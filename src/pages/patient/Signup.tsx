import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import Layout from '@/components/Layout';

const PatientSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const signupSchema = z.object({
      fullName: z.string().min(2, 'Full name is required'),
      email: z.string().trim().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
    });

    const result = signupSchema.safeParse({ fullName, email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        toast.success('Account created successfully! You can now log in.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error('An error occurred during signup');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] bg-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-xl bg-card">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6 mt-4">
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center shadow-lg">
                <UserPlus className="h-10 w-10 text-secondary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Create Account</CardTitle>
            <CardDescription className="text-sm mt-2">
              Join Satome Eye Clinic to manage your healthcare
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters long.</p>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-xl hover:shadow-2xl transition-all mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-6 text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="ml-1 text-secondary hover:underline font-medium">Log In</Link>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default PatientSignup;
