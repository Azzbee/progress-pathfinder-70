import { useState, useEffect } from 'react';
import { Edit, Calendar, Clock, Repeat } from 'lucide-react';
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
import { ScheduleEvent } from '@/hooks/useEvents';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface EditEventDialogProps {
  event: ScheduleEvent;
  categories: Category[];
  onUpdateEvent: (eventId: string, updates: {
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    category_id: string;
    recurrence_type: 'one_time' | 'daily' | 'weekly';
  }) => void;
  trigger?: React.ReactNode;
}

export default function EditEventDialog({ 
  event,
  categories, 
  onUpdateEvent,
  trigger
}: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [date, setDate] = useState(event.event_date);
  const [startTime, setStartTime] = useState(event.start_time);
  const [endTime, setEndTime] = useState(event.end_time);
  const [categoryId, setCategoryId] = useState(event.category_id || '');
  const [recurrenceType, setRecurrenceType] = useState<'one_time' | 'daily' | 'weekly'>(event.recurrence_type);

  // Reset form when event changes
  useEffect(() => {
    setTitle(event.title);
    setDescription(event.description || '');
    setDate(event.event_date);
    setStartTime(event.start_time);
    setEndTime(event.end_time);
    setCategoryId(event.category_id || '');
    setRecurrenceType(event.recurrence_type);
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !categoryId) return;

    onUpdateEvent(event.id, {
      title,
      description,
      event_date: date,
      start_time: startTime,
      end_time: endTime,
      category_id: categoryId,
      recurrence_type: recurrenceType
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="heading-display text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Event
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Title */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Event Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title..."
              className="bg-background border-border focus:border-primary"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="bg-background border-border focus:border-primary min-h-[60px]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background border-border focus:border-primary"
              required
            />
          </div>

          {/* Time - Manual Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">
                Start Time
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-background border-border focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-2">
                End Time
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-background border-border focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Category
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
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
                        {cat.name}
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

          {/* Recurrence Type */}
          <div>
            <label className="text-xs text-muted-foreground block mb-2">
              Recurrence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'one_time', label: 'One Time' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRecurrenceType(option.value as typeof recurrenceType)}
                  className={cn(
                    "p-2 border rounded-lg flex items-center justify-center gap-1 text-xs transition-all",
                    recurrenceType === option.value 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Repeat className="w-3 h-3" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
            disabled={!title || !categoryId}
          >
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
