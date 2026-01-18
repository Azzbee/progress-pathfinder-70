import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserSettings {
  sound_enabled: boolean;
  animation_intensity: 'off' | 'reduced' | 'normal' | 'high';
  ambient_audio_enabled: boolean;
  ambient_audio_volume: number;
  language: string;
  notifications_enabled: boolean;
}

const defaultSettings: UserSettings = {
  sound_enabled: true,
  animation_intensity: 'normal',
  ambient_audio_enabled: false,
  ambient_audio_volume: 0.3,
  language: 'en',
  notifications_enabled: true
};

interface UserSettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setSettings(defaultSettings);
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
    }

    if (data) {
      setSettings({
        sound_enabled: data.sound_enabled ?? defaultSettings.sound_enabled,
        animation_intensity: (data.animation_intensity as UserSettings['animation_intensity']) ?? defaultSettings.animation_intensity,
        ambient_audio_enabled: data.ambient_audio_enabled ?? defaultSettings.ambient_audio_enabled,
        ambient_audio_volume: Number(data.ambient_audio_volume) ?? defaultSettings.ambient_audio_volume,
        language: data.language ?? defaultSettings.language,
        notifications_enabled: data.notifications_enabled ?? defaultSettings.notifications_enabled
      });
    }

    setLoading(false);
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } else {
      await supabase.from('user_settings').insert({
        user_id: user.id,
        ...newSettings
      });
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within UserSettingsProvider');
  }
  return context;
}
