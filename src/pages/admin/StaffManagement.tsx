import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Shield, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const StaffManagement = () => {
  const { userRole, isStaff, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingStaff, setCreatingStaff] = useState(false);

  const [newStaff, setNewStaff] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'receptionist' as 'admin' | 'receptionist' | 'doctor'
  });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isStaff) {
      if (userRole !== 'admin') {
        toast.error('Access denied. Admin only.');
        navigate('/admin');
        return;
      }
      fetchStaffMembers();
    }
  }, [userRole, isStaff, authLoading, navigate]);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      // Fetch profiles and user_roles separately because the join might fail due to missing FK relationships in schema cache
      const [profilesResponse, rolesResponse] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_roles').select('*')
      ]);

      if (profilesResponse.error) throw profilesResponse.error;
      if (rolesResponse.error) throw rolesResponse.error;

      // Merge the data in memory using user_roles as the starting point
      const staffByRole = (rolesResponse.data || []).map(role => {
        const profile = (profilesResponse.data || []).find(p => p.user_id === role.user_id || p.id === role.user_id);
        return {
          id: role.user_id,
          full_name: profile?.full_name || 'Staff User',
          email: profile?.email || 'No email found',
          user_roles: [role],
          created_at: role.created_at
        };
      });

      setStaffMembers(staffByRole);
    } catch (error: any) {
      console.error('Fetch staff error:', error);
      toast.error('Failed to load staff members: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const passwordSchema = z.object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!newStaff.email || !newStaff.password || !newStaff.fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate password
    const passwordValidation = passwordSchema.safeParse({ password: newStaff.password });
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.errors[0].message);
      return;
    }

    setCreatingStaff(true);

    try {
      // Use a SEPARATE Supabase client for signUp so it never touches the admin session
      const tempClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: false,   // Do NOT persist — this is throwaway
          autoRefreshToken: false,
        }
      });

      // Create the staff user via the isolated client
      const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
        email: newStaff.email,
        password: newStaff.password,
        options: {
          data: {
            full_name: newStaff.fullName,
          }
        }
      });

      if (signUpError) {
        console.error('Error creating staff account');
        toast.error(signUpError.message || 'Failed to create staff member');
        return;
      }

      if (!signUpData.user) {
        toast.error('Failed to create user account');
        return;
      }

      const newUserId = signUpData.user.id;

      // Assign the role using the ADMIN's authenticated client (RLS allows admins)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUserId,
          role: newStaff.role
        });

      if (roleError) {
        console.error('Error assigning role');
        toast.error('Account created but failed to assign role. You may need to assign it manually.');
      } else {
        // If the role is doctor, create a default doctor record
        if (newStaff.role === 'doctor') {
          const { error: doctorError } = await supabase
            .from('doctors')
            .insert({
              user_id: newUserId,
              name: newStaff.fullName,
              specialization: 'General Optometrist',
              is_active: true
            });
            
            if (doctorError) {
              console.error('Error creating doctor record:', doctorError);
              toast.error(`Staff created, but failed to initialize doctor record: ${doctorError.message}`);
            } else {
              toast.success(`Doctor "${newStaff.fullName}" created successfully!`);
            }
        } else {
          toast.success(`Staff member "${newStaff.fullName}" created with role "${newStaff.role}"!`);
        }
      }

      // Reset form
      setNewStaff({
        email: '',
        password: '',
        fullName: '',
        role: 'receptionist'
      });

      // Refresh staff list
      fetchStaffMembers();
    } catch (error: any) {
      console.error('Error in staff creation');
      toast.error(error.message || 'Failed to create staff member');
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (userId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-staff-user', {
        body: { userId }
      });

      if (error || !data.success) {
        toast.error(data?.error || error?.message || 'Failed to delete staff member');
        return;
      }

      toast.success(`Staff member ${staffName} deleted successfully`);
      fetchStaffMembers();
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      toast.error(error.message || 'Failed to delete staff member');
    } finally {
      setDeletingUserId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="w-full h-full pb-8">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Staff Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage staff accounts</p>
        </div>
        {/* Create Staff Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create New Staff Account
            </CardTitle>
            <CardDescription>
              Add a new staff member with their role and credentials. The account and role are assigned instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStaff} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Strong password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Min 8 chars, uppercase, lowercase, number, special character
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newStaff.role}
                    onValueChange={(value: any) => setNewStaff({ ...newStaff, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={creatingStaff} className="w-full md:w-auto">
                  {creatingStaff ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Staff Account
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg bg-muted/50 border p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> If "Confirm email" is enabled in your Supabase Authentication settings, the new staff member will need to verify their email before they can log in.
                  You can disable this in{' '}
                  <span className="font-medium text-foreground">Supabase Dashboard → Authentication → Providers → Email</span>.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>Current Staff Members</CardTitle>
            <CardDescription>
              {staffMembers.length} staff member(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffMembers.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{staff.full_name}</p>
                    <p className="text-sm text-muted-foreground">{staff.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${staff.user_roles?.[0]?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      staff.user_roles?.[0]?.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                      {staff.user_roles?.[0]?.role || 'No Role'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStaff(staff.id, staff.full_name)}
                      disabled={deletingUserId === staff.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {staffMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No staff members yet. Create the first one above.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffManagement;
