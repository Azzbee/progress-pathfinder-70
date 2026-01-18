import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CreateEventDialog from '@/components/schedule/CreateEventDialog';
import TodayTasksWidget from '@/components/schedule/TodayTasksWidget';
import { useEvents } from '@/hooks/useEvents';
import { useGoals } from '@/hooks/useGoals';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Repeat, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const HOUR_SLOTS = Array.from({ length: 24 }, (_, i) => i); // 12am to 11pm (24 hours)

export default function Schedule() {
  const { categories } = useGoals();
  const { toast } = useToast();
  const { 
    events, 
    loading, 
    createEvent, 
    deleteEvent, 
    toggleEventComplete,
    refetch 
  } = useEvents();

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToNextWeek = () => setCurrentWeek(prev => addDays(prev, 7));
  const goToPrevWeek = () => setCurrentWeek(prev => addDays(prev, -7));
  const goToToday = () => setCurrentWeek(new Date());

  const getCategoryColor = (categoryId: string | null): string => {
    if (!categoryId) return 'hsl(var(--primary))';
    const cat = categories.find(c => c.id === categoryId);
    return cat?.color || 'hsl(var(--primary))';
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.event_date === dateStr);
  };

  const handleCreateEvent = async (eventData: {
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    category_id: string;
    recurrence_type: string;
  }) => {
    await createEvent(eventData);
    toast({
      title: 'Event Created',
      description: `"${eventData.title}" has been scheduled.`
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    toast({
      title: 'Event Deleted',
      description: 'The event has been removed.'
    });
  };

  // Get today's events for the widget
  const todayEvents = events.filter(e => e.event_date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 animate-fade-in-up">
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

        {/* Today's Tasks Widget */}
        <TodayTasksWidget 
          events={todayEvents}
          onToggleComplete={toggleEventComplete}
          onDelete={handleDeleteEvent}
        />

        {/* Calendar Grid */}
        <div className="glass-card rounded-3xl overflow-hidden animate-fade-in-up stagger-2 mt-6">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-border/50">
            <div className="p-4 border-r border-border/50">
              <span className="text-xs text-muted-foreground">Time</span>
            </div>
            {weekDays.map((day) => (
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
                    {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
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
                          className={cn(
                            "relative z-10 p-2 text-xs border-l-2 bg-card rounded-lg shadow-soft mb-1 group/event",
                            event.is_completed && "opacity-50"
                          )}
                          style={{ borderColor: getCategoryColor(event.category_id) }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {event.recurrence_type !== 'one_time' && (
                              <Repeat className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span className={cn(
                              "font-medium text-foreground truncate flex-1",
                              event.is_completed && "line-through"
                            )}>
                              {event.title}
                            </span>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="opacity-0 group-hover/event:opacity-100 text-destructive hover:text-destructive/80 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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
          {categories.filter(c => c.is_preset).map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-muted-foreground">{cat.name}</span>
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
                title: 'Coming Soon',
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
