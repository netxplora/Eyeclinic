import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Activity, Clock, Search, Filter } from 'lucide-react';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:staff_id (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
      const searchStr = `${log.action_type} ${log.notes} ${log.profiles?.full_name}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            System Activity Logs
          </h2>
          <p className="text-muted-foreground mt-1">Audit trail of all administrative and clinical actions.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                   <CardTitle className="text-lg">Recent Activities</CardTitle>
                   <CardDescription>Last 100 system events</CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                   <div className="relative flex-1 md:w-64">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input 
                        placeholder="Search logs..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                   </div>
                   <Button variant="outline" size="icon">
                       <Filter className="w-4 h-4" />
                   </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-primary border-t-transparent flex rounded-full animate-spin mb-4" />
                 Loading logs...
             </div>
          ) : filteredLogs.length === 0 ? (
             <div className="text-center py-16 text-muted-foreground">
                 <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                 <p className="font-medium text-lg">No activity logs found</p>
                 <p className="text-sm">Try adjusting your search criteria.</p>
             </div>
          ) : (
             <div className="divide-y divide-border">
                 {filteredLogs.map(log => (
                     <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col md:flex-row justify-between gap-4">
                         <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                                ${log.action_type.includes('upload') ? 'bg-indigo-100 text-indigo-700' :
                                  log.action_type.includes('delete') ? 'bg-red-100 text-red-700' :
                                  log.action_type.includes('status') ? 'bg-amber-100 text-amber-700' :
                                  'bg-blue-100 text-blue-700'}
                            `}>
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground capitalize">
                                    {(log.action_type || 'unknown_action').replace(/_/g, ' ')}
                                </h4>
                                <p className="text-sm text-slate-600 mt-1">{log.notes || 'No description provided'}</p>
                                
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                                        By: {log.profiles?.full_name || 'System User'}
                                    </span>
                                </div>
                            </div>
                         </div>
                         <div className="flex md:flex-col items-center md:items-end justify-between text-sm whitespace-nowrap text-muted-foreground">
                            <span>{new Date(log.created_at).toLocaleDateString()}</span>
                            <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                         </div>
                     </div>
                 ))}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityLogs;
