import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Search, Users, ChevronDown, ChevronUp, Clock, Save, Edit, Calendar, UserPlus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const Patients = () => {
  const { isStaff, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', address: '' });

  // Route protection is now handled by ProtectedRoute wrapper

  useEffect(() => {
    if (isStaff) {
      fetchPatients();
    }
  }, [isStaff]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    filterPatients();
  }, [patients, searchQuery]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('custom_id', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchQuery) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        patient.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.custom_id && patient.custom_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredPatients(filtered);
  };

  const handleExpand = async (patient: any) => {
    if (expandedPatientId === patient.id) {
      setExpandedPatientId(null);
      return;
    }
    setExpandedPatientId(patient.id);
    setLoadingHistory(true);
    setPatientHistory([]);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clinic_services(service_name), doctors(name)')
        .eq('patient_email', patient.email)
        .order('appointment_date', { ascending: false });
        
      if (error) throw error;
      setPatientHistory(data || []);
    } catch (err: any) {
      toast.error('Failed to fetch patient history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartEditNotes = (patient: any) => {
    setEditingNotesId(patient.id);
    setNotesText(patient.medical_notes || '');
  };

  const handleSaveNotes = async (patientId: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ medical_notes: notesText })
        .eq('id', patientId);
        
      if (error) throw error;
      toast.success('Medical notes updated');
      
      // Update local state
      const updated = patients.map(p => p.id === patientId ? { ...p, medical_notes: notesText } : p);
      setPatients(updated);
      setEditingNotesId(null);
    } catch (err: any) {
      toast.error('Failed to update notes');
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      const payload: any = { 
        name: newPatient.name, 
        phone: newPatient.phone 
      };
      if (newPatient.email) payload.email = newPatient.email;
      if (newPatient.address) payload.address = newPatient.address;
      
      // Since email might be unique, just insert and let Supabase error if exists
      const { data, error } = await supabase.from('patients').insert([payload]).select().single();
      if (error) throw error;
      
      toast.success('Patient created successfully');
      setIsAddingPatient(false);
      setNewPatient({ name: '', email: '', phone: '', address: '' });
      fetchPatients();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create patient');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Patient Records</h1>
            <p className="text-sm text-muted-foreground mt-1">{filteredPatients.length} patients</p>
          </div>
          <div>
            <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
              <DialogTrigger asChild>
                <Button><UserPlus className="w-4 h-4 mr-2" /> Add Patient</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Quick Add Patient</DialogTitle></DialogHeader>
                <form onSubmit={handleCreatePatient} className="space-y-4 pt-4">
                   <div className="space-y-2">
                     <Label>Full Name *</Label>
                     <Input required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <Label>Phone *</Label>
                     <Input required value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <Label>Email (Optional)</Label>
                     <Input type="email" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <Label>Address (Optional)</Label>
                     <Input value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} />
                   </div>
                   <Button type="submit" className="w-full">Create Patient</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Patients</CardTitle>
            <CardDescription>Patient database and history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No patients found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-6 border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold uppercase">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-foreground">{patient.name}</h3>
                            {patient.custom_id && (
                              <Badge variant="secondary" className="font-mono text-xs bg-slate-100 border-slate-200">
                                {patient.custom_id}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{patient.email || 'No email'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {patient.last_visit_date && (
                          <span className="hidden sm:inline text-xs text-muted-foreground mr-2">
                            Last visit: {new Date(patient.last_visit_date).toLocaleDateString()}
                          </span>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/patients/${patient.id}`} className="gap-2">
                            <Eye className="w-3.5 h-3.5" /> Full Profile
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleExpand(patient)}>
                          {expandedPatientId === patient.id ? (
                            <><ChevronUp className="w-4 h-4 mr-1" /> Hide</>
                          ) : (
                            <><ChevronDown className="w-4 h-4 mr-1" /> Quick View</>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{patient.phone}</p>
                      </div>
                      {patient.date_of_birth && (
                        <div>
                          <p className="text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                        </div>
                      )}
                      {patient.address && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Address</p>
                          <p className="font-medium">{patient.address}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Expanded Content: History & Notes */}
                    {expandedPatientId === patient.id && (
                      <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Past Appointments */}
                          <div className="lg:col-span-2 space-y-4">
                             <h4 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Appointment History</h4>
                             {loadingHistory ? (
                               <p className="text-sm text-muted-foreground animate-pulse">Loading history...</p>
                             ) : patientHistory.length === 0 ? (
                               <div className="text-center py-6 bg-muted/20 rounded-md">
                                  <p className="text-sm text-muted-foreground">No past appointments found.</p>
                               </div>
                             ) : (
                               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                  {patientHistory.map(apt => (
                                    <div key={apt.id} className="p-3 border rounded-md bg-card flex justify-between items-start gap-4">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-medium text-sm">{apt.clinic_services?.service_name}</p>
                                          <Badge variant="outline" className={`text-[10px] h-5 ${
                                            apt.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                          }`}>{apt.status.toUpperCase()}</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex gap-3">
                                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(apt.appointment_date).toLocaleDateString()}</span>
                                          <span>{apt.appointment_start?.substring(0, 5)}</span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground pt-1">Doc: {apt.doctors?.name}</p>
                                    </div>
                                  ))}
                               </div>
                             )}
                          </div>

                          {/* Medical Notes */}
                          {(userRole === 'doctor' || userRole === 'admin') && (
                            <div className="space-y-4">
                               <h4 className="font-semibold flex items-center justify-between">
                                 <span className="flex items-center gap-2"><Edit className="w-4 h-4 text-primary" /> Medical Notes</span>
                                 {editingNotesId !== patient.id && (
                                   <Button variant="ghost" size="sm" onClick={() => handleStartEditNotes(patient)} className="h-7 text-xs">
                                      Edit
                                   </Button>
                                 )}
                               </h4>
                               
                               <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-md border border-amber-100 dark:border-amber-900/40">
                                 {editingNotesId === patient.id ? (
                                   <div className="space-y-3">
                                      <Textarea 
                                        value={notesText} 
                                        onChange={e => setNotesText(e.target.value)} 
                                        placeholder="Add private medical notes here..."
                                        className="min-h-[120px] bg-white dark:bg-background"
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <Button variant="outline" size="sm" onClick={() => setEditingNotesId(null)}>Cancel</Button>
                                        <Button size="sm" onClick={() => handleSaveNotes(patient.id)}><Save className="w-4 h-4 mr-2" /> Save Notes</Button>
                                      </div>
                                   </div>
                                 ) : (
                                   <p className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300 min-h-[60px]">
                                     {patient.medical_notes || <span className="text-muted-foreground italic">No medical notes recorded yet.</span>}
                                   </p>
                                 )}
                               </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Patients;
