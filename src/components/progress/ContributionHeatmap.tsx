import { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DayData {
  date: string;
  level: number; // 0-4 intensity
  count: number;
}

interface ContributionHeatmapProps {
  data: { date: string; goalsCompleted: number; totalGoals: number }[];
  weeks?: number;
}

export default function ContributionHeatmap({ data, weeks = 20 }: ContributionHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    const startDate = subDays(today, totalDays - 1);
    
    // Create a map of date -> completion data
    const dataMap = new Map(
      data.map(d => [d.date, d])
    );
    
    // Generate all days
    const days: DayData[] = [];
    for (let i = 0; i < totalDays; i++) {
      const date = addDays(startDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayData = dataMap.get(dateStr);
      
      let level = 0;
      let count = 0;
      
      if (dayData && dayData.totalGoals > 0) {
        const ratio = dayData.goalsCompleted / dayData.totalGoals;
        count = dayData.goalsCompleted;
        if (ratio === 0) level = 0;
        else if (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5) level = 2;
        else if (ratio <= 0.75) level = 3;
        else level = 4;
      }
      
      days.push({ date: dateStr, level, count });
    }
    
    // Group by weeks (columns)
    const weekGroups: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    days.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      if (index === 0) {
        // Pad first week with empty slots
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', level: -1, count: 0 });
        }
      }
      
      currentWeek.push(day);
      
      if (dayOfWeek === 6 || index === days.length - 1) {
        weekGroups.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return weekGroups;
  }, [data, weeks]);

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const getLevelColor = (level: number) => {
    switch (level) {
      case -1: return 'transparent';
      case 0: return 'hsl(var(--muted)/0.3)';
      case 1: return 'hsl(142 76% 36% / 0.3)';
      case 2: return 'hsl(142 76% 36% / 0.5)';
      case 3: return 'hsl(142 76% 36% / 0.75)';
      case 4: return 'hsl(142 76% 36% / 1)';
      default: return 'hsl(var(--muted)/0.3)';
    }
  };

  const totalContributions = data.reduce((acc, d) => acc + d.goalsCompleted, 0);
  const activeDays = data.filter(d => d.goalsCompleted > 0).length;

  return (
    <div className="glass-card p-6 rounded-3xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading-display text-lg text-foreground mb-1 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Consistency Heatmap
          </h2>
          <p className="text-xs text-muted-foreground">
            {totalContributions} goals completed across {activeDays} active days
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-fit">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2">
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className="h-3 w-3 text-[8px] text-muted-foreground flex items-center justify-center"
              >
                {i % 2 === 1 ? label : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "w-3 h-3 rounded-sm transition-all duration-300",
                    day.level >= 0 && "hover:scale-150 hover:z-10 cursor-pointer",
                    day.level === 4 && "contribution-pulse"
                  )}
                  style={{ backgroundColor: getLevelColor(day.level) }}
                  title={
                    day.level >= 0
                      ? `${format(new Date(day.date), 'MMM d, yyyy')}: ${day.count} goals completed`
                      : ''
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getLevelColor(level) }}
          />
        ))}
        <span className="text-xs text-muted-foreground">More</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-primary">{totalContributions}</p>
          <p className="text-xs text-muted-foreground">Total Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-foreground">{activeDays}</p>
          <p className="text-xs text-muted-foreground">Active Days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-accent">
            {activeDays > 0 ? Math.round((activeDays / (weeks * 7)) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground">Consistency</p>
        </div>
      </div>
    </div>
  );
}