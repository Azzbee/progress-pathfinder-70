import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { format, startOfWeek, endOfWeek, addDays, isWithinInterval, isSameDay } from 'date-fns';

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  category_id: string | null;
  category_name?: string;
  category_color?: string;
  recurrence_type: 'one_time' | 'daily' | 'weekly';
  is_completed: boolean;
}

export function useEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data: eventsData, error } = await supabase
      .from('events')
      .select(`
        *,
        goal_categories (name, color)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
      return;
    }

    const formattedEvents: ScheduleEvent[] = (eventsData || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time,
      category_id: event.category_id,
      category_name: event.goal_categories?.name || 'Uncategorized',
      category_color: event.goal_categories?.color || 'hsl(200 85% 55%)',
      recurrence_type: event.recurrence_type,
      is_completed: event.is_completed
    }));

    setEvents(formattedEvents);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const createEvent = async (eventData: {
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    category_id: string;
    recurrence_type: 'one_time' | 'daily' | 'weekly';
  }) => {
    if (!user) return;

    const { error } = await supabase.from('events').insert({
      user_id: user.id,
      title: eventData.title,
      description: eventData.description || null,
      event_date: eventData.event_date,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      category_id: eventData.category_id,
      recurrence_type: eventData.recurrence_type
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Event Created',
      description: `"${eventData.title}" has been scheduled.`
    });

    fetchEvents();
  };

  const toggleEventComplete = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const { error } = await supabase
      .from('events')
      .update({ is_completed: !event.is_completed })
      .eq('id', eventId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive'
      });
      return;
    }

    setEvents(events.map(e => 
      e.id === eventId ? { ...e, is_completed: !e.is_completed } : e
    ));
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Event Deleted',
      description: 'The event has been removed.'
    });

    setEvents(events.filter(e => e.id !== eventId));
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    
    return events.filter(event => {
      if (event.recurrence_type === 'one_time') {
        return event.event_date === dateStr;
      }
      
      if (event.recurrence_type === 'daily') {
        const eventDate = new Date(event.event_date);
        return date >= eventDate;
      }
      
      if (event.recurrence_type === 'weekly') {
        const eventDate = new Date(event.event_date);
        return date >= eventDate && eventDate.getDay() === dayOfWeek;
      }
      
      return false;
    });
  };

  const getTodaysEvents = () => {
    return getEventsForDay(new Date());
  };

  const goToNextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
  const goToPrevWeek = () => setCurrentWeek(addDays(currentWeek, -7));
  const goToToday = () => setCurrentWeek(new Date());

  return {
    events,
    loading,
    weekDays,
    weekStart,
    weekEnd,
    createEvent,
    toggleEventComplete,
    deleteEvent,
    getEventsForDay,
    getTodaysEvents,
    goToNextWeek,
    goToPrevWeek,
    goToToday,
    refetch: fetchEvents
  };
}
