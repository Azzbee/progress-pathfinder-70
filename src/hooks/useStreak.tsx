import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface Streak {
  current_streak: number;
  longest_streak: number;
  streak_freezes_available: number;
  last_completed_date: string | null;
}

export function useStreak() {
  const [streak, setStreak] = useState<Streak>({
    current_streak: 0,
    longest_streak: 0,
    streak_freezes_available: 1,
    last_completed_date: null
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStreak = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No streak record yet, create one
        const { data: newStreak } = await supabase
          .from('streaks')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (newStreak) {
          setStreak(newStreak);
        }
      }
      setLoading(false);
      return;
    }

    setStreak(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStreak();
  }, [user]);

  const useFreeze = async () => {
    if (!user || streak.streak_freezes_available <= 0) return;

    const { error } = await supabase
      .from('streaks')
      .update({
        streak_freezes_available: streak.streak_freezes_available - 1,
        streak_freeze_used_this_week: true
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'ERROR',
        description: 'Failed to use streak freeze',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'FREEZE_ACTIVATED',
      description: 'Your streak is protected for today!'
    });

    fetchStreak();
  };

  const updateStreak = async (allDailyGoalsCompleted: boolean) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = streak.last_completed_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newCurrentStreak = streak.current_streak;
    let newLongestStreak = streak.longest_streak;

    if (allDailyGoalsCompleted) {
      if (lastDate === yesterday) {
        // Continue streak
        newCurrentStreak++;
      } else if (lastDate !== today) {
        // Start new streak or broken
        newCurrentStreak = 1;
      }

      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }

      await supabase
        .from('streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_completed_date: today
        })
        .eq('user_id', user.id);

      fetchStreak();
    }
  };

  return {
    streak,
    loading,
    useFreeze,
    updateStreak,
    refetch: fetchStreak
  };
}
