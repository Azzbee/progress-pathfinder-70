import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek, format, addDays } from 'date-fns';

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  category: string;
  is_recurring: boolean;
  goal_id: string | null;
}

// For now we'll simulate events from goals/tasks until we add an events table
export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch goals with target dates in this week
    const { data: goals, error } = await supabase
      .from('goals')
      .select(`
        *,
        category:goal_categories(name, color)
      `)
      .eq('user_id', user.id)
      .gte('target_date', format(weekStart, 'yyyy-MM-dd'))
      .lte('target_date', format(weekEnd, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching schedule:', error);
      setLoading(false);
      return;
    }

    // Convert goals to events
    const goalEvents: ScheduleEvent[] = (goals || []).map(goal => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      date: goal.target_date || format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_time: '10:00',
      category: goal.category?.name || 'General',
      is_recurring: goal.is_daily || false,
      goal_id: goal.id,
    }));

    // For daily goals, create an event for each day of the week
    const { data: dailyGoals } = await supabase
      .from('goals')
      .select(`
        *,
        category:goal_categories(name, color)
      `)
      .eq('user_id', user.id)
      .eq('is_daily', true);

    const dailyEvents: ScheduleEvent[] = [];
    (dailyGoals || []).forEach(goal => {
      weekDays.forEach((day, index) => {
        dailyEvents.push({
          id: `${goal.id}-${index}`,
          title: goal.title,
          description: goal.description,
          date: format(day, 'yyyy-MM-dd'),
          start_time: '08:00',
          end_time: '09:00',
          category: goal.category?.name || 'Daily',
          is_recurring: true,
          goal_id: goal.id,
        });
      });
    });

    setEvents([...goalEvents, ...dailyEvents]);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [user, currentWeek]);

  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const goToPrevWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr);
  };

  return {
    events,
    weekDays,
    weekStart,
    weekEnd,
    currentWeek,
    loading,
    goToNextWeek,
    goToPrevWeek,
    goToToday,
    getEventsForDay,
    refetch: fetchEvents,
  };
}
