import { useState, useRef } from 'react';
import { useAuth, User as AuthUser } from '@/context/AuthContext';
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
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);


const handleProfileUpdate = async () => {
  if (!firstName.trim() && !lastName.trim() && !email.trim() && !selectedAvatarFile) {
    toast.error("Nothing to update");
    return;
  }

  const formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  if (user?.authProvider === "local") formData.append("email", email);
  if (selectedAvatarFile) formData.append("avatar", selectedAvatarFile);

  try {
    await updateProfile(formData);   // <-- IMPORTANT
    setPreviewAvatar(null);
    setSelectedAvatarFile(null);
    toast.success("Profile updated successfully! ✨");
  } catch (err) {
    toast.error("Failed to update profile");
  }
};


  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    toast.error("Invalid image");
    return;
  }

  // Just preview, don’t upload yet
  setSelectedAvatarFile(file);
  setPreviewAvatar(URL.createObjectURL(file)); // show instant preview
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
        <AvatarImage
                src={
                  previewAvatar
                    ? previewAvatar
                    : user?.avatar
                      ? typeof user.avatar === "string"
                        ? user.avatar.startsWith("http")
                          ? user.avatar
                          : `${import.meta.env.VITE_API_URL}${user.avatar}`
                        : undefined
                      : undefined
                }
              />
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
      >
        Save Changes
      </Button>
    </Card>
  );
};

const PasswordSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showHints, setShowHints] = useState(false);

  const { changePassword } = useAuth();

  // Password strength rules
 const passwordChecks = [
  { label: "At least 8 characters", valid: newPassword.length >= 8 },
  { label: "Contains a lowercase letter", valid: /[a-z]/.test(newPassword) },
  { label: "Contains an uppercase letter", valid: /[A-Z]/.test(newPassword) }, // ✅ NEW
  { label: "Contains a number", valid: /[0-9]/.test(newPassword) },
  { label: "Contains a special character (!@#$%^&* etc.)", valid: /[^A-Za-z0-9]/.test(newPassword) },
];

  const isStrongPassword = passwordChecks.every(check => check.valid);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!isStrongPassword) {
      toast.error('Your password does not meet the strength requirements ⚠️');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully! 🔒');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    }
  };

  return (
    <Card className="glass-strong p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-1">Password Settings</h2>

      <div className="space-y-4">

        {/* Current password */}
        <div className="space-y-2">
          <Label>Current Password</Label>
          <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="glass" />
        </div>

        {/* New password with live validation */}
        <div className="space-y-2">
          <Label>New Password</Label>
          <Input type="password" value={newPassword}onFocus={() => setShowHints(true)}
            onBlur={() => !newPassword && setShowHints(false)}
            onChange={e => setNewPassword(e.target.value)} className="glass" />

          {/* Minimalist Helper — shows only when focused or has text */}
          {showHints && (
            <div className="mt-2 text-[11px] text-muted-foreground space-y-1 pl-1">
              {passwordChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={check.valid ? "text-green-500" : "text-zinc-400"}>
                    {check.valid ? "●" : "○"}
                  </span>
                  <span className={check.valid ? "text-green-600" : ""}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
            )}
            </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="glass"
            disabled={!isStrongPassword} // ⬅ Only allow if password meets requirements
          />

          {!isStrongPassword && newPassword && (
            <p className="text-xs text-destructive pl-1">
              You must meet password requirements before continuing.
            </p>
          )}

          {isStrongPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive pl-1">
              Passwords do not match.
            </p>
          )}
        </div>

      </div>

      <Button 
        onClick={handlePasswordChange}
        className="gradient-primary hover-glow"
        disabled={!currentPassword || !newPassword || !confirmPassword}
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