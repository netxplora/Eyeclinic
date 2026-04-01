import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Calendar as CalendarIcon, DollarSign, Users, Download, Stethoscope, BarChart3, PieChart } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Analytics = () => {
  const { isStaff, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    dailyCount: 0,
    weeklyCount: 0,
    monthlyCount: 0,
    totalRevenue: 0,
    topServices: [] as any[],
    recentTrends: [] as any[],
    doctorPerformance: [] as { name: string; count: number; completed: number }[],
    statusDistribution: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPatients, setExportingPatients] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date | undefined }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
    to: new Date() // Today
  });

  // Route protection is now handled by ProtectedRoute wrapper

  useEffect(() => {
    if (isStaff) {
      if (dateRange.from) {
        fetchAnalytics();
      }
    }
  }, [isStaff, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Using chosen date range or fallback
      const fromDate = dateRange.from ? dateRange.from.toISOString().split('T')[0] : startOfMonth.toISOString().split('T')[0];
      const toDate = dateRange.to ? dateRange.to.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      // Daily count
      const { count: dailyCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today.toISOString().split('T')[0]);

      // Weekly count
      const { count: weeklyCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
        .lte('appointment_date', today.toISOString().split('T')[0]);

      // Range count (Custom metric replacing Monthly for the specific range)
      const { count: rangeCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', fromDate)
        .lte('appointment_date', toDate);

      // Top services
      const { data: servicesData } = await supabase
        .from('appointments')
        .select('clinic_services(service_name)')
        .gte('appointment_date', fromDate)
        .lte('appointment_date', toDate);

      const serviceCounts: any = {};
      servicesData?.forEach((booking: any) => {
        const name = booking.clinic_services?.service_name || 'General';
        serviceCounts[name] = (serviceCounts[name] || 0) + 1;
      });

      const topServices = Object.entries(serviceCounts)
        .map(([service, count]) => ({ service, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      // Total Revenue (within range)
      const { data: revenueData } = await supabase
        .from('appointments')
        .select('clinic_services(price)')
        .in('status', ['confirmed', 'completed'])
        .gte('appointment_date', fromDate)
        .lte('appointment_date', toDate);

      const totalRevenue = revenueData?.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.clinic_services?.price) || 0);
      }, 0) || 0;

      // Doctor performance
      const { data: doctorData } = await supabase
        .from('appointments')
        .select('doctors(name), status')
        .gte('appointment_date', fromDate)
        .lte('appointment_date', toDate);

      const doctorMap: Record<string, { count: number; completed: number }> = {};
      doctorData?.forEach((a: any) => {
        const name = a.doctors?.name || 'Unassigned';
        if (!doctorMap[name]) doctorMap[name] = { count: 0, completed: 0 };
        doctorMap[name].count++;
        if (a.status === 'completed') doctorMap[name].completed++;
      });
      const doctorPerformance = Object.entries(doctorMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

      // Status distribution
      const statusDistribution: Record<string, number> = {};
      doctorData?.forEach((a: any) => {
        const s = a.status || 'unknown';
        statusDistribution[s] = (statusDistribution[s] || 0) + 1;
      });

      setAnalytics({
        dailyCount: dailyCount || 0,
        weeklyCount: weeklyCount || 0,
        monthlyCount: rangeCount || 0,
        totalRevenue,
        topServices,
        recentTrends: [],
        doctorPerformance,
        statusDistribution,
      });
    } catch (error: any) {
      toast.error('Error fetching analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          booking_id,
          patient_name,
          patient_email,
          patient_phone,
          appointment_date,
          appointment_start,
          status,
          clinic_services:service_id(service_name),
          doctors:doctor_id(name)
        `)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.info("No data to export");
        return;
      }

      // Convert to CSV
      const headers = ['Booking ID', 'Patient Name', 'Patient Email', 'Phone', 'Service', 'Doctor', 'Date', 'Time', 'Status'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const row of data) {
        const serviceName = row.clinic_services?.service_name || 'N/A';
        const doctorName = row.doctors?.name || 'N/A';
        
        const values = [
          row.booking_id,
          `"${(row.patient_name || '').replace(/"/g, '""')}"`,
          row.patient_email || '',
          row.patient_phone || '',
          `"${serviceName.replace(/"/g, '""')}"`,
          `"${doctorName.replace(/"/g, '""')}"`,
          row.appointment_date,
          row.appointment_start,
          row.status
        ];
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `appointments_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Export successful");
    } catch (error: any) {
      toast.error("Failed to export: " + error.message);
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportPatients = async () => {
    try {
      setExportingPatients(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.info('No patient data to export');
        return;
      }

      const headers = ['Name', 'Email', 'Phone', 'Address', 'Date of Birth', 'Last Visit', 'Created At'];
      const csvRows = [headers.join(',')];

      for (const p of data) {
        csvRows.push([
          `"${(p.name || '').replace(/"/g, '""')}"`,
          p.email || '',
          p.phone || '',
          `"${(p.address || '').replace(/"/g, '""')}"`,
          p.date_of_birth || '',
          p.last_visit_date || '',
          p.created_at
        ].join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Patient export successful');
    } catch (error: any) {
      toast.error('Failed to export patients: ' + error.message);
    } finally {
      setExportingPatients(false);
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
    <div className="w-full h-full pb-12">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Analytics & Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Key performance metrics and business insights.</p>
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-900/40",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-amber-600" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(d: any) => setDateRange(d || { from: new Date(), to: new Date() })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.dailyCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Appointments today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.weeklyCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Appointments this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Selected Range</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.monthlyCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Appointments in range</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₦{analytics.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Confirmed & Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Services */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Most Requested Services
                </CardTitle>
                <CardDescription>Services ordered by popularity</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topServices.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No data available yet</p>
                ) : (
                  <div className="space-y-4">
                    {analytics.topServices.map((item: any, index) => {
                      const maxCount = Math.max(...analytics.topServices.map((s: any) => s.count));
                      const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{item.service}</span>
                              <span className="font-bold">{item.count}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary rounded-full h-2 transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doctor Performance & Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-teal-500" />
                    Doctor Performance
                  </CardTitle>
                  <CardDescription>Appointments per doctor</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.doctorPerformance.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {analytics.doctorPerformance.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                              <span className="font-bold text-teal-700">{doc.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.completed} completed</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{doc.count}</p>
                            <p className="text-xs text-muted-foreground">total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-500" />
                    Status Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of all appointment statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(analytics.statusDistribution).length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(analytics.statusDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([status, count]) => {
                          const total = Object.values(analytics.statusDistribution).reduce((a, b) => a + b, 0);
                          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                          const colorMap: Record<string, string> = {
                            'confirmed': 'bg-green-500',
                            'pending': 'bg-yellow-500',
                            'completed': 'bg-blue-500',
                            'cancelled': 'bg-red-500',
                            'checked in': 'bg-emerald-500',
                            'waiting': 'bg-amber-500',
                            'in progress': 'bg-purple-500',
                            'no-show': 'bg-slate-500',
                            'follow-up required': 'bg-orange-500',
                          };
                          return (
                            <div key={status} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${colorMap[status] || 'bg-gray-400'}`} />
                              <span className="text-sm font-medium capitalize flex-1">{status}</span>
                              <span className="text-sm text-muted-foreground">{pct}%</span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Reports
                </CardTitle>
                <CardDescription>Download data for external analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" onClick={handleExportCSV} disabled={exportingCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    {exportingCSV ? 'Exporting...' : 'Export Appointments CSV'}
                  </Button>
                  <Button variant="outline" onClick={handleExportPatients} disabled={exportingPatients}>
                    <Users className="w-4 h-4 mr-2" />
                    {exportingPatients ? 'Exporting...' : 'Export Patients CSV'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
