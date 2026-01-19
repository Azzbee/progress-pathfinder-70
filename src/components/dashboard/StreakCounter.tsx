import { useState, useEffect } from 'react';
import { Flame, Snowflake, Zap, Share2, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  onUseFreeze?: () => void;
}

// Streak tier system
const getStreakTier = (streak: number) => {
  if (streak >= 100) return { name: 'Diamond', color: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-500/50', emoji: '💎' };
  if (streak >= 50) return { name: 'Gold', color: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-500/50', emoji: '🏆' };
  if (streak >= 30) return { name: 'Silver', color: 'from-gray-300 to-gray-400', glow: 'shadow-gray-400/50', emoji: '🥈' };
  if (streak >= 7) return { name: 'Bronze', color: 'from-orange-400 to-amber-600', glow: 'shadow-orange-500/50', emoji: '🥉' };
  return { name: 'Starter', color: 'from-primary to-accent', glow: 'shadow-primary/30', emoji: '🔥' };
};

export default function StreakCounter({
  currentStreak,
  longestStreak,
  freezesAvailable,
  onUseFreeze
}: StreakCounterProps) {
  const [displayStreak, setDisplayStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isActiveStreak = currentStreak > 0;
  const tier = getStreakTier(currentStreak);

  useEffect(() => {
    if (currentStreak === 0) {
      setDisplayStreak(0);
      return;
    }

    setIsAnimating(true);
    const duration = 1500;
    const steps = Math.min(currentStreak, 30);
    const increment = currentStreak / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= currentStreak) {
        setDisplayStreak(currentStreak);
        clearInterval(timer);
        setTimeout(() => setIsAnimating(false), 500);
      } else {
        setDisplayStreak(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentStreak]);

  const handleShare = () => {
    const text = `🔥 I'm on a ${currentStreak}-day streak! ${tier.emoji} ${tier.name} tier achieved! Can you beat it? #DisciplineOS #Productivity`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="glass-premium rounded-3xl p-6 overflow-hidden relative group">
      {/* Animated background gradient */}
      {isActiveStreak && (
        <>
          <div className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl transition-all duration-1000",
            `bg-gradient-to-b ${tier.color}`,
            isAnimating ? "opacity-40 scale-110" : "opacity-20"
          )} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="heading-display text-xl text-foreground">Streak Status</h2>
            {isActiveStreak && (
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r text-white",
                tier.color
              )}>
                {tier.emoji} {tier.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isActiveStreak && (
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-all border border-border px-3 py-1.5 rounded-full hover:border-primary hover:bg-primary/5"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
            )}
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
        </div>

        <div className="flex items-center gap-8">
          {/* Current Streak - Animated Fire */}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={cn(
                'text-6xl font-display font-bold transition-all duration-300',
                isActiveStreak ? 'text-transparent bg-clip-text bg-gradient-to-r' : 'text-muted-foreground',
                tier.color
              )}>
                {displayStreak}
              </div>
              <div className="relative">
                {/* Animated fire with multiple layers */}
                <div className={cn(
                  "relative w-14 h-14 flex items-center justify-center",
                  isActiveStreak && "animate-fire-flicker"
                )}>
                  <Flame className={cn(
                    'w-12 h-12 transition-all duration-300',
                    isActiveStreak ? 'text-orange-500' : 'text-muted-foreground'
                  )} />
                  {isActiveStreak && (
                    <>
                      <Flame className="w-10 h-10 text-yellow-400 absolute top-1 left-2 animate-fire-inner opacity-80" />
                      <Flame className="w-8 h-8 text-red-500 absolute top-2 left-3 animate-fire-core" />
                    </>
                  )}
                </div>
                {isActiveStreak && (
                  <div className={cn(
                    "absolute -inset-4 rounded-full blur-2xl animate-pulse",
                    `bg-gradient-to-b ${tier.color} opacity-30`
                  )} />
                )}
              </div>
            </div>
            <div className="text-muted-foreground text-xs">Current Streak</div>
          </div>

          <div className="w-px h-24 bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Longest Streak with crown */}
          <div className="flex-1 text-center relative">
            {currentStreak >= longestStreak && currentStreak > 0 && (
              <Crown className="w-5 h-5 text-yellow-500 absolute -top-1 left-1/2 -translate-x-1/2 animate-bounce-soft" />
            )}
            <div className="text-4xl font-display text-muted-foreground">{longestStreak}</div>
            <div className="text-muted-foreground text-xs mt-2">Longest Streak</div>
            {currentStreak >= longestStreak && currentStreak > 0 && (
              <div className="text-xs text-yellow-500 mt-2 animate-pulse flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> New Record!
              </div>
            )}
          </div>
        </div>

        {/* Milestones with progress */}
        <div className="mt-6">
          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { days: 7, label: 'Week Warrior', emoji: '🥉' },
              { days: 30, label: 'Monthly Master', emoji: '🥈' },
              { days: 50, label: 'Golden Legend', emoji: '🏆' },
              { days: 100, label: 'Diamond Elite', emoji: '💎' }
            ].map((milestone) => {
              const achieved = currentStreak >= milestone.days;
              const progress = Math.min((currentStreak / milestone.days) * 100, 100);
              
              return (
                <div
                  key={milestone.days}
                  className={cn(
                    'relative px-4 py-2 text-xs rounded-full border transition-all overflow-hidden',
                    achieved
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {!achieved && (
                    <div 
                      className="absolute inset-0 bg-primary/10 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    {milestone.emoji} {milestone.days}D {achieved && '✓'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
