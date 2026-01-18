import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { useSubscription } from '@/hooks/useSubscription';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { usePushNotifications } from '@/hooks/usePushNotifications';
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
  Eye,
  EyeOff,
  CreditCard,
  Calendar,
  ExternalLink,
  Loader2,
  Crown,
  BellRing
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
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings();
  const { isPlaying, volume, toggleAmbient, updateVolume } = useAmbientAudio();
  const { 
    subscribed, 
    planName, 
    formattedEndDate, 
    loading: subscriptionLoading, 
    openCustomerPortal,
    checkSubscription 
  } = useSubscription();
  const { 
    isConnected: calendarConnected, 
    isSyncing: calendarSyncing,
    connect: connectCalendar,
    disconnect: disconnectCalendar,
    syncCurrentWeek,
    isConfigured: calendarConfigured
  } = useGoogleCalendar();
  const {
    isSupported: notificationsSupported,
    isEnabled: notificationsEnabled,
    permission: notificationPermission,
    isLoading: notificationsLoading,
    requestPermission,
    disableNotifications
  } = usePushNotifications();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  
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

  const handleOpenCustomerPortal = async () => {
    setIsOpeningPortal(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open subscription management',
        variant: 'destructive'
      });
    }
    setIsOpeningPortal(false);
  };

  const handleTogglePushNotifications = async () => {
    if (notificationsEnabled) {
      disableNotifications();
    } else {
      await requestPermission();
    }
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
          {/* Subscription Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Subscription
            </h2>

            <div className="space-y-4">
              {subscriptionLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        subscribed ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{planName}</span>
                          {subscribed && (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          )}
                        </div>
                        {formattedEndDate && (
                          <p className="text-xs text-muted-foreground">
                            Renews on {formattedEndDate}
                          </p>
                        )}
                        {!subscribed && (
                          <p className="text-xs text-muted-foreground">
                            Upgrade for premium features
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {subscribed && (
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={handleOpenCustomerPortal}
                      disabled={isOpeningPortal}
                    >
                      <span className="flex items-center gap-2">
                        {isOpeningPortal ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        Manage Subscription
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => checkSubscription()}
                    className="text-xs text-muted-foreground"
                  >
                    Refresh subscription status
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Account Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-1">
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

          {/* Google Calendar Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-2">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Google Calendar
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sync your Google Calendar events to your schedule
              </p>

              {calendarConnected ? (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-sm text-foreground">Connected to Google Calendar</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={syncCurrentWeek}
                      disabled={calendarSyncing}
                    >
                      {calendarSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Import This Week
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={disconnectCalendar}
                    >
                      Disconnect
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={connectCalendar}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Connect Google Calendar
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              {!calendarConfigured && (
                <p className="text-xs text-muted-foreground">
                  Google Calendar integration requires configuration. Contact support for setup.
                </p>
              )}
            </div>
          </div>

          {/* Language Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-3">
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
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-4">
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
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-5">
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
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-6">
            <h2 className="heading-display text-lg text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">In-App Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get reminders for your goals
                  </p>
                </div>
                <Switch
                  checked={settings.notifications_enabled}
                  onCheckedChange={(checked) => updateSettings({ notifications_enabled: checked })}
                />
              </div>

              {notificationsSupported && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground flex items-center gap-2">
                      <BellRing className="w-4 h-4" />
                      Push Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get browser notifications for events and deadlines
                    </p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={handleTogglePushNotifications}
                    disabled={notificationsLoading}
                  />
                </div>
              )}

              {notificationPermission === 'denied' && (
                <p className="text-xs text-destructive">
                  Push notifications are blocked. Please enable them in your browser settings.
                </p>
              )}
            </div>
          </div>

          {/* Support Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-7">
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