import { useEffect, useState } from 'react';
import { Target, Sparkles, ArrowUp, Star, Zap } from 'lucide-react';
import CreateGoalDialog from './CreateGoalDialog';

interface AnimatedEmptyStateProps {
  categories: { id: string; name: string; color: string }[];
  onCreateGoal: (goal: any) => Promise<any>;
}

// Animated floating elements
const FloatingElement = ({ delay, duration, className, children }: {
  delay: number;
  duration: number;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`absolute animate-float ${className}`}
    style={{
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  >
    {children}
  </div>
);

// Animated climbing figure
const ClimbingFigure = () => (
  <svg viewBox="0 0 100 140" className="w-24 h-32">
    {/* Mountain */}
    <polygon
      points="50,10 95,130 5,130"
      fill="url(#mountainGradient)"
      className="animate-pulse-slow"
    />
    <defs>
      <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--primary)/0.3)" />
      </linearGradient>
    </defs>
    
    {/* Flag at top */}
    <g className="animate-wave origin-bottom-left" style={{ transformOrigin: '50px 15px' }}>
      <line x1="50" y1="10" x2="50" y2="0" stroke="hsl(var(--accent))" strokeWidth="1.5" />
      <polygon points="50,0 65,5 50,10" fill="hsl(var(--accent))" />
    </g>
    
    {/* Climber */}
    <g className="animate-climb">
      {/* Body */}
      <circle cx="35" cy="70" r="6" fill="hsl(var(--foreground))" />
      {/* Torso */}
      <line x1="35" y1="76" x2="35" y2="90" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" />
      {/* Arms */}
      <line x1="35" y1="80" x2="42" y2="72" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="35" y1="80" x2="28" y2="85" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <line x1="35" y1="90" x2="40" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="35" y1="90" x2="30" y2="100" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
    </g>
    
    {/* Stars */}
    <g className="animate-twinkle">
      <circle cx="70" cy="30" r="2" fill="hsl(var(--primary))" opacity="0.8" />
      <circle cx="25" cy="40" r="1.5" fill="hsl(var(--accent))" opacity="0.6" />
      <circle cx="80" cy="55" r="1" fill="hsl(var(--primary))" opacity="0.7" />
    </g>
  </svg>
);

export default function AnimatedEmptyState({ categories, onCreateGoal }: AnimatedEmptyStateProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative glass-premium rounded-3xl p-10 text-center overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
      {/* Background floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement delay={0} duration={6} className="top-10 left-10">
          <Star className="w-6 h-6 text-primary/30" />
        </FloatingElement>
        <FloatingElement delay={1} duration={5} className="top-20 right-16">
          <Sparkles className="w-8 h-8 text-accent/40" />
        </FloatingElement>
        <FloatingElement delay={2} duration={7} className="bottom-20 left-16">
          <Target className="w-5 h-5 text-primary/25" />
        </FloatingElement>
        <FloatingElement delay={0.5} duration={6} className="bottom-16 right-10">
          <Zap className="w-7 h-7 text-accent/35" />
        </FloatingElement>
        <FloatingElement delay={1.5} duration={5.5} className="top-1/3 left-1/4">
          <div className="w-2 h-2 rounded-full bg-primary/40" />
        </FloatingElement>
        <FloatingElement delay={2.5} duration={6.5} className="top-1/2 right-1/4">
          <div className="w-3 h-3 rounded-full bg-accent/30" />
        </FloatingElement>
      </div>

      {/* Animated illustration */}
      <div
        className={`transition-all duration-700 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl scale-150" />
          <ClimbingFigure />
        </div>
      </div>

      {/* Text content */}
      <div
        className={`transition-all duration-700 delay-200 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-foreground font-display text-2xl mb-3 gradient-text text-depth">
          Begin Your Ascent
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
          Every great journey starts with a single goal. Set yours now and watch your progress unfold.
        </p>
      </div>

      {/* Pulsing CTA */}
      <div
        className={`transition-all duration-700 delay-400 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative">
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-full h-full rounded-2xl bg-primary/20 animate-ping-slow" />
            <div className="absolute w-full h-full rounded-2xl bg-primary/10 animate-ping-slower" />
          </div>
          
          <CreateGoalDialog 
            categories={categories} 
            onCreateGoal={onCreateGoal}
            trigger={
              <button className="relative px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 group">
                <span className="text-lg">🚀</span>
                <span>Create Your First Goal</span>
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              </button>
            }
          />
        </div>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </div>
  );
}