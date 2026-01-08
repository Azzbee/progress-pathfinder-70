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
  const [isAnimating, setIsAnimating] = useState(true);
  const isActiveStreak = currentStreak > 0;

  useEffect(() => {
    setIsAnimating(true);
    setDisplayStreak(0);
    
    if (currentStreak === 0) {
      setIsAnimating(false);
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
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayStreak(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentStreak]);

  return (
    <div className="relative border border-primary/50 p-6 card-hover overflow-hidden group">
      {/* Animated background glow */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-700",
        isActiveStreak && "opacity-100"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="heading-serif text-xl text-primary">STREAK_STATUS</h2>
            {isActiveStreak && (
              <Zap className="w-4 h-4 text-accent animate-pulse" />
            )}
          </div>
          {freezesAvailable > 0 && (
            <button
              onClick={onUseFreeze}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-all border border-muted-foreground/30 px-2 py-1 hover:border-accent hover:scale-105 active:scale-95"
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
              <div className="relative">
                <Flame 
                  className={cn(
                    'w-10 h-10 transition-all duration-500',
                    isActiveStreak ? 'text-primary' : 'text-muted-foreground'
                  )} 
                />
                {isActiveStreak && (
                  <>
                    <Flame 
                      className="absolute inset-0 w-10 h-10 text-primary animate-ping opacity-30" 
                    />
                    <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  </>
                )}
              </div>
            </div>
            <div 
              className={cn(
                'heading-serif text-6xl font-bold transition-all duration-300',
                isActiveStreak ? 'text-primary' : 'text-muted-foreground',
                isAnimating && 'scale-110'
              )}
              style={{
                textShadow: isActiveStreak ? '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)' : 'none'
              }}
            >
              {displayStreak}
            </div>
            <div className="text-muted-foreground text-xs mt-2 tracking-widest">
              CURRENT_STREAK
            </div>
          </div>

          {/* Animated Divider */}
          <div className="relative w-px h-24">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
            <div className={cn(
              "absolute inset-0 bg-gradient-to-b from-transparent via-primary to-transparent transition-opacity duration-500",
              isActiveStreak ? "opacity-100 animate-pulse" : "opacity-0"
            )} />
          </div>

          {/* Longest Streak */}
          <div className="flex-1 text-center group/longest">
            <div className="heading-serif text-4xl text-muted-foreground group-hover/longest:text-primary/70 transition-colors duration-300">
              {longestStreak}
            </div>
            <div className="text-muted-foreground text-xs mt-2 tracking-widest">
              LONGEST_STREAK
            </div>
            {currentStreak >= longestStreak && currentStreak > 0 && (
              <div className="text-xs text-accent mt-2 animate-pulse">
                ★ NEW RECORD
              </div>
            )}
          </div>
        </div>

        {/* Streak milestones with animation */}
        <div className="mt-6 flex gap-2 justify-center">
          {[7, 30, 100].map((milestone, index) => (
            <div
              key={milestone}
              className={cn(
                'px-4 py-1.5 text-xs border transition-all duration-300 transform',
                currentStreak >= milestone
                  ? 'border-primary text-primary bg-primary/10 scale-105 shadow-lg shadow-primary/20'
                  : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:scale-105'
              )}
              style={{ 
                animationDelay: `${index * 100}ms`,
                transitionDelay: `${index * 50}ms`
              }}
            >
              {milestone}D
              {currentStreak >= milestone && (
                <span className="ml-1 text-accent">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
