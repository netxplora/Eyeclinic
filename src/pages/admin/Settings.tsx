import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, User, Bell, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { user, userRole, isStaff, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    marketingUpdates: false,
  });

  useEffect(() => {
    loadNotificationPrefs();
  }, []);

  const loadNotificationPrefs = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('value')
        .eq('name', 'notification_prefs')
        .single();

      if (data && !error) {
        const val = data.value as any;
        setNotifPrefs({
          emailNotifications: val.emailNotifications ?? true,
          inAppNotifications: val.inAppNotifications ?? true,
          marketingUpdates: val.marketingUpdates ?? false,
        });
      }
    } catch (err) {
      // OK — first load, defaults are fine
    }
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      const { error } = await supabase
        .from('clinic_settings')
        .upsert({
          name: 'notification_prefs',
          value: notifPrefs,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'name' });

      if (error) throw error;
      toast.success('Notification preferences saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  // Route protection is now handled by ProtectedRoute wrapper

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your profile details and role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                  {userRole || 'No role assigned'}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{user?.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" asChild>
                <Link to="/admin/password">Change Password</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Global Notifications - ADMIN ONLY */}
          {userRole === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Global Notifications
                </CardTitle>
                <CardDescription>Configure clinical and system-wide notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive daily summaries and critical alerts via email.</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifPrefs.emailNotifications}
                    onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, emailNotifications: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="in-app-notifications" className="text-base">In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show popup notifications for new bookings and messages within the dashboard.</p>
                  </div>
                  <Switch
                    id="in-app-notifications"
                    checked={notifPrefs.inAppNotifications}
                    onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, inAppNotifications: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-notifications" className="text-base">Marketing Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about new features and promotions.</p>
                  </div>
                  <Switch
                    id="marketing-notifications"
                    checked={notifPrefs.marketingUpdates}
                    onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, marketingUpdates: v })}
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={handleSavePrefs} disabled={savingPrefs}>
                    {savingPrefs ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Global Preferences</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Note */}
          {userRole !== 'admin' && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Contact an administrator to change your role or access additional features.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
