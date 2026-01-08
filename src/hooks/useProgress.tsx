import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, subDays, startOfDay } from 'date-fns';

interface DailyProgress {
  date: string;
  goalsCompleted: number;
  totalGoals: number;
  disciplineScore: number;
}

interface CategoryProgress {
  category: string;
  color: string;
  data: { date: string; progress: number }[];
}

export function useProgress() {
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProgress = async () => {
    if (!user) return;
    setLoading(true);

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

    // Fetch daily completions
    const { data: completions, error: completionsError } = await supabase
      .from('daily_completions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (completionsError) {
      console.error('Error fetching completions:', completionsError);
    }

    // Create a map of completions by date
    const completionMap = new Map(
      (completions || []).map(c => [c.date, c])
    );

    // Generate data for all days in range
    const allDays: DailyProgress[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const completion = completionMap.get(date);
      allDays.push({
        date,
        goalsCompleted: completion?.goals_completed || 0,
        totalGoals: completion?.total_goals || 0,
        disciplineScore: Number(completion?.discipline_score || 0),
      });
    }
    setDailyProgress(allDays);

    // Fetch goals with categories for category breakdown
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select(`
        *,
        category:goal_categories(id, name, color)
      `)
      .eq('user_id', user.id);

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
    }

    // Group goals by category and calculate progress over time
    const categoryMap = new Map<string, { color: string; goals: typeof goals }>();
    
    (goals || []).forEach(goal => {
      const catName = goal.category?.name || 'Uncategorized';
      const catColor = goal.category?.color || '#00ff00';
      
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, { color: catColor, goals: [] });
      }
      categoryMap.get(catName)!.goals.push(goal);
    });

    const catProgress: CategoryProgress[] = [];
    categoryMap.forEach((value, key) => {
      // Simulate progress over time (in a real app, this would come from historical data)
      const data = allDays.map((day, index) => ({
        date: day.date,
        progress: Math.min(100, Math.round((index / allDays.length) * 80 + Math.random() * 20)),
      }));
      
      catProgress.push({
        category: key,
        color: value.color,
        data,
      });
    });

    setCategoryProgress(catProgress);
    setLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  }, [user, timeRange]);

  return {
    dailyProgress,
    categoryProgress,
    selectedCategory,
    setSelectedCategory,
    timeRange,
    setTimeRange,
    loading,
    refetch: fetchProgress,
  };
}
