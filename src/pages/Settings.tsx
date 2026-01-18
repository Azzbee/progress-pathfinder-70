import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
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
  ChevronRight
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings();
  const { isPlaying, volume, toggleAmbient, updateVolume } = useAmbientAudio();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const animationOptions = [
    { value: 'off', label: 'Off' },
    { value: 'reduced', label: 'Reduced' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' }
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

          {/* Audio Section */}
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-2">
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
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-3">
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
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-4">
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
          <div className="glass-card rounded-3xl p-6 animate-fade-in-up stagger-5">
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
