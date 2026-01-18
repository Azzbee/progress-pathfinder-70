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
    <div className="glass-card rounded-3xl p-6">
      <h3 className="heading-display text-lg text-foreground mb-6">Category Progress</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => {
          const percentage = category.totalGoals > 0 
            ? Math.round((category.completedGoals / category.totalGoals) * 100) 
            : 0;
          
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.completedGoals}/{category.totalGoals}
                </span>
              </div>
              
              <div className="relative h-8 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out flex items-center justify-center"
                  style={{
                    width: `${Math.max(percentage, 8)}%`,
                    backgroundColor: category.color,
                    boxShadow: percentage > 30 ? `0 0 12px ${category.color}60` : 'none'
                  }}
                >
                  {percentage > 15 && (
                    <span className="text-xs font-bold text-white drop-shadow-sm">
                      {percentage}%
                    </span>
                  )}
                </div>
                {percentage <= 15 && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {percentage}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
