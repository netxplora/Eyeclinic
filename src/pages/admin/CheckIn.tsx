import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, UserCheck, Search, Clock, Check, AlertTriangle, Phone, Mail, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO, isSameDay } from 'date-fns';

const CheckIn = () => {
  const { isStaff } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const today = new Date();

  useEffect(() => {
    if (isStaff) {
      fetchTodayAppointments();
    }
  }, [isStaff]);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const todayStr = format(today, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctors(name), clinic_services(service_name)')
        .eq('appointment_date', todayStr)
        .order('appointment_start', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      toast.error('Failed to load today\'s appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'checked in', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Patient checked in!');
      fetchTodayAppointments();
    } catch (err: any) {
      toast.error('Failed to check in patient');
    }
  };

  const handleMarkWaiting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'waiting', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Patient moved to waiting room');
      fetchTodayAppointments();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleInProgress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'in progress', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Consultation started');
      fetchTodayAppointments();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Consultation marked as completed');
      fetchTodayAppointments();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleNoShow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'no-show', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Marked as no-show');
      fetchTodayAppointments();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.patient_name.toLowerCase().includes(q) ||
      a.booking_id.toLowerCase().includes(q) ||
      (a.patient_phone && a.patient_phone.includes(q))
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'checked in': return 'bg-green-100 text-green-700 border-green-200';
      case 'waiting': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'in progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'no-show': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-red-100 text-red-500 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const checkedInCount = appointments.filter(a => a.status === 'checked in').length;
  const waitingCount = appointments.filter(a => a.status === 'waiting').length;
  const pendingCount = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
              <UserCheck className="w-7 h-7 text-green-500" />
              Patient Check-In
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{format(today, 'EEEE, MMMM do yyyy')}</p>
          </div>
          <Button asChild><Link to="/admin/bookings/new">+ New Walk-in / Booking</Link></Button>
        </div>
        {/* Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-2 border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold">{checkedInCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold">{waitingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, booking ID, or phone..."
              className="pl-10 border-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Appointment Cards */}
        {loading ? (
          <div className="text-center py-20 animate-pulse text-muted-foreground">Loading today's schedule...</div>
        ) : filteredAppointments.length === 0 ? (
          <Card className="text-center py-20">
            <CardContent>
              <UserCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-sm text-muted-foreground mt-1">No scheduled patients {searchQuery ? 'matching your search' : 'for today'}.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => (
              <Card key={appt.id} className="border-2 hover:shadow-md transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Time Block */}
                    <div className="md:w-32 bg-slate-50 dark:bg-slate-900 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r">
                      <p className="text-xl font-mono font-bold">{appt.appointment_start?.substring(0, 5)}</p>
                      <p className="text-xs text-muted-foreground">to {appt.appointment_end?.substring(0, 5)}</p>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold">{appt.patient_name}</h3>
                            <Badge variant="outline" className={getStatusColor(appt.status)}>
                              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </Badge>
                            {appt.is_emergency && (
                              <Badge variant="destructive" className="animate-pulse">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Emergency
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{appt.clinic_services?.service_name} • Dr. {appt.doctors?.name}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {appt.patient_phone}</span>
                            {appt.patient_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {appt.patient_email}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">REF: {appt.booking_id}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {(appt.status === 'pending' || appt.status === 'confirmed') && (
                            <Button size="sm" onClick={() => handleCheckIn(appt.id)} className="bg-green-600 hover:bg-green-700">
                              <UserCheck className="w-4 h-4 mr-1" /> Check In
                            </Button>
                          )}
                          {appt.status === 'checked in' && (
                            <Button size="sm" onClick={() => handleMarkWaiting(appt.id)} className="bg-amber-600 hover:bg-amber-700">
                              <Clock className="w-4 h-4 mr-1" /> Move to Waiting
                            </Button>
                          )}
                          {(appt.status === 'checked in' || appt.status === 'waiting') && (
                            <Button size="sm" onClick={() => handleInProgress(appt.id)} className="bg-purple-600 hover:bg-purple-700">
                              <Stethoscope className="w-4 h-4 mr-1" /> Start Consultation
                            </Button>
                          )}
                          {appt.status === 'in progress' && (
                            <Button size="sm" onClick={() => handleCompleted(appt.id)} className="bg-slate-700 hover:bg-slate-800">
                              <Check className="w-4 h-4 mr-1" /> Mark Complete
                            </Button>
                          )}
                          {(appt.status === 'pending' || appt.status === 'confirmed' || appt.status === 'checked in') && (
                            <Button size="sm" variant="outline" onClick={() => handleNoShow(appt.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                              No Show
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;
