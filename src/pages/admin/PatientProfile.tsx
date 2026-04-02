import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Calendar, Clock, FileText, User, Phone, Mail, MapPin, 
  History, PlusCircle, ExternalLink, Download, Stethoscope, 
  CreditCard, Edit2, Trash2, ShieldAlert
} from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff, userRole } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [billingRecords, setBillingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Patient
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', address: '', medical_notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Upload Document
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', type: 'General', appointmentId: '', notes: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Clinical Note
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ appointmentId: '', notes: '' });
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Patient Info
      const { data: patientData, error: pError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
        
      if (pError) throw pError;
      setPatient(patientData);
      setEditForm({
        name: patientData.name || '',
        email: patientData.email || '',
        phone: patientData.phone || '',
        address: patientData.address || '',
        medical_notes: patientData.medical_notes || ''
      });

      // 2. Fetch Appointments
      const { data: apptData, error: aError } = await supabase
        .from('appointments')
        .select('*, clinic_services(service_name, price), doctors(name)')
        .eq('patient_phone', patientData.phone) // Using phone as key because some might not have emails
        .order('appointment_date', { ascending: false });
        
      if (aError) throw aError;
      setAppointments(apptData || []);

      const apptIds = (apptData || []).map(a => a.id);

      if (apptIds.length > 0) {
        // 3. Fetch Medical Records & Billing
        const [medRes, billRes] = await Promise.all([
          supabase.from('medical_records' as any).select('*').in('appointment_id', apptIds),
          supabase.from('billing' as any).select('*').in('appointment_id', apptIds)
        ]);

        setMedicalRecords(medRes.data || []);
        setBillingRecords(billRes.data || []);
      }

    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load patient profile");
      navigate('/admin/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update(editForm)
        .eq('id', id);
        
      if (error) throw error;
      
      setPatient({ ...patient, ...editForm });
      toast.success("Patient information updated");
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update patient");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const { data, error } = await supabase.storage.from('medical_documents').download(doc.file_url);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || doc.record_title;
      a.click();
      URL.revokeObjectURL(url);
    } catch(err) {
      toast.error("Failed to download file");
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!uploadForm.appointmentId) {
      toast.error("Please select an appointment context");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${patient.id || id}/${fileName}`; // fallback to URL id if patient.id missing

      const { error: uploadError } = await supabase.storage
        .from('medical_documents')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('medical_records' as any)
        .insert({
          appointment_id: uploadForm.appointmentId,
          record_title: uploadForm.title,
          record_type: uploadForm.type,
          file_name: uploadFile.name,
          file_url: filePath,
          file_size: uploadFile.size,
          notes: uploadForm.notes
        });

      if (insertError) throw insertError;

      toast.success("Document uploaded successfully");
      setIsUploadOpen(false);
      setUploadForm({ title: '', type: 'General', appointmentId: '', notes: '' });
      setUploadFile(null);
      fetchPatientData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.appointmentId) {
      toast.error("Please select an appointment context");
      return;
    }
    setIsSavingNote(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ additional_notes: noteForm.notes })
        .eq('id', noteForm.appointmentId);
        
      if (error) throw error;
      toast.success("Clinical note updated");
      setIsNoteOpen(false);
      fetchPatientData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update note");
    } finally {
      setIsSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="w-full h-full pb-12 animate-fade-in">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Breadcrumb / Top Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/admin/patients')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-primary">{patient.name}</h1>
                <Badge variant="outline" className="text-xs">{patient.custom_id}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Patient Profile & Medical History</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Info
            </Button>
            <Button onClick={() => navigate('/admin/bookings/new')}>
              <PlusCircle className="w-4 h-4 mr-2" /> New Booking
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar: Patient Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 shadow-sm border-primary/10 overflow-hidden">
               <div className="h-24 bg-gradient-to-r from-primary/80 to-primary"></div>
               <div className="px-6 -mt-12 pb-6">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center mb-4">
                     <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold uppercase">
                        {patient.name.charAt(0)}
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                       <Phone className="w-4 h-4 text-primary" />
                       <span className="font-medium">{patient.phone}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-3 text-sm overflow-hidden">
                         <Mail className="w-4 h-4 text-primary" />
                         <span className="font-medium truncate">{patient.email}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-start gap-3 text-sm">
                         <MapPin className="w-4 h-4 text-primary mt-0.5" />
                         <span className="font-medium italic">{patient.address}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-dashed">
                       <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Registered On</p>
                       <p className="text-sm">{new Date(patient.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
               </div>
            </Card>

            <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-sm uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                   <ShieldAlert className="w-4 h-4" /> Medical Notes
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {patient.medical_notes ? (
                   <p className="text-sm whitespace-pre-wrap leading-relaxed">{patient.medical_notes}</p>
                 ) : (
                   <p className="text-xs italic text-muted-foreground">No critical medical notes added.</p>
                 )}
               </CardContent>
            </Card>
          </div>

          {/* Main Content: History Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="appointments" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="appointments" className="gap-2">
                  <Calendar className="w-4 h-4" /> Appointments
                </TabsTrigger>
                <TabsTrigger value="medical" className="gap-2">
                  <FileText className="w-4 h-4" /> Clinical & Files
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2">
                  <CreditCard className="w-4 h-4" /> Billing History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Appointment History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.length === 0 ? (
                      <div className="text-center py-12 bg-muted/20 rounded-xl">
                        <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">No appointments found for this patient.</p>
                      </div>
                    ) : (
                      appointments.map(appt => (
                        <div key={appt.id} className="p-4 border rounded-xl hover:bg-muted/30 transition-colors flex flex-col md:flex-row justify-between gap-4">
                           <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                 <span className="font-bold text-base">{appt.clinic_services?.service_name || 'Consultation'}</span>
                                 <Badge className={`
                                    ${appt.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                      appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                      'bg-blue-100 text-blue-700'}
                                 `}>{appt.status.toUpperCase()}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                 <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {appt.appointment_date}</span>
                                 <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {appt.appointment_start?.substring(0,5)}</span>
                                 <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> Dr. {appt.doctors?.name || 'Assigned Specialist'}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 self-end md:self-center">
                              <Button variant="ghost" size="sm" asChild>
                                 <Link to={`/admin/bookings/${appt.id}`} className="gap-2">View Details <ExternalLink className="w-3 h-3" /></Link>
                              </Button>
                           </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6 animate-fade-in">
                {/* Clinical Results Summary */}
                <Card className="border-l-4 border-l-teal-500">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                         <Stethoscope className="w-5 h-5 text-teal-600" /> Clinical Examination Notes
                      </CardTitle>
                      <CardDescription>Direct findings from consultations</CardDescription>
                    </div>
                    {userRole === 'doctor' && appointments.length > 0 && (
                      <Button size="sm" variant="outline" className="gap-2 text-teal-700 hover:text-teal-800 hover:bg-teal-50 border-teal-200" onClick={() => {
                        setNoteForm({ appointmentId: appointments[0].id, notes: appointments[0].additional_notes || '' });
                        setIsNoteOpen(true);
                      }}>
                        <PlusCircle className="w-4 h-4" /> Add Note
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {appointments.filter(a => a.additional_notes).length === 0 ? (
                       <p className="text-sm text-muted-foreground italic py-4">No clinical examination notes available.</p>
                     ) : (
                       appointments.filter(a => a.additional_notes).map(a => (
                         <div key={a.id} className="p-4 bg-teal-50/30 rounded-lg border border-teal-100 group relative">
                            {userRole === 'doctor' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 hover:bg-teal-100"
                                onClick={() => {
                                  setNoteForm({ appointmentId: a.id, notes: a.additional_notes || '' });
                                  setIsNoteOpen(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            <div className="flex justify-between items-center mb-2 pr-8">
                               <p className="text-xs font-bold text-teal-800">{a.appointment_date}</p>
                               <Badge variant="outline" className="text-[10px]">{a.clinic_services?.service_name}</Badge>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.additional_notes}</p>
                         </div>
                       ))
                     )}
                  </CardContent>
                </Card>

                {/* Uploaded Documents */}
                <Card className="border-l-4 border-l-indigo-500">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                         <FileText className="w-5 h-5 text-indigo-600" /> Uploaded Files & Scans
                      </CardTitle>
                      <CardDescription>Official medical documents and images</CardDescription>
                    </div>
                    {(userRole === 'admin' || userRole === 'doctor') && appointments.length > 0 && (
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => {
                        setUploadForm({ ...uploadForm, appointmentId: appointments[0].id });
                        setIsUploadOpen(true);
                      }}>
                        <PlusCircle className="w-4 h-4" /> Upload
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {medicalRecords.filter(r => r.file_url).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm italic">
                        No uploaded documents found for this patient.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {medicalRecords.filter(r => r.file_url).map((doc) => (
                          <div key={doc.id} className="p-4 border-2 border-slate-50 rounded-xl bg-white flex flex-col gap-3">
                             <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                   <FileText className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div className="min-w-0">
                                   <p className="font-bold text-sm truncate">{doc.record_title}</p>
                                   <p className="text-[10px] text-slate-500">{doc.record_type} · {new Date(doc.created_at).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <Button variant="outline" size="sm" onClick={() => handleDownload(doc)} className="w-full text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                                <Download className="w-3.5 h-3.5 mr-2" /> Download
                             </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payments & Billing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {billingRecords.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm italic">No billing records found.</div>
                    ) : (
                      billingRecords.map(bill => (
                        <div key={bill.id} className="p-4 border rounded-xl flex items-center justify-between">
                           <div>
                              <p className="font-bold">Invoice #{bill.invoice_number}</p>
                              <p className="text-xs text-muted-foreground">{new Date(bill.created_at).toLocaleDateString()}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-black text-primary">₦ {Number(bill.amount).toLocaleString()}</p>
                              <Badge className={bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                 {bill.status.toUpperCase()}
                              </Badge>
                           </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
         <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Edit Patient Profile</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdatePatient} className="space-y-4 pt-4">
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>General Medical Notes</Label>
                    <Textarea value={editForm.medical_notes} onChange={e => setEditForm({...editForm, medical_notes: e.target.value})} rows={3} placeholder="Allergies, chronic conditions, etc." />
                  </div>
               </div>
               <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSaving}>
                     {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
         <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Upload Medical Record</DialogTitle></DialogHeader>
            <form onSubmit={handleUploadDocument} className="space-y-4 pt-4">
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Visit / Appointment Context *</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={uploadForm.appointmentId} 
                      onChange={e => setUploadForm({...uploadForm, appointmentId: e.target.value})} 
                      required
                    >
                      <option value="">Select Appointment</option>
                      {appointments.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.appointment_date} - {a.clinic_services?.service_name || 'Consultation'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Document Title *</Label>
                    <Input 
                      placeholder="e.g. Blood Test Results" 
                      value={uploadForm.title} 
                      onChange={e => setUploadForm({...uploadForm, title: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Document Type *</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={uploadForm.type} 
                      onChange={e => setUploadForm({...uploadForm, type: e.target.value})} 
                      required
                    >
                      <option value="General">General</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Test Result">Test/Lab Result</option>
                      <option value="Scan">Scan/Imaging</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select File *</Label>
                    <Input 
                      type="file" 
                      onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)} 
                      required 
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes / Remarks</Label>
                    <Textarea 
                      placeholder="Any additional instructions or remarks..." 
                      value={uploadForm.notes} 
                      onChange={e => setUploadForm({...uploadForm, notes: e.target.value})} 
                      rows={2}
                    />
                  </div>
               </div>
               <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isUploading || !uploadFile}>
                     {isUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>

      {/* Clinical Note Dialog */}
      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
         <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Clinical Note</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdateNote} className="space-y-4 pt-4">
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Visit / Appointment Context *</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={noteForm.appointmentId} 
                      onChange={e => {
                        const appdId = e.target.value;
                        const defaultNotes = appointments.find(a => a.id === appdId)?.additional_notes || '';
                        setNoteForm({ appointmentId: appdId, notes: defaultNotes });
                      }} 
                      required
                    >
                      <option value="">Select Appointment</option>
                      {appointments.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.appointment_date} - {a.clinic_services?.service_name || 'Consultation'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Examination Notes / Findings *</Label>
                    <Textarea 
                      placeholder="Symptoms, diagnosis, prescriptions, general findings..." 
                      value={noteForm.notes} 
                      onChange={e => setNoteForm({...noteForm, notes: e.target.value})} 
                      required
                      rows={6}
                    />
                  </div>
               </div>
               <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsNoteOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSavingNote}>
                     {isSavingNote ? 'Saving...' : 'Save Note'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfile;
