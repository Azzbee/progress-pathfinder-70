import { useState, useEffect } from 'react';
import { Swords, Trophy, Clock, Check, X, Zap, TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  challenger_username: string;
  challenged_username: string;
  challenger_avatar?: string;
  challenged_avatar?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  start_date?: string;
  end_date?: string;
  challenger_score: number;
  challenged_score: number;
  winner_id?: string;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
}

interface RivalChallengePanelProps {
  leaderboard: LeaderboardEntry[];
  onChallengeUpdate?: () => void;
}

export default function RivalChallengePanel({ leaderboard, onChallengeUpdate }: RivalChallengePanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingChallenge, setSendingChallenge] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching challenges:', error);
    } else if (data) {
      // Enrich with usernames
      const enrichedChallenges = await Promise.all(
        data.map(async (challenge) => {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, avatar_url')
            .in('user_id', [challenge.challenger_id, challenge.challenged_id]);

          const challenger = profiles?.find(p => p.user_id === challenge.challenger_id);
          const challenged = profiles?.find(p => p.user_id === challenge.challenged_id);

          return {
            ...challenge,
            challenger_username: challenger?.username || 'Unknown',
            challenged_username: challenged?.username || 'Unknown',
            challenger_avatar: challenger?.avatar_url,
            challenged_avatar: challenged?.avatar_url
          };
        })
      );
      setChallenges(enrichedChallenges as Challenge[]);
    }
    setLoading(false);
  };

  const sendChallenge = async (opponentId: string) => {
    if (!user) return;

    setSendingChallenge(opponentId);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7-day challenge

    const { error } = await supabase
      .from('challenges')
      .insert({
        challenger_id: user.id,
        challenged_id: opponentId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send challenge',
        variant: 'destructive'
      });
    } else {
      toast({
        title: '⚔️ Challenge Sent!',
        description: 'Waiting for your rival to accept...'
      });
      fetchChallenges();
      setIsDialogOpen(false);
      onChallengeUpdate?.();
    }

    setSendingChallenge(null);
  };

  const respondToChallenge = async (challengeId: string, accept: boolean) => {
    const { error } = await supabase
      .from('challenges')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', challengeId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to respond to challenge',
        variant: 'destructive'
      });
    } else {
      toast({
        title: accept ? '⚔️ Challenge Accepted!' : 'Challenge Declined',
        description: accept ? 'The battle begins now!' : 'Maybe next time.'
      });
      fetchChallenges();
      onChallengeUpdate?.();
    }
  };

  const pendingChallenges = challenges.filter(c => c.status === 'pending' && c.challenged_id === user?.id);
  const activeChallenges = challenges.filter(c => c.status === 'accepted');
  const completedChallenges = challenges.filter(c => c.status === 'completed').slice(0, 3);
  
  // Filter available opponents (not already in a challenge)
  const challengedUserIds = challenges
    .filter(c => c.status === 'pending' || c.status === 'accepted')
    .flatMap(c => [c.challenger_id, c.challenged_id]);
  
  const availableOpponents = leaderboard.filter(
    entry => entry.userId !== user?.id && !challengedUserIds.includes(entry.userId)
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="glass-card rounded-2xl p-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center animate-pulse">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Rival Challenges</h3>
              <p className="text-xs text-muted-foreground">
                {activeChallenges.length} active battle{activeChallenges.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Swords className="w-4 h-4 mr-2" />
                Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-orange-500" />
                  Challenge a Rival
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Challenge someone to a 7-day discipline battle!
                </p>
                {availableOpponents.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No available rivals at the moment.</p>
                  </div>
                ) : (
                  availableOpponents.map((opponent) => (
                    <div 
                      key={opponent.userId}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-orange-500/50 transition-all"
                    >
                      <div 
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden"
                        style={{
                          backgroundImage: opponent.avatarUrl ? `url(${opponent.avatarUrl})` : 'none',
                          backgroundSize: 'cover'
                        }}
                      >
                        {!opponent.avatarUrl && (
                          <span className="font-bold text-primary">
                            {opponent.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{opponent.username}</div>
                        <div className="text-xs text-muted-foreground">{opponent.score.toFixed(1)} pts</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => sendChallenge(opponent.userId)}
                        disabled={sendingChallenge === opponent.userId}
                        className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                      >
                        {sendingChallenge === opponent.userId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Swords className="w-4 h-4 mr-1" />
                            Fight
                          </>
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pending Challenges (incoming) */}
      {pendingChallenges.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            Incoming Challenges
          </h4>
          {pendingChallenges.map((challenge) => (
            <div 
              key={challenge.id}
              className="glass-card rounded-xl p-4 border-2 border-yellow-500/30 animate-pulse-slow"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden ring-2 ring-yellow-500/50"
                  style={{
                    backgroundImage: challenge.challenger_avatar ? `url(${challenge.challenger_avatar})` : 'none',
                    backgroundSize: 'cover'
                  }}
                >
                  {!challenge.challenger_avatar && (
                    <span className="font-bold text-primary text-lg">
                      {challenge.challenger_username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {challenge.challenger_username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    wants to challenge you!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => respondToChallenge(challenge.id, true)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => respondToChallenge(challenge.id, false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Active Battles
          </h4>
          {activeChallenges.map((challenge) => {
            const isChallenger = challenge.challenger_id === user?.id;
            const myScore = isChallenger ? challenge.challenger_score : challenge.challenged_score;
            const theirScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
            const opponentName = isChallenger ? challenge.challenged_username : challenge.challenger_username;
            const opponentAvatar = isChallenger ? challenge.challenged_avatar : challenge.challenger_avatar;
            const winning = myScore > theirScore;
            const tied = myScore === theirScore;

            return (
              <div 
                key={challenge.id}
                className={cn(
                  "glass-card rounded-xl p-4 relative overflow-hidden transition-all",
                  winning && "border-accent/50",
                  !winning && !tied && "border-destructive/50"
                )}
              >
                {/* Background gradient based on status */}
                <div className={cn(
                  "absolute inset-0 opacity-10",
                  winning && "bg-gradient-to-r from-accent to-transparent",
                  !winning && !tied && "bg-gradient-to-r from-destructive to-transparent"
                )} />
                
                <div className="relative flex items-center gap-4">
                  {/* Your score */}
                  <div className="text-center">
                    <div className={cn(
                      "text-2xl font-bold",
                      winning ? "text-accent" : "text-foreground"
                    )}>
                      {myScore.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">You</div>
                  </div>

                  {/* VS */}
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <div className={cn(
                      "text-sm font-bold px-3 py-1 rounded-full",
                      winning && "bg-accent/20 text-accent",
                      !winning && !tied && "bg-destructive/20 text-destructive",
                      tied && "bg-muted text-muted-foreground"
                    )}>
                      {winning ? <TrendingUp className="w-4 h-4 inline mr-1" /> : !tied ? <TrendingDown className="w-4 h-4 inline mr-1" /> : null}
                      VS
                    </div>
                  </div>

                  {/* Opponent */}
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className={cn(
                        "text-2xl font-bold",
                        !winning && !tied ? "text-destructive" : "text-foreground"
                      )}>
                        {theirScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[80px]">
                        {opponentName}
                      </div>
                    </div>
                    <div 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundImage: opponentAvatar ? `url(${opponentAvatar})` : 'none',
                        backgroundSize: 'cover'
                      }}
                    >
                      {!opponentAvatar && (
                        <span className="font-bold text-primary">
                          {opponentName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Days remaining */}
                {challenge.end_date && (
                  <div className="mt-3 pt-3 border-t border-border/50 text-center">
                    <span className="text-xs text-muted-foreground">
                      {Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Recent Results
          </h4>
          {completedChallenges.map((challenge) => {
            const won = challenge.winner_id === user?.id;
            const opponentName = challenge.challenger_id === user?.id 
              ? challenge.challenged_username 
              : challenge.challenger_username;

            return (
              <div 
                key={challenge.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl",
                  won ? "bg-accent/10" : "bg-muted/30"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  won ? "bg-accent/20" : "bg-muted"
                )}>
                  {won ? '🏆' : '😔'}
                </div>
                <div className="flex-1">
                  <span className={cn(
                    "text-sm font-medium",
                    won ? "text-accent" : "text-muted-foreground"
                  )}>
                    {won ? 'Victory' : 'Defeat'} vs {opponentName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && challenges.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            <Swords className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            No active challenges yet.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Challenge someone from the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
}