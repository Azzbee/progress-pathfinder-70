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
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    setDisplayScore(0);
    setShowSparkle(false);
    
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        setIsAnimating(false);
        if (score >= 7) setShowSparkle(true);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const highPerformers = useMemo(() => 
    categoryScores.filter(c => c.score >= 7).sort((a, b) => b.score - a.score),
    [categoryScores]
  );
  
  const needsWork = useMemo(() => 
    categoryScores.filter(c => c.score < 7).sort((a, b) => a.score - b.score),
    [categoryScores]
  );

  // Calculate ring progress
  const ringProgress = (displayScore / 10) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  // Score color based on value
  const getScoreColor = () => {
    if (displayScore >= 8) return 'text-primary';
    if (displayScore >= 5) return 'text-accent';
    return 'text-destructive';
  };

  return (
    <div className="relative border border-primary/50 p-6 card-hover overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="heading-serif text-xl text-primary">DISCIPLINE_SCORE</h2>
            {showSparkle && (
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            )}
          </div>
          <div className="flex gap-1">
            {(['daily', 'weekly', 'monthly'] as const).map((tf, index) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={cn(
                  'px-3 py-1.5 text-xs border transition-all duration-300 transform hover:scale-105 active:scale-95',
                  timeframe === tf
                    ? 'border-primary text-primary bg-primary/10 shadow-lg shadow-primary/10'
                    : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50'
                )}
                style={{ transitionDelay: `${index * 30}ms` }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Main Score with Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* SVG Ring */}
            <svg width="140" height="140" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="70"
                cy="70"
                r="54"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
                className="opacity-30"
              />
              {/* Progress ring */}
              <circle
                cx="70"
                cy="70"
                r="54"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))'
                }}
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div 
                className={cn(
                  'heading-serif text-5xl font-bold transition-all duration-300',
                  getScoreColor(),
                  isAnimating && 'scale-95 opacity-80'
                )}
                style={{
                  textShadow: displayScore >= 7 
                    ? '0 0 20px hsl(var(--primary) / 0.5)' 
                    : 'none'
                }}
              >
                {displayScore.toFixed(1)}
              </div>
              <div className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                <Target className="w-3 h-3" />
                / 10.0
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown with staggered animations */}
        <div className="grid grid-cols-2 gap-6">
          {/* What you did well */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-primary font-medium tracking-wider">EXCELLING</span>
            </div>
            <div className="space-y-2">
              {highPerformers.length > 0 ? (
                highPerformers.map((cat, index) => (
                  <div 
                    key={cat.name} 
                    className="flex items-center justify-between text-sm p-2 border border-transparent hover:border-primary/20 transition-all duration-300 hover:bg-primary/5 rounded"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span style={{ color: cat.color }}>{cat.name}</span>
                    </div>
                    <span className="text-primary font-mono">{cat.score.toFixed(1)}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-xs italic">No data yet</p>
              )}
            </div>
          </div>

          {/* What needs work */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-destructive/10 rounded">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-xs text-destructive font-medium tracking-wider">NEEDS_WORK</span>
            </div>
            <div className="space-y-2">
              {needsWork.length > 0 ? (
                needsWork.map((cat, index) => (
                  <div 
                    key={cat.name} 
                    className="flex items-center justify-between text-sm p-2 border border-transparent hover:border-destructive/20 transition-all duration-300 hover:bg-destructive/5 rounded"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full opacity-60"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span style={{ color: cat.color }} className="opacity-80">{cat.name}</span>
                    </div>
                    <span className="text-muted-foreground font-mono">{cat.score.toFixed(1)}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-xs italic flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> All good!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
