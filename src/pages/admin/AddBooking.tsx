import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Calendar, User, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, addMinutes, parseISO, parse, isToday } from 'date-fns';

type Service = { id: string; service_name: string; duration_minutes: number; buffer_minutes: number; };
type Doctor = { id: string; name: string; specialization: string; working_days: string[]; start_time: string; end_time: string; break_start: string; break_end: string; };
type Patient = { id: string; name: string; phone: string; email?: string; };

const AddBooking = () => {
  const { isStaff, userRole } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dailyCount, setDailyCount] = useState(0);

  // Data From DB
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Form State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('walk-in'); // 'walk-in' is a placeholder for unselected
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isStaff && userRole === 'doctor') {
      toast.error("Doctors are not allowed to create manual bookings.");
      navigate('/admin/dashboard');
      return;
    }
    if (isStaff) {
      fetchInitialData();
    }
  }, [isStaff, userRole, navigate]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [servicesRes, doctorsRes, patientsRes] = await Promise.all([
        supabase.from('clinic_services').select('*').eq('is_active', true),
        supabase.from('doctors').select('*').eq('is_active', true),
        supabase.from('patients').select('id, name, phone, email').order('name', { ascending: true })
      ]);

      if (servicesRes.data) setServices(servicesRes.data);
      if (doctorsRes.data) setDoctors(doctorsRes.data);
      if (patientsRes.data) setPatients(patientsRes.data);
    } catch (err) {
      toast.error("Failed to load scheduling data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientMode === 'existing' && selectedPatientId && selectedPatientId !== 'walk-in') {
      const p = patients.find(p => p.id === selectedPatientId);
      if (p) {
        setPatientDetails({
          name: p.name,
          email: p.email || "",
          phone: p.phone,
          message: ""
        });
      }
    } else if (patientMode === 'new') {
      setPatientDetails({ name: "", email: "", phone: "", message: "" });
    }
  }, [patientMode, selectedPatientId, patients]);

  // Calculate Slots dynamically
  useEffect(() => {
    if (!selectedDate || !selectedDoctor || !selectedService) {
      setAvailableSlots([]);
      return;
    }

    const checkAvailability = async () => {
      setSlotsLoading(true);
      try {
        const selectedDayName = format(parseISO(selectedDate), "EEEE");

        // Fetch conflicting appointments and locks
        const [apptsRes, locksRes] = await Promise.all([
          supabase
            .from('appointments')
            .select('appointment_start, appointment_end')
            .eq('doctor_id', selectedDoctor.id)
            .eq('appointment_date', selectedDate)
            .neq('status', 'cancelled')
            .neq('status', 'no-show'),
          supabase
            .from('appointment_locks')
            .select('start_time, end_time')
            .eq('doctor_id', selectedDoctor.id)
            .eq('appointment_date', selectedDate)
            .gt('locked_until', new Date().toISOString())
        ]);

        const conflicts = [
          ...(apptsRes.data || []),
          ...(locksRes.data || [])
        ].map(c => ({
          start: 'appointment_start' in c ? c.appointment_start : c.start_time,
          end: 'appointment_end' in c ? c.appointment_end : c.end_time
        }));

        const slots: string[] = [];
        const duration = selectedService.duration_minutes;
        const buffer = selectedService.buffer_minutes;
        const totalSlotMins = duration + buffer;

        const dayPrefix = `${selectedDate}T`;
        let currentTime = new Date(`${dayPrefix}${selectedDoctor.start_time}`);
        const endTime = new Date(`${dayPrefix}${selectedDoctor.end_time}`);

        const breakStart = new Date(`${dayPrefix}${selectedDoctor.break_start}`);
        const breakEnd = new Date(`${dayPrefix}${selectedDoctor.break_end}`);

        const now = new Date();

        while (currentTime < endTime) {
          const slotEndTime = addMinutes(currentTime, duration);
          const fullSlotEndTime = addMinutes(currentTime, totalSlotMins);

          if (slotEndTime > endTime) break;

          // Admins can book past times or during breaks if they really want to, but we still apply basic checks 
          // to highlight open slots vs conflicts
          
          let hasConflict = false;
          const currentStr = format(currentTime, "HH:mm:ss");
          const endStr = format(fullSlotEndTime, "HH:mm:ss");

          for (const conflict of conflicts) {
            if (currentStr < conflict.end && endStr > conflict.start) {
              hasConflict = true;
              break;
            }
          }

          // We push it anyway if it is "isEmergency", else skip conflicts
          if (!hasConflict || isEmergency) {
            // Also enforce working days rule unless emergency
            if (isEmergency || selectedDoctor.working_days.includes(selectedDayName)) {
               // Enforce breaks unless emergency
               if (isEmergency || (currentTime >= breakEnd || slotEndTime <= breakStart)) {
                 slots.push(format(currentTime, "HH:mm:ss"));
                 if (!isEmergency) currentTime = addMinutes(currentTime, totalSlotMins);
                 else currentTime = addMinutes(currentTime, 15); // Emergencies give more granular choices
                 continue;
               }
            }
          }
          
          currentTime = addMinutes(currentTime, 15);
        }

        setAvailableSlots(slots);
      } catch (err) {
        toast.error("Availability check failed");
      } finally {
        setSlotsLoading(false);
      }
    };

    checkAvailability();
  }, [selectedDate, selectedDoctor, selectedService, isEmergency]);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyCount();
    }
  }, [selectedDate]);

  const fetchDailyCount = async () => {
     try {
       const { count, error } = await supabase
         .from('appointments')
         .select('*', { count: 'exact', head: true })
         .eq('appointment_date', selectedDate);
       
       if (!error && count !== null) {
         setDailyCount(count);
       }
     } catch (e) {
       console.error("Failed to fetch daily count", e);
     }
  };

  const [isWaitlist, setIsWaitlist] = useState(false);

  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDoctor || !selectedDate) {
      toast.error("Please complete all booking details");
      return;
    }
    
    // Time is not required strictly for waitlist, but we assume they skipped picking time if waitlist
    if (!isWaitlist && !selectedTime) {
      toast.error("Please select a time or check Waitlist");
      return;
    }

    if (!patientDetails.name || !patientDetails.phone) {
      toast.error("Patient name and phone are required");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPatientId = selectedPatientId;

      if (patientMode === 'new') {
         // Generate a human-friendly Patient ID
         const { count } = await supabase.from('patients').select('*', { count: 'exact', head: true });
         const nextIdVal = (count || 0) + 1;
         const customId = `SEC-${new Date().getFullYear()}-${String(nextIdVal).padStart(4, '0')}`;

         const { data: newPatient, error: pError } = await supabase.from('patients').insert({
            name: patientDetails.name,
            email: patientDetails.email || null,
            phone: patientDetails.phone,
            custom_id: customId
         }).select().single();

         if (pError) {
           console.error("Could not insert patient", pError);
           if (!pError.message.includes('unique')) {
             throw pError;
           }
         } else if (newPatient) {
            finalPatientId = newPatient.id;
         }
      }

      if (isWaitlist) {
         const { error: waitlistError } = await supabase.from('waitlists').insert({
           patient_name: patientDetails.name,
           patient_email: patientDetails.email || null,
           patient_phone: patientDetails.phone,
           doctor_id: selectedDoctor.id,
           service_id: selectedService.id,
           preferred_date: selectedDate,
           status: 'waiting'
         });
         
         if (waitlistError) throw waitlistError;
         
         try {
           await supabase.functions.invoke('send-booking-notification', {
             body: {
               bookingId: "WAITLIST",
               patientName: patientDetails.name,
               patientEmail: patientDetails.email || null,
               patientPhone: patientDetails.phone,
               serviceType: selectedService.service_name,
               appointmentDate: selectedDate,
               isWaitlist: true,
               additionalNotes: patientDetails.message
             }
           });
         } catch (e) {
           console.error("Failed to send waitlist notification", e);
         }
         
         toast.success(`Patient added to waitlist!`);
         navigate('/admin/waitlists');
         return;
      }

      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const bookingIdData = `BK${datePart}${randomPart}`;
      
      const qNumber = dailyCount + 1;

      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          booking_id: bookingIdData,
          patient_name: patientDetails.name,
          patient_email: patientDetails.email || null,
          patient_phone: patientDetails.phone,
          doctor_id: selectedDoctor.id,
          service_id: selectedService.id,
          appointment_date: selectedDate,
          appointment_start: selectedTime,
          appointment_end: format(addMinutes(parse(`${selectedDate} ${selectedTime}`, "yyyy-MM-dd HH:mm:ss", new Date()), selectedService.duration_minutes), "HH:mm:ss"),
          status: isWalkIn ? 'checked in' : 'confirmed',
          additional_notes: patientDetails.message,
          is_emergency: isEmergency,
          priority: isEmergency ? 'urgent' : priority,
          queue_number: qNumber,
          check_in_time: isWalkIn ? new Date().toISOString() : null
        });

      if (insertError) throw insertError;

      try {
        await supabase.functions.invoke('send-booking-notification', {
          body: {
            bookingId: bookingIdData,
            patientName: patientDetails.name,
            patientEmail: patientDetails.email || null,
            patientPhone: patientDetails.phone,
            serviceType: selectedService.service_name,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            additionalNotes: isWalkIn ? "Point-of-care Walk-In" : patientDetails.message,
            isWaitlist: false
          }
        });
      } catch (e) {
        console.error("Failed to send booking notification", e);
      }

      toast.success(`Appointment ${bookingIdData} booked successfully!`);
      
      if (isWalkIn) {
         navigate('/admin/check-in');
      } else {
         navigate('/admin/bookings');
      }

    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
        <span>1. Select A Service</span>
        <Button variant="outline" size="sm" onClick={() => setIsEmergency(!isEmergency)} className={isEmergency ? "bg-red-50 text-red-600 border-red-200" : ""}>
           <AlertTriangle className="w-4 h-4 mr-2" />
           {isEmergency ? "Emergency Override ON" : "Normal Mode"}
        </Button>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(svc => (
          <Card key={svc.id} className={`cursor-pointer transition-all ${selectedService?.id === svc.id ? 'border-primary ring-2 ring-primary sm:bg-primary/5' : 'hover:border-primary/50'}`} onClick={() => setSelectedService(svc)}>
            <CardContent className="p-4 flex gap-4 items-center">
              <div>
                <h3 className="font-semibold">{svc.service_name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" /> {svc.duration_minutes} Mins (+{svc.buffer_minutes} buffer)
                </p>
              </div>
              {selectedService?.id === svc.id && <CheckCircle2 className="text-primary w-6 h-6 ml-auto" />}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={() => setStep(2)} disabled={!selectedService}>Next Step <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setStep(1)}><ChevronLeft className="w-5 h-5" /></Button>
        <h2 className="text-2xl font-bold">2. Choose a Doctor</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map(doc => (
          <Card key={doc.id} className={`cursor-pointer transition-all ${selectedDoctor?.id === doc.id ? 'border-primary ring-2 ring-primary sm:bg-primary/5' : 'hover:border-primary/50'}`} onClick={() => setSelectedDoctor(doc)}>
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary"><User className="w-5 h-5" /></div>
              <div>
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="text-sm text-muted-foreground">{doc.specialization}</p>
              </div>
              {selectedDoctor?.id === doc.id && <CheckCircle2 className="text-primary w-6 h-6 ml-auto" />}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={() => setStep(3)} disabled={!selectedDoctor}>Next Step <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setStep(2)}><ChevronLeft className="w-5 h-5" /></Button>
        <h2 className="text-2xl font-bold">3. Date & Time</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label className="text-base font-semibold block mb-2">Pick a Date</Label>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-12 w-full" />
        </div>
        <div className="space-y-4">
          <Label className="text-base font-semibold block mb-2">Available Slots {isEmergency && <Badge variant="destructive" className="ml-2">Override All</Badge>}</Label>
          {!selectedDate ? <p className="text-muted-foreground text-sm">Select a date first.</p> : 
           slotsLoading ? <p className="animate-pulse text-sm">Finding slots...</p> : 
           availableSlots.length === 0 ? <p className="text-destructive font-semibold text-sm">No slots available. Turn on Emergency Mode if needed.</p> : 
           (
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
              {availableSlots.map(time => (
                <Button key={time} variant={selectedTime === time ? "default" : "outline"} className={`h-10 ${selectedTime === time && 'ring-2 ring-primary ring-offset-2'}`} onClick={() => setSelectedTime(time)}>
                  {time.substring(0, 5)}
                </Button>
              ))}
            </div>
           )}
        </div>
      </div>
      <div className="flex justify-between mt-6 pb-2">
        <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
        <Button onClick={() => setStep(4)} disabled={!selectedTime}>Next Step <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setStep(3)} disabled={isSubmitting}><ChevronLeft className="w-5 h-5" /></Button>
        <h2 className="text-2xl font-bold">4. Patient Details</h2>
      </div>

      <div className="bg-muted p-4 rounded-lg flex flex-wrap gap-4 mb-6">
        <Badge variant="outline" className="bg-background"><Calendar className="w-3 h-3 mr-1" /> {selectedDate} {selectedTime?.substring(0,5)}</Badge>
        <Badge variant="outline" className="bg-background"><User className="w-3 h-3 mr-1" /> {selectedDoctor?.name}</Badge>
        <Badge variant="outline" className="bg-background"><ShieldCheck className="w-3 h-3 mr-1" /> {selectedService?.service_name}</Badge>
      </div>

      <form onSubmit={submitAppointment} className="space-y-6">
         <div className="flex gap-4">
           <Button type="button" variant={patientMode === 'existing' ? 'default' : 'outline'} onClick={() => setPatientMode('existing')} className="flex-1">Existing Patient</Button>
           <Button type="button" variant={patientMode === 'new' ? 'default' : 'outline'} onClick={() => setPatientMode('new')} className="flex-1">New Patient</Button>
         </div>

         {patientMode === 'existing' && (
           <div className="space-y-2">
             <Label>Select Patient</Label>
             <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
               <SelectTrigger><SelectValue placeholder="Search or select..." /></SelectTrigger>
               <SelectContent className="max-h-[300px]">
                  <SelectItem value="walk-in" disabled>Select from records...</SelectItem>
                  {patients.map(p => (
                     <SelectItem key={p.id} value={p.id}>{p.name} ({p.phone})</SelectItem>
                  ))}
               </SelectContent>
             </Select>
           </div>
         )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input required value={patientDetails.name} onChange={e => setPatientDetails({ ...patientDetails, name: e.target.value })} disabled={patientMode === 'existing' && selectedPatientId !== 'walk-in'} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input required type="tel" value={patientDetails.phone} onChange={e => setPatientDetails({ ...patientDetails, phone: e.target.value })} disabled={patientMode === 'existing' && selectedPatientId !== 'walk-in'} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" value={patientDetails.email} onChange={e => setPatientDetails({ ...patientDetails, email: e.target.value })} disabled={patientMode === 'existing' && selectedPatientId !== 'walk-in'} />
        </div>

        <div className="space-y-2">
          <Label>Appointment Notes</Label>
          <Textarea rows={3} value={patientDetails.message} onChange={e => setPatientDetails({ ...patientDetails, message: e.target.value })} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t">
           <label className="flex items-center gap-2 cursor-pointer bg-slate-100 p-2 px-4 rounded-md hover:bg-slate-200 font-medium w-full sm:w-auto">
             <input type="checkbox" checked={isWalkIn} onChange={e => { setIsWalkIn(e.target.checked); if (e.target.checked) setIsWaitlist(false); }} className="w-4 h-4 accent-primary" />
             Patient is here now (Walk-In)
           </label>

           <label className="flex items-center gap-2 cursor-pointer bg-amber-50 text-amber-900 border border-amber-200 p-2 px-4 rounded-md hover:bg-amber-100 font-medium w-full sm:w-auto">
             <input type="checkbox" checked={isWaitlist} onChange={e => { setIsWaitlist(e.target.checked); if (e.target.checked) setIsWalkIn(false); }} className="w-4 h-4 accent-amber-600" />
             Add to Waitlist instead
           </label>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" type="button" onClick={() => setStep(3)}>Back</Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Confirming...' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </div>
  );

  if (loading) return <div className="p-8 text-center">Loading booking system...</div>;

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary">New Internal Booking</h1>
          <p className="text-sm text-muted-foreground mt-1 text-slate-500">
            Create an appointment on behalf of a patient.
          </p>
        </div>
        <div className="mb-8 flex justify-between items-center relative before:absolute before:inset-0 before:h-1 before:bg-slate-200 before:top-1/2 before:-translate-y-1/2 before:z-0 max-w-xl mx-auto">
           {[1, 2, 3, 4].map(num => (
             <div key={num} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${step >= num ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-white text-slate-400 border border-slate-200'}`}>
               {num}
             </div>
           ))}
        </div>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6 md:p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBooking;
