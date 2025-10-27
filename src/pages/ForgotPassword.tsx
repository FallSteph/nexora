import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Key, Lock, ArrowLeft, Sparkles, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'email' | 'code' | 'password';

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // ---------------- Step 1: Send Verification Code ----------------
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to send code');

      toast.success('Verification code sent to your email!');
      setStep('code');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Step 2: Verify Code ----------------
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Invalid code');

      toast.success('Code verified successfully!');
      setStep('password');
    } catch (err: any) {
      toast.error(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Step 3: Reset Password ----------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      toast.success('Password changed successfully! You can now login.');
      setStep('email');
      setEmail('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen flex items-center justify-center mesh-gradient p-4">
      <div className="w-full max-w-sm">
        <div className="glass-strong rounded-xl p-5 space-y-4">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl gradient-primary mb-2">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">Reset Password</h1>
            <p className="text-muted-foreground text-sm">
              {step === 'email' && 'Enter your email to receive a code'}
              {step === 'code' && 'Enter the verification code'}
              {step === 'password' && 'Create a new password'}
            </p>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
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

              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send Code'}
              </Button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm">Verification Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border/50"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border/50"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <Link to="/login" className="block">
            <Button variant="ghost" className="w-full hover:bg-transparent hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
