import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, Save, Edit } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

const AdminDoctors = () => {
  const { user, userRole } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  
  const initialForm = {
    name: '',
    specialization: '',
    working_days: 'Monday, Tuesday, Wednesday, Thursday, Friday',
    start_time: '09:00:00',
    end_time: '17:00:00',
    break_start: '13:00:00',
    break_end: '14:00:00',
    is_active: true,
    service_ids: [] as string[]
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let query = supabase.from('doctors').select('*, doctor_services(service_id)').order('created_at', { ascending: false });
      
      if (userRole === 'doctor' && user) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setDoctors(data || []);

      const { data: svcData } = await supabase.from('clinic_services').select('*').eq('is_active', true);
      setAllServices(svcData || []);
    } catch (err) {
      toast.error('Failed to load doctors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const daysArray = formData.working_days.split(',').map(d => d.trim()).filter(d => Boolean(d));

      const payload = {
        name: formData.name,
        specialization: formData.specialization,
        working_days: daysArray,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_start: formData.break_start || null,
        break_end: formData.break_end || null,
        is_active: formData.is_active
      };

      let doctorId = editingDoctor ? editingDoctor.id : null;

      if (editingDoctor) {
        const { error } = await supabase.from('doctors').update(payload).eq('id', editingDoctor.id);
        if (error) throw error;
        toast.success("Doctor updated successfully");
      } else {
        const { data: newDoc, error } = await supabase.from('doctors').insert([payload]).select().single();
        if (error) throw error;
        toast.success("Doctor added successfully");
        doctorId = newDoc.id;
      }

      if (doctorId) {
        await supabase.from('doctor_services').delete().eq('doctor_id', doctorId);
        if (formData.service_ids.length > 0) {
          const servicePayload = formData.service_ids.map(sid => ({ doctor_id: doctorId, service_id: sid }));
          await supabase.from('doctor_services').insert(servicePayload);
        }
      }
      
      setFormData(initialForm);
      setEditingDoctor(null);
      fetchDoctors();
    } catch(err: any) {
      toast.error(err.message || "Failed to save doctor");
    }
  };

  const handleEdit = (doc: any) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name,
      specialization: doc.specialization,
      working_days: doc.working_days.join(', '),
      start_time: doc.start_time,
      end_time: doc.end_time,
      break_start: doc.break_start || '',
      break_end: doc.break_end || '',
      is_active: doc.is_active,
      service_ids: doc.doctor_services ? doc.doctor_services.map((ds: any) => ds.service_id) : []
    });
  };

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-primary">{userRole === 'doctor' ? 'My Schedule' : 'Manage Doctors'}</h1>
          <p className="text-sm text-muted-foreground mt-1">Doctor profiles, schedules, and service assignments.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {(userRole === 'admin' || editingDoctor) && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="Dr. Jane Doe" 
                        disabled={userRole === 'doctor'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialization</Label>
                      <Input 
                        required 
                        value={formData.specialization} 
                        onChange={e => setFormData({...formData, specialization: e.target.value})} 
                        placeholder="Optometrist" 
                        disabled={userRole === 'doctor'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Working Days (comma separated)</Label>
                      <Input required value={formData.working_days} onChange={e => setFormData({...formData, working_days: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input required type="time" step="2" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input required type="time" step="2" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Break Start</Label>
                        <Input type="time" step="2" value={formData.break_start} onChange={e => setFormData({...formData, break_start: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Break End</Label>
                        <Input type="time" step="2" value={formData.break_end} onChange={e => setFormData({...formData, break_end: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2 pb-2">
                      <Label>Assigned Services</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {allServices.map(svc => (
                          <div key={svc.id} className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id={`svc-${svc.id}`}
                              checked={formData.service_ids.includes(svc.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setFormData({...formData, service_ids: [...formData.service_ids, svc.id]});
                                } else {
                                  setFormData({...formData, service_ids: formData.service_ids.filter(id => id !== svc.id)});
                                }
                              }}
                            />
                            <Label htmlFor={`svc-${svc.id}`} className="font-normal text-sm">{svc.service_name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                      <Label htmlFor="active">Is Active?</Label>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Button type="submit" className="w-full">
                        {editingDoctor ? <><Save className="w-4 h-4 mr-2" /> Update</> : <><UserPlus className="w-4 h-4 mr-2" /> Create</>}
                      </Button>
                      {editingDoctor && (
                        <Button type="button" variant="outline" onClick={() => { setEditingDoctor(null); setFormData(initialForm); }}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          <div className={(userRole === 'admin' || editingDoctor) ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
            {loading ? <p>Loading...</p> : doctors.length === 0 ? <p>No doctors found. Add one on the left.</p> : (
              doctors.map(doc => (
                <Card key={doc.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-2 h-full ${doc.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                  <CardContent className="p-6 flex justify-between items-center pl-8">
                    <div>
                      <h3 className="text-xl font-bold">{doc.name}</h3>
                      <p className="text-muted-foreground">{doc.specialization}</p>
                      <p className="text-sm mt-2 font-mono">
                        {doc.start_time.substring(0,5)} - {doc.end_time.substring(0,5)} | 
                        Break: {doc.break_start?.substring(0,5) || 'None'} - {doc.break_end?.substring(0,5) || 'None'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.working_days.join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(doc)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctors;
