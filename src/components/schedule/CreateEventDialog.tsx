import { useState } from 'react';
import { Plus, Calendar, Clock, Tag, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CreateEventDialogProps {
  categories: Category[];
  selectedDate?: Date;
  onCreateEvent: (event: {
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    category_id: string;
    is_recurring: boolean;
  }) => void;
}

export default function CreateEventDialog({ 
  categories, 
  selectedDate,
  onCreateEvent 
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(
    selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [categoryId, setCategoryId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !categoryId) return;

    onCreateEvent({
      title,
      description,
      date,
      start_time: startTime,
      end_time: endTime,
      category_id: categoryId,
      is_recurring: isRecurring
    });

    // Reset form
    setTitle('');
    setDescription('');
    setStartTime('09:00');
    setEndTime('10:00');
    setCategoryId('');
    setIsRecurring(false);
    setOpen(false);
  };

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="matrix-btn">
          <Plus className="w-4 h-4 mr-2" />
          NEW_EVENT
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="heading-serif text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            CREATE_EVENT
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2 font-mono">
              EVENT_TITLE:
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title..."
              className="terminal-input"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2 font-mono">
              DESCRIPTION:
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="terminal-input min-h-[60px]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2 font-mono">
              DATE:
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="terminal-input"
              required
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-2 font-mono">
                START_TIME:
              </label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="terminal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-primary/30 max-h-48">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-2 font-mono">
                END_TIME:
              </label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="terminal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-primary/30 max-h-48">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2 font-mono">
              CATEGORY:
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="terminal-input">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="glass-card border-primary/30">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 border"
                        style={{ backgroundColor: cat.color, borderColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurring */}
          <div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={cn(
                "w-full p-3 border flex items-center justify-center gap-2 transition-all",
                isRecurring 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-primary/30 text-muted-foreground hover:border-primary/50"
              )}
            >
              <Repeat className="w-4 h-4" />
              <span className="text-sm font-mono">
                {isRecurring ? 'RECURRING_DAILY' : 'ONE_TIME_EVENT'}
              </span>
            </button>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full matrix-btn"
            disabled={!title || !categoryId}
          >
            CREATE_EVENT
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
