import { Flame, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  onUseFreeze?: () => void;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  freezesAvailable,
  onUseFreeze
}: StreakCounterProps) {
  const isActiveStreak = currentStreak > 0;

  return (
    <div className="border border-primary/50 p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-serif text-xl text-primary">STREAK_STATUS</h2>
        {freezesAvailable > 0 && (
          <button
            onClick={onUseFreeze}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-cyan-400 transition-colors border border-muted-foreground/30 px-2 py-1 hover:border-cyan-400"
          >
            <Snowflake className="w-3 h-3" />
            FREEZE ({freezesAvailable})
          </button>
        )}
      </div>

      <div className="flex items-center gap-8">
        {/* Current Streak */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame 
              className={cn(
                'w-8 h-8',
                isActiveStreak ? 'text-primary pulse-glow' : 'text-muted-foreground'
              )} 
            />
          </div>
          <div 
            className={cn(
              'heading-serif text-5xl font-bold',
              isActiveStreak ? 'text-primary matrix-glow-strong' : 'text-muted-foreground'
            )}
          >
            {currentStreak}
          </div>
          <div className="text-muted-foreground text-xs mt-1">
            CURRENT_STREAK
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-20 bg-primary/30" />

        {/* Longest Streak */}
        <div className="flex-1 text-center">
          <div className="heading-serif text-3xl text-muted-foreground">
            {longestStreak}
          </div>
          <div className="text-muted-foreground text-xs mt-1">
            LONGEST_STREAK
          </div>
        </div>
      </div>

      {/* Streak milestones */}
      <div className="mt-6 flex gap-2 justify-center">
        {[7, 30, 100].map((milestone) => (
          <div
            key={milestone}
            className={cn(
              'px-3 py-1 text-xs border',
              currentStreak >= milestone
                ? 'border-primary text-primary bg-primary/10'
                : 'border-muted-foreground/30 text-muted-foreground'
            )}
          >
            {milestone}D
          </div>
        ))}
      </div>
    </div>
  );
}
