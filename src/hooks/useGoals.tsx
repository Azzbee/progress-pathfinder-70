import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  color: string;
  is_preset: boolean;
}

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  goal_id: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  target_date: string | null;
  is_daily: boolean;
  category_id: string | null;
  category: Category | null;
  tasks: Task[];
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('goal_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  };

  const fetchGoals = async () => {
    if (!user) return;

    const { data: goalsData, error: goalsError } = await supabase
      .from('goals')
      .select(`
        *,
        category:goal_categories(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return;
    }

    // Fetch tasks for all goals
    const goalIds = goalsData?.map(g => g.id) || [];
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('goal_id', goalIds);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    const goalsWithTasks = goalsData?.map(goal => ({
      ...goal,
      tasks: tasksData?.filter(t => t.goal_id === goal.id) || []
    })) || [];

    setGoals(goalsWithTasks);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchGoals();
  }, [user]);

  const createGoal = async (goalData: {
    title: string;
    description: string;
    category_id: string;
    target_date: string | null;
    is_daily: boolean;
    tasks: string[];
  }) => {
    if (!user) return;

    const { data: newGoal, error: goalError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: goalData.title,
        description: goalData.description || null,
        category_id: goalData.category_id,
        target_date: goalData.target_date,
        is_daily: goalData.is_daily,
        progress: 0
      })
      .select()
      .single();

    if (goalError) {
      toast({
        title: 'ERROR',
        description: 'Failed to create goal',
        variant: 'destructive'
      });
      return;
    }

    // Create tasks
    if (goalData.tasks.length > 0) {
      const tasksToInsert = goalData.tasks.map(title => ({
        goal_id: newGoal.id,
        user_id: user.id,
        title,
        is_completed: false
      }));

      await supabase.from('tasks').insert(tasksToInsert);
    }

    toast({
      title: 'GOAL_CREATED',
      description: `"${goalData.title}" has been added.`
    });

    fetchGoals();
  };

  const toggleTask = async (taskId: string) => {
    const task = goals.flatMap(g => g.tasks).find(t => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from('tasks')
      .update({
        is_completed: !task.is_completed,
        completed_at: !task.is_completed ? new Date().toISOString() : null
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error toggling task:', error);
      return;
    }

    // Update goal progress
    const goal = goals.find(g => g.tasks.some(t => t.id === taskId));
    if (goal) {
      const updatedTasks = goal.tasks.map(t =>
        t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
      );
      const completedCount = updatedTasks.filter(t => t.is_completed).length;
      const newProgress = updatedTasks.length > 0 
        ? Math.round((completedCount / updatedTasks.length) * 100)
        : 0;

      await supabase
        .from('goals')
        .update({ progress: newProgress })
        .eq('id', goal.id);
    }

    fetchGoals();
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      toast({
        title: 'ERROR',
        description: 'Failed to delete goal',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'GOAL_DELETED',
      description: 'Goal has been removed.'
    });

    fetchGoals();
  };

  return {
    goals,
    categories,
    loading,
    createGoal,
    toggleTask,
    deleteGoal,
    refetch: fetchGoals
  };
}
