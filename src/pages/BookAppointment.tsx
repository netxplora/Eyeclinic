import Layout from "@/components/Layout";
import FloatingCTA from "@/components/FloatingCTA";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, Phone, MessageCircle, Sparkles, User, ShieldCheck, ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, parseISO, isBefore, isPast, isToday, parse } from "date-fns";
import heroSlideExam from "@/assets/satome/hero-slide-exam.png";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

type Service = {
  id: string;
  service_name: string;
  duration_minutes: number;
  buffer_minutes: number;
};

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  working_days: string[];
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
};

const BookAppointment = () => {
  const { toast } = useToast();
  const { user, userRole, isStaff } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previousDoctorId, setPreviousDoctorId] = useState<string | null>(null);

  // Data From DB
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; doctorId: string; doctorName: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Form State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; doctorId: string; doctorName: string } | null>(null);
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    honeypot: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<{ id: string, lockId?: string, type: 'appointment' | 'waitlist' } | null>(null);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [servicesRes, doctorsRes] = await Promise.all([
          supabase.from('clinic_services').select('*').eq('is_active', true),
          supabase.from('doctors').select('*').eq('is_active', true)
        ]);

        if (servicesRes.data) setServices(servicesRes.data);
        if (doctorsRes.data) setDoctors(doctorsRes.data);

        // If user is a staff/doctor, they shouldn't be booking here
        if (userRole === 'doctor' || (isStaff && userRole !== 'receptionist')) {
           toast({ title: "Staff Restriction", description: "Clinicians should book via the Admin Panel.", variant: "destructive" });
           navigate('/admin/dashboard');
           return;
        }

        // Fetch previous doctor if logged in patient
        if (user?.email) {
           const { data: lastAppt } = await supabase
             .from('appointments')
             .select('doctor_id')
             .eq('patient_email', user.email)
             .eq('status', 'completed')
             .order('appointment_date', { ascending: false })
             .limit(1)
             .maybeSingle();
           
           if (lastAppt) {
             setPreviousDoctorId(lastAppt.doctor_id);
           }
        }
      } catch (err) {
        console.error("Failed to load scheduling data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user, userRole, isStaff, navigate]);

  // Auto-assign doctor: Calculate slots across ALL doctors for the selected service+date
  useEffect(() => {
    if (!selectedDate || !selectedService || doctors.length === 0) {
      setAvailableSlots([]);
      return;
    }

    const checkAvailability = async () => {
      setSlotsLoading(true);
      try {
        const selectedDayName = format(parseISO(selectedDate), "EEEE");
        const now = new Date();

        // Filter doctors who work on this day
        let workingDoctors = doctors.filter(doc => doc.working_days.includes(selectedDayName));

        // Prioritize previous doctor if available for follow-up continuity
        if (previousDoctorId) {
          const preferredDoc = workingDoctors.find(d => d.id === previousDoctorId);
          if (preferredDoc) {
             // Move preferred doctor to the start of the array to prioritize their slots
             workingDoctors = [preferredDoc, ...workingDoctors.filter(d => d.id !== previousDoctorId)];
          }
        }

        if (workingDoctors.length === 0) {
          setAvailableSlots([]);
          setSlotsLoading(false);
          return;
        }

        // Fetch appointments and locks for ALL working doctors on this date
        const [apptsRes, locksRes] = await Promise.all([
          supabase
            .from('appointments')
            .select('doctor_id, appointment_start, appointment_end')
            .in('doctor_id', workingDoctors.map(d => d.id))
            .eq('appointment_date', selectedDate)
            .neq('status', 'cancelled')
            .neq('status', 'no-show'),
          supabase
            .from('appointment_locks')
            .select('doctor_id, start_time, end_time')
            .in('doctor_id', workingDoctors.map(d => d.id))
            .eq('appointment_date', selectedDate)
            .gt('locked_until', new Date().toISOString())
        ]);

        // Build conflict map per doctor
        const conflictsByDoctor: Record<string, { start: string; end: string }[]> = {};
        for (const doc of workingDoctors) {
          conflictsByDoctor[doc.id] = [];
        }

        for (const appt of (apptsRes.data || [])) {
          if (conflictsByDoctor[appt.doctor_id]) {
            conflictsByDoctor[appt.doctor_id].push({ start: appt.appointment_start, end: appt.appointment_end });
          }
        }
        for (const lock of (locksRes.data || [])) {
          if (conflictsByDoctor[lock.doctor_id]) {
            conflictsByDoctor[lock.doctor_id].push({ start: lock.start_time, end: lock.end_time });
          }
        }

        const duration = selectedService.duration_minutes;
        const buffer = selectedService.buffer_minutes;
        const totalSlotMins = duration + buffer;

        // For each doctor, generate available time slots
        const allSlots: { time: string; doctorId: string; doctorName: string }[] = [];
        const seenTimes = new Set<string>(); // Track unique times to avoid showing duplicate times

        for (const doc of workingDoctors) {
          const dayPrefix = `${selectedDate}T`;
          let currentTime = new Date(`${dayPrefix}${doc.start_time}`);
          const endTime = new Date(`${dayPrefix}${doc.end_time}`);
          const breakStart = new Date(`${dayPrefix}${doc.break_start}`);
          const breakEnd = new Date(`${dayPrefix}${doc.break_end}`);
          const conflicts = conflictsByDoctor[doc.id] || [];

          while (currentTime < endTime) {
            const slotEndTime = addMinutes(currentTime, duration);
            const fullSlotEndTime = addMinutes(currentTime, totalSlotMins);

            if (slotEndTime > endTime) break;

            // Skip past times
            if (isToday(parseISO(selectedDate)) && currentTime < now) {
              currentTime = addMinutes(currentTime, 15);
              continue;
            }

            // Skip break overlap
            if (currentTime < breakEnd && slotEndTime > breakStart) {
              currentTime = addMinutes(currentTime, 15);
              continue;
            }

            // Check conflicts
            const currentStr = format(currentTime, "HH:mm:ss");
            const endStr = format(fullSlotEndTime, "HH:mm:ss");
            let hasConflict = false;

            for (const conflict of conflicts) {
              if (currentStr < conflict.end && endStr > conflict.start) {
                hasConflict = true;
                break;
              }
            }

            if (!hasConflict) {
              const timeStr = format(currentTime, "HH:mm:ss");
              // Only add this time if we don't already have it (auto-assign picks best doctor)
              if (!seenTimes.has(timeStr)) {
                seenTimes.add(timeStr);
                allSlots.push({ time: timeStr, doctorId: doc.id, doctorName: doc.name });
              }
              currentTime = addMinutes(currentTime, totalSlotMins);
            } else {
              currentTime = addMinutes(currentTime, 15);
            }
          }
        }

        // Sort by time
        allSlots.sort((a, b) => a.time.localeCompare(b.time));
        setAvailableSlots(allSlots);
      } catch (err) {
        console.error("Availability check failed", err);
      } finally {
        setSlotsLoading(false);
      }
    };

    checkAvailability();
  }, [selectedDate, selectedService, doctors]);

  const handleSlotSelect = async (slot: { time: string; doctorId: string; doctorName: string }) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientDetails.honeypot) return; // Anti-spam

    if (!selectedService || !selectedDate) {
      toast({ title: "Error", description: "Missing booking details", variant: "destructive" });
      return;
    }

    // Handle Waitlist Submission Route
    if (showWaitlistForm) {
      if (!patientDetails.name || !patientDetails.phone) {
        toast({ title: "Error", description: "Please provide name and phone", variant: "destructive" });
        return;
      }
      setIsSubmitting(true);
      try {
        // Pick first available doctor for waitlist (or any)
        const waitlistDoctorId = doctors.length > 0 ? doctors[0].id : null;
        const { error } = await supabase.from('waitlists').insert({
          patient_name: patientDetails.name,
          patient_email: patientDetails.email || null,
          patient_phone: patientDetails.phone,
          doctor_id: waitlistDoctorId,
          service_id: selectedService.id,
          preferred_date: selectedDate,
          status: 'waiting'
        });

        if (error) throw error;

        const waitlistId = 'WAITLIST-' + Math.floor(Math.random() * 1000);

        // Notify Admin and Patient
        await supabase.functions.invoke('send-booking-notification', {
          body: {
            bookingId: waitlistId,
            patientName: patientDetails.name,
            patientEmail: patientDetails.email || null,
            patientPhone: patientDetails.phone,
            serviceType: selectedService.service_name,
            appointmentDate: selectedDate,
            appointmentTime: null,
            additionalNotes: patientDetails.message || '',
            isWaitlist: true,
          }
        });

        setBookingConfirmed({ id: waitlistId, type: 'waitlist' });
        setStep(4);
        toast({ title: "Waitlist Joined!", description: "We will notify you if a slot opens up." });
      } catch (err: any) {
        toast({ title: "Failed", description: err.message || "An error occurred", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!selectedSlot) {
      toast({ title: "Error", description: "Missing time selection", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionId = Math.random().toString(36).substring(2, 15);
      const totalMins = selectedService.duration_minutes + selectedService.buffer_minutes;

      const startTime = selectedSlot.time;
      const endTime = format(addMinutes(parse(`${selectedDate} ${selectedSlot.time}`, "yyyy-MM-dd HH:mm:ss", new Date()), totalMins), "HH:mm:ss");

      const lockedUntil = new Date(Date.now() + 3 * 60000).toISOString(); // Lock for 3 mins

      // 1. Lock the slot
      const { data: lockData, error: lockError } = await supabase
        .from('appointment_locks')
        .insert({
          doctor_id: selectedSlot.doctorId,
          appointment_date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          locked_until: lockedUntil,
          session_id: sessionId
        }).select('id').single();

      if (lockError) {
        toast({ title: "Slot Taken", description: "This slot was just booked. Please select another time.", variant: "destructive" });
        setStep(2); // Go back to available times
        setIsSubmitting(false);
        return;
      }

      // Generate unique booking ID locally
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const bookingIdData = `BK${datePart}${randomPart}`;

      // 2. Insert the actual appointment (doctor is auto-assigned)
      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          booking_id: bookingIdData,
          patient_name: patientDetails.name,
          patient_email: patientDetails.email || null,
          patient_phone: patientDetails.phone,
          doctor_id: selectedSlot.doctorId,
          service_id: selectedService.id,
          appointment_date: selectedDate,
          appointment_start: startTime,
          appointment_end: format(addMinutes(parse(`${selectedDate} ${selectedSlot.time}`, "yyyy-MM-dd HH:mm:ss", new Date()), selectedService.duration_minutes), "HH:mm:ss"),
          status: 'pending',
          additional_notes: patientDetails.message
        });

      if (insertError) {
        throw insertError;
      }

      // 3. Delete the lock early to clean up
      await supabase.from('appointment_locks').delete().eq('id', lockData.id);

      setBookingConfirmed({ id: bookingIdData, lockId: lockData.id, type: 'appointment' });
      setStep(4);

      toast({
        title: "Appointment Request Submitted!",
        description: `Your booking ID is ${bookingIdData}. We'll contact you shortly.`,
      });

      // Email Notification 
      await supabase.functions.invoke('send-booking-notification', {
        body: {
          bookingId: bookingIdData,
          patientName: patientDetails.name,
          patientEmail: patientDetails.email || null,
          patientPhone: patientDetails.phone,
          serviceType: selectedService.service_name,
          appointmentDate: selectedDate,
          appointmentTime: startTime,
          additionalNotes: patientDetails.message || '',
          isWaitlist: false,
        }
      });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Booking Failed", description: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 1: Select Service
  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">Select A Service</h2>
      {loading ? (
        <p className="animate-pulse">Loading clinic services...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(svc => (
            <Card
              key={svc.id}
              className={`cursor-pointer transition-all ${selectedService?.id === svc.id ? 'border-primary ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setSelectedService(svc)}
            >
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{svc.service_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" /> {svc.duration_minutes} Mins
                  </p>
                </div>
                {selectedService?.id === svc.id && <CheckCircle2 className="text-primary w-6 h-6" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="flex justify-end mt-6">
        <Button onClick={() => setStep(2)} disabled={!selectedService}>Next Step <ChevronRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  );

  // STEP 2: Select Date & Time (doctor is auto-assigned)
  const renderStep2 = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="text-2xl font-bold">Select Date & Time</h2>
        </div>

        {/* Info banner explaining auto-assignment */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium">Doctor is automatically assigned</p>
            <p className="text-blue-600 mt-1">Our system will assign the most suitable available doctor based on the service you selected, ensuring balanced scheduling and continuity of care.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label htmlFor="date" className="text-base font-semibold block mb-2">Pick a Date</Label>
            <Input
              id="date"
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
              className="h-12 w-full"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold block mb-2">Available Slots</Label>

            {!selectedDate ? (
              <p className="text-muted-foreground text-sm italic">Please select a date first.</p>
            ) : slotsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Finding available slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-destructive/5 text-destructive p-6 rounded-xl border border-destructive/20 text-center">
                <p className="font-semibold text-lg mb-2">No available slots on this date.</p>
                <p className="text-sm mb-4">Please try another day or join our waitlist, and we'll contact you if a spot opens up.</p>
                <Button
                  onClick={() => { setShowWaitlistForm(true); setStep(3); }}
                  variant="outline"
                  className="border-destructive/30 hover:bg-destructive/10 text-destructive w-full"
                >
                  Join Waitlist for {selectedDate}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                {availableSlots.map(slot => (
                  <Button
                    key={slot.time + slot.doctorId}
                    variant="outline"
                    className="hover:border-primary hover:text-primary transition-colors h-10"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot.time.substring(0, 5)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // STEP 3: Patient Details
  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setStep(2)} disabled={isSubmitting}><ChevronLeft className="w-5 h-5" /></Button>
        <h2 className="text-2xl font-bold">Patient Details</h2>
      </div>

      {/* Booking Summary */}
      <div className="bg-muted p-4 rounded-lg flex flex-wrap gap-4 mb-6 text-sm">
        <Badge variant="outline" className="bg-background"><Calendar className="w-3 h-3 mr-1" /> {selectedDate}</Badge>
        {!showWaitlistForm && selectedSlot && <Badge variant="outline" className="bg-background"><Clock className="w-3 h-3 mr-1" /> {selectedSlot.time.substring(0, 5)}</Badge>}
        <Badge variant="outline" className="bg-background"><ShieldCheck className="w-3 h-3 mr-1" /> {selectedService?.service_name}</Badge>
        {!showWaitlistForm && selectedSlot && (
          <Badge variant="outline" className="bg-background text-green-700 border-green-200">
            <User className="w-3 h-3 mr-1" /> Auto-assigned: {selectedSlot.doctorName}
          </Badge>
        )}
        {showWaitlistForm && <Badge variant="destructive" className="animate-pulse">Waitlist Request</Badge>}
      </div>

      <form onSubmit={submitAppointment} className="space-y-4">
        <input type="text" style={{ display: 'none' }} value={patientDetails.honeypot} onChange={e => setPatientDetails({ ...patientDetails, honeypot: e.target.value })} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input required value={patientDetails.name} onChange={e => setPatientDetails({ ...patientDetails, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input required type="tel" value={patientDetails.phone} onChange={e => setPatientDetails({ ...patientDetails, phone: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" value={patientDetails.email} onChange={e => setPatientDetails({ ...patientDetails, email: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>Additional Notes (Optional)</Label>
          <Textarea rows={3} value={patientDetails.message} onChange={e => setPatientDetails({ ...patientDetails, message: e.target.value })} />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground max-w-sm">
            {showWaitlistForm
              ? "By joining the waitlist, you agree to let us contact you regarding cancellations."
              : "By submitting, you agree that your slot is reserved for 3 minutes to complete booking."}
          </p>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Confirming...' : showWaitlistForm ? 'Join Waitlist' : 'Confirm Appointment'}
          </Button>
        </div>
      </form>
    </div>
  );

  // STEP 4: Confirmation
  const renderStep4 = () => (
    <div className="text-center py-10 space-y-6 animate-fade-in-up">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold">
        {bookingConfirmed?.type === 'waitlist' ? 'Added to Waitlist!' : 'Booking Submitted!'}
      </h2>
      <p className="text-lg text-muted-foreground">
        {bookingConfirmed?.type === 'waitlist'
          ? "We've recorded your preferred date. We'll contact you instantly if a spot opens up."
          : "Your appointment request has been recorded."}
      </p>

      <div className="bg-muted p-6 rounded-lg max-w-md mx-auto inline-block text-left mt-4 border border-border">
        <p className="text-sm text-slate-500 mb-1">Reference ID</p>
        <p className="text-2xl font-mono font-bold tracking-wider">{bookingConfirmed?.id}</p>
        <hr className="my-4 border-border" />
        <p className="font-semibold">{selectedService?.service_name}</p>
        {selectedSlot && <p className="text-sm text-green-700 mt-1">Doctor auto-assigned: {selectedSlot.doctorName}</p>}
        <p className="text-slate-600 mt-2">Date: {selectedDate}</p>
        {!showWaitlistForm && selectedSlot && <p className="text-slate-600">Time: {selectedSlot.time.substring(0, 5)}</p>}
        {showWaitlistForm && <p className="text-amber-600 font-medium mt-1">Status: On Waitlist Notification</p>}
      </div>

      <div className="pt-8">
        <Button onClick={() => window.location.reload()} variant="outline">Book Another Appointment</Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <FloatingCTA />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img src={heroSlideExam} alt="Eye Exam Booking" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
          <Badge className="mb-6 bg-background/20 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Smart Scheduling
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Book Your Visit</h1>
        </div>
      </section>

      {/* Booking Wizard */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">

          {/* Progress Indicator - 3 steps now */}
          {step < 4 && (
            <div className="mb-10 flex justify-between items-center relative before:absolute before:inset-0 before:h-1 before:bg-slate-200 before:top-1/2 before:-translate-y-1/2 before:z-0">
              {[1, 2, 3].map(num => (
                <div key={num} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= num ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-white text-slate-400 border border-slate-200'}`}>
                  {num}
                </div>
              ))}
            </div>
          )}

          <Card className="shadow-lg min-h-[400px]">
            <CardContent className="p-6 md:p-8">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Information Section Below Wizard */}
      <section className="py-16 bg-white border-t border-border/50">
        <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* What to Expect */}
            <div>
              <h3 className="text-2xl font-bold mb-6">What to Expect During Your Visit</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left font-semibold">Will I need to arrive early?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, please arrive at least 10-15 minutes prior to your scheduled appointment. This gives us enough time to process your registration, update any medical history, and ensure you see the doctor on time.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left font-semibold">What should I bring?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Please bring your current eyeglasses or contact lenses, a list of any medications you are currently taking, your insurance/HMO card (if applicable), and a valid form of identification.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left font-semibold">Do you accept walk-ins?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    While we prioritize booked appointments to maintain our schedule, we do accept walk-in patients for emergencies. Please note that wait times for walk-ins may be longer depending on doctor availability.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left font-semibold">How are doctors assigned?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Our intelligent scheduling system automatically assigns the most suitable available doctor based on the service you selected and their availability. For follow-up visits, we prioritize continuity by assigning the same doctor from your previous appointment whenever possible.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Need Help */}
            <div>
              <Card className="bg-primary text-primary-foreground border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" /> Need Help Booking?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-primary-foreground/90 text-lg">
                    Having trouble finding a suitable time? Dealing with an eye emergency? Our reception team is ready to assist you immediately.
                  </p>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                      <Phone className="w-6 h-6" />
                      <div>
                        <p className="text-sm font-medium text-white/70">Call Us directly</p>
                        <p className="text-xl font-bold">0805 907 0153</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                      <Clock className="w-6 h-6" />
                      <div>
                        <p className="text-sm font-medium text-white/70">Emergency Hours</p>
                        <p className="font-semibold">24/7 Support Available</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BookAppointment;
