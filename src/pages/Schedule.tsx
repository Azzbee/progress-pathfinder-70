import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CreateEventDialog from '@/components/schedule/CreateEventDialog';
import { useSchedule } from '@/hooks/useSchedule';
import { useGoals } from '@/hooks/useGoals';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Repeat, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const HOUR_SLOTS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

export default function Schedule() {
  const { user } = useAuth();
  const { categories } = useGoals();
  const { toast } = useToast();
  const { 
    weekDays, 
    weekStart, 
    weekEnd, 
    loading, 
    goToNextWeek, 
    goToPrevWeek, 
    goToToday,
    getEventsForDay,
    refetch
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Physical': 'hsl(200 85% 55%)',
      'Social': 'hsl(280 70% 60%)',
      'Financial': 'hsl(45 100% 50%)',
      'Career': 'hsl(160 70% 45%)',
      'Mental': 'hsl(320 70% 60%)',
      'Daily': 'hsl(200 85% 55%)',
    };
    return colors[category] || 'hsl(200 85% 55%)';
  };

  const handleCreateEvent = async (eventData: {
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    category_id: string;
    is_recurring: boolean;
  }) => {
    if (!user) return;

    // Create as a goal with target_date (events are stored as goals)
    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: eventData.title,
        description: eventData.description || null,
        category_id: eventData.category_id,
        target_date: eventData.date,
        is_daily: eventData.is_recurring,
        progress: 0
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
      title: 'Event Created! 🎉',
      description: `"${eventData.title}" has been scheduled.`
    });

    refetch();
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="heading-display text-3xl text-primary mb-2">
              Schedule
            </h1>
            <p className="text-muted-foreground text-sm">
              Weekly calendar and activity planning
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <CreateEventDialog 
              categories={categories}
              selectedDate={selectedDay || undefined}
              onCreateEvent={handleCreateEvent}
            />
            <button
              onClick={goToToday}
              className="btn-primary text-xs py-2 px-4 rounded-full flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Today
            </button>
            <div className="flex items-center gap-2 glass-card p-1 rounded-full">
              <button
                onClick={goToPrevWeek}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <span className="text-sm text-foreground px-3">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
              <button
                onClick={goToNextWeek}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass-card rounded-3xl overflow-hidden animate-fade-in-up stagger-2">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-border/50">
            <div className="p-4 border-r border-border/50">
              <span className="text-xs text-muted-foreground">Time</span>
            </div>
            {weekDays.map((day, index) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-4 text-center border-r border-border/50 last:border-r-0 cursor-pointer transition-colors",
                  isToday(day) && "bg-primary/10",
                  selectedDay?.toDateString() === day.toDateString() && "bg-primary/20"
                )}
                onClick={() => setSelectedDay(day)}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  "text-lg font-display",
                  isToday(day) ? "text-primary font-bold" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </div>
                {isToday(day) && (
                  <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-1 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="max-h-[600px] overflow-y-auto">
            {HOUR_SLOTS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border/30 min-h-[60px]">
                {/* Time Label */}
                <div className="p-2 border-r border-border/50 flex items-start justify-end">
                  <span className="text-xs text-muted-foreground">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
                
                {/* Day Columns */}
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const hourEvents = dayEvents.filter(e => {
                    const eventHour = parseInt(e.start_time.split(':')[0]);
                    return eventHour === hour;
                  });

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={cn(
                        "border-r border-border/30 last:border-r-0 p-1 relative group",
                        isToday(day) && "bg-primary/5"
                      )}
                    >
                      {/* Add Event Button (hover) */}
                      <button className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-primary/5 transition-opacity rounded-lg">
                        <Plus className="w-4 h-4 text-primary/50" />
                      </button>

                      {/* Events */}
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className="relative z-10 p-2 text-xs border-l-2 bg-card rounded-lg shadow-soft mb-1"
                          style={{ borderColor: getCategoryColor(event.category) }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {event.is_recurring && (
                              <Repeat className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span className="font-medium text-foreground truncate">
                              {event.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{event.start_time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs animate-fade-in-up stagger-3">
          <span className="text-muted-foreground">Categories:</span>
          {['Physical', 'Social', 'Financial', 'Career', 'Mental'].map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: getCategoryColor(cat),
                }}
              />
              <span className="text-muted-foreground">{cat}</span>
            </div>
          ))}
        </div>

        {/* Google Calendar Integration Notice */}
        <div className="mt-8 glass-card p-6 rounded-3xl animate-fade-in-up stagger-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-display font-medium mb-1">
                  Google Calendar Sync
                </p>
                <p className="text-xs text-muted-foreground">
                  Connect your Google Calendar to sync external events automatically.
                </p>
              </div>
            </div>
            <button 
              className="btn-primary text-xs py-2 px-4 rounded-full"
              onClick={() => toast({
                title: 'Coming Soon! 🚀',
                description: 'Google Calendar integration will be available soon.'
              })}
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
