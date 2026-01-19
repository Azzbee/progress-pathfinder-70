import { cn } from '@/lib/utils';

interface CategoryHealth {
  name: string;
  color: string;
  completedGoals: number;
  totalGoals: number;
}

interface CategoryHealthBarsProps {
  categories: CategoryHealth[];
}

// Category icons and gradients
const categoryMeta: Record<string, { emoji: string; gradient: string; bgGradient: string }> = {
  Physical: { 
    emoji: '🏋️', 
    gradient: 'from-emerald-400 to-green-500',
    bgGradient: 'from-emerald-500/20 to-green-500/10'
  },
  Mental: { 
    emoji: '🧠', 
    gradient: 'from-blue-400 to-indigo-500',
    bgGradient: 'from-blue-500/20 to-indigo-500/10'
  },
  Academic: { 
    emoji: '📚', 
    gradient: 'from-purple-400 to-violet-500',
    bgGradient: 'from-purple-500/20 to-violet-500/10'
  },
  Financial: { 
    emoji: '💰', 
    gradient: 'from-yellow-400 to-amber-500',
    bgGradient: 'from-yellow-500/20 to-amber-500/10'
  },
  Social: { 
    emoji: '👥', 
    gradient: 'from-rose-400 to-red-500',
    bgGradient: 'from-rose-500/20 to-red-500/10'
  }
};

export default function CategoryHealthBars({ categories }: CategoryHealthBarsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="glass-premium rounded-3xl p-6 hover-lift">
      <h3 className="heading-display text-lg text-foreground mb-6 flex items-center gap-2">
        <span className="text-xl">📊</span>
        Category Progress
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category, index) => {
          const percentage = category.totalGoals > 0 
            ? Math.round((category.completedGoals / category.totalGoals) * 100) 
            : 0;
          
          const meta = categoryMeta[category.name] || { 
            emoji: '🎯', 
            gradient: 'from-primary to-accent',
            bgGradient: 'from-primary/20 to-accent/10'
          };

          // SVG circle properties
          const size = 80;
          const strokeWidth = 6;
          const radius = (size - strokeWidth) / 2;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (percentage / 100) * circumference;

          return (
            <div 
              key={category.name} 
              className={cn(
                "relative flex flex-col items-center p-4 rounded-2xl transition-all duration-500 group cursor-pointer",
                "bg-gradient-to-br border border-white/10",
                meta.bgGradient,
                "hover:scale-105 hover:shadow-lg animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Glow effect on hover */}
              <div className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl",
                `bg-gradient-to-br ${meta.gradient}`
              )} />

              {/* Circular progress with icon */}
              <div className="relative mb-2">
                <svg 
                  width={size} 
                  height={size} 
                  className="transform -rotate-90"
                >
                  {/* Background circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    className="opacity-20"
                  />
                  
                  {/* Progress circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={category.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: percentage === 100 ? `drop-shadow(0 0 8px ${category.color})` : 
                              percentage > 50 ? `drop-shadow(0 0 4px ${category.color})` : 'none'
                    }}
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">
                    {meta.emoji}
                  </span>
                  <span 
                    className={cn(
                      "text-sm font-bold transition-all",
                      percentage === 100 ? "text-primary" : "text-foreground"
                    )}
                    style={{ color: category.color }}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Category name */}
              <span className="text-xs font-medium text-foreground text-center mb-0.5 group-hover:text-primary transition-colors">
                {category.name}
              </span>
              
              {/* Goal count */}
              <span className="text-xs text-muted-foreground">
                {category.completedGoals}/{category.totalGoals}
              </span>

              {/* Completion badge */}
              {percentage === 100 && category.totalGoals > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-[10px] shadow-lg animate-bounce-once">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
