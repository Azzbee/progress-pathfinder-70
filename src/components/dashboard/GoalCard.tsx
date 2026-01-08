import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
}

interface GoalCardProps {
  id: string;
  title: string;
  description?: string;
  progress: number;
  categoryName: string;
  categoryColor: string;
  targetDate?: string;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteGoal: (goalId: string) => void;
}

export default function GoalCard({
  id,
  title,
  description,
  progress,
  categoryName,
  categoryColor,
  targetDate,
  tasks,
  onToggleTask,
  onDeleteGoal
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-primary/30 card-hover">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span 
              className="px-2 py-0.5 text-xs border"
              style={{ 
                borderColor: categoryColor, 
                color: categoryColor 
              }}
            >
              {categoryName}
            </span>
            {targetDate && (
              <span className="text-xs text-muted-foreground">
                DUE: {new Date(targetDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="text-lg text-primary">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="w-32">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">PROGRESS</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 progress-glow" />
          </div>

          {/* Expand icon */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-primary/20 p-4">
          {/* Tasks */}
          <div className="mb-4">
            <h4 className="text-xs text-muted-foreground mb-3">MILESTONES_</h4>
            {tasks.length > 0 ? (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className={cn(
                        'w-5 h-5 border flex items-center justify-center transition-all',
                        task.is_completed
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground hover:border-primary'
                      )}
                    >
                      {task.is_completed && <Check className="w-3 h-3" />}
                    </button>
                    <span 
                      className={cn(
                        'text-sm',
                        task.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'
                      )}
                    >
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No milestones added</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGoal(id);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              DELETE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
