import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StreakCounter from '@/components/dashboard/StreakCounter';
import DisciplineScore from '@/components/dashboard/DisciplineScore';
import GoalCard from '@/components/dashboard/GoalCard';
import CreateGoalDialog from '@/components/dashboard/CreateGoalDialog';
import { useGoals } from '@/hooks/useGoals';
import { useStreak } from '@/hooks/useStreak';
import { Skeleton } from '@/components/ui/skeleton';

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
            <h1 className="heading-serif text-3xl text-primary matrix-glow">
              GOAL_PLANNER
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              // Track your objectives and build discipline
            </p>
          </div>
          <CreateGoalDialog categories={categories} onCreateGoal={createGoal} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-48 bg-muted" />
              <Skeleton className="h-48 bg-muted" />
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
          <h2 className="heading-serif text-xl text-primary mb-4">ACTIVE_GOALS</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 bg-muted" />
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
                  categoryColor={goal.category?.color || '#00ff00'}
                  targetDate={goal.target_date || undefined}
                  tasks={goal.tasks}
                  onToggleTask={toggleTask}
                  onDeleteGoal={deleteGoal}
                />
              ))}
            </div>
          ) : (
            <div className="border border-primary/30 p-8 text-center">
              <p className="text-muted-foreground">
                // NO_GOALS_FOUND
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Create your first goal to begin tracking your discipline.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
