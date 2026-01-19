import AppLayout from '@/components/layout/AppLayout';
import GoalCard from '@/components/dashboard/GoalCard';
import CreateGoalDialog from '@/components/dashboard/CreateGoalDialog';
import CategoryHealthBars from '@/components/dashboard/CategoryHealthBars';
import XPLevelBar from '@/components/dashboard/XPLevelBar';
import AnimatedEmptyState from '@/components/dashboard/AnimatedEmptyState';
import { useGoals } from '@/hooks/useGoals';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { goals, categories, loading: goalsLoading, createGoal, toggleTask, deleteGoal } = useGoals();

  // Calculate category completion percentages
  const getCategoryData = () => {
    const presetCategories = [
      { name: 'Physical', color: 'hsl(142 76% 36%)' },
      { name: 'Mental', color: 'hsl(221 83% 53%)' },
      { name: 'Academic', color: 'hsl(262 83% 58%)' },
      { name: 'Financial', color: 'hsl(45 93% 47%)' },
      { name: 'Social', color: 'hsl(0 84% 60%)' }
    ];
    
    return presetCategories.map(preset => {
      const category = categories.find(c => c.name === preset.name);
      const categoryGoals = category 
        ? goals.filter(g => g.category_id === category.id)
        : [];
      
      const completedGoals = categoryGoals.filter(g => g.progress === 100).length;

      return {
        name: preset.name,
        color: category?.color || preset.color,
        totalGoals: categoryGoals.length,
        completedGoals
      };
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with premium styling */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="heading-display text-3xl gradient-text text-depth">
              Goal Planner
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your objectives across all areas of life ✨
            </p>
          </div>
          <CreateGoalDialog categories={categories} onCreateGoal={createGoal} />
        </div>

        {/* XP Level Bar */}
        <div className="animate-fade-in-up">
          <XPLevelBar />
        </div>

        {/* Goals List */}
        <div className="animate-fade-in-up stagger-1">
          <h2 className="heading-display text-xl text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Active Goals
          </h2>
          
          {goalsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted/30 rounded-3xl shimmer-effect" />
              ))}
            </div>
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div 
                  key={goal.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <GoalCard
                    id={goal.id}
                    title={goal.title}
                    description={goal.description || undefined}
                    progress={goal.progress}
                    categoryName={goal.category?.name || 'Uncategorized'}
                    categoryColor={goal.category?.color || 'hsl(195 90% 48%)'}
                    targetDate={goal.target_date || undefined}
                    tasks={goal.tasks}
                    onToggleTask={toggleTask}
                    onDeleteGoal={deleteGoal}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AnimatedEmptyState categories={categories} onCreateGoal={createGoal} />
          )}
        </div>

        {/* Category Health Bars */}
        <div className="animate-fade-in-up stagger-2">
          <CategoryHealthBars categories={getCategoryData()} />
        </div>

        {/* AI Coach Link - Premium styled */}
        <button
          onClick={() => navigate('/ai-coach')}
          className="w-full glass-premium p-5 rounded-3xl flex items-center gap-4 hover-lift group animate-fade-in-up stagger-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-foreground font-semibold text-lg">Need help with goals?</p>
            <p className="text-sm text-muted-foreground">Talk to AI Coach for personalized guidance</p>
          </div>
          <div className="text-primary text-2xl group-hover:translate-x-1 transition-transform">
            →
          </div>
        </button>
      </div>
    </AppLayout>
  );
}
