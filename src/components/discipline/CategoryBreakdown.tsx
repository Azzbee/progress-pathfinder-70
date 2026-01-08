import { TrendingUp, TrendingDown, Minus, Target, Zap, Brain, Users, DollarSign, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryData {
  name: string;
  score: number;
  trend: number;
  color: string;
  goalsCompleted: number;
  totalGoals: number;
}

interface CategoryBreakdownProps {
  categories: CategoryData[];
}

const categoryIcons: Record<string, typeof Target> = {
  'Physical': Zap,
  'Mental': Brain,
  'Social': Users,
  'Financial': DollarSign,
  'Career': Briefcase,
};

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const getScoreClass = (score: number) => {
    if (score >= 8) return 'text-primary';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-destructive';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-primary" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="heading-serif text-lg text-primary">CATEGORY_ANALYSIS</h3>
      
      <div className="grid gap-4">
        {categories.map((cat, index) => {
          const Icon = categoryIcons[cat.name] || Target;
          const completionRate = cat.totalGoals > 0 
            ? Math.round((cat.goalsCompleted / cat.totalGoals) * 100) 
            : 0;

          return (
            <div 
              key={cat.name}
              className={cn(
                "glass-card p-4 border-l-4 animate-fade-in-up",
                `stagger-${index + 1}`
              )}
              style={{ borderLeftColor: cat.color }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{ 
                      borderColor: cat.color,
                      backgroundColor: `${cat.color}15`
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <span className="font-mono text-sm text-card-foreground uppercase tracking-wider">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{cat.goalsCompleted}/{cat.totalGoals} goals</span>
                      <span>•</span>
                      <span>{completionRate}% complete</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(cat.trend)}
                    <span className={cn(
                      "text-xs font-mono",
                      cat.trend > 0 ? "text-primary" : cat.trend < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {cat.trend > 0 ? '+' : ''}{cat.trend.toFixed(1)}
                    </span>
                  </div>
                  <div className={cn("text-2xl font-mono font-bold", getScoreClass(cat.score))}>
                    {cat.score.toFixed(1)}
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-muted relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${cat.score * 10}%`,
                    backgroundColor: cat.color,
                    boxShadow: `0 0 10px ${cat.color}`
                  }}
                />
                {/* Grid overlay */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 border-r border-background/50 last:border-r-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground font-mono">
              // NO_CATEGORY_DATA
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Complete goals to see category analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
