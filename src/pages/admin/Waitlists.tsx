import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type WaitlistEntry = {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  preferred_date: string;
  status: string;
  created_at: string;
  clinic_services: { service_name: string };
  doctors: { name: string };
};

const Waitlists = () => {
  const { isStaff, loading: authLoading } = useAuth();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isStaff) {
      fetchWaitlist();

      // Real-time subscription to waitlist
      const channel = supabase
        .channel('waitlist_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'waitlists' },
          (payload) => {
            fetchWaitlist();
            toast.info('Waitlist updated in real-time');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isStaff]);

  const fetchWaitlist = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlists')
        .select(`
          *,
          clinic_services(service_name),
          doctors(name)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setWaitlistEntries(data as unknown as WaitlistEntry[]);
    } catch (err: any) {
      toast.error('Error fetching waitlists: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('waitlists')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Waitlist entry marked as ${newStatus}`);
      fetchWaitlist();
      
      if (newStatus === 'notified') {
        // Here you would typically trigger an Edge Function to actually send the SMS/Email.
        // For now, we update the UI to indicate they've been notified.
        toast.info('Notification status updated. Be sure to contact them!');
      }

    } catch (err: any) {
      toast.error('Error updating status: ' + err.message);
    }
  };

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Waitlist Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage pending patient requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
               <Link to="/admin/bookings">Schedule</Link>
            </Button>
          </div>
        </div>
         <Card className="shadow-lg border-2">
           <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">Loading waitlist entries...</div>
              ) : waitlistEntries.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-foreground">Waitlist is currently empty</p>
                  <p className="text-sm">Patients who couldn't find a slot will appear here.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {waitlistEntries.map(entry => (
                    <div key={entry.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between">
                       <div>
                         <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{entry.patient_name}</h3>
                            <Badge variant={entry.status === 'waiting' ? 'secondary' : entry.status === 'notified' ? 'default' : entry.status === 'booked' ? 'outline' : 'destructive'} 
                              className={entry.status === 'booked' ? 'bg-green-100/50 text-green-700 border-green-200' : ''}>
                              {entry.status.toUpperCase()}
                            </Badge>
                         </div>
                         <div className="text-sm text-slate-600 mb-2 space-y-1">
                            <p><strong>Phone:</strong> {entry.patient_phone} {entry.patient_email ? `| Email: ${entry.patient_email}` : ''}</p>
                            <p><strong>Requested Date:</strong> {format(new Date(entry.preferred_date), 'EEEE, MMMM do, yyyy')}</p>
                            <p><strong>Service:</strong> {entry.clinic_services?.service_name} with {entry.doctors?.name}</p>
                         </div>
                         <p className="text-xs text-muted-foreground">Joined waitlist on {format(new Date(entry.created_at), 'MM/dd/yyyy h:mm a')}</p>
                       </div>
                       
                       <div className="flex flex-wrap items-center gap-2">
                          {entry.status === 'waiting' && (
                            <Button onClick={() => updateStatus(entry.id, 'notified')} variant="default" className="w-full md:w-auto">
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Notified
                            </Button>
                          )}
                          {(entry.status === 'waiting' || entry.status === 'notified') && (
                            <Button onClick={() => updateStatus(entry.id, 'booked')} variant="outline" className="w-full md:w-auto border-green-200 text-green-700 hover:bg-green-50">
                              Patient Booked
                            </Button>
                          )}
                          {entry.status !== 'cancelled' && entry.status !== 'booked' && (
                             <Button onClick={() => updateStatus(entry.id, 'cancelled')} variant="ghost" className="w-full md:w-auto text-destructive hover:bg-destructive/10">
                               <XCircle className="w-4 h-4 mr-2" /> Cancel
                             </Button>
                          )}
                       </div>
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

export default Waitlists;
