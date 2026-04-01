import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Play, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

const QueuePanel = () => {
  const [serving, setServing] = useState<any[]>([]);
  const [waiting, setWaiting] = useState<any[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchQueue();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('queue-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchQueue();
      })
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchQueue = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors (name),
        clinic_services (service_name)
      `)
      .eq('appointment_date', today)
      .neq('status', 'cancelled')
      .neq('status', 'no-show')
      .order('queue_number', { ascending: true });

    if (data) {
      setServing(data.filter(a => a.status === 'in consultation' || a.status === 'waiting'));
      setWaiting(data.filter(a => a.status === 'checked in' || a.status === 'confirmed'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-teal-400">SATOME EYE CLINIC</h1>
            <p className="text-xl text-slate-400 mt-2 font-medium">Patient Queue Management System</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-mono font-bold tracking-widest">{format(time, 'HH:mm:ss')}</div>
            <div className="text-slate-400 font-medium capitalize">{format(time, 'EEEE, do MMMM')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Now Serving / In Consultation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-teal-500/20 p-3 rounded-2xl">
                 <Play className="w-8 h-8 text-teal-400 fill-teal-400" />
               </div>
               <h2 className="text-4xl font-bold">NOW SERVING</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {serving.length === 0 ? (
                 <Card className="bg-slate-800/50 border-slate-700 h-[300px] flex items-center justify-center col-span-2">
                    <p className="text-slate-500 text-xl italic">No patients currently in consultation</p>
                 </Card>
               ) : (
                 serving.map(appt => (
                   <Card key={appt.id} className="bg-slate-800 border-2 border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.2)] animate-pulse">
                      <CardContent className="p-8 space-y-4">
                         <div className="flex justify-between items-start">
                            <span className="text-8xl font-black text-teal-400">#{appt.queue_number}</span>
                            <Badge className="bg-teal-500 text-slate-900 font-bold text-lg px-4 py-1">CONSULTING</Badge>
                         </div>
                         <div className="pt-4">
                            <h3 className="text-3xl font-bold text-white truncate">{appt.patient_name}</h3>
                            <div className="flex items-center mt-3 text-slate-400 gap-2 text-lg">
                               <ArrowRight className="w-5 h-5 text-teal-500" />
                               <span>DR. {appt.doctors?.name?.toUpperCase()}</span>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                 ))
               )}
            </div>

            {/* Next in Queue Summary */}
            <div className="bg-slate-800/40 rounded-3xl p-8 border border-white/5">
               <h3 className="text-slate-400 font-bold mb-6 flex items-center gap-2">
                 <Clock className="w-5 h-5" /> NEXT IN QUEUE
               </h3>
               <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {waiting.slice(0, 12).map(appt => (
                    <div key={appt.id} className="flex flex-col items-center">
                       <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold border-2 border-slate-600">
                         {appt.queue_number}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sidebar: Waiting Room Status */}
          <div className="space-y-6">
             <Card className="bg-slate-800 border-slate-700 overflow-hidden">
                <CardHeader className="bg-slate-700/50 border-b border-slate-600">
                   <CardTitle className="flex items-center gap-2 text-white">
                     <Users className="w-5 h-5 text-teal-400" />
                     Waiting Room
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
                      {waiting.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">Waitlist is currently empty</div>
                      ) : (
                        waiting.map(appt => (
                          <div key={appt.id} className="p-4 hover:bg-slate-700/30 transition-colors flex justify-between items-center">
                             <div>
                                <div className="text-2xl font-black text-slate-300">#{appt.queue_number}</div>
                                <div className="text-sm font-medium text-slate-500 truncate max-w-[150px]">{appt.patient_name}</div>
                             </div>
                             <div className="text-right">
                                <Badge variant="outline" className={appt.status === 'checked in' ? 'border-green-500 text-green-400' : 'border-slate-500 text-slate-400'}>
                                  {appt.status.toUpperCase()}
                                </Badge>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </CardContent>
             </Card>

             <div className="bg-teal-500 rounded-3xl p-8 text-slate-900 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <UserCheck className="w-6 h-6" />
                  <span className="font-bold text-xl uppercase tracking-wider">Quick Note</span>
                </div>
                <p className="font-medium text-lg leading-tight">
                  Please proceed to the Reception Desk if your number is called but you have not checked in.
                </p>
             </div>
          </div>
        </div>

        {/* Footer Ribbon */}
        <div className="bg-slate-800/80 p-4 rounded-xl text-center text-slate-500 text-sm border border-white/5">
           &copy; {new Date().getFullYear()} Satome Eye Clinic Management System &bull; Healthcare with Vision
        </div>
      </div>
    </div>
  );
};

export default QueuePanel;
