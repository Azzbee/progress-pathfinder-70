import { useState, useEffect } from 'react';
import { Zap, Target, Flame, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPExplainerProps {
  onComplete?: () => void;
}

const levels = [
  { level: 1, title: 'Novice', xp: 0, icon: '🌱' },
  { level: 5, title: 'Apprentice', xp: 500, icon: '📘' },
  { level: 10, title: 'Practitioner', xp: 1500, icon: '⚡' },
  { level: 25, title: 'Expert', xp: 5000, icon: '🏆' },
  { level: 50, title: 'Discipline Master', xp: 15000, icon: '👑' },
];

const xpSources = [
  { icon: Target, label: 'Complete tasks', xp: '+10-25 XP', color: 'text-primary' },
  { icon: Flame, label: 'Daily streaks', xp: '+50 XP/day', color: 'text-orange-400' },
  { icon: Award, label: 'Achieve goals', xp: '+100-500 XP', color: 'text-accent' },
  { icon: TrendingUp, label: 'Consistency bonus', xp: '+2x multiplier', color: 'text-emerald-400' },
];

export default function XPExplainer({ onComplete }: XPExplainerProps) {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    // Animate XP bar filling
    const timer = setTimeout(() => {
      const targetXP = 750;
      const duration = 2000;
      const steps = 60;
      const increment = targetXP / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= targetXP) {
          setAnimatedXP(targetXP);
          setCurrentLevel(5);
          clearInterval(interval);
          setTimeout(() => setShowSources(true), 500);
        } else {
          setAnimatedXP(current);
          // Level up animation
          if (current >= 500 && currentLevel < 5) {
            setCurrentLevel(5);
          }
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const progressPercent = Math.min((animatedXP / 1500) * 100, 100);

  return (
    <div className="space-y-6">
      {/* XP Bar Preview */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-[shimmer-slide_3s_linear_infinite]" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl animate-[bounce_2s_ease-in-out_infinite]">
                {levels[currentLevel > 0 ? 1 : 0].icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Level {currentLevel > 0 ? 5 : 1}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentLevel > 0 ? 'Apprentice' : 'Novice'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary">
                <Zap className="w-4 h-4" />
                <span className="font-bold">{Math.round(animatedXP)}</span>
              </div>
              <div className="text-xs text-muted-foreground">/ 1,500 XP</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="h-4 bg-muted/30 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-300 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer-slide_1.5s_linear_infinite]" />
            </div>
            
            {/* Level markers */}
            <div className="absolute top-0 left-[33%] w-0.5 h-full bg-foreground/20" />
            <div className="absolute top-0 left-[66%] w-0.5 h-full bg-foreground/20" />
          </div>

          {/* Level preview */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Novice</span>
            <span>Practitioner</span>
            <span>Master</span>
          </div>
        </div>
      </div>

      {/* XP Sources */}
      <div className={cn(
        "space-y-3 transition-all duration-500",
        showSources ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <h4 className="text-sm font-semibold text-foreground text-center">
          How to earn XP
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {xpSources.map((source, i) => (
            <div 
              key={source.label}
              className="glass-card rounded-xl p-3 flex items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={cn("p-2 rounded-lg bg-muted/50", source.color)}>
                <source.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">
                  {source.label}
                </div>
                <div className="text-xs text-primary font-bold">{source.xp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level progression preview */}
      <div className={cn(
        "transition-all duration-500 delay-300",
        showSources ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex justify-center gap-3 py-4">
          {levels.map((level, i) => (
            <div 
              key={level.level}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                i <= 1 ? "opacity-100 scale-100" : "opacity-40 scale-90"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg border-2",
                i === 0 && "border-primary bg-primary/20",
                i === 1 && "border-accent bg-accent/20 animate-pulse",
                i > 1 && "border-muted bg-muted/20"
              )}>
                {level.icon}
              </div>
              <span className="text-[10px] text-muted-foreground">{level.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}