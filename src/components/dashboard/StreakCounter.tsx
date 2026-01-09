import { useState, useEffect } from 'react';
import { Flame, Snowflake, Zap } from 'lucide-react';
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
  const [displayStreak, setDisplayStreak] = useState(0);
  const isActiveStreak = currentStreak > 0;

  useEffect(() => {
    if (currentStreak === 0) {
      setDisplayStreak(0);
      return;
    }

    const duration = 1500;
    const steps = Math.min(currentStreak, 30);
    const increment = currentStreak / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= currentStreak) {
        setDisplayStreak(currentStreak);
        clearInterval(timer);
      } else {
        setDisplayStreak(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentStreak]);

  return (
    <div className="glass-card rounded-3xl p-6 overflow-hidden relative">
      {/* Background glow */}
      {isActiveStreak && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="heading-display text-xl text-foreground">Streak Status</h2>
            {isActiveStreak && <Zap className="w-4 h-4 text-accent animate-pulse" />}
          </div>
          {freezesAvailable > 0 && (
            <button
              onClick={onUseFreeze}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-all border border-border px-3 py-1.5 rounded-full hover:border-accent"
            >
              <Snowflake className="w-3 h-3" />
              Freeze ({freezesAvailable})
            </button>
          )}
        </div>

        <div className="flex items-center gap-8">
          {/* Current Streak */}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="relative">
                <Flame className={cn('w-10 h-10', isActiveStreak ? 'text-primary' : 'text-muted-foreground')} />
                {isActiveStreak && (
                  <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
                )}
              </div>
            </div>
            <div className={cn(
              'text-6xl font-display font-bold',
              isActiveStreak ? 'text-primary' : 'text-muted-foreground'
            )}>
              {displayStreak}
            </div>
            <div className="text-muted-foreground text-xs mt-2">Current Streak</div>
          </div>

          <div className="w-px h-24 bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Longest Streak */}
          <div className="flex-1 text-center">
            <div className="text-4xl font-display text-muted-foreground">{longestStreak}</div>
            <div className="text-muted-foreground text-xs mt-2">Longest Streak</div>
            {currentStreak >= longestStreak && currentStreak > 0 && (
              <div className="text-xs text-accent mt-2 animate-pulse">★ New Record!</div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="mt-6 flex gap-2 justify-center">
          {[7, 30, 100].map((milestone) => (
            <div
              key={milestone}
              className={cn(
                'px-4 py-1.5 text-xs rounded-full border transition-all',
                currentStreak >= milestone
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-muted-foreground'
              )}
            >
              {milestone}D {currentStreak >= milestone && '✓'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
