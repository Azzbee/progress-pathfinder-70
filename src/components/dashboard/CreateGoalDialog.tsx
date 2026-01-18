import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CreateGoalDialogProps {
  categories: Category[];
  onCreateGoal: (goal: {
    title: string;
    description: string;
    category_id: string;
    target_date: string | null;
    is_daily: boolean;
    tasks: string[];
  }) => void;
}

export default function CreateGoalDialog({ categories, onCreateGoal }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [howTo, setHowTo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [tasks, setTasks] = useState<string[]>(['']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId) return;

    onCreateGoal({
      title,
      description: howTo, // "How To" is stored as description
      category_id: categoryId,
      target_date: targetDate || null,
      is_daily: false, // Removed daily goal toggle
      tasks: tasks.filter(t => t.trim() !== '')
    });

    // Reset form
    setTitle('');
    setHowTo('');
    setCategoryId('');
    setTargetDate('');
    setTasks(['']);
    setOpen(false);
  };

  const addTask = () => {
    setTasks([...tasks, '']);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/80">
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="heading-display text-2xl text-primary">
            Create Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-border focus:border-primary"
              placeholder="Enter goal title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="howTo" className="text-foreground">How To</Label>
            <Textarea
              id="howTo"
              value={howTo}
              onChange={(e) => setHowTo(e.target.value)}
              className="bg-background border-border focus:border-primary resize-none"
              placeholder="Action steps to achieve this goal..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Describe the steps you'll take to achieve this goal
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date" className="text-foreground">Target Date</Label>
              <Input
                id="target_date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-background border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Milestones</Label>
              <button
                type="button"
                onClick={addTask}
                className="text-xs text-primary hover:text-primary/80"
              >
                + Add Milestone
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Break down your goal into smaller, trackable steps
            </p>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={task}
                    onChange={(e) => updateTask(index, e.target.value)}
                    className="bg-background border-border focus:border-primary"
                    placeholder={`Milestone ${index + 1}...`}
                  />
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
            disabled={!title || !categoryId}
          >
            Create Goal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
