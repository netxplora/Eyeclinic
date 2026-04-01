import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginSchema = z.object({
      email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
      password: z.string().min(1, 'Password is required').max(128, 'Password must be less than 128 characters')
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
      } else if (userIsStaff) {
        toast.success('Logged in successfully');
        navigate('/admin');
      } else {
        toast.error('Access denied. You do not have staff permissions.');
        await signOut();
        setLoading(false);
      }
    } catch (error: any) {
      toast.error('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl bg-card">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6 mt-4">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <LogIn className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Admin Login</CardTitle>
          <CardDescription className="text-sm">
            Sign in securely to Satome Eye Clinic Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@satomeeyeclinic.com"
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
              {loading ? 'Authenticating...' : 'Sign In Securely'}
            </Button>
          </form>
        </CardContent>
        <div className="text-center pb-6 space-y-2">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            &larr; Back to Website
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
