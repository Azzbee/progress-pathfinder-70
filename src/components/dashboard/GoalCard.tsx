import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Trash2, Calendar, Target, Sparkles } from 'lucide-react';
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
  const isComplete = progress === 100;
  const completedTasks = tasks.filter(t => t.is_completed).length;

  return (
    <div 
      className={cn(
        "relative border transition-all duration-500 group overflow-hidden",
        isComplete 
          ? "border-primary/60 bg-primary/5" 
          : "border-primary/30 hover:border-primary/50"
      )}
    >
      {/* Completion celebration effect */}
      {isComplete && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          </div>
        </div>
      )}

      {/* Progress bar at top */}
      <div className="h-1 bg-muted/30">
        <div 
          className="h-full transition-all duration-700 ease-out"
          style={{ 
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${categoryColor}, hsl(var(--primary)))`,
            boxShadow: progress > 50 ? `0 0 10px ${categoryColor}` : 'none'
          }}
        />
      </div>

      {/* Header */}
      <div 
        className="p-5 cursor-pointer flex items-center justify-between transition-all duration-300 hover:bg-primary/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span 
              className="px-2.5 py-1 text-xs border transition-all duration-300 hover:scale-105"
              style={{ 
                borderColor: categoryColor, 
                color: categoryColor,
                backgroundColor: `${categoryColor}15`
              }}
            >
              {categoryName}
            </span>
            {targetDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-70">
                <Calendar className="w-3 h-3" />
                {new Date(targetDate).toLocaleDateString()}
              </span>
            )}
            {isComplete && (
              <span className="text-xs text-primary flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3" /> COMPLETE
              </span>
            )}
          </div>
          <h3 className={cn(
            "text-lg transition-colors duration-300",
            isComplete ? "text-primary" : "text-foreground group-hover:text-primary"
          )}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Progress Circle */}
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
                fill="none"
                className="opacity-30"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke={categoryColor}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress / 100)}`}
                className="transition-all duration-700 ease-out"
                style={{
                  filter: progress > 50 ? `drop-shadow(0 0 4px ${categoryColor})` : 'none'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-mono text-primary">{progress}%</span>
            </div>
          </div>

          {/* Expand icon with rotation */}
          <div className={cn(
            "transition-transform duration-300",
            isExpanded && "rotate-180"
          )}>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Expanded content with animation */}
      <div className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out",
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="border-t border-primary/20 p-5">
          {/* Tasks Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h4 className="text-xs text-muted-foreground tracking-wider">MILESTONES</h4>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {completedTasks}/{tasks.length}
            </span>
          </div>

          {/* Tasks list */}
          {tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map((task, index) => (
                <li 
                  key={task.id} 
                  className="flex items-center gap-3 group/task"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className={cn(
                      'w-6 h-6 border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95',
                      task.is_completed
                        ? 'border-primary bg-primary text-primary-foreground rotate-0'
                        : 'border-muted-foreground/50 hover:border-primary group-hover/task:border-primary/70'
                    )}
                  >
                    <Check className={cn(
                      "w-3.5 h-3.5 transition-all duration-300",
                      task.is_completed ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    )} />
                  </button>
                  <span 
                    className={cn(
                      'text-sm transition-all duration-300',
                      task.is_completed 
                        ? 'text-muted-foreground line-through opacity-60' 
                        : 'text-foreground group-hover/task:text-primary'
                    )}
                  >
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm italic">No milestones added</p>
          )}

          {/* Actions */}
          <div className="flex justify-end mt-6 pt-4 border-t border-primary/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGoal(id);
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-all duration-300 hover:scale-105 active:scale-95 px-3 py-1.5 border border-transparent hover:border-destructive/30 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
              DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
