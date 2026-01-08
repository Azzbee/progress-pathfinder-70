import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useSchedule } from '@/hooks/useSchedule';
import { format, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

const HOUR_SLOTS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

export default function Schedule() {
  const { 
    weekDays, 
    weekStart, 
    weekEnd, 
    loading, 
    goToNextWeek, 
    goToPrevWeek, 
    goToToday,
    getEventsForDay 
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Physical': 'hsl(120 100% 45%)',
      'Social': 'hsl(200 100% 50%)',
      'Financial': 'hsl(45 100% 50%)',
      'Career': 'hsl(280 100% 60%)',
      'Mental': 'hsl(320 100% 50%)',
      'Daily': 'hsl(120 100% 45%)',
    };
    return colors[category] || 'hsl(120 60% 40%)';
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="heading-serif text-3xl text-primary matrix-glow mb-2">
              SCHEDULE_VIEW
            </h1>
            <p className="text-muted-foreground text-sm font-mono">
              // Weekly calendar and activity planning
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={goToToday}
              className="matrix-btn text-xs py-2 px-4"
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              TODAY
            </button>
            <div className="flex items-center gap-2 glass-card p-1">
              <button
                onClick={goToPrevWeek}
                className="p-2 hover:bg-primary/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <span className="text-sm font-mono text-primary px-3">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
              <button
                onClick={goToNextWeek}
                className="p-2 hover:bg-primary/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-primary/20">
            <div className="p-4 border-r border-primary/20">
              <span className="text-xs text-muted-foreground font-mono">TIME_</span>
            </div>
            {weekDays.map((day, index) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-4 text-center border-r border-primary/20 last:border-r-0 cursor-pointer transition-colors",
                  isToday(day) && "bg-primary/10",
                  selectedDay?.toDateString() === day.toDateString() && "bg-primary/20"
                )}
                onClick={() => setSelectedDay(day)}
              >
                <div className="text-xs text-muted-foreground font-mono mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className={cn(
                  "text-lg font-mono",
                  isToday(day) ? "text-primary matrix-glow" : "text-card-foreground"
                )}>
                  {format(day, 'd')}
                </div>
                {isToday(day) && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1 animate-pulse-glow" />
                )}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="max-h-[600px] overflow-y-auto">
            {HOUR_SLOTS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-primary/10 min-h-[60px]">
                {/* Time Label */}
                <div className="p-2 border-r border-primary/20 flex items-start justify-end">
                  <span className="text-xs text-muted-foreground font-mono">
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
                        "border-r border-primary/10 last:border-r-0 p-1 relative group",
                        isToday(day) && "bg-primary/5"
                      )}
                    >
                      {/* Add Event Button (hover) */}
                      <button className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-primary/5 transition-opacity">
                        <Plus className="w-4 h-4 text-primary/50" />
                      </button>

                      {/* Events */}
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className="relative z-10 p-2 text-xs border-l-2 bg-card/80 mb-1"
                          style={{ borderColor: getCategoryColor(event.category) }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {event.is_recurring && (
                              <Repeat className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span className="font-mono font-medium text-card-foreground truncate">
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
        <div className="mt-6 flex items-center gap-6 text-xs font-mono animate-fade-in-up stagger-3">
          <span className="text-muted-foreground">CATEGORIES:</span>
          {['Physical', 'Social', 'Financial', 'Career', 'Mental'].map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 border"
                style={{ 
                  backgroundColor: `${getCategoryColor(cat)}20`,
                  borderColor: getCategoryColor(cat)
                }}
              />
              <span className="text-muted-foreground uppercase">{cat}</span>
            </div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 glass-card p-6 text-center animate-fade-in-up stagger-4">
          <p className="text-muted-foreground font-mono text-sm mb-2">
            // GOOGLE_CALENDAR_SYNC_MODULE
          </p>
          <p className="text-xs text-muted-foreground">
            External calendar integration coming soon. Events will sync automatically.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
