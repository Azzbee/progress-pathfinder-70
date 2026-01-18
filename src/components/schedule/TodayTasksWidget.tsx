import { useState } from 'react';
import { Check, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import SplashAnimation from '@/components/animations/SplashAnimation';

interface TodayTask {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  categoryColor: string;
  isCompleted: boolean;
}

interface TodayTasksWidgetProps {
  tasks: TodayTask[];
  onToggleTask: (taskId: string) => void;
}

export default function TodayTasksWidget({ tasks = [], onToggleTask }: TodayTasksWidgetProps) {
  const [splashTaskId, setSplashTaskId] = useState<string | null>(null);
  const { playDroplet, playSuccess } = useSoundEffects();
  const { mediumTap, successPattern } = useHapticFeedback();

  const handleToggle = (taskId: string, wasCompleted: boolean) => {
    if (!wasCompleted) {
      setSplashTaskId(taskId);
      playDroplet();
      mediumTap(); // Haptic feedback for task completion
      
      const completedCount = tasks.filter(t => t.isCompleted).length + 1;
      if (completedCount === tasks.length) {
        setTimeout(() => {
          playSuccess();
          successPattern(); // Haptic pattern for all tasks complete
        }, 300);
      }
    }
    onToggleTask(taskId);
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (tasks.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="heading-display text-lg text-foreground">Today's Schedule</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-6">
          No events scheduled for today. Enjoy your free time!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="heading-display text-lg text-foreground">Today's Schedule</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{completedCount}/{tasks.length}</span>
          <div className="w-20 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={cn(
              'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 relative',
              task.isCompleted 
                ? 'bg-primary/5 border-primary/20 opacity-70' 
                : 'bg-card border-border/50 hover:border-primary/30'
            )}
          >
            {splashTaskId === task.id && (
              <SplashAnimation 
                isActive={true}
                color={task.categoryColor}
                size="small"
                onComplete={() => setSplashTaskId(null)}
              />
            )}

            <button
              onClick={() => handleToggle(task.id, task.isCompleted)}
              className={cn(
                'w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110',
                task.isCompleted
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/50 hover:border-primary'
              )}
            >
              <Check className={cn(
                'w-3.5 h-3.5 transition-all duration-300',
                task.isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              )} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.categoryColor }}
                />
                <span className={cn(
                  'text-sm font-medium truncate',
                  task.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                )}>
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{task.startTime} - {task.endTime}</span>
              </div>
            </div>

            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: `${task.categoryColor}15`,
                color: task.categoryColor
              }}
            >
              {task.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
