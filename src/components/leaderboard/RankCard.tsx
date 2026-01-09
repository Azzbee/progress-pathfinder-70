import { Trophy, Medal, Award, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankCardProps {
  rank: number;
  username: string;
  score: number;
  streakDays: number;
  change: number;
  isCurrentUser?: boolean;
  avatarUrl?: string;
}

export default function RankCard({ 
  rank, 
  username, 
  score, 
  streakDays, 
  change,
  isCurrentUser = false,
  avatarUrl
}: RankCardProps) {
  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="w-7 h-7 text-amber-400 drop-shadow-lg" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300 drop-shadow" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400 drop-shadow" />;
    return null;
  };

  const getRankBg = () => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-400/15 via-yellow-300/10 to-transparent border-amber-400/40';
    if (rank === 2) return 'bg-gradient-to-r from-slate-300/15 via-gray-200/10 to-transparent border-slate-400/40';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400/15 via-amber-300/10 to-transparent border-orange-400/40';
    if (isCurrentUser) return 'bg-gradient-to-r from-primary/15 via-accent/10 to-transparent border-primary/50';
    return 'border-border/40';
  };

  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-accent" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div 
      className={cn(
        "glass-card p-5 border-l-4 transition-all duration-500 ripple-effect",
        "hover:scale-[1.02] hover:shadow-xl",
        getRankBg(),
        isCurrentUser && "animate-pulse-glow"
      )}
    >
      <div className="flex items-center gap-5">
        {/* Rank */}
        <div className="w-14 h-14 flex items-center justify-center">
          {getRankIcon() || (
            <span className={cn(
              "text-2xl font-bold heading-display",
              rank <= 10 ? "text-primary" : "text-muted-foreground"
            )}>
              {rank}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div 
          className={cn(
            "w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center",
            "bg-gradient-to-br from-secondary to-muted overflow-hidden",
            "shadow-lg shadow-primary/10"
          )}
          style={{
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
            backgroundSize: 'cover'
          }}
        >
          {!avatarUrl && (
            <span className="text-xl font-bold text-primary heading-display">
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold heading-display text-lg truncate",
              isCurrentUser ? "text-primary" : "text-card-foreground"
            )}>
              {username}
            </span>
            {isCurrentUser && (
              <span className="text-xs font-bold text-primary-foreground bg-primary px-2.5 py-1 rounded-full shadow-sm">
                You
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              {streakDays} day streak
            </span>
            <span className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn(
                "font-medium",
                change > 0 && "text-accent",
                change < 0 && "text-destructive"
              )}>
                {change > 0 ? '+' : ''}{change}
              </span>
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className={cn(
            "text-3xl font-bold heading-display",
            rank <= 3 ? "text-primary" : "text-card-foreground"
          )}>
            {score.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground font-medium">points</div>
        </div>
      </div>
    </div>
  );
}