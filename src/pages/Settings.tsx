import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Volume2, 
  VolumeX,
  Sparkles,
  Globe,
  Mail,
  Lock,
  LogOut,
  ChevronRight,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings();
  const { isPlaying, volume, toggleAmbient, updateVolume } = useAmbientAudio();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleUpdateUsername = async () => {
    if (!user || !username.trim()) return;
    
    setIsUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update username',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Username updated successfully'
      });
    }
    setIsUpdating(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Password changed successfully'
      });
      setPasswordDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsChangingPassword(false);
  };

  const animationOptions = [
    { value: 'off', label: 'Off' },
    { value: 'reduced', label: 'Reduced' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' }
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="heading-display text-3xl text-primary mb-2 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Customize your experience and manage your account
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user?.email || 'Not signed in'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-muted-foreground">
                  Username
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter new username"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpdateUsername}
                    disabled={isUpdating || !username.trim()}
                    size="sm"
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Password Change */}
              <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Change Password
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="heading-display text-primary flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Change Password
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="w-full"
                    >
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="w-full justify-between text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Theme Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-1">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Theme
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground">App Theme</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose between a soft water aesthetic or a hacker matrix style
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('softer')}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-left",
                      theme === 'softer' 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(195,85%,45%)] to-[hsl(175,65%,45%)] mb-2" />
                    <p className="font-medium text-foreground">Softer</p>
                    <p className="text-xs text-muted-foreground">Water aesthetic</p>
                  </button>
                  <button
                    onClick={() => setTheme('hacker')}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-left",
                      theme === 'hacker' 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ff41] to-[#003300] mb-2" />
                    <p className="font-medium text-foreground">Hacker</p>
                    <p className="text-xs text-muted-foreground">Matrix style</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-2">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Language
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Display Language</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose your preferred language
                </p>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSettings({ language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Audio Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-3">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Audio
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground">
                    Play sounds when completing tasks
                  </p>
                </div>
                <Switch
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) => updateSettings({ sound_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Ambient Water Sounds</Label>
                  <p className="text-xs text-muted-foreground">
                    Relaxing background audio
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAmbient}
                    className={cn(
                      isPlaying && 'border-primary bg-primary/10 text-primary'
                    )}
                  >
                    {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {isPlaying && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Volume</Label>
                  <Slider
                    value={[volume * 100]}
                    onValueChange={([val]) => updateVolume(val / 100)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Animations Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-4">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Animations
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Animation Intensity</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Control the amount of motion and effects
                </p>
                <Select
                  value={settings.animation_intensity}
                  onValueChange={(value) => updateSettings({ 
                    animation_intensity: value as 'off' | 'reduced' | 'normal' | 'high' 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-5">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get reminders for your goals
                </p>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) => updateSettings({ notifications_enabled: checked })}
              />
            </div>
          </div>

          {/* Support Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-6">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Support
            </h2>

            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate('/contact')}
            >
              <span>Contact Us</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
