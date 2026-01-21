import { useState } from 'react';
import { Target, Plus, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useGoals } from '@/hooks/useGoals';
import { useToast } from '@/hooks/use-toast';

interface GoalCreationGuideProps {
  onComplete: () => void;
  onSkip: () => void;
}

const suggestedGoals = [
  { title: 'Exercise 3x per week', category: 'physical', emoji: '🏋️' },
  { title: 'Read 20 pages daily', category: 'mental', emoji: '📚' },
  { title: 'Save $500 this month', category: 'financial', emoji: '💰' },
  { title: 'Learn a new skill', category: 'academic', emoji: '🎯' },
  { title: 'Connect with a friend weekly', category: 'social', emoji: '👥' },
];

export default function GoalCreationGuide({ onComplete, onSkip }: GoalCreationGuideProps) {
  const { createGoal } = useGoals();
  const { toast } = useToast();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleGoal = (title: string) => {
    setSelectedGoals(prev => 
      prev.includes(title) 
        ? prev.filter(g => g !== title)
        : [...prev, title]
    );
  };

  const handleCreateGoals = async () => {
    const goalsToCreate = [...selectedGoals];
    if (customGoal.trim()) {
      goalsToCreate.push(customGoal.trim());
    }

    if (goalsToCreate.length === 0) {
      toast({
        title: 'Select at least one goal',
        description: 'Pick a suggested goal or write your own to get started.',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);

    try {
      for (const goalTitle of goalsToCreate) {
        const suggested = suggestedGoals.find(g => g.title === goalTitle);
        await createGoal({
          title: goalTitle,
          description: suggested ? `Category: ${suggested.category}` : '',
          is_daily: true
        });
      }

      setShowSuccess(true);
      toast({
        title: '🎉 Goals created!',
        description: `You've set ${goalsToCreate.length} goal${goalsToCreate.length > 1 ? 's' : ''} to track.`
      });

      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error creating goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to create goals. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center py-8 animate-fade-in-up">
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Celebration animation */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-[confetti_1s_ease-out_forwards]"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: ['hsl(var(--primary))', 'hsl(var(--accent))', '#fbbf24', '#f472b6'][i % 4],
                animationDelay: `${i * 0.05}s`,
                transform: `rotate(${i * 30}deg)`
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
              <Check className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>
        <h3 className="heading-display text-xl text-foreground mb-2">
          You're all set! 🚀
        </h3>
        <p className="text-muted-foreground text-sm">
          Your goals are ready. Let's start building discipline!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Target className="w-7 h-7 text-primary" />
        </div>
        <h3 className="heading-display text-xl text-foreground mb-2">
          Set Your First Goal
        </h3>
        <p className="text-sm text-muted-foreground">
          Pick from suggestions or create your own
        </p>
      </div>

      {/* Suggested Goals */}
      <div className="space-y-2">
        {suggestedGoals.map((goal, i) => (
          <button
            key={goal.title}
            onClick={() => toggleGoal(goal.title)}
            className={cn(
              "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left",
              "animate-fade-in-up",
              selectedGoals.includes(goal.title)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-card/50"
            )}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="text-2xl">{goal.emoji}</span>
            <span className={cn(
              "flex-1 font-medium",
              selectedGoals.includes(goal.title) ? "text-primary" : "text-foreground"
            )}>
              {goal.title}
            </span>
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
              selectedGoals.includes(goal.title)
                ? "border-primary bg-primary"
                : "border-muted-foreground/30"
            )}>
              {selectedGoals.includes(goal.title) && (
                <Check className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Goal Input */}
      <div className="relative">
        <Input
          placeholder="Or type your own goal..."
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          className="pr-10 h-12 rounded-xl bg-card/50"
        />
        <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      </div>

      {/* Selected count */}
      {(selectedGoals.length > 0 || customGoal) && (
        <div className="flex items-center justify-center gap-2 text-sm text-primary animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>
            {selectedGoals.length + (customGoal ? 1 : 0)} goal{selectedGoals.length + (customGoal ? 1 : 0) !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          onClick={handleCreateGoals}
          disabled={isCreating || (selectedGoals.length === 0 && !customGoal)}
          className="w-full"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              Create Goals
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
        <Button variant="ghost" onClick={onSkip} className="w-full text-muted-foreground">
          I'll do this later
        </Button>
      </div>
    </div>
  );
}