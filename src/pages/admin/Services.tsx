import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, Save, Edit, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<any>(null);
  
  const initialForm = {
    service_name: '',
    duration_minutes: 30,
    buffer_minutes: 10,
    price: 0,
    is_active: true
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('clinic_services').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      toast.error('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        service_name: formData.service_name,
        duration_minutes: Number(formData.duration_minutes),
        buffer_minutes: Number(formData.buffer_minutes),
        price: Number(formData.price),
        is_active: formData.is_active
      };

      if (editingService) {
        const { error } = await supabase.from('clinic_services').update(payload).eq('id', editingService.id);
        if (error) throw error;
        toast.success("Service updated successfully");
      } else {
        const { error } = await supabase.from('clinic_services').insert([payload]);
        if (error) throw error;
        toast.success("Service added successfully");
      }
      
      setFormData(initialForm);
      setEditingService(null);
      fetchServices();
    } catch(err: any) {
      toast.error(err.message || "Failed to save service");
    }
  };

  const handleEdit = (svc: any) => {
    setEditingService(svc);
    setFormData({
      service_name: svc.service_name,
      duration_minutes: svc.duration_minutes,
      buffer_minutes: svc.buffer_minutes,
      price: svc.price || 0,
      is_active: svc.is_active
    });
  };

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, and configure clinic services.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{editingService ? 'Edit Service' : 'Add New Service'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input required value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})} placeholder="Eye Exam" />
                </div>
                
                <div className="space-y-2">
                  <Label>Price (₦)</Label>
                  <Input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="5000" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (Mins)</Label>
                    <Input required type="number" min="5" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Buffer (Mins)</Label>
                    <Input required type="number" min="0" value={formData.buffer_minutes} onChange={e => setFormData({...formData, buffer_minutes: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                  <Label htmlFor="active">Is Active?</Label>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button type="submit" className="w-full">
                    {editingService ? <><Save className="w-4 h-4 mr-2" /> Update</> : <><UserPlus className="w-4 h-4 mr-2" /> Create</>}
                  </Button>
                  {editingService && (
                    <Button type="button" variant="outline" onClick={() => { setEditingService(null); setFormData(initialForm); }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
           {loading ? <p>Loading...</p> : services.length === 0 ? <p>No services found. Add one on the left.</p> : (
             services.map(svc => (
               <Card key={svc.id} className="relative overflow-hidden h-fit">
                 <div className={`absolute top-0 left-0 w-2 h-full ${svc.is_active ? 'bg-blue-500' : 'bg-slate-300'}`} />
                 <CardContent className="p-6 flex justify-between items-start pl-8">
                   <div>
                     <h3 className="text-xl font-bold">{svc.service_name}</h3>
                     <p className="text-lg font-semibold text-primary">₦ {Number(svc.price).toLocaleString()}</p>
                     <p className="text-sm mt-2 text-muted-foreground">
                       Duration: {svc.duration_minutes} mins
                     </p>
                     <p className="text-sm text-muted-foreground bg-slate-100 px-2 py-1 rounded inline-block mt-1">
                       Buffer: +{svc.buffer_minutes} mins
                     </p>
                   </div>
                   <div className="flex gap-2">
                     <Button variant="outline" size="icon" onClick={() => handleEdit(svc)}>
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

export default AdminServices;
