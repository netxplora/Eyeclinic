import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, LogOut, Eye, AlertCircle, Edit2, XCircle, History, Stethoscope, Bell, User, CalendarPlus, FileText, CheckCircle2, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PatientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [billingRecords, setBillingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Cancel Appt
  const [isCancelApptOpen, setIsCancelApptOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.email) return;
      try {
        const { data: apptData, error: apptError } = await supabase
          .from('appointments')
          .select(`
            *,
            clinic_services(service_name, price),
            doctors(name)
          `)
          .eq('patient_email', user.email)
          .order('appointment_date', { ascending: false });

        if (apptError) throw apptError;
        setAppointments(apptData || []);

        if (apptData && apptData.length > 0) {
          const apptIds = apptData.map(a => a.id);

          const [medRes, billRes] = await Promise.all([
            supabase.from('medical_records' as any).select('*').in('appointment_id', apptIds),
            supabase.from('billing' as any).select('*').in('appointment_id', apptIds)
          ]);

          setMedicalRecords(medRes.data || []);
          setBillingRecords(billRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load your appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditName(user.user_metadata?.full_name || '');
      setEditPhone(user.user_metadata?.phone || '');
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    toast.success('Signed out successfully');
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: editName, phone: editPhone }
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
      setIsEditProfileOpen(false);
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedApptId) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', selectedApptId);

      if (error) throw error;

      toast.success('Appointment cancelled successfully');
      setAppointments(appointments.map(app =>
        app.id === selectedApptId ? { ...app, status: 'cancelled' } : app
      ));
      setIsCancelApptOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
      setSelectedApptId(null);
    }
  };

  const openCancelDialog = (id: string) => {
    setSelectedApptId(id);
    setIsCancelApptOpen(true);
  };

  // Categorize appointments
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppts = appointments.filter(a => a.appointment_date >= today && !['cancelled', 'completed', 'no-show'].includes(a.status));
  const pastAppts = appointments.filter(a => a.appointment_date < today || ['completed'].includes(a.status));
  const cancelledAppts = appointments.filter(a => ['cancelled', 'no-show'].includes(a.status));
  const followUpAppts = appointments.filter(a => (a.additional_notes || '').toLowerCase().includes('follow-up') || (a.additional_notes || '').toLowerCase().includes('follow up'));

  // Stats
  const totalVisits = appointments.filter(a => a.status === 'completed').length;
  const upcomingCount = upcomingAppts.length;
  const followUpCount = followUpAppts.length;

  const renderAppointmentCard = (appointment: any, showCancel = true) => (
    <div key={appointment.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors flex flex-col md:flex-row gap-4 justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-base">{appointment.clinic_services?.service_name || 'Eye Consultation'}</span>
          <Badge variant="outline" className={`
            ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                appointment.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                  appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    appointment.status === 'no-show' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                      'bg-blue-100 text-blue-700 border-blue-200'}
          `}>
            {appointment.status.toUpperCase()}
          </Badge>
          {(appointment.additional_notes || '').toLowerCase().includes('follow-up') && (
            <Badge className="bg-teal-100 text-teal-700 border-teal-200" variant="outline">Follow-Up</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(appointment.appointment_date).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {appointment.appointment_start?.substring(0, 5)} - {appointment.appointment_end?.substring(0, 5)}
          </div>
        </div>
        {appointment.doctors?.name && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" /> Doctor: {appointment.doctors.name}
          </p>
        )}
        {appointment.additional_notes && (
          <p className="text-xs text-slate-500 mt-1 border-l-2 border-teal-300 pl-2 italic">
            {appointment.additional_notes.length > 120 ? appointment.additional_notes.substring(0, 120) + '...' : appointment.additional_notes}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 items-center md:items-end justify-center">
        {showCancel && (appointment.status === 'confirmed' || appointment.status === 'pending') && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openCancelDialog(appointment.id)}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancel Appt
          </Button>
        )}
        {showCancel && (appointment.status === 'confirmed' || appointment.status === 'pending') && (
          <Button variant="secondary" size="sm" asChild>
            <a href={`mailto:info@satomeeyeclinic.com?subject=Reschedule Booking ${appointment.booking_id}`}>
              Request Reschedule
            </a>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-lg">Welcome back, {user?.user_metadata?.full_name || 'Patient'}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/book')}>
              <Calendar className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingCount}</p>
                <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-green-500/50 transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVisits}</p>
                <p className="text-sm text-muted-foreground">Completed Visits</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-teal-500/50 transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <CalendarPlus className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{followUpCount}</p>
                <p className="text-sm text-muted-foreground">Follow-Up Visits</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Appointment Tabs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-5 h-5 text-primary" />
                  My Appointments
                </CardTitle>
                <CardDescription>Your complete appointment history at Satome Eye Clinic</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-4">
                    <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
                      Upcoming ({upcomingAppts.length})
                    </TabsTrigger>
                    <TabsTrigger value="past" className="text-xs sm:text-sm">
                      Visit History ({pastAppts.length})
                    </TabsTrigger>
                    <TabsTrigger value="medical" className="text-xs sm:text-sm">
                      Eye Exams ({medicalRecords.length})
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="text-xs sm:text-sm">
                      Invoices ({billingRecords.length})
                    </TabsTrigger>
                    <TabsTrigger value="followups" className="text-xs sm:text-sm">
                      Follow-Ups ({followUpAppts.length})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="text-xs sm:text-sm">
                      Cancelled ({cancelledAppts.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    {loading ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : upcomingAppts.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-lg">
                        <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No upcoming appointments</h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-4">You have not scheduled any appointments yet.</p>
                        <Button onClick={() => navigate('/book')}>Book an Appointment</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">{upcomingAppts.map(a => renderAppointmentCard(a))}</div>
                    )}
                  </TabsContent>

                  <TabsContent value="past">
                    {pastAppts.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-lg">
                        <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No past appointments</h3>
                        <p className="text-sm text-muted-foreground mt-2">Your completed visits will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">{pastAppts.map(a => renderAppointmentCard(a, false))}</div>
                    )}
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-8">
                    {/* Clinical Eye Exams */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <Stethoscope className="w-5 h-5 text-teal-600" />
                        Clinical Eye Exams
                      </h3>
                      {medicalRecords.filter(r => !r.file_url).length === 0 ? (
                        <div className="text-center py-8 bg-muted/20 rounded-lg">
                          <Stethoscope className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Your clinical eye examination results will appear here after your visit.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {medicalRecords.filter(r => !r.file_url).map((record) => {
                            const appt = appointments.find(a => a.id === record.appointment_id);
                            return (
                              <Card key={record.id} className="overflow-hidden border-2 border-teal-100">
                                <CardHeader className="bg-teal-50/50 py-3 px-4 border-b">
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-sm font-bold text-teal-800">Eye Exam - {appt?.appointment_date}</CardTitle>
                                    <Badge variant="secondary" className="bg-white">Ref: {appt?.booking_id}</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                      <p className="text-[10px] uppercase text-muted-foreground font-bold">VA (OD - Right)</p>
                                      <p className="font-bold text-teal-700">{record.va_right || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                      <p className="text-[10px] uppercase text-muted-foreground font-bold">VA (OS - Left)</p>
                                      <p className="font-bold text-teal-700">{record.va_left || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                      <p className="text-[10px] uppercase text-muted-foreground font-bold">IOP (OD)</p>
                                      <p className="font-bold text-blue-700">{record.iop_right || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                      <p className="text-[10px] uppercase text-muted-foreground font-bold">IOP (OS)</p>
                                      <p className="font-bold text-blue-700">{record.iop_left || 'N/A'}</p>
                                    </div>
                                  </div>

                                  {record.diagnosis && (
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Diagnosis</h4>
                                      <p className="text-sm">{record.diagnosis}</p>
                                    </div>
                                  )}

                                  {record.lens_prescription && (
                                    <div className="pt-2 border-t text-xs">
                                      <h4 className="font-bold text-slate-500 uppercase mb-2">Lens Prescription</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-teal-50/30 p-2 rounded">
                                          <p className="font-bold text-teal-900 border-b pb-1 mb-1">OD (Right)</p>
                                          <p>SPH: {record.lens_prescription.lens_od_sph || '0.00'} · CYL: {record.lens_prescription.lens_od_cyl || '0.00'} · AXIS: {record.lens_prescription.lens_od_axis || '0'}</p>
                                        </div>
                                        <div className="bg-slate-50/50 p-2 rounded">
                                          <p className="font-bold text-slate-900 border-b pb-1 mb-1">OS (Left)</p>
                                          <p>SPH: {record.lens_prescription.lens_os_sph || '0.00'} · CYL: {record.lens_prescription.lens_os_cyl || '0.00'} · AXIS: {record.lens_prescription.lens_os_axis || '0'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                                    <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                                      <Printer className="w-4 h-4" /> Print Record
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Uploaded Documents */}
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Uploaded Records & Scans
                      </h3>
                      {medicalRecords.filter(r => r.file_url).length === 0 ? (
                        <div className="text-center py-8 bg-muted/20 rounded-lg">
                          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Any scans, prescriptions, or documents uploaded by your doctor will appear here.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {medicalRecords.filter(r => r.file_url).map((doc) => {
                            const handleDownload = async () => {
                              try {
                                const { data, error } = await supabase.storage.from('medical_documents').download(doc.file_url);
                                if (error) throw error;
                                const url = URL.createObjectURL(data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = doc.file_name;
                                a.click();
                                URL.revokeObjectURL(url);
                              } catch(err) {
                                toast.error("Failed to download file");
                              }
                            };
                            return (
                              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-indigo-200 transition-colors bg-white">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                     <FileText className="w-5 h-5 text-indigo-500" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="font-bold text-sm text-slate-800 truncate">{doc.record_title}</p>
                                     <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <Badge variant="outline" className="text-[10px] py-0">{doc.record_type}</Badge>
                                        <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                        <span>·</span>
                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                     </div>
                                  </div>
                                </div>
                                <div className="mt-3 sm:mt-0 flex justify-end">
                                  <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                      <Download className="w-3.5 h-3.5" /> View
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="billing">
                    {billingRecords.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-lg">
                        <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No invoices yet</h3>
                        <p className="text-sm text-muted-foreground mt-2">Your clinical eye examination invoices and billing history will appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {billingRecords.map((bill) => {
                          const appt = appointments.find(a => a.id === bill.appointment_id);
                          return (
                                  <div key={bill.id} className="p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-center bg-white shadow-sm gap-4">
                                    <div className="flex gap-4 items-center">
                                      <div className="bg-slate-100 p-3 rounded-lg"><FileText className="w-6 h-6 text-slate-600" /></div>
                                      <div>
                                        <p className="font-bold text-base">Invoice {bill.invoice_number}</p>
                                        <p className="text-xs text-muted-foreground">{appt?.clinic_services?.service_name || 'Consultation'} · {appt?.appointment_date}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                      <div className="text-right">
                                        <p className="text-lg font-black text-primary">₦ {Number(bill.amount).toLocaleString()}</p>
                                        <Badge className={bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                          {bill.status.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => window.print()} title="Print Invoice">
                                          <Printer className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">View Receipt</Button>
                                      </div>
                                    </div>
                                  </div>
                                  );
                        })}
                                </div>
                    )}
                              </TabsContent>

                              <TabsContent value="followups">
                                {followUpAppts.length === 0 ? (
                                  <div className="text-center py-12 bg-muted/20 rounded-lg">
                                    <CalendarPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No follow-up appointments</h3>
                                    <p className="text-sm text-muted-foreground mt-2">Any follow-up visits scheduled by your doctor will appear here.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4">{followUpAppts.map(a => renderAppointmentCard(a))}</div>
                                )}
                              </TabsContent>

                              <TabsContent value="cancelled">
                                {cancelledAppts.length === 0 ? (
                                  <div className="text-center py-12 bg-muted/20 rounded-lg">
                                    <XCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No cancelled appointments</h3>
                                    <p className="text-sm text-muted-foreground mt-2">Great! You haven't cancelled any visits.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4">{cancelledAppts.map(a => renderAppointmentCard(a, false))}</div>
                                )}
                              </TabsContent>
                            </Tabs>
              </CardContent>
            </Card>

                  {/* Medical Records Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-5 h-5 text-teal-600" />
                        Consultation History
                      </CardTitle>
                      <CardDescription>A summary of your consultations and services received.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pastAppts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No consultation records yet. Complete your first visit to see your medical history here.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                          {pastAppts.map((visit) => (
                            <div key={visit.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg border border-border hover:border-teal-200 transition-colors">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${visit.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">{visit.clinic_services?.service_name || 'Consultation'}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(visit.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {visit.doctors?.name || 'Specialist'} · {visit.appointment_start?.substring(0, 5)}
                                </p>
                                {visit.additional_notes && (
                                  <p className="text-xs text-slate-500 mt-1 border-l-2 border-teal-300 pl-2 italic">
                                    {visit.additional_notes.length > 100 ? visit.additional_notes.substring(0, 100) + '...' : visit.additional_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">

                  {/* Profile Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Full Name</label>
                        <p className="font-medium text-foreground">{user?.user_metadata?.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Email</label>
                        <p className="font-medium text-foreground">{user?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Phone Number</label>
                        <p className="font-medium text-foreground">{user?.user_metadata?.phone || 'Not provided'}</p>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsEditProfileOpen(true)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Notifications */}
                  <Card className="border-2 border-blue-200/50 bg-blue-50/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                        <Bell className="w-5 h-5" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {upcomingAppts.length > 0 ? (
                        upcomingAppts.slice(0, 3).map(appt => (
                          <div key={appt.id} className="flex items-start gap-2 p-2 bg-white rounded-md border border-blue-100 text-sm">
                            <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-blue-900">
                                {appt.status === 'pending' ? 'Pending Confirmation' : 'Confirmed Appointment'}
                              </p>
                              <p className="text-xs text-blue-600">
                                {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {appt.appointment_start?.substring(0, 5)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-3">No new notifications</p>
                      )}

                      {followUpAppts.filter(a => a.appointment_date >= today).length > 0 && (
                        <div className="flex items-start gap-2 p-2 bg-teal-50 rounded-md border border-teal-200 text-sm">
                          <CalendarPlus className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-teal-900">Follow-Up Reminder</p>
                            <p className="text-xs text-teal-600">You have {followUpAppts.filter(a => a.appointment_date >= today).length} upcoming follow-up(s)</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Help Card */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex gap-3 text-sm flex-col">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground leading-snug">
                          Need to modify an appointment? You can cancel directly above, or notify us at least 24 hours in advance by requesting a reschedule.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Edit Profile Dialog */}
              <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile Information</DialogTitle>
                    <DialogDescription>
                      Update your contact details below. Changes will be reflected immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditProfileOpen(false)} disabled={isSavingProfile}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateProfile} disabled={isSavingProfile}>
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Cancel Appointment Dialog */}
              <Dialog open={isCancelApptOpen} onOpenChange={setIsCancelApptOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsCancelApptOpen(false)} disabled={isCancelling}>
                      No, Keep It
                    </Button>
                    <Button variant="destructive" onClick={handleCancelAppointment} disabled={isCancelling}>
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel Appointment'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </div>
        </Layout>
        );
};

        export default PatientDashboard;
