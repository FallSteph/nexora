import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Sparkles, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ReCAPTCHA from 'react-google-recaptcha';

declare const google: any;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const handleGoogleLogin = () => {
    if (!(window as any).google || !(window as any).google.accounts) return;

    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response: any) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.access_token }),
          });

          if (!res.ok) throw new Error('Failed to log in with Google');

          const data = await res.json(); // { user }

          googleLogin(data.user);
          toast.success('Welcome back! 🚀');
          navigate('/dashboard');
        } catch (err: any) {
          toast.error(err.message || 'An error occurred');
        }
      },
    });

    client.requestAccessToken();
  };

  // Manual login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ get real reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      toast.error('Please verify reCAPTCHA');
      return;
    }

    setLoading(true);
    try {
      console.log("reCAPTCHA token before login:", recaptchaToken);

      // ✅ Send token in the correct field name expected by backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // ✅ Continue normal login flow
      await login(email, password, recaptchaToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset(); // reset captcha after attempt
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-gradient p-4">
      <div className="w-full max-w-sm">
        <div className="glass-strong rounded-xl p-5 space-y-4">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-primary mb-2">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">Nexora</h1>
            <p className="text-muted-foreground text-sm">Sign in to your workspace</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-background/50 border-border/50"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ✅ reCAPTCHA (Single Instance) */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                ref={recaptchaRef}
                onChange={() => setCaptchaVerified(true)}
              />
            </div>

            <div className="flex justify-between text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline text-xs">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full gradient-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-background/50 border-border/50"
            onClick={handleGoogleLogin}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>

          {/* Testing Hint */}
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-center text-muted-foreground">
              💡 Test with: admin@nexora.io / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
