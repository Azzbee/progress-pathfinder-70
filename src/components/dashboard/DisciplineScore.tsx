import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

  useEffect(() => {
    setIsAnimating(true);
    setDisplayScore(0);
    
    const duration = 2000;
    const steps = 50;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const highPerformers = categoryScores.filter(c => c.score >= 7).sort((a, b) => b.score - a.score);
  const needsWork = categoryScores.filter(c => c.score < 7).sort((a, b) => a.score - b.score);

  return (
    <div className="border border-primary/50 p-6 card-hover">
      <div className="flex items-center justify-between mb-6">
        <h2 className="heading-serif text-xl text-primary">DISCIPLINE_SCORE</h2>
        <div className="flex gap-1">
          {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={cn(
                'px-3 py-1 text-xs border transition-all',
                timeframe === tf
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50'
              )}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Score */}
      <div className="text-center mb-8">
        <div 
          className={cn(
            'heading-serif text-7xl font-bold text-primary',
            isAnimating ? '' : 'matrix-glow-strong'
          )}
        >
          {displayScore.toFixed(1)}
        </div>
        <div className="text-muted-foreground text-xs mt-2">
          / 10.0
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* What you did well */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary">EXCELLING</span>
          </div>
          <div className="space-y-2">
            {highPerformers.length > 0 ? (
              highPerformers.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <span style={{ color: cat.color }}>{cat.name}</span>
                  <span className="text-primary">{cat.score.toFixed(1)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-xs">No data yet</p>
            )}
          </div>
        </div>

        {/* What needs work */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive">NEEDS_WORK</span>
          </div>
          <div className="space-y-2">
            {needsWork.length > 0 ? (
              needsWork.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <span style={{ color: cat.color }}>{cat.name}</span>
                  <span className="text-muted-foreground">{cat.score.toFixed(1)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-xs">All good!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
