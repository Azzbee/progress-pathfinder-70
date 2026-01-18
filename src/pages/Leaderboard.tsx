import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RankCard from '@/components/leaderboard/RankCard';
import CommunityPanel from '@/components/leaderboard/CommunityPanel';
import { useAuth } from '@/hooks/useAuth';
import { useGoals } from '@/hooks/useGoals';
import { useStreak } from '@/hooks/useStreak';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Globe, Filter, Medal, Award } from 'lucide-react';
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
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url');

    if (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
      return;
    }

    const { data: streaks } = await supabase
      .from('streaks')
      .select('user_id, current_streak, longest_streak');

    const { data: completions } = await supabase
      .from('daily_completions')
      .select('user_id, discipline_score, date');

    const userScores: LeaderboardEntry[] = (profiles || []).map((profile) => {
      const userStreakData = streaks?.find(s => s.user_id === profile.user_id);
      const userCompletions = completions?.filter(c => c.user_id === profile.user_id) || [];
      
      const avgScore = userCompletions.length > 0
        ? userCompletions.reduce((sum, c) => sum + (c.discipline_score || 0), 0) / userCompletions.length
        : 0;

      return {
        rank: 0,
        userId: profile.user_id,
        username: profile.username || `User ${profile.user_id.slice(0, 6)}`,
        score: avgScore,
        streakDays: userStreakData?.current_streak || 0,
        change: Math.floor(Math.random() * 5) - 2,
        avatarUrl: profile.avatar_url || undefined
      };
    });

    const sortedLeaderboard = userScores
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

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
          yourRank: Math.floor(Math.random() * 10) + 1
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
        title: 'Error',
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
        title: 'Error',
        description: 'Failed to join community',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Welcome',
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
        title: 'Error',
        description: 'Failed to create community',
        variant: 'destructive'
      });
      return;
    }

    await supabase
      .from('community_members')
      .insert({
        community_id: newCommunity.id,
        user_id: user.id
      });

    toast({
      title: 'Created',
      description: `${name} has been created!`
    });

    fetchCommunities();
  };

  const currentUserEntry = leaderboard.find(e => e.userId === user?.id);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h1 className="heading-display text-3xl text-primary mb-2 flex items-center justify-center sm:justify-start gap-3">
              <Trophy className="w-8 h-8" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Compete with the community and climb the ranks
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mx-auto sm:mx-0">
            <button
              onClick={() => setView('global')}
              className={cn(
                "px-4 py-2 rounded-full border flex items-center gap-2 transition-all",
                view === 'global'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs">Global</span>
            </button>
            <button
              onClick={() => setView('community')}
              className={cn(
                "px-4 py-2 rounded-full border flex items-center gap-2 transition-all",
                view === 'community'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">Communities</span>
            </button>
          </div>
        </div>

        {view === 'global' ? (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up stagger-1">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Filter:</span>
              {(['all', 'weekly', 'monthly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-all",
                    filter === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Your Position Card */}
            {currentUserEntry && (
              <div className="glass-card p-6 rounded-3xl border-primary/30 text-center mb-6 animate-fade-in-up stagger-2">
                <h3 className="text-sm text-muted-foreground mb-2">Your Position</h3>
                <div className="text-5xl font-display font-bold text-primary mb-1">
                  #{currentUserEntry.rank}
                </div>
                <div className="text-sm text-muted-foreground">
                  out of {leaderboard.length} users
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-center gap-8">
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground">
                      {currentUserEntry.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-display font-bold text-foreground">
                      {currentUserEntry.streakDays}
                    </div>
                    <div className="text-xs text-muted-foreground">day streak</div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-20 bg-muted rounded-3xl" />
                ))}
              </div>
            ) : (
              <>
                {/* Vertical Leaderboard List */}
                <div className="space-y-3 animate-fade-in-up stagger-3">
                  {leaderboard.map((entry) => (
                    <div 
                      key={entry.userId}
                      className={cn(
                        "glass-card p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.01]",
                        entry.userId === user?.id && "border-primary/50 bg-primary/5",
                        entry.rank === 1 && "bg-gradient-to-r from-yellow-400/10 to-transparent",
                        entry.rank === 2 && "bg-gradient-to-r from-gray-300/10 to-transparent",
                        entry.rank === 3 && "bg-gradient-to-r from-orange-400/10 to-transparent"
                      )}
                    >
                      {/* Rank with Medal */}
                      <div className="w-12 flex items-center justify-center">
                        {getMedalIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <div 
                        className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center bg-gradient-to-br from-secondary to-muted overflow-hidden"
                        style={{
                          backgroundImage: entry.avatarUrl ? `url(${entry.avatarUrl})` : 'none',
                          backgroundSize: 'cover'
                        }}
                      >
                        {!entry.avatarUrl && (
                          <span className="text-lg font-bold text-primary">
                            {entry.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-semibold truncate",
                            entry.userId === user?.id ? "text-primary" : "text-foreground"
                          )}>
                            {entry.username}
                          </span>
                          {entry.userId === user?.id && (
                            <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          🔥 {entry.streakDays} day streak
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className={cn(
                          "text-2xl font-bold",
                          entry.rank <= 3 ? "text-primary" : "text-foreground"
                        )}>
                          {entry.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">pts</div>
                      </div>
                    </div>
                  ))}
                </div>

                {leaderboard.length === 0 && (
                  <div className="glass-card p-12 rounded-3xl text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-display text-lg mb-2">
                      No rankings yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Complete goals to appear on the leaderboard.
                    </p>
                  </div>
                )}
              </>
            )}
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
