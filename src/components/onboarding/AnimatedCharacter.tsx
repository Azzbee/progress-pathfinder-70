import { cn } from '@/lib/utils';

interface AnimatedCharacterProps {
  variant: 'welcome' | 'thinking' | 'celebrating' | 'pointing' | 'climbing';
  className?: string;
}

export default function AnimatedCharacter({ variant, className }: AnimatedCharacterProps) {
  return (
    <div className={cn("relative", className)}>
      {variant === 'welcome' && (
        <div className="relative w-32 h-32">
          {/* Body */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-primary to-primary/80 rounded-t-3xl animate-[bounce_2s_ease-in-out_infinite]">
            {/* Face */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-200 rounded-full">
              {/* Eyes */}
              <div className="absolute top-3 left-2 w-2 h-2 bg-foreground rounded-full animate-[blink_3s_ease-in-out_infinite]" />
              <div className="absolute top-3 right-2 w-2 h-2 bg-foreground rounded-full animate-[blink_3s_ease-in-out_infinite]" />
              {/* Smile */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-foreground rounded-full" />
            </div>
            {/* Waving hand */}
            <div className="absolute -right-4 top-8 w-4 h-8 bg-amber-200 rounded-full origin-bottom animate-[wave_1s_ease-in-out_infinite]" />
          </div>
          {/* Sparkles */}
          <div className="absolute top-2 left-4 w-2 h-2 bg-accent rounded-full animate-[twinkle_1.5s_ease-in-out_infinite]" />
          <div className="absolute top-6 right-4 w-1.5 h-1.5 bg-primary rounded-full animate-[twinkle_1.5s_ease-in-out_infinite_0.3s]" />
          <div className="absolute top-0 right-8 w-1 h-1 bg-accent rounded-full animate-[twinkle_1.5s_ease-in-out_infinite_0.6s]" />
        </div>
      )}

      {variant === 'thinking' && (
        <div className="relative w-32 h-32">
          {/* Body */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-primary to-primary/80 rounded-t-3xl">
            {/* Face */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-200 rounded-full">
              {/* Thinking eyes */}
              <div className="absolute top-3 left-2 w-2 h-2 bg-foreground rounded-full" />
              <div className="absolute top-3 right-2 w-2 h-0.5 bg-foreground" />
              {/* Hmm mouth */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 border-2 border-foreground rounded-full" />
            </div>
            {/* Chin-touching hand */}
            <div className="absolute -right-2 top-12 w-3 h-6 bg-amber-200 rounded-full animate-[think_2s_ease-in-out_infinite]" />
          </div>
          {/* Thought bubbles */}
          <div className="absolute -top-2 right-0 flex flex-col gap-1 animate-[float_2s_ease-in-out_infinite]">
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full ml-4" />
            <div className="w-3 h-3 bg-muted-foreground/40 rounded-full ml-2" />
            <div className="w-6 h-6 bg-muted-foreground/50 rounded-full flex items-center justify-center">
              <span className="text-xs">💡</span>
            </div>
          </div>
        </div>
      )}

      {variant === 'celebrating' && (
        <div className="relative w-32 h-32">
          {/* Confetti particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-sm animate-[confetti_1.5s_ease-out_infinite]"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${Math.random() * 30}%`,
                backgroundColor: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', '#fbbf24'][i % 4],
                animationDelay: `${i * 0.1}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
          {/* Body jumping */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-primary to-primary/80 rounded-t-3xl animate-[jump_0.5s_ease-in-out_infinite]">
            {/* Face */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-200 rounded-full">
              {/* Happy eyes */}
              <div className="absolute top-3 left-2 w-3 h-1.5 bg-foreground rounded-full" style={{ borderRadius: '50% 50% 0 0' }} />
              <div className="absolute top-3 right-2 w-3 h-1.5 bg-foreground rounded-full" style={{ borderRadius: '50% 50% 0 0' }} />
              {/* Big smile */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-3 border-2 border-foreground border-t-0 rounded-b-full" />
            </div>
            {/* Raised hands */}
            <div className="absolute -left-4 top-2 w-4 h-8 bg-amber-200 rounded-full animate-[cheer-left_0.3s_ease-in-out_infinite]" />
            <div className="absolute -right-4 top-2 w-4 h-8 bg-amber-200 rounded-full animate-[cheer-right_0.3s_ease-in-out_infinite_0.15s]" />
          </div>
          {/* Stars */}
          <div className="absolute top-4 left-4 text-2xl animate-[twinkle_0.5s_ease-in-out_infinite]">⭐</div>
          <div className="absolute top-2 right-4 text-xl animate-[twinkle_0.5s_ease-in-out_infinite_0.2s]">✨</div>
        </div>
      )}

      {variant === 'pointing' && (
        <div className="relative w-32 h-32">
          {/* Body */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-primary to-primary/80 rounded-t-3xl">
            {/* Face */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-200 rounded-full">
              {/* Eyes looking right */}
              <div className="absolute top-3 left-3 w-2 h-2 bg-foreground rounded-full" />
              <div className="absolute top-3 right-1 w-2 h-2 bg-foreground rounded-full" />
              {/* Slight smile */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-1.5 border-b-2 border-foreground rounded-full" />
            </div>
            {/* Pointing hand */}
            <div className="absolute -right-6 top-6 animate-[point_1s_ease-in-out_infinite]">
              <div className="w-8 h-4 bg-amber-200 rounded-full" />
              <div className="absolute right-0 top-0.5 w-3 h-3 bg-amber-200 rounded-full" />
            </div>
          </div>
          {/* Arrow indicator */}
          <div className="absolute top-8 right-0 animate-[bounce-right_1s_ease-in-out_infinite]">
            <span className="text-2xl text-primary">👉</span>
          </div>
        </div>
      )}

      {variant === 'climbing' && (
        <div className="relative w-32 h-40">
          {/* Mountain */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted to-muted/50 clip-triangle" />
          {/* Flag at top */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 animate-[wave-flag_1s_ease-in-out_infinite]">
            <div className="w-0.5 h-8 bg-muted-foreground" />
            <div className="absolute top-0 left-0.5 w-6 h-4 bg-accent rounded-r" />
          </div>
          {/* Climbing character */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-[climb_1s_ease-in-out_infinite]">
            <div className="w-10 h-14 bg-gradient-to-b from-primary to-primary/80 rounded-t-2xl">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-200 rounded-full">
                <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-foreground rounded-full" />
                <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-foreground rounded-full" />
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1 border-b-2 border-foreground rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}