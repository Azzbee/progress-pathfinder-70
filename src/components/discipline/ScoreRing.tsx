import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  color?: string;
  animated?: boolean;
}

export default function ScoreRing({ 
  score, 
  maxScore = 10, 
  size = 'lg',
  label,
  animated = true
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);

  const sizeMap = {
    sm: { width: 80, stroke: 6, fontSize: 'text-lg' },
    md: { width: 120, stroke: 8, fontSize: 'text-2xl' },
    lg: { width: 180, stroke: 10, fontSize: 'text-4xl' },
    xl: { width: 240, stroke: 12, fontSize: 'text-5xl' }
  };

  const { width, stroke, fontSize } = sizeMap[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / maxScore) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }
    
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, animated]);

  const getScoreColor = () => {
    if (displayScore >= 8) return 'hsl(200 85% 55%)';
    if (displayScore >= 6) return 'hsl(45 100% 50%)';
    if (displayScore >= 4) return 'hsl(30 100% 50%)';
    return 'hsl(0 85% 50%)';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width, height: width }}>
      <svg className="absolute transform -rotate-90" width={width} height={width}>
        <circle cx={width / 2} cy={width / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} className="opacity-30" />
      </svg>
      
      <svg className="absolute transform -rotate-90" width={width} height={width}>
        <circle
          cx={width / 2} cy={width / 2} r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: `drop-shadow(0 0 8px ${getScoreColor()})` }}
        />
      </svg>

      <div className="flex flex-col items-center justify-center z-10">
        <span className={cn("font-display font-bold", fontSize)} style={{ color: getScoreColor() }}>
          {displayScore.toFixed(1)}
        </span>
        {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
        <span className="text-xs text-muted-foreground opacity-50">/ {maxScore.toFixed(1)}</span>
      </div>
    </div>
  );
}
