import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Sparkles, Target } from 'lucide-react';

interface CategoryScore {
  name: string;
  score: number;
  color: string;
}

interface DisciplineScoreProps {
  score: number;
  categoryScores: CategoryScore[];
  timeframe: 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
}

export default function DisciplineScore({
  score,
  categoryScores,
  timeframe,
  onTimeframeChange
}: DisciplineScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        if (score >= 7) setShowSparkle(true);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const highPerformers = useMemo(() => 
    categoryScores.filter(c => c.score >= 7).sort((a, b) => b.score - a.score), [categoryScores]);
  
  const needsWork = useMemo(() => 
    categoryScores.filter(c => c.score < 7).sort((a, b) => a.score - b.score), [categoryScores]);

  const ringProgress = (displayScore / 10) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="heading-display text-xl text-foreground">Discipline Score</h2>
            {showSparkle && <Sparkles className="w-4 h-4 text-accent animate-pulse" />}
          </div>
          <div className="flex gap-1">
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full border transition-all',
                  timeframe === tf
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Score Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg width="140" height="140" className="transform -rotate-90">
              <circle cx="70" cy="70" r="54" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" className="opacity-30" />
              <circle
                cx="70" cy="70" r="54"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-display font-bold text-primary">{displayScore.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" /> / 10.0
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Excelling</span>
            </div>
            {highPerformers.length > 0 ? highPerformers.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span style={{ color: cat.color }}>{cat.name}</span>
                </div>
                <span className="text-primary">{cat.score.toFixed(1)}</span>
              </div>
            )) : <p className="text-muted-foreground text-xs">No data yet</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive">Needs Work</span>
            </div>
            {needsWork.length > 0 ? needsWork.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-destructive/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full opacity-60" style={{ backgroundColor: cat.color }} />
                  <span className="opacity-80" style={{ color: cat.color }}>{cat.name}</span>
                </div>
                <span className="text-muted-foreground">{cat.score.toFixed(1)}</span>
              </div>
            )) : <p className="text-muted-foreground text-xs flex items-center gap-1"><Sparkles className="w-3 h-3" /> All good!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
