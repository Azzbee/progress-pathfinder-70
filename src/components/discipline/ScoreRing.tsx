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
  color,
  animated = true
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
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
    if (color) return color;
    if (displayScore >= 8) return 'hsl(120 100% 45%)'; // Excellent - green
    if (displayScore >= 6) return 'hsl(60 100% 50%)'; // Good - yellow
    if (displayScore >= 4) return 'hsl(30 100% 50%)'; // Average - orange
    return 'hsl(0 85% 50%)'; // Needs work - red
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width, height: width }}>
      {/* Background ring */}
      <svg className="absolute transform -rotate-90" width={width} height={width}>
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="hsl(120 15% 12%)"
          strokeWidth={stroke}
        />
      </svg>
      
      {/* Progress ring */}
      <svg 
        className={cn(
          "absolute transform -rotate-90 transition-all duration-1000",
          mounted && "opacity-100"
        )} 
        width={width} 
        height={width}
      >
        <defs>
          <filter id={`glow-${label || 'main'}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? strokeDashoffset : circumference - (score / maxScore) * circumference}
          filter={`url(#glow-${label || 'main'})`}
          style={{
            transition: animated ? 'stroke-dashoffset 1.5s ease-out' : 'none'
          }}
        />
      </svg>

      {/* Inner content */}
      <div className="flex flex-col items-center justify-center z-10">
        <span 
          className={cn("font-mono font-bold matrix-glow", fontSize)}
          style={{ color: getScoreColor() }}
        >
          {displayScore.toFixed(1)}
        </span>
        {label && (
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">
            {label}
          </span>
        )}
        <span className="text-xs text-muted-foreground font-mono opacity-50">
          / {maxScore.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
