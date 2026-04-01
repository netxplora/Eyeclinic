import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { AdminOverview } from '@/components/admin/dashboards/AdminOverview';
import { DeskOverview } from '@/components/admin/dashboards/DeskOverview';
import { DoctorOverview } from '@/components/admin/dashboards/DoctorOverview';

const Dashboard = () => {
  const { user, isStaff, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingBookings: 0,
    totalPatients: 0,
    monthlyAppointments: 0,
    pendingWaitlists: 0,
    dailyRevenue: 0,
    completedToday: 0,
    followupsToday: 0,
    walkinsToday: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (isStaff) {
      fetchDashboardData();

      const channel = supabase
        .channel('dashboard-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments' },
          () => fetchDashboardData()
        )
        .subscribe();
      
      const billingChannel = supabase
        .channel('dashboard-billing-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'billing' }, () => fetchDashboardData())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(billingChannel);
      };
    }
  }, [isStaff]);

  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      const today = new Date().toISOString().split('T')[0];
      const startOfToday = new Date().setHours(0,0,0,0);
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

      let doctorId: string | null = null;
      if (userRole === 'doctor' && user) {
        const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', user.id).maybeSingle();
        if (doc) doctorId = doc.id;
      }

      // Counts
      let todayQuery = supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today);
      let pendingQuery = supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      let patientsQuery = supabase.from('patients').select('*', { count: 'exact', head: true });
      let monthlyQuery = supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('appointment_date', firstDayOfMonth);
      let recentQuery = supabase.from('appointments').select('*, clinic_services(service_name)').order('created_at', { ascending: false }).limit(5);
      
      // New Metric Queries
      let completedQuery = supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today).eq('status', 'completed');
      let followupQuery = supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today).ilike('additional_notes', '%follow%up%');
      let walkinQuery = supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today).eq('status', 'checked in');
      
      // Billing Revenue
      let revenueQuery = supabase.from('billing').select('amount').eq('status', 'paid').gte('created_at', new Date(startOfToday).toISOString());

      if (doctorId) {
        todayQuery = todayQuery.eq('doctor_id', doctorId);
        pendingQuery = pendingQuery.eq('doctor_id', doctorId);
        monthlyQuery = monthlyQuery.eq('doctor_id', doctorId);
        recentQuery = recentQuery.eq('doctor_id', doctorId);
        completedQuery = completedQuery.eq('doctor_id', doctorId);
        followupQuery = followupQuery.eq('doctor_id', doctorId);
        walkinQuery = walkinQuery.eq('doctor_id', doctorId);
        
        const { data: appts } = await supabase.from('appointments').select('id').eq('doctor_id', doctorId).eq('appointment_date', today);
        if (appts && appts.length > 0) {
           revenueQuery = revenueQuery.in('appointment_id', appts.map(a => a.id));
        } else {
           revenueQuery = revenueQuery.eq('appointment_id', '00000000-0000-0000-0000-000000000000');
        }
      }

      const [
        { count: todayCount }, 
        { count: pendingCount }, 
        { count: patientsCount }, 
        { count: monthlyCount }, 
        { data: bookingsData }, 
        { count: waitlistsCount }, 
        { data: revData },
        { count: completedCount },
        { count: followupCount },
        { count: walkinCount }
      ] = await Promise.all([
        todayQuery,
        pendingQuery,
        patientsQuery,
        monthlyQuery,
        recentQuery,
        supabase.from('waitlists').select('*', { count: 'exact', head: true }).eq('status', 'waiting'),
        revenueQuery,
        completedQuery,
        followupQuery,
        walkinQuery
      ]);

      const revTotal = revData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      setStats({
        todayAppointments: todayCount || 0,
        pendingBookings: pendingCount || 0,
        totalPatients: patientsCount || 0,
        monthlyAppointments: monthlyCount || 0,
        pendingWaitlists: waitlistsCount || 0,
        dailyRevenue: revTotal,
        completedToday: completedCount || 0,
        followupsToday: followupCount || 0,
        walkinsToday: walkinCount || 0,
      });
      setRecentBookings(bookingsData || []);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingStats(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="w-full h-full pb-12">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10 w-full">
        {userRole === 'admin' ? (
          <AdminOverview stats={stats} loadingStats={loadingStats} recentBookings={recentBookings} />
        ) : userRole === 'doctor' ? (
          <DoctorOverview stats={stats} loadingStats={loadingStats} recentBookings={recentBookings} />
        ) : (
          <DeskOverview stats={stats} loadingStats={loadingStats} recentBookings={recentBookings} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
