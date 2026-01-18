import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import GoalCard from '@/components/dashboard/GoalCard';
import CreateGoalDialog from '@/components/dashboard/CreateGoalDialog';
import CategoryHealthBars from '@/components/dashboard/CategoryHealthBars';
import { useGoals } from '@/hooks/useGoals';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Sparkles, MessageCircle } from 'lucide-react';
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-display text-3xl text-primary">
              Goal Planner
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track your objectives across all areas of life
            </p>
          </div>
          <CreateGoalDialog categories={categories} onCreateGoal={createGoal} />
        </div>

        {/* Goals List */}
        <div>
          <h2 className="heading-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Goals
          </h2>
          
          {goalsLoading ? (
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
                Create your first goal to begin tracking your progress.
              </p>
            </div>
          )}
        </div>

        {/* Category Health Bars */}
        <CategoryHealthBars categories={getCategoryData()} />

        {/* AI Coach Link */}
        <button
          onClick={() => navigate('/ai-coach')}
          className="w-full glass-card p-4 rounded-2xl flex items-center gap-3 hover:border-primary/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-foreground font-medium">Need help with goals?</p>
            <p className="text-xs text-muted-foreground">Talk to AI Coach for personalized guidance</p>
          </div>
        </button>
      </div>
    </AppLayout>
  );
}
