import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RankCard from '@/components/leaderboard/RankCard';
import CommunityPanel from '@/components/leaderboard/CommunityPanel';
import { useAuth } from '@/hooks/useAuth';
import { useGoals } from '@/hooks/useGoals';
import { useStreak } from '@/hooks/useStreak';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Globe, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  streakDays: number;
  change: number;
  avatarUrl?: string;
}

interface Community {
  id: string;
  name: string;
  memberCount: number;
  isPublic: boolean;
  yourRank?: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { goals } = useGoals();
  const { streak } = useStreak();
  const { toast } = useToast();
  
  const [view, setView] = useState<'global' | 'community'>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    fetchLeaderboard();
    fetchCommunities();
  }, [user, filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    // Fetch all users' profiles and their goal progress
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url');

    if (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
      return;
    }

    // Fetch streaks for all users
    const { data: streaks } = await supabase
      .from('streaks')
      .select('user_id, current_streak, longest_streak');

    // Fetch daily completions to calculate scores
    const { data: completions } = await supabase
      .from('daily_completions')
      .select('user_id, discipline_score, date');

    // Calculate scores for each user
    const userScores: LeaderboardEntry[] = (profiles || []).map((profile, index) => {
      const userStreakData = streaks?.find(s => s.user_id === profile.user_id);
      const userCompletions = completions?.filter(c => c.user_id === profile.user_id) || [];
      
      // Calculate average discipline score
      const avgScore = userCompletions.length > 0
        ? userCompletions.reduce((sum, c) => sum + (c.discipline_score || 0), 0) / userCompletions.length
        : 0;

      return {
        rank: 0, // Will be set after sorting
        userId: profile.user_id,
        username: profile.username || `User_${profile.user_id.slice(0, 6)}`,
        score: avgScore,
        streakDays: userStreakData?.current_streak || 0,
        change: Math.floor(Math.random() * 5) - 2, // Simulated change
        avatarUrl: profile.avatar_url || undefined
      };
    });

    // Sort by score and assign ranks
    const sortedLeaderboard = userScores
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    // If current user isn't in leaderboard, add them
    if (user && !sortedLeaderboard.find(e => e.userId === user.id)) {
      const userScore = goals.length > 0
        ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length / 10
        : 0;
      
      sortedLeaderboard.push({
        rank: sortedLeaderboard.length + 1,
        userId: user.id,
        username: user.email?.split('@')[0] || 'You',
        score: userScore,
        streakDays: streak.current_streak,
        change: 0
      });
    }

    setLeaderboard(sortedLeaderboard);
    setLoading(false);
  };

  const fetchCommunities = async () => {
    if (!user) return;

    // Fetch communities user is a member of
    const { data: memberships } = await supabase
      .from('community_members')
      .select('community_id')
      .eq('user_id', user.id);

    if (!memberships || memberships.length === 0) {
      setCommunities([]);
      return;
    }

    const communityIds = memberships.map(m => m.community_id);
    
    const { data: communityData } = await supabase
      .from('communities')
      .select('*')
      .in('id', communityIds);

    // Get member counts
    const communitiesWithCounts: Community[] = await Promise.all(
      (communityData || []).map(async (comm) => {
        const { count } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', comm.id);

        return {
          id: comm.id,
          name: comm.name,
          memberCount: count || 0,
          isPublic: !comm.invite_code,
          yourRank: Math.floor(Math.random() * 10) + 1 // Simulated
        };
      })
    );

    setCommunities(communitiesWithCounts);
  };

  const handleJoinCommunity = async (code: string) => {
    if (!user) return;

    const { data: community, error } = await supabase
      .from('communities')
      .select('*')
      .eq('invite_code', code)
      .single();

    if (error || !community) {
      toast({
        title: 'ERROR',
        description: 'Invalid invite code',
        variant: 'destructive'
      });
      return;
    }

    const { error: joinError } = await supabase
      .from('community_members')
      .insert({
        community_id: community.id,
        user_id: user.id
      });

    if (joinError) {
      toast({
        title: 'ERROR',
        description: 'Failed to join community',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'JOINED',
      description: `You've joined ${community.name}!`
    });

    fetchCommunities();
  };

  const handleCreateCommunity = async (name: string, isPublic: boolean) => {
    if (!user) return;

    const inviteCode = isPublic ? null : Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data: newCommunity, error } = await supabase
      .from('communities')
      .insert({
        name,
        invite_code: inviteCode,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'ERROR',
        description: 'Failed to create community',
        variant: 'destructive'
      });
      return;
    }

    // Add creator as member
    await supabase
      .from('community_members')
      .insert({
        community_id: newCommunity.id,
        user_id: user.id
      });

    toast({
      title: 'CREATED',
      description: `${name} has been created!`
    });

    fetchCommunities();
  };

  const currentUserEntry = leaderboard.find(e => e.userId === user?.id);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="heading-serif text-3xl text-primary matrix-glow mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              LEADERBOARD
            </h1>
            <p className="text-muted-foreground text-sm font-mono">
              // Compete with the community, climb the ranks
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('global')}
              className={cn(
                "px-4 py-2 border flex items-center gap-2 transition-all",
                view === 'global'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-primary/30 text-muted-foreground hover:border-primary/50"
              )}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-mono">GLOBAL</span>
            </button>
            <button
              onClick={() => setView('community')}
              className={cn(
                "px-4 py-2 border flex items-center gap-2 transition-all",
                view === 'community'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-primary/30 text-muted-foreground hover:border-primary/50"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs font-mono">COMMUNITIES</span>
            </button>
          </div>
        </div>

        {view === 'global' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Leaderboard */}
            <div className="lg:col-span-3 space-y-4">
              {/* Filter */}
              <div className="flex items-center gap-2 mb-4 animate-fade-in-up stagger-1">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">FILTER:</span>
                {(['all', 'weekly', 'monthly'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-3 py-1 text-xs font-mono border transition-all",
                      filter === f
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/30 text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-20 bg-muted" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Top 3 */}
                  <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in-up stagger-2">
                    {leaderboard.slice(0, 3).map((entry, index) => (
                      <div 
                        key={entry.userId}
                        className={cn(
                          "glass-card p-6 text-center",
                          index === 0 && "border-yellow-400/50 bg-gradient-to-b from-yellow-400/10 to-transparent order-2 lg:-mt-4",
                          index === 1 && "border-gray-400/50 bg-gradient-to-b from-gray-400/10 to-transparent order-1",
                          index === 2 && "border-orange-400/50 bg-gradient-to-b from-orange-400/10 to-transparent order-3"
                        )}
                      >
                        <div className="text-4xl mb-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div className="font-mono text-card-foreground mb-1">
                          {entry.username}
                        </div>
                        <div className={cn(
                          "text-2xl font-mono font-bold matrix-glow",
                          index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : "text-orange-400"
                        )}>
                          {entry.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          🔥 {entry.streakDays} days
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rest of leaderboard */}
                  <div className="space-y-2">
                    {leaderboard.slice(3).map((entry, index) => (
                      <div key={entry.userId} className={cn("animate-fade-in-up", `stagger-${Math.min(index + 3, 5)}`)}>
                        <RankCard
                          rank={entry.rank}
                          username={entry.username}
                          score={entry.score}
                          streakDays={entry.streakDays}
                          change={entry.change}
                          isCurrentUser={entry.userId === user?.id}
                          avatarUrl={entry.avatarUrl}
                        />
                      </div>
                    ))}
                  </div>

                  {leaderboard.length === 0 && (
                    <div className="glass-card p-12 text-center">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground font-mono">
                        // LEADERBOARD_EMPTY
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Complete goals to appear on the leaderboard.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Your Rank Sidebar */}
            <div className="space-y-6 animate-fade-in-up stagger-3">
              {currentUserEntry && (
                <div className="glass-card p-6 border-primary/50">
                  <h3 className="heading-serif text-sm text-muted-foreground mb-4">YOUR_POSITION</h3>
                  <div className="text-center">
                    <div className="text-5xl font-mono font-bold text-primary matrix-glow mb-2">
                      #{currentUserEntry.rank}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      out of {leaderboard.length} users
                    </div>
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <div className="text-2xl font-mono font-bold text-card-foreground">
                        {currentUserEntry.score.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card p-6">
                <h3 className="heading-serif text-sm text-muted-foreground mb-4">QUICK_STATS</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Total Players</span>
                    <span className="font-mono text-card-foreground">{leaderboard.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Avg Score</span>
                    <span className="font-mono text-card-foreground">
                      {leaderboard.length > 0 
                        ? (leaderboard.reduce((a, b) => a + b.score, 0) / leaderboard.length).toFixed(1)
                        : '0.0'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Top Score</span>
                    <span className="font-mono text-primary">
                      {leaderboard.length > 0 ? leaderboard[0].score.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <CommunityPanel
              communities={communities}
              onJoinCommunity={handleJoinCommunity}
              onCreateCommunity={handleCreateCommunity}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
