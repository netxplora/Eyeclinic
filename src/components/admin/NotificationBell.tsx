import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell, CalendarClock, UploadCloud, ChevronRight, Activity, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time changes
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, fetchNotifications)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, fetchNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      // Fetch 1: Pending Appointments
      const { data: pendingAppts } = await supabase
        .from('appointments')
        .select('id, patient_email, appointment_date, appointment_start, created_at, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch 2: Recent Activity Logs (excluding login/logout/view)
      const { data: recentActivity } = await supabase
        .from('activity_logs')
        .select(`id, action_type, notes, created_at, profiles:staff_id (full_name)`)
        .not('action_type', 'in', '("view_patient","login","logout")')
        .order('created_at', { ascending: false })
        .limit(3);

      const combined = [];

      if (pendingAppts) {
        pendingAppts.forEach(a => combined.push({
          id: `appt-${a.id}`,
          type: 'appointment',
          title: 'New Appointment Request',
          description: `${a.patient_email} requested ${a.appointment_date} at ${a.appointment_start?.substring(0,5)}`,
          date: new Date(a.created_at),
          path: '/admin/bookings',
          icon: <CalendarClock className="w-4 h-4 text-amber-500" />,
          color: 'bg-amber-100'
        }));
      }

      if (recentActivity) {
        recentActivity.forEach(act => combined.push({
          id: `act-${act.id}`,
          type: 'activity',
          title: (act.action_type || '').replace(/_/g, ' ').toUpperCase(),
          description: act.notes,
          date: new Date(act.created_at),
          path: '/admin/activity-logs',
          icon: act.action_type.includes('upload') ? <UploadCloud className="w-4 h-4 text-indigo-500" /> : <Activity className="w-4 h-4 text-blue-500" />,
          color: act.action_type.includes('upload') ? 'bg-indigo-100' : 'bg-blue-100'
        }));
      }

      // Sort by date DESC
      combined.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      const topNotifications = combined.slice(0, 5);
      setNotifications(topNotifications);
      setUnreadCount(pendingAppts?.length || 0); // We consider 'pending appointments' as unread count
      
    } catch (err) {
      console.error('Failed to load real-time notifications', err);
    }
  };

  const handleNotificationClick = (path: string) => {
    navigate(path);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative mr-2 text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 shadow-xl border-border/40">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">{unreadCount} Action Required</Badge>}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
             <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
             <p className="text-sm">You are all caught up!</p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => handleNotificationClick(notif.path)}
                className="flex items-start gap-3 p-3 border-b border-border/40 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                  {notif.icon}
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  <p className="text-sm font-medium leading-none truncate">{notif.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notif.description}</p>
                  <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {notif.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 self-center" />
              </div>
            ))}
          </div>
        )}
        <div className="p-2 border-t bg-muted/20">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate('/admin/activity-logs')}>
              View All Activity
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
