import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, AlertTriangle, Save, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmergencySlots = () => {
  const [dailySlots, setDailySlots] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('name', 'emergency_slots')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const val = data.value as any;
        setDailySlots(val.daily_slots || 5);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load emergency slot settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('clinic_settings')
        .upsert({
          name: 'emergency_slots',
          value: { daily_slots: dailySlots },
          updated_at: new Date().toISOString()
        }, { onConflict: 'name' });

      if (error) throw error;
      toast.success('Emergency slot configuration saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            Emergency Slot Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure daily emergency appointment limits.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-muted-foreground">Loading settings...</div>
        ) : (
          <div className="space-y-8">
            <Card className="border-2 border-orange-200 bg-orange-50/30 dark:bg-orange-950/10 hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <Shield className="w-5 h-5" />
                  About Emergency Slots
                </CardTitle>
                <CardDescription>
                  Emergency slots are reserved time blocks allowing walk-in patients with urgent eye conditions to be seen 
                  without a prior appointment. These slots are not available for online booking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Daily Emergency Capacity</CardTitle>
                <CardDescription>
                  Set the maximum number of emergency appointment slots available per day across all doctors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="daily-slots" className="text-base font-semibold">Number of Daily Emergency Slots</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="daily-slots"
                      type="number"
                      min={0}
                      max={20}
                      value={dailySlots}
                      onChange={(e) => setDailySlots(Number(e.target.value))}
                      className="max-w-[150px] text-2xl font-bold text-center border-2 focus:ring-primary h-14"
                    />
                    <div className="px-4 py-2 bg-muted rounded-lg text-sm font-medium">
                      Slots Reserved
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 3-5 slots per day for a small clinic, 5-10 for a larger clinic.
                  </p>
                </div>

                <div className="pt-6 border-t">
                  <Button onClick={handleSave} disabled={saving} size="lg" className="px-8 shadow-lg hover:shadow-xl transition-all">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <li>Emergency slots are reserved separately from regular bookable time slots.</li>
                  <li>Receptionists can mark an incoming patient as an emergency walk-in.</li>
                  <li>When the daily emergency limit is reached, additional patients are added to the waitlist.</li>
                  <li>Admins can adjust this value at any time; changes take effect the next business day.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySlots;
