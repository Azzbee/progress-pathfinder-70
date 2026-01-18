import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OnboardingResponses {
  happiness_score: number | null;
  doing_best: string | null;
  doing_worst: string | null;
  fitness_score: number | null;
  mental_wellbeing: number | null;
  finances_score: number | null;
  academic_score: number | null;
  social_score: number | null;
  biggest_challenge: string | null;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<OnboardingResponses>({
    happiness_score: null,
    doing_best: null,
    doing_worst: null,
    fitness_score: null,
    mental_wellbeing: null,
    finances_score: null,
    academic_score: null,
    social_score: null,
    biggest_challenge: null
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('onboarding_responses')
      .select('is_completed')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking onboarding:', error);
    }

    setIsCompleted(data?.is_completed ?? false);
    setLoading(false);
  };

  const saveResponses = async (newResponses: Partial<OnboardingResponses>) => {
    if (!user) return;

    const updatedResponses = { ...responses, ...newResponses };
    setResponses(updatedResponses);

    const { data: existing } = await supabase
      .from('onboarding_responses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase
        .from('onboarding_responses')
        .update(updatedResponses)
        .eq('user_id', user.id);
    } else {
      await supabase.from('onboarding_responses').insert({
        user_id: user.id,
        ...updatedResponses
      });
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('onboarding_responses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase
        .from('onboarding_responses')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } else {
      await supabase.from('onboarding_responses').insert({
        user_id: user.id,
        is_completed: true,
        completed_at: new Date().toISOString()
      });
    }

    setIsCompleted(true);
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  return {
    isCompleted,
    loading,
    responses,
    saveResponses,
    completeOnboarding,
    skipOnboarding
  };
}
