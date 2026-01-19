import { cn } from '@/lib/utils';
import { Zap, Star, Crown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfDay, subDays } from 'date-fns';

interface XPLevelBarProps {
  totalXP?: number;
  dailyXP?: number;
}

// Level thresholds - exponential growth
const getLevelInfo = (xp: number) => {
  const levels = [
    { level: 1, name: 'Novice', minXP: 0, maxXP: 100, icon: '🌱' },
    { level: 2, name: 'Beginner', minXP: 100, maxXP: 300, icon: '🌿' },
    { level: 3, name: 'Apprentice', minXP: 300, maxXP: 600, icon: '🌳' },
    { level: 4, name: 'Student', minXP: 600, maxXP: 1000, icon: '📖' },
    { level: 5, name: 'Practitioner', minXP: 1000, maxXP: 1500, icon: '⚡' },
    { level: 6, name: 'Adept', minXP: 1500, maxXP: 2200, icon: '🔥' },
    { level: 7, name: 'Expert', minXP: 2200, maxXP: 3000, icon: '💫' },
    { level: 8, name: 'Virtuoso', minXP: 3000, maxXP: 4000, icon: '🌟' },
    { level: 9, name: 'Master', minXP: 4000, maxXP: 5500, icon: '👑' },
    { level: 10, name: 'Grandmaster', minXP: 5500, maxXP: 7500, icon: '🏆' },
    { level: 15, name: 'Champion', minXP: 7500, maxXP: 12000, icon: '💎' },
    { level: 20, name: 'Legend', minXP: 12000, maxXP: 18000, icon: '🔮' },
    { level: 30, name: 'Mythic', minXP: 18000, maxXP: 30000, icon: '⭐' },
    { level: 50, name: 'Discipline Master', minXP: 30000, maxXP: Infinity, icon: '🌈' },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) {
      const current = levels[i];
      const next = levels[i + 1] || { ...current, maxXP: current.maxXP + 10000 };
      const progress = ((xp - current.minXP) / (current.maxXP - current.minXP)) * 100;
      const xpToNext = current.maxXP - xp;
      
      return {
        ...current,
        progress: Math.min(progress, 100),
        xpToNext,
        nextLevel: next
      };
    }
  }

  return { ...levels[0], progress: 0, xpToNext: 100, nextLevel: levels[1] };
};

export default function XPLevelBar({ totalXP: propTotalXP, dailyXP: propDailyXP }: XPLevelBarProps) {
  const { user } = useAuth();
  const [calculatedXP, setCalculatedXP] = useState({ total: 0, daily: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchXP = async () => {
      if (!user) return;

      // Fetch all completions to calculate XP
      const { data: completions } = await supabase
        .from('daily_completions')
        .select('goals_completed, date')
        .eq('user_id', user.id);

      // Fetch streak data
      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      const today = format(new Date(), 'yyyy-MM-dd');
      let totalXP = 0;
      let dailyXP = 0;

      (completions || []).forEach(c => {
        // 10 XP per task, 50 XP bonus per goal (estimated as completed tasks)
        const xp = (c.goals_completed || 0) * 50;
        totalXP += xp;
        if (c.date === today) {
          dailyXP = xp;
        }
      });

      // Streak bonus
      const streakBonus = (streakData?.current_streak || 0) * 25;
      totalXP += streakBonus;

      setCalculatedXP({ total: totalXP, daily: dailyXP });
      setLoading(false);
    };

    fetchXP();
  }, [user]);

  const totalXP = propTotalXP ?? calculatedXP.total;
  const dailyXP = propDailyXP ?? calculatedXP.daily;
  const levelInfo = getLevelInfo(totalXP);
  const isMaxLevel = levelInfo.level >= 50;

  if (loading && !propTotalXP) {
    return (
      <div className="glass-premium rounded-3xl p-6 animate-pulse">
        <div className="h-12 bg-muted/30 rounded-xl mb-4" />
        <div className="h-4 bg-muted/30 rounded-full" />
      </div>
    );
  }

  return (
    <div className="glass-premium rounded-3xl p-6 overflow-hidden relative group">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float-particle"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl shadow-lg">
                {levelInfo.icon}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center text-xs font-bold border-2 border-primary">
                {levelInfo.level}
              </div>
            </div>
            <div>
              <h2 className="heading-display text-xl text-foreground flex items-center gap-2">
                {levelInfo.name}
                {isMaxLevel && <Crown className="w-4 h-4 text-yellow-500" />}
              </h2>
              <p className="text-xs text-muted-foreground">
                Level {levelInfo.level}
              </p>
            </div>
          </div>

          {/* Daily XP badge */}
          {dailyXP > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/30">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">+{dailyXP} today</span>
            </div>
          )}
        </div>

        {/* XP Progress Bar */}
        <div className="relative mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">{totalXP.toLocaleString()} XP</span>
            {!isMaxLevel && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3" />
                {levelInfo.xpToNext.toLocaleString()} XP to next level
              </span>
            )}
          </div>
          
          <div className="h-4 bg-muted/30 rounded-full overflow-hidden relative">
            {/* Progress fill with gradient and shimmer */}
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer-slide rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${levelInfo.progress}%` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>

            {/* Level markers */}
            <div className="absolute inset-0 flex items-center">
              {[25, 50, 75].map((marker) => (
                <div 
                  key={marker}
                  className={cn(
                    "absolute w-0.5 h-full",
                    levelInfo.progress >= marker ? "bg-primary-foreground/30" : "bg-muted-foreground/20"
                  )}
                  style={{ left: `${marker}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Next milestone */}
        {!isMaxLevel && (
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Next: </span>
              <span className="text-xs font-semibold text-foreground">
                {levelInfo.nextLevel?.icon} {levelInfo.nextLevel?.name}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Level {levelInfo.nextLevel?.level}
            </span>
          </div>
        )}

        {/* XP breakdown hint */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            💡 Complete tasks (+10 XP) • Finish goals (+50 XP) • Maintain streaks (+25 XP/day)
          </p>
        </div>
      </div>
    </div>
  );
}
