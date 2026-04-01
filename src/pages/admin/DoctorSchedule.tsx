import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorSchedule = () => {
  const { isStaff } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const timeSlots = [];
  for (let h = 8; h <= 20; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    timeSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  useEffect(() => {
    if (isStaff) {
      fetchData();
    }
  }, [isStaff, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: docs } = await supabase.from('doctors').select('*').eq('is_active', true);
      const { data: appts } = await supabase
        .from('appointments')
        .select('*, clinic_services(service_name)')
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');

      setDoctors(docs || []);
      setAppointments(appts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForDoctorAndTime = (doctorId: string, slot: string) => {
    return appointments.filter(a => {
      if (a.doctor_id !== doctorId) return false;
      const start = a.appointment_start.substring(0, 5);
      return start === slot;
    });
  };

  return (
    <div className="w-full h-full pb-12">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-primary" />
              Doctor Availability Grid
            </h1>
            <p className="text-muted-foreground mt-1">Real-time daily schedule overview for all clinical staff.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
             <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="rounded-lg h-10 w-10">
               <ChevronLeft className="w-5 h-5" />
             </Button>
             <div className="px-6 font-bold text-lg min-w-[180px] text-center">
                {format(selectedDate, 'EEE, MMM dd')}
             </div>
             <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="rounded-lg h-10 w-10">
               <ChevronRight className="w-5 h-5" />
             </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Synchronizing schedules...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-[100px_repeat(auto-fit,minmax(200px,1fr))] border-b-2 border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50 dark:bg-slate-950 z-20">
                <div className="p-4 border-r-2 border-slate-200 dark:border-slate-800 font-bold text-center text-slate-400">TIME</div>
                {doctors.map(doc => (
                  <div key={doc.id} className="p-4 border-r-2 border-slate-200 dark:border-slate-800 text-center last:border-r-0">
                    <p className="font-black text-primary truncate">DR. {doc.name.toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground font-medium">{doc.specialization}</p>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="bg-white dark:bg-slate-900">
                {timeSlots.map(slot => (
                  <div key={slot} className="grid grid-cols-[100px_repeat(auto-fit,minmax(200px,1fr))] border-b border-slate-100 dark:border-slate-800 group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <div className="p-4 border-r-2 border-slate-200 dark:border-slate-800 font-mono font-bold text-sm text-slate-500 text-center bg-slate-50/30 dark:bg-slate-950/30">
                      {slot}
                    </div>
                    {doctors.map(doc => {
                      const appts = getAppointmentsForDoctorAndTime(doc.id, slot);
                      const isBreak = slot >= (doc.break_start?.substring(0,5) || '24:00') && slot < (doc.break_end?.substring(0,5) || '00:00');
                      
                      return (
                        <div key={`${doc.id}-${slot}`} className="p-2 border-r-2 border-slate-100 dark:border-slate-800 min-h-[80px] last:border-r-0 flex flex-col gap-2 relative">
                          {isBreak ? (
                            <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/30 flex items-center justify-center pointer-events-none">
                              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 rotate-[-15deg]">Lunch Break</span>
                            </div>
                          ) : appts.map(a => (
                            <Link 
                              to={`/admin/bookings/${a.id}`} 
                              key={a.id} 
                              className={`p-2 rounded-lg border-l-4 shadow-sm hover:scale-[1.02] transition-transform flex flex-col gap-1 ${
                                a.status === 'in consultation' ? 'bg-teal-50 border-teal-500 text-teal-900' :
                                a.status === 'waiting' ? 'bg-amber-50 border-amber-500 text-amber-900' :
                                'bg-blue-50 border-blue-500 text-blue-900'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-xs truncate max-w-[120px]">{a.patient_name}</span>
                                <Badge variant="outline" className="text-[8px] h-4 px-1">{a.status.toUpperCase()}</Badge>
                              </div>
                              <span className="text-[10px] opacity-70 flex items-center gap-1">
                                <Eye className="w-2.5 h-2.5" /> {a.clinic_services?.service_name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4 flex-wrap justify-center sm:justify-start">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
             <div className="w-3 h-3 rounded-full bg-blue-500"></div> Confirmed
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
             <div className="w-3 h-3 rounded-full bg-amber-500"></div> Checked-in / Waiting
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
             <div className="w-3 h-3 rounded-full bg-teal-500"></div> In Consultation
           </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
