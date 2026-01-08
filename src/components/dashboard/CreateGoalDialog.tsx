import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [tasks, setTasks] = useState<string[]>(['']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId) return;

    onCreateGoal({
      title,
      description,
      category_id: categoryId,
      target_date: targetDate || null,
      is_daily: isDaily,
      tasks: tasks.filter(t => t.trim() !== '')
    });

    // Reset form
    setTitle('');
    setDescription('');
    setCategoryId('');
    setTargetDate('');
    setIsDaily(false);
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
        <Button className="bg-primary text-primary-foreground hover:bg-primary/80 matrix-glow">
          <Plus className="w-4 h-4 mr-2" />
          NEW_GOAL
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary max-w-lg">
        <DialogHeader>
          <DialogTitle className="heading-serif text-2xl text-primary">
            CREATE_GOAL
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-primary">TITLE_</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-primary/50 focus:border-primary"
              placeholder="Enter goal title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-primary">DESCRIPTION_</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-primary/50 focus:border-primary resize-none"
              placeholder="Describe your goal..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-primary">CATEGORY_</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="bg-background border-primary/50">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span style={{ color: cat.color }}>{cat.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date" className="text-primary">TARGET_DATE_</Label>
              <Input
                id="target_date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-background border-primary/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-primary/30">
            <div>
              <Label className="text-primary">DAILY_GOAL</Label>
              <p className="text-xs text-muted-foreground">
                Repeats every day for streak tracking
              </p>
            </div>
            <Switch
              checked={isDaily}
              onCheckedChange={setIsDaily}
            />
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-primary">MILESTONES_</Label>
              <button
                type="button"
                onClick={addTask}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                + ADD
              </button>
            </div>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={task}
                    onChange={(e) => updateTask(index, e.target.value)}
                    className="bg-background border-primary/50 focus:border-primary"
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
          >
            CREATE_GOAL
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
