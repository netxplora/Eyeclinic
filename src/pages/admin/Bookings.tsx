import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, subDays, parseISO, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ListIcon, MousePointerClick, Check, X, Edit, Trash, ChevronLeft, ChevronRight, Search, Filter, MoreVertical, Phone, Mail } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const AdminBookings = () => {
  const { isStaff, userRole, user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Reschedule State
  const [rescheduleData, setRescheduleData] = useState<{ id: string, date: string, start: string, end: string, docId: string } | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    if (isStaff) {
      fetchData();
    }
  }, [isStaff]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let docsQuery = supabase.from('doctors').select('*');
      let apptsQuery = supabase.from('appointments').select(`
          *,
          doctors!inner (name, specialization),
          clinic_services (service_name, duration_minutes)
        `).order('appointment_date', { ascending: false }).order('appointment_start');

      // Restrict doctors from seeing other schedules
      if (userRole === 'doctor' && user) {
        // Fetch the doctor id first to filter appointments efficiently if RLS doesn't do it alone
        const { data: myDoc } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
        if (myDoc) {
          docsQuery = docsQuery.eq('id', myDoc.id);
          apptsQuery = apptsQuery.eq('doctor_id', myDoc.id);
          setSelectedDoctorId(myDoc.id); // Default to their own id
        }
      }

      const [docsRes, apptsRes] = await Promise.all([docsQuery, apptsQuery]);

      if (docsRes.error) throw docsRes.error;
      if (apptsRes.error) throw apptsRes.error;

      setDoctors(docsRes.data || []);
      setAppointments(apptsRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load scheduling data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [appointments, searchQuery, selectedDoctorId, selectedDate, viewMode]);

  const filterData = () => {
    let filtered = [...appointments];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.patient_name.toLowerCase().includes(q) || 
        a.booking_id.toLowerCase().includes(q) ||
        (a.patient_email && a.patient_email.toLowerCase().includes(q))
      );
    }

    if (selectedDoctorId !== 'all') {
      filtered = filtered.filter(a => a.doctor_id === selectedDoctorId);
    }

    if (viewMode === 'calendar') {
      // Calendar view only shows the selected date
      filtered = filtered.filter(a => isSameDay(parseISO(a.appointment_date), selectedDate));
    }

    setFilteredAppointments(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };


  const handleRescheduleSubmit = async () => {
    if (!rescheduleData) return;
    try {
      const { error } = await supabase.from('appointments').update({
        appointment_date: rescheduleData.date,
        appointment_start: rescheduleData.start,
        appointment_end: rescheduleData.end,
        status: 'rescheduled',
        doctor_id: rescheduleData.docId
      }).eq('id', rescheduleData.id);

      if (error) throw error;
      toast.success('Appointment rescheduled successfully');
      setRescheduleData(null);
      setIsRescheduling(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to reschedule');
    }
  };

  const timeSlots = [
    "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00", 
    "13:00:00", "14:00:00", "15:00:00", "16:00:00", "17:00:00"
  ];

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Appointment Schedule</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage all appointments.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
             {(userRole === 'admin' || userRole === 'receptionist') && (
               <Button asChild><Link to="/admin/bookings/new">+ New Appointment</Link></Button>
             )}
             {userRole === 'admin' && (
               <>
                 <Button variant="outline" asChild><Link to="/admin/doctors">Manage Doctors</Link></Button>
                 <Button variant="outline" asChild><Link to="/admin/services">Manage Services</Link></Button>
               </>
             )}
          </div>
        </div>
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto">
             <Button 
               variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
               size="sm" 
               className={cn("flex-1 lg:flex-none rounded-lg font-semibold", viewMode === 'calendar' && "bg-white shadow-sm")}
               onClick={() => setViewMode('calendar')}
             >
               <CalendarIcon className="w-4 h-4 mr-2" /> Daily Schedule
             </Button>
             <Button 
               variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
               size="sm" 
               className={cn("flex-1 lg:flex-none rounded-lg font-semibold", viewMode === 'list' && "bg-white shadow-sm")}
               onClick={() => setViewMode('list')}
             >
               <ListIcon className="w-4 h-4 mr-2" /> All Bookings
             </Button>
           </div>
           
           <div className="h-8 w-px bg-slate-200 hidden lg:block mx-2"></div>
           
           <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
             {viewMode === 'calendar' && (
               <Popover>
                 <PopoverTrigger asChild>
                   <Button variant="outline" className="justify-start text-left font-normal border-2 w-full lg:w-[240px] bg-white">
                     <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                     {format(selectedDate, "PPP")}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0" align="start">
                   <Calendar
                     mode="single"
                     selected={selectedDate}
                     onSelect={(d) => d && setSelectedDate(d)}
                     initialFocus
                     className="bg-white"
                   />
                 </PopoverContent>
               </Popover>
             )}

             <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
               <SelectTrigger className="w-full lg:w-[180px] border-2 bg-white">
                 <Filter className="w-4 h-4 mr-2 opacity-50" />
                 <SelectValue placeholder="All Doctors" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Doctors</SelectItem>
                 {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
               </SelectContent>
             </Select>
           </div>
           
           <div className="hidden lg:block flex-1"></div>
           
           <div className="relative w-full lg:w-[300px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input 
               className="pl-10 border-2 bg-white" 
               placeholder="Search patient, ID, or email..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
           </div>
        </div>

        {loading ? (
           <div className="text-center py-20 animate-pulse text-muted-foreground">Loading scheduling engine...</div>
        ) : viewMode === 'calendar' ? (
           // DAILY SCHEDULE FULL WIDTH VIEW 
           <div className="space-y-6">
             
             {/* Main Schedule Container */}
             <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[600px]">
                <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-2 order-2 sm:order-1">
                     <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => setSelectedDate(subDays(selectedDate, 1))}><ChevronLeft className="w-4 h-4" /></Button>
                     <Button variant="outline" size="sm" className="bg-white font-semibold" onClick={() => setSelectedDate(new Date())}>Today</Button>
                     <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight className="w-4 h-4" /></Button>
                   </div>
                   
                   <h2 className="text-xl font-bold flex items-center gap-2 order-1 sm:order-2 text-slate-800">
                     <CalendarIcon className="w-5 h-5 text-primary" /> 
                     {format(selectedDate, 'EEEE, MMMM do yyyy')}
                   </h2>
                   
                   <div className="flex gap-2 order-3">
                     <Badge variant="outline" className="bg-white shadow-sm border-slate-200 px-3 py-1 text-slate-700">
                       {filteredAppointments.length} Appointments
                     </Badge>
                   </div>
                </div>
                
                <div className="p-4 relative">
                   {filteredAppointments.length === 0 ? (
                      <div className="text-center py-32 text-slate-400">
                        <MousePointerClick className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        No appointments scheduled for this day
                      </div>
                   ) : (
                     <div className="space-y-4">
                       {[...filteredAppointments].sort((a,b) => (a.queue_number || 0) - (b.queue_number || 0)).map(appt => {
                         let statusColor = "bg-amber-100 border-amber-300 text-amber-900";
                         let dotColor = "bg-amber-500";
                         if (appt.status === 'confirmed' || appt.status === 'checked in') { statusColor = "bg-green-50 border-green-300 text-green-900"; dotColor = "bg-green-500"; }
                         if (appt.status === 'rescheduled') { statusColor = "bg-blue-50 border-blue-300 text-blue-900"; dotColor = "bg-blue-500"; }
                         if (appt.status === 'completed') { statusColor = "bg-slate-100 border-slate-300 text-slate-900"; dotColor = "bg-slate-500"; }
                         if (appt.status === 'cancelled' || appt.status === 'no-show') { statusColor = "bg-red-50 border-red-300 text-red-900 opacity-60"; dotColor = "bg-red-500"; }

                         return (
                           <div key={appt.id} className={`flex flex-col md:flex-row rounded-lg border-2 p-4 transition-all hover:shadow-md ${statusColor}`}>
                             
                             <div className="md:w-56 border-b md:border-b-0 md:border-r border-current/20 pb-4 md:pb-0 md:pr-4 mr-4 flex flex-col justify-center">
                               <div className="flex items-center gap-2 font-mono font-bold text-lg">
                                  <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                                  {appt.appointment_start.substring(0,5)} - {appt.appointment_end.substring(0,5)}
                               </div>
                               <div className="flex items-center gap-2 mt-2">
                                  {appt.queue_number && (
                                    <Badge className="bg-primary text-white font-mono rounded-full h-8 w-8 flex items-center justify-center p-0">#{appt.queue_number}</Badge>
                                  )}
                                  <Badge variant="outline" className="bg-white/50">{appt.doctors?.name || 'Unassigned'}</Badge>
                               </div>
                             </div>
                             
                             <div className="flex-1 mt-4 md:mt-0">
                               <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-lg">{appt.patient_name}</h3>
                                      {appt.priority === 'urgent' && <Badge className="bg-red-500 animate-pulse">URGENT</Badge>}
                                      {appt.status === 'checked in' && <Badge variant="secondary" className="bg-green-600 text-white">READY</Badge>}
                                    </div>
                                    <p className="text-sm opacity-80 font-medium mb-1 drop-shadow-sm">{appt.clinic_services?.service_name}</p>
                                    <p className="text-xs font-mono opacity-80">REF: {appt.booking_id}</p>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div className="flex flex-wrap gap-2 justify-end max-w-[200px]">
                                     {appt.status === 'pending' && userRole !== 'doctor' && (
                                       <>
                                         <Button size="icon" variant="outline" className="h-8 w-8 bg-white" onClick={() => updateStatus(appt.id, 'confirmed')}><Check className="w-4 h-4 text-green-600" /></Button>
                                         <Button size="icon" variant="outline" className="h-8 w-8 bg-white" onClick={() => updateStatus(appt.id, 'cancelled')}><X className="w-4 h-4 text-red-600" /></Button>
                                       </>
                                     )}
                                     {appt.status === 'confirmed' && (
                                       <>
                                         <Button size="sm" variant="outline" className="bg-white h-8 text-xs" onClick={() => updateStatus(appt.id, 'completed')}>Mark Complete</Button>
                                         <Button size="sm" variant="outline" className="bg-white h-8 text-xs text-red-600" onClick={() => updateStatus(appt.id, 'no-show')}>No Show</Button>
                                       </>
                                     )}
                                     {(userRole === 'admin' || userRole === 'receptionist') && (
                                       <Dialog open={isRescheduling && rescheduleData?.id === appt.id} onOpenChange={(open) => {
                                         setIsRescheduling(open);
                                         if(open) setRescheduleData({ id: appt.id, date: appt.appointment_date, start: appt.appointment_start, end: appt.appointment_end, docId: appt.doctor_id });
                                       }}>
                                         <DialogTrigger asChild>
                                            <Button size="icon" variant="outline" className="h-8 w-8 bg-white"><Edit className="w-4 h-4" /></Button>
                                         </DialogTrigger>
                                         <DialogContent>
                                           <DialogHeader><DialogTitle>Reschedule Appointment</DialogTitle></DialogHeader>
                                           <div className="space-y-4 py-4">
                                              <div className="space-y-2">
                                                <Label>Select New Doctor</Label>
                                                <Select value={rescheduleData?.docId || ''} onValueChange={v => setRescheduleData({...rescheduleData!, docId: v})}>
                                                  <SelectTrigger><SelectValue/></SelectTrigger>
                                                  <SelectContent>
                                                    {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label>New Date</Label>
                                                <Input type="date" value={rescheduleData?.date || ''} onChange={e => setRescheduleData({...rescheduleData!, date: e.target.value})} />
                                              </div>
                                              <div className="space-y-2">
                                                <Label>New Start Time</Label>
                                                <Select value={rescheduleData?.start || ''} onValueChange={v => setRescheduleData({...rescheduleData!, start: v})}>
                                                  <SelectTrigger><SelectValue/></SelectTrigger>
                                                  <SelectContent>
                                                    {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-2">
                                                <Label>New End Time (Manual override)</Label>
                                                <Select value={rescheduleData?.end || ''} onValueChange={v => setRescheduleData({...rescheduleData!, end: v})}>
                                                  <SelectTrigger><SelectValue/></SelectTrigger>
                                                  <SelectContent>
                                                    {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                           </div>
                                           <DialogFooter>
                                              <Button onClick={handleRescheduleSubmit}>Confirm Reschedule</Button>
                                           </DialogFooter>
                                         </DialogContent>
                                       </Dialog>
                                     )}
                                  </div>
                               </div>
                               
                               <div className="mt-4 flex gap-4 text-sm opacity-80">
                                  <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {appt.patient_phone}</div>
                                  <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {appt.patient_email || 'N/A'}</div>
                                </div>
                               {appt.additional_notes && (
                                 <div className="mt-3 bg-white/40 p-2 rounded text-sm italic">
                                   Note: {appt.additional_notes}
                                 </div>
                               )}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   )}
                </div>
             </div>

             {/* Bottom Legend */}
             <div className="flex flex-wrap gap-6 justify-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-sm font-medium">
                <div className="flex items-center gap-2 text-slate-600"><div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div> Pending Approval</div>
                <div className="flex items-center gap-2 text-slate-600"><div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div> Confirmed / In-Progress</div>
                <div className="flex items-center gap-2 text-slate-600"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div> Rescheduled</div>
                <div className="flex items-center gap-2 text-slate-600"><div className="w-3 h-3 rounded-full bg-slate-500 shadow-sm"></div> Successfully Completed</div>
                <div className="flex items-center gap-2 text-slate-600"><div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div> Cancelled / No-show</div>
             </div>
           </div>
        ) : (
           // LIST ALL VIEW 
           <Card className="border-0 shadow-lg">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-slate-100 text-slate-600 uppercase">
                   <tr>
                     <th className="p-4">Date/Time</th>
                     <th className="p-4">Patient</th>
                     <th className="p-4">Doctor</th>
                     <th className="p-4">Service</th>
                     <th className="p-4">Status</th>
                     <th className="p-4">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredAppointments.length === 0 ? (
                     <tr><td colSpan={6} className="text-center p-8 text-slate-500">No appointments found.</td></tr>
                   ) : (
                     filteredAppointments.map(appt => (
                       <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                         <td className="p-4">
                           <div className="font-bold">{appt.appointment_date}</div>
                           <div className="text-xs font-mono text-slate-500">{appt.appointment_start.substring(0,5)}</div>
                         </td>
                         <td className="p-4">
                           <div className="font-bold">{appt.patient_name}</div>
                           <div className="text-xs text-slate-500">{appt.patient_phone}</div>
                         </td>
                         <td className="p-4">{appt.doctors?.name || 'Unassigned'}</td>
                         <td className="p-4">{appt.clinic_services?.service_name}</td>
                         <td className="p-4">
                           <Badge variant="outline" className={appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : appt.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}>
                             {appt.status.toUpperCase()}
                           </Badge>
                         </td>
                         <td className="p-4">
                            {/* Simple inline buttons for quick view toggle */}
                            <Button size="sm" variant="ghost" onClick={() => { setViewMode('calendar'); setSelectedDate(parseISO(appt.appointment_date)); }}>View in Day</Button>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           </Card>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
