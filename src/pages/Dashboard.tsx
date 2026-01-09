import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StreakCounter from '@/components/dashboard/StreakCounter';
import DisciplineScore from '@/components/dashboard/DisciplineScore';
import GoalCard from '@/components/dashboard/GoalCard';
import CreateGoalDialog from '@/components/dashboard/CreateGoalDialog';
import { useGoals } from '@/hooks/useGoals';
import { useStreak } from '@/hooks/useStreak';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { goals, categories, loading: goalsLoading, createGoal, toggleTask, deleteGoal } = useGoals();
  const { streak, loading: streakLoading, useFreeze } = useStreak();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Calculate discipline score based on goal completion
  const calculateDisciplineScore = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
    return (totalProgress / goals.length / 10);
  };

  // Calculate category scores
  const calculateCategoryScores = () => {
    return categories.map(cat => {
      const categoryGoals = goals.filter(g => g.category_id === cat.id);
      if (categoryGoals.length === 0) return { name: cat.name, score: 0, color: cat.color };
      
      const avgProgress = categoryGoals.reduce((sum, g) => sum + g.progress, 0) / categoryGoals.length;
      return {
        name: cat.name,
        score: avgProgress / 10,
        color: cat.color
      };
    }).filter(c => c.score > 0);
  };

  const isLoading = goalsLoading || streakLoading;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-display text-3xl text-primary">
              Goal Planner
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your objectives and build discipline
            </p>
          </div>
          <CreateGoalDialog categories={categories} onCreateGoal={createGoal} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-48 bg-muted rounded-3xl" />
              <Skeleton className="h-48 bg-muted rounded-3xl" />
            </>
          ) : (
            <>
              <StreakCounter
                currentStreak={streak.current_streak}
                longestStreak={streak.longest_streak}
                freezesAvailable={streak.streak_freezes_available}
                onUseFreeze={useFreeze}
              />
              <DisciplineScore
                score={calculateDisciplineScore()}
                categoryScores={calculateCategoryScores()}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </>
          )}
        </div>

        {/* Goals List */}
        <div>
          <h2 className="heading-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Goals
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 bg-muted rounded-3xl" />
              ))}
            </div>
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  id={goal.id}
                  title={goal.title}
                  description={goal.description || undefined}
                  progress={goal.progress}
                  categoryName={goal.category?.name || 'Uncategorized'}
                  categoryColor={goal.category?.color || 'hsl(200 85% 55%)'}
                  targetDate={goal.target_date || undefined}
                  tasks={goal.tasks}
                  onToggleTask={toggleTask}
                  onDeleteGoal={deleteGoal}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-display text-lg mb-2">
                Ready to start your journey?
              </p>
              <p className="text-muted-foreground text-sm">
                Create your first goal to begin tracking your discipline.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
