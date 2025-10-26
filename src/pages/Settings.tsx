import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Lock, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'password';

// Profile Settings Component
const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileUpdate = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('All fields are required');
      return;
    }

    updateProfile({
      firstName,
      lastName,
      email,
    });
    toast.success('Profile updated successfully! ✨');
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a blob URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      
      // Update profile with new avatar
      updateProfile({ avatar: imageUrl });
      toast.success('Avatar uploaded successfully! 🎉');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarDelete = () => {
    updateProfile({ avatar: undefined });
    toast.success('Avatar removed');
  };

  return (
    <Card className="glass-strong p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">Update your personal information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center space-x-6">
        <Avatar className="w-24 h-24 border-2 border-border">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="text-2xl gradient-primary text-white">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col space-y-3">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="glass"
              onClick={handleAvatarUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
            {user?.avatar && (
              <Button
                variant="outline"
                size="sm"
                className="glass text-destructive hover:text-destructive"
                onClick={handleAvatarDelete}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </p>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="pl-10 glass"
              placeholder="Enter your first name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="glass"
            placeholder="Enter your last name"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 glass"
              placeholder="Enter your email address"
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={handleProfileUpdate} 
        className="gradient-primary hover-glow"
        disabled={!firstName.trim() || !lastName.trim() || !email.trim()}
      >
        Save Changes
      </Button>
    </Card>
  );
};

// Password Settings Component
const PasswordSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Simulate password change process
    toast.success('Password changed successfully! 🔒');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const isFormValid = currentPassword && newPassword && confirmPassword && newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <Card className="glass-strong p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Password Settings</h2>
        <p className="text-sm text-muted-foreground">Update your password</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pl-10 glass"
              placeholder="Enter current password"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 glass"
              placeholder="Enter new password"
            />
          </div>
          {newPassword && newPassword.length < 6 && (
            <p className="text-xs text-destructive">Password must be at least 6 characters</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 glass"
              placeholder="Confirm new password"
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>
      </div>

      <Button 
        onClick={handlePasswordChange} 
        className="gradient-primary hover-glow"
        disabled={!isFormValid}
      >
        Change Password
      </Button>
    </Card>
  );
};

// Main Settings Component
const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Tab Navigation - Smaller size */}
      <div className="flex space-x-1 p-1 bg-muted/20 rounded-lg w-fit glass">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('profile')}
          size="sm"
          className={`px-4 ${activeTab === 'profile' ? 'gradient-primary hover-glow' : 'hover:bg-accent/50'}`}
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </Button>
        <Button
          variant={activeTab === 'password' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('password')}
          size="sm"
          className={`px-4 ${activeTab === 'password' ? 'gradient-primary hover-glow' : 'hover:bg-accent/50'}`}
        >
          <Lock className="w-4 h-4 mr-2" />
          Password
        </Button>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'password' && <PasswordSettings />}
      </div>
    </div>
  );
};

export default Settings;