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
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return null;
  };

  const getRankBg = () => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400/10 to-transparent border-yellow-400/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300/10 to-transparent border-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400/10 to-transparent border-orange-400/50';
    if (isCurrentUser) return 'bg-primary/10 border-primary/50';
    return 'border-primary/20';
  };

  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-primary" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div 
      className={cn(
        "glass-card p-4 border-l-4 transition-all duration-300 hover:scale-[1.01]",
        getRankBg(),
        isCurrentUser && "animate-border-pulse"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-12 h-12 flex items-center justify-center">
          {getRankIcon() || (
            <span className={cn(
              "text-2xl font-mono font-bold",
              rank <= 10 ? "text-primary" : "text-muted-foreground"
            )}>
              {rank}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div 
          className="w-12 h-12 border border-primary/50 flex items-center justify-center bg-card"
          style={{
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
            backgroundSize: 'cover'
          }}
        >
          {!avatarUrl && (
            <span className="text-lg font-mono text-primary">
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-mono",
              isCurrentUser ? "text-primary matrix-glow" : "text-card-foreground"
            )}>
              {isCurrentUser ? '> ' : ''}{username}
            </span>
            {isCurrentUser && (
              <span className="text-xs text-primary border border-primary/50 px-2 py-0.5">
                YOU
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              {streakDays} day streak
            </span>
            <span className="flex items-center gap-1">
              {getTrendIcon()}
              {change > 0 ? '+' : ''}{change}
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className={cn(
            "text-2xl font-mono font-bold",
            rank <= 3 ? "text-primary matrix-glow" : "text-card-foreground"
          )}>
            {score.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">pts</div>
        </div>
      </div>
    </div>
  );
}
