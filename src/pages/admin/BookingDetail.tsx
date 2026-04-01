import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Mail, Phone, User, FileText, CheckCircle, XCircle, CalendarClock, AlertCircle, CalendarPlus, Loader2, History, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

import { MedicalRecordUpload } from '@/components/admin/MedicalRecordUpload';

const BookingDetailEnhanced = () => {
  const { id } = useParams();
  const { isStaff, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newTime: '',
    reason: ''
  });
  const [bookedSlots, setBookedSlots] = useState<{[key: string]: string[]}>({});
  
  // Follow-up & notes state
  const [consultationNotes, setConsultationNotes] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [creatingFollowUp, setCreatingFollowUp] = useState(false);

  // Patient history for follow-up context
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [isFollowUp, setIsFollowUp] = useState(false);

  // Time slots for follow-up select
  const timeSlots = [
    "08:00:00", "09:00:00", "10:00:00", "11:00:00",
    "12:00:00", "13:00:00", "14:00:00", "15:00:00",
    "16:00:00", "17:00:00"
  ];

  // Eye Clinic Medical State
  const [medicalRecord, setMedicalRecord] = useState({
    va_left: '',
    va_right: '',
    iop_left: '',
    iop_right: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
    lens_od_sph: '',
    lens_od_cyl: '',
    lens_od_axis: '',
    lens_os_sph: '',
    lens_os_cyl: '',
    lens_os_axis: '',
    lens_add: ''
  });

  // Billing State
  const [billing, setBilling] = useState({
    amount: 0,
    status: 'unpaid' as 'paid' | 'unpaid' | 'pending',
    method: 'cash',
    invoice_number: ''
  });

  const displayTimeSlots = [
    '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
    '12:00:00', '12:30:00', '13:00:00', '13:30:00', '14:00:00', '14:30:00',
    '15:00:00', '15:30:00', '16:00:00', '16:30:00', '17:00:00'
  ];

  useEffect(() => {
    if (isStaff && id) {
      fetchBooking();
      fetchActivityLogs();
      fetchBookedSlots();
    }
  }, [isStaff, id]);

  // Fetch patient history once booking is loaded
  useEffect(() => {
    if (booking) {
      fetchPatientHistory();
    }
  }, [booking?.patient_email, booking?.patient_phone]);

  const fetchPatientHistory = async () => {
    if (!booking) return;
    try {
      // Find all appointments for the same patient (by email OR phone)
      let query = supabase
        .from('appointments')
        .select('*, clinic_services(service_name), doctors(name)')
        .neq('id', id)
        .order('appointment_date', { ascending: false })
        .order('appointment_start', { ascending: false })
        .limit(20);

      if (booking.patient_email) {
        query = query.eq('patient_email', booking.patient_email);
      } else {
        query = query.eq('patient_phone', booking.patient_phone);
      }

      const { data, error } = await query;
      if (error) throw error;

      setPatientHistory(data || []);

      // Check if this appointment references a previous one (follow-up detection)
      const notes = booking.additional_notes || '';
      const hasFollowUpRef = notes.toLowerCase().includes('follow-up') || notes.toLowerCase().includes('follow up');
      setIsFollowUp(hasFollowUpRef || (data && data.length > 0));
    } catch (err) {
      console.error('Failed to fetch patient history:', err);
    }
  };

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clinic_services(service_name, price), doctors(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBooking(data);
      setConsultationNotes(data.additional_notes || '');
      
      // Fetch associated medical record if exists
      fetchMedicalRecord(id as string);
      fetchBilling(id as string, data);
    } catch (error: any) {
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecord = async (apptId: string) => {
    try {
      const { data, error } = await supabase
        .from('medical_records' as any)
        .select('*')
        .eq('appointment_id', apptId)
        .maybeSingle();
      
      if (data) {
        setMedicalRecord({
          ...medicalRecord,
          va_left: data.va_left || '',
          va_right: data.va_right || '',
          iop_left: data.iop_left || '',
          iop_right: data.iop_right || '',
          diagnosis: data.diagnosis || '',
          treatment_plan: data.treatment_plan || '',
          notes: data.notes || '',
          ...(data.lens_prescription || {})
        });
      }
    } catch (err) {
      console.error("Failed to fetch medical record", err);
    }
  };

  const fetchBilling = async (apptId: string, currentBooking?: any) => {
    try {
      const { data, error } = await supabase
        .from('billing' as any)
        .select('*')
        .eq('appointment_id', apptId)
        .maybeSingle();
      
      if (data) {
        setBilling({
          amount: data.amount || 0,
          status: data.status || 'unpaid',
          method: data.payment_method || 'cash',
          invoice_number: data.invoice_number || ''
        });
      } else if (currentBooking?.clinic_services?.price) {
        // Auto-fill from service price if no billing record exists yet
        setBilling(prev => ({
          ...prev,
          amount: currentBooking.clinic_services.price
        }));
      }
    } catch (err) {
      console.error("Failed to fetch billing", err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:staff_id (full_name)
        `)
        .eq('booking_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error: any) {
      console.error('Failed to load activity logs:', error);
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('appointment_date, appointment_time')
        .neq('status', 'cancelled');

      if (error) throw error;
      
      const slots: {[key: string]: string[]} = {};
      data?.forEach((b: any) => {
        if (!slots[b.appointment_date]) {
          slots[b.appointment_date] = [];
        }
        slots[b.appointment_date].push(b.appointment_time);
      });
      
      setBookedSlots(slots);
    } catch (error: any) {
      console.error('Failed to load booked slots:', error);
    }
  };

  const isSlotBooked = (date: string, time: string) => {
    return bookedSlots[date]?.includes(time) || false;
  };

  const updateBookingStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Log the activity
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('activity_logs').insert({
        booking_id: id,
        staff_id: user?.id,
        action_type: 'status_change',
        old_value: booking.status,
        new_value: newStatus,
        notes: `Status changed from ${booking.status} to ${newStatus}`
      });

      setBooking({ ...booking, status: newStatus });
      toast.success(`Booking ${newStatus} successfully`);
      fetchActivityLogs();

      // Send email notification to patient (for confirmed or cancelled)
      if ((newStatus === 'confirmed' || newStatus === 'cancelled') && booking.patient_email) {
        try {
          await supabase.functions.invoke('send-booking-update', {
            body: {
              bookingId: booking.booking_id,
              patientName: booking.patient_name,
              patientEmail: booking.patient_email,
              patientPhone: booking.patient_phone,
              serviceType: booking.clinic_services?.service_name || 'Eye Checkup',
              appointmentDate: booking.appointment_date,
              appointmentTime: booking.appointment_start,
              status: newStatus,
              additionalNotes: booking.additional_notes
            }
          });
          toast.success(`Notification email sent to patient.`);
        } catch (emailError) {
          console.error("Failed to send update email:", emailError);
          toast.error(`Status updated, but failed to send email notification.`);
        }
      }
    } catch (error: any) {
      toast.error('Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.newDate || !rescheduleData.newTime) {
      toast.error('Please select both date and time');
      return;
    }

    if (isSlotBooked(rescheduleData.newDate, rescheduleData.newTime)) {
      toast.error('This time slot is already booked. Please choose another.');
      return;
    }

    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('reschedule-booking', {
        body: {
          bookingId: id,
          newDate: rescheduleData.newDate,
          newTime: rescheduleData.newTime,
          reason: rescheduleData.reason
        }
      });

      if (error || !data.success) {
        toast.error(data?.error || error?.message || 'Failed to reschedule booking');
        return;
      }

      toast.success('Booking rescheduled successfully and notification sent to patient');
      setRescheduleOpen(false);
      setRescheduleData({ newDate: '', newTime: '', reason: '' });
      fetchBooking();
      fetchActivityLogs();
      fetchBookedSlots();
    } catch (error: any) {
      console.error('Error rescheduling booking:', error);
      toast.error(error.message || 'Failed to reschedule booking');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ additional_notes: consultationNotes, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setBooking({ ...booking, additional_notes: consultationNotes });
      toast.success('Consultation notes saved');
    } catch (error: any) {
      toast.error('Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveMedicalRecord = async () => {
    setUpdating(true);
    try {
      const { data: existing } = await supabase
        .from('medical_records' as any)
        .select('id')
        .eq('appointment_id', id)
        .maybeSingle();

      const payload = {
        appointment_id: id,
        patient_id: booking.patient_id || null,
        doctor_id: booking.doctor_id,
        va_left: medicalRecord.va_left,
        va_right: medicalRecord.va_right,
        iop_left: medicalRecord.iop_left,
        iop_right: medicalRecord.iop_right,
        diagnosis: medicalRecord.diagnosis,
        treatment_plan: medicalRecord.treatment_plan,
        notes: medicalRecord.notes,
        lens_prescription: {
          lens_od_sph: medicalRecord.lens_od_sph,
          lens_od_cyl: medicalRecord.lens_od_cyl,
          lens_od_axis: medicalRecord.lens_od_axis,
          lens_os_sph: medicalRecord.lens_os_sph,
          lens_os_cyl: medicalRecord.lens_os_cyl,
          lens_os_axis: medicalRecord.lens_os_axis,
          lens_add: medicalRecord.lens_add
        }
      };

      if (existing) {
        await supabase.from('medical_records' as any).update(payload).eq('id', (existing as any).id);
      } else {
        await supabase.from('medical_records' as any).insert(payload);
      }
      
      toast.success('Medical record updated successfully');
    } catch (err) {
      toast.error('Failed to save medical records');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateBilling = async () => {
    setUpdating(true);
    try {
      const { data: existing } = await supabase
        .from('billing' as any)
        .select('id')
        .eq('appointment_id', id)
        .maybeSingle();

      const invNum = billing.invoice_number || `INV-${booking.booking_id}`;

      const payload = {
        appointment_id: id,
        patient_id: booking.patient_id || null,
        amount: billing.amount,
        status: billing.status,
        payment_method: billing.method,
        invoice_number: invNum
      };

      if (existing) {
        await supabase.from('billing' as any).update(payload).eq('id', (existing as any).id);
      } else {
        await supabase.from('billing' as any).insert(payload);
      }

      setBilling({ ...billing, invoice_number: invNum });
      toast.success('Billing information updated');
    } catch (err) {
      toast.error('Failed to update billing');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateFollowUp = async () => {
    if (!followUpDate || !followUpTime) {
      toast.error('Please select both date and time for the follow-up');
      return;
    }

    setCreatingFollowUp(true);
    try {
      const startH = parseInt(followUpTime.substring(0, 2));
      const endTime = `${String(startH + 1).padStart(2, '0')}:00:00`;

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_name: booking.patient_name,
          patient_email: booking.patient_email,
          patient_phone: booking.patient_phone,
          service_id: booking.service_id,
          doctor_id: booking.doctor_id,
          appointment_date: followUpDate,
          appointment_start: followUpTime,
          appointment_end: endTime,
          status: 'confirmed',
          additional_notes: `Follow-up from appointment ${booking.booking_id}`,
          is_emergency: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Follow-up appointment created for ${new Date(followUpDate).toLocaleDateString()}`);
      setShowFollowUp(false);
      setFollowUpDate('');
      setFollowUpTime('');

      if (booking.patient_email) {
        try {
          await supabase.functions.invoke('send-booking-update', {
            body: {
              bookingId: data.booking_id,
              patientName: booking.patient_name,
              patientEmail: booking.patient_email,
              patientPhone: booking.patient_phone,
              serviceType: booking.clinic_services?.service_name || 'Eye Checkup',
              appointmentDate: followUpDate,
              appointmentTime: followUpTime,
              status: 'confirmed',
              additionalNotes: `This is a follow-up appointment from your previous visit.`,
            }
          });
        } catch (emailErr) {
          console.error('Email notification failed:', emailErr);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create follow-up appointment');
    } finally {
      setCreatingFollowUp(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
          <Button asChild>
            <Link to="/admin/bookings">Back to Bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Booking Details</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs px-2 py-0 h-5">ID: {booking.booking_id}</Badge>
              Manage this appointment and patient medical records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="shadow-sm">
              <Link to="/admin/bookings">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Link>
            </Button>
          </div>
        </div>
        {/* Follow-Up Patient Summary Panel */}
        {isFollowUp && patientHistory.length > 0 && (
          <Card className="border-2 border-teal-200 bg-teal-50/30 dark:bg-teal-950/10 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <History className="w-5 h-5" />
                Follow-Up Patient Summary
              </CardTitle>
              <CardDescription>
                This patient has {patientHistory.length} previous visit(s). Continuity of care information is shown below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-teal-100">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Patient Name</p>
                  <p className="font-bold text-lg">{booking.patient_name}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-teal-100">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Last Visit</p>
                  <p className="font-bold text-lg">
                    {new Date(patientHistory[0].appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted-foreground">with {patientHistory[0].doctors?.name || 'Unknown Doctor'}</p>
                </div>
              </div>

              {/* Previous consultation notes */}
              {patientHistory[0].additional_notes && (
                <div className="bg-white rounded-lg p-4 border border-teal-100 mb-4">
                  <p className="text-xs text-muted-foreground uppercase font-medium mb-2 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> Previous Doctor Notes
                  </p>
                  <p className="text-sm whitespace-pre-wrap bg-teal-50 p-3 rounded-md">{patientHistory[0].additional_notes}</p>
                </div>
              )}

              {/* Patient History Timeline */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Appointment History Timeline</p>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {patientHistory.map((visit, idx) => (
                    <div key={visit.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 hover:border-teal-200 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        visit.status === 'completed' ? 'bg-green-500' :
                        visit.status === 'cancelled' ? 'bg-red-500' :
                        visit.status === 'no-show' ? 'bg-slate-400' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{visit.clinic_services?.service_name || 'Consultation'}</p>
                          <Badge variant="outline" className="text-xs">{visit.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(visit.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}{visit.appointment_start?.substring(0, 5)}
                          {' · '}{visit.doctors?.name || 'Unassigned'}
                        </p>
                        {visit.additional_notes && (
                          <p className="text-xs text-slate-500 mt-1 truncate">Notes: {visit.additional_notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{booking.patient_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{booking.patient_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{booking.patient_phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{new Date(booking.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{booking.appointment_start?.substring(0, 5)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">{booking.clinic_services?.service_name || 'General Eye Exam'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Specialist Doctor</p>
                    <p className="font-medium">{booking.doctors?.name || 'Assigned Specialist'}</p>
                  </div>
                </div>
                {booking.additional_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Original Notes</p>
                    <p className="font-medium bg-muted p-4 rounded-lg whitespace-pre-wrap">{booking.additional_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consultation Notes</CardTitle>
                <CardDescription>Record medical observations and visit summaries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background"
                  placeholder="Enter patient consultation notes here..."
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  disabled={updating}
                />
                <Button onClick={handleSaveNotes} disabled={updating}>Save Notes</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 overflow-hidden">
               <CardHeader className="bg-primary/5 border-b">
                 <CardTitle className="flex items-center gap-2">
                   <Stethoscope className="w-5 h-5 text-primary" />
                   Eye Examination (Clinical)
                 </CardTitle>
                 <CardDescription>Record clinical findings for VA, Eye Pressure, and Diagnosis.</CardDescription>
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                 {/* VA and IOP */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase text-slate-500 border-b pb-2">Visual Acuity (VA)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Left Eye (OS)</Label>
                          <Input placeholder="e.g. 6/6" value={medicalRecord.va_left} onChange={e => setMedicalRecord({...medicalRecord, va_left: e.target.value})} disabled={!canEditMedical} />
                        </div>
                        <div className="space-y-2">
                          <Label>Right Eye (OD)</Label>
                          <Input placeholder="e.g. 6/9" value={medicalRecord.va_right} onChange={e => setMedicalRecord({...medicalRecord, va_right: e.target.value})} disabled={!canEditMedical} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase text-slate-500 border-b pb-2">Intraocular Pressure (IOP)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Left Eye (OS)</Label>
                          <Input placeholder="e.g. 14 mmHg" value={medicalRecord.iop_left} onChange={e => setMedicalRecord({...medicalRecord, iop_left: e.target.value})} disabled={!canEditMedical} />
                        </div>
                        <div className="space-y-2">
                          <Label>Right Eye (OD)</Label>
                          <Input placeholder="e.g. 15 mmHg" value={medicalRecord.iop_right} onChange={e => setMedicalRecord({...medicalRecord, iop_right: e.target.value})} disabled={!canEditMedical} />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Lens Prescription */}
                 <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-bold text-sm uppercase text-slate-500">Auto-Refraction / Lens Prescription</h4>
                    <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                       <div className="grid grid-cols-4 gap-4 items-end">
                         <div className="text-xs font-bold text-slate-400 pb-2">Eye</div>
                         <div className="text-xs font-bold text-slate-400 pb-2">SPH</div>
                         <div className="text-xs font-bold text-slate-400 pb-2">CYL</div>
                         <div className="text-xs font-bold text-slate-400 pb-2">AXIS</div>
                         
                         <div className="font-bold py-2">Right (OD)</div>
                         <Input size={1} value={medicalRecord.lens_od_sph} onChange={e => setMedicalRecord({...medicalRecord, lens_od_sph: e.target.value})} disabled={!canEditMedical} />
                         <Input size={1} value={medicalRecord.lens_od_cyl} onChange={e => setMedicalRecord({...medicalRecord, lens_od_cyl: e.target.value})} disabled={!canEditMedical} />
                         <Input size={1} value={medicalRecord.lens_od_axis} onChange={e => setMedicalRecord({...medicalRecord, lens_od_axis: e.target.value})} disabled={!canEditMedical} />

                         <div className="font-bold py-2">Left (OS)</div>
                         <Input size={1} value={medicalRecord.lens_os_sph} onChange={e => setMedicalRecord({...medicalRecord, lens_os_sph: e.target.value})} disabled={!canEditMedical} />
                         <Input size={1} value={medicalRecord.lens_os_cyl} onChange={e => setMedicalRecord({...medicalRecord, lens_os_cyl: e.target.value})} disabled={!canEditMedical} />
                         <Input size={1} value={medicalRecord.lens_os_axis} onChange={e => setMedicalRecord({...medicalRecord, lens_os_axis: e.target.value})} disabled={!canEditMedical} />
                       </div>
                       <div className="grid grid-cols-4 gap-4 items-center">
                          <Label className="col-span-1">ADD (Near)</Label>
                          <Input className="col-span-1" value={medicalRecord.lens_add} onChange={e => setMedicalRecord({...medicalRecord, lens_add: e.target.value})} disabled={!canEditMedical} />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label>Diagnosis</Label>
                       <Textarea placeholder="e.g. Myopia, Astigmatism..." value={medicalRecord.diagnosis} onChange={e => setMedicalRecord({...medicalRecord, diagnosis: e.target.value})} disabled={!canEditMedical} />
                    </div>
                    <div className="space-y-2">
                       <Label>Treatment Plan / Recommendation</Label>
                       <Textarea placeholder="Glasses, Eye drops, Surgery required..." value={medicalRecord.treatment_plan} onChange={e => setMedicalRecord({...medicalRecord, treatment_plan: e.target.value})} disabled={!canEditMedical} />
                    </div>
                 </div>

                 {canEditMedical && (
                   <Button onClick={handleSaveMedicalRecord} className="w-full" size="lg" disabled={updating}>Save Examination Data</Button>
                 )}
               </CardContent>
            </Card>

            <MedicalRecordUpload 
               appointmentId={id as string} 
               patientId={booking.patient_id} 
               doctorId={booking.doctor_id} 
               disabled={!canEditMedical && userRole !== 'admin'} 
            />

            <Card>
              <CardHeader>
                <CardTitle>Internal Activity Log</CardTitle>
                <CardDescription>History of changes to this booking</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No activity yet</p>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log: any) => (
                      <div key={log.id} className="border-l-2 border-primary pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{log.action_type.replace('_', ' ')}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.old_value && log.new_value && (
                          <p className="text-sm text-muted-foreground">
                            Changed from <span className="font-medium">{log.old_value}</span> to{' '}
                            <span className="font-medium">{log.new_value}</span>
                          </p>
                        )}
                        {log.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                        )}
                        {log.profiles?.full_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            By: {log.profiles.full_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-slate-200 shadow-lg">
               <CardHeader className="bg-slate-50 border-b">
                 <CardTitle className="text-lg">Billing & Payments</CardTitle>
               </CardHeader>
               <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Consultation/Service Fee</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <Input type="number" className="pl-8 text-xl font-bold" value={billing.amount} onChange={e => setBilling({...billing, amount: parseFloat(e.target.value)})} disabled={!canEditBilling} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={billing.status} onValueChange={v => setBilling({...billing, status: v as any})} disabled={!canEditBilling}>
                      <SelectTrigger className={cn(
                        billing.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 
                        billing.status === 'unpaid' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50'
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="pending">Pending/Partial</SelectItem>
                        <SelectItem value="paid">Paid Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={billing.method} onValueChange={v => setBilling({...billing, method: v})} disabled={!canEditBilling}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {billing.invoice_number && (
                    <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-500">
                      Invoice: {billing.invoice_number}
                    </div>
                  )}

                  {canEditBilling && (
                    <Button variant="default" className="w-full" onClick={handleUpdateBilling} disabled={updating}>
                      Update Billing info
                    </Button>
                  )}
                  
                  {billing.status === 'paid' && (
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                      <FileText className="w-4 h-4 mr-2" />
                      Print Receipt / Invoice
                    </Button>
                  )}
               </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Status</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div>
                    <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                    <Select disabled={updating} value={booking.status} onValueChange={updateBookingStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Change status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Mark as Pending</SelectItem>
                        <SelectItem value="confirmed">Mark as Confirmed</SelectItem>
                        <SelectItem value="checked in">Patient Checked In</SelectItem>
                        <SelectItem value="waiting">Waiting for Doctor</SelectItem>
                        <SelectItem value="in progress">In Progress</SelectItem>
                        <SelectItem value="completed">Mark as Completed</SelectItem>
                        <SelectItem value="follow-up required">Follow-up Required</SelectItem>
                        <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full" disabled={updating || booking.status === 'confirmed'} onClick={() => updateBookingStatus('confirmed')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </Button>
                  <Button variant="outline" className="w-full" disabled={updating} onClick={() => setRescheduleOpen(true)}>
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button variant="destructive" className="w-full" disabled={updating || booking.status === 'cancelled'} onClick={() => updateBookingStatus('cancelled')}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                </div>
              </CardContent>
             </Card>

             <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(booking.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(booking.updated_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {(booking.status === 'follow-up required' || booking.status === 'completed') && (
              <Card className="border-2 border-orange-200 bg-orange-50/30 dark:bg-orange-950/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <CalendarPlus className="w-5 h-5" />
                    Schedule Follow-Up
                  </CardTitle>
                  <CardDescription>Create a follow-up appointment for this patient with the same doctor and service.</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showFollowUp ? (
                    <Button variant="outline" onClick={() => setShowFollowUp(true)} className="border-orange-300 text-orange-700 hover:bg-orange-100">
                      <CalendarPlus className="w-4 h-4 mr-2" /> Schedule Follow-Up Appointment
                    </Button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase text-muted-foreground">Follow-Up Date</Label>
                          <Input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase text-muted-foreground">Time Slot</Label>
                          <Select value={followUpTime} onValueChange={setFollowUpTime}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot}>{slot.substring(0, 5)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateFollowUp} disabled={creatingFollowUp} className="bg-orange-600 hover:bg-orange-700">
                          {creatingFollowUp ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><CalendarPlus className="w-4 h-4 mr-2" /> Create Follow-Up</>}
                        </Button>
                        <Button variant="ghost" onClick={() => setShowFollowUp(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for this appointment. An email notification will be sent to the patient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newDate">New Date</Label>
              <Input
                id="newDate"
                type="date"
                value={rescheduleData.newDate}
                onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTime">New Time</Label>
              <Select
                value={rescheduleData.newTime}
                onValueChange={(value) => setRescheduleData({ ...rescheduleData, newTime: value })}
              >
                <SelectTrigger id="newTime">
                  <SelectValue placeholder="Select time..." />
                </SelectTrigger>
                <SelectContent>
                  {displayTimeSlots.map((time) => {
                    const isBooked = rescheduleData.newDate && isSlotBooked(rescheduleData.newDate, time);
                    return (
                      <SelectItem key={time} value={time} disabled={isBooked}>
                        <div className="flex items-center justify-between w-full">
                          <span>{time.substring(0, 5)}</span>
                          {isBooked && (
                            <span className="ml-2 text-xs text-destructive flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Booked
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Reason for rescheduling..."
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={updating}>
              {updating ? 'Rescheduling...' : 'Reschedule & Notify Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDetailEnhanced;
