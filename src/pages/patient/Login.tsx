import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import Layout from '@/components/Layout';

const PatientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginSchema = z.object({
      email: z.string().trim().email('Invalid email address'),
      password: z.string().min(1, 'Password is required')
    });

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error, isStaff: userIsStaff } = await signIn(email, password);

      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success('Logged in successfully');
        if (userIsStaff) {
          navigate('/admin');
        } else {
          navigate('/patient/dashboard');
        }
      }
    } catch (error: any) {
      toast.error('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] bg-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-xl bg-card">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6 mt-4">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <LogIn className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary">Patient Portal</CardTitle>
            <CardDescription className="text-sm mt-2">
              Sign in to manage your appointments and profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-xl hover:shadow-2xl transition-all mt-4"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-6 text-sm text-muted-foreground">
            Don't have an account? <Link to="/signup" className="ml-1 text-primary hover:underline font-medium">Sign Up</Link>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientLogin;
