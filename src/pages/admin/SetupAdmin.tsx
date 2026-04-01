import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, Loader2 } from 'lucide-react';
import { z } from 'zod';

const setupSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  fullName: z.string().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
});

const SetupAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data
      setupSchema.parse(formData);

      setLoading(true);

      // Standard sign up instead of Edge Function
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) {
        toast.error(error.message || 'Failed to create admin account');
        return;
      }

      toast.success('Account created!', {
        description: 'IMPORTANT: If you are not automatically an admin, please run the SQL command provided in ADMIN_SETUP.md in your Supabase SQL Editor.',
        duration: 10000,
      });
      navigate('/admin/login');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl bg-card">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6 mt-4">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Eye className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Administrator Setup</CardTitle>
          <CardDescription className="text-sm">
            Create the root administrator account for Satome Eye Clinic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@satomeeyeclinic.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be 8-128 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-xl hover:shadow-2xl transition-all" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Administrator Account'
              )}
            </Button>

            <div className="text-center mt-6">
              <Button
                type="button"
                variant="link"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={() => navigate('/admin/login')}
                disabled={loading}
              >
                Already have an account? Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAdmin;
