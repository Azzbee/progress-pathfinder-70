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
          
          return (
            <div 
              key={category.name} 
              className="group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Circular progress indicator */}
              <div className="relative w-16 h-16 mx-auto mb-3">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="hsl(var(--muted))"
                    strokeWidth="6"
                    fill="none"
                    className="opacity-30"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke={category.color}
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - percentage / 100)}`}
                    className="transition-all duration-700 ease-out group-hover:drop-shadow-lg"
                    style={{
                      filter: percentage > 50 ? `drop-shadow(0 0 8px ${category.color})` : 'none'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: category.color }}>
                    {percentage}%
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-sm font-semibold text-foreground block group-hover:text-primary transition-colors">
                  {category.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {category.completedGoals}/{category.totalGoals}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
