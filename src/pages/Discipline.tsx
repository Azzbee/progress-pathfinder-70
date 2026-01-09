import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ScoreRing from '@/components/discipline/ScoreRing';
import CategoryBreakdown from '@/components/discipline/CategoryBreakdown';
import PerformanceGraph from '@/components/discipline/PerformanceGraph';
import InsightsPanel from '@/components/discipline/InsightsPanel';
import { useGoals } from '@/hooks/useGoals';
import { useStreak } from '@/hooks/useStreak';
import { useProgress } from '@/hooks/useProgress';
import { format, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Discipline() {
  const { goals, categories, loading: goalsLoading } = useGoals();
  const { streak, loading: streakLoading } = useStreak();
  const { dailyProgress, timeRange, setTimeRange, loading: progressLoading } = useProgress();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d') => {
    setSelectedTimeRange(range);
    setTimeRange(range);
  };

  // Calculate overall discipline score
  const calculateOverallScore = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
    return (totalProgress / goals.length / 10);
  };

  // Calculate category data
  const calculateCategoryData = () => {
    return categories.map(cat => {
      const categoryGoals = goals.filter(g => g.category_id === cat.id);
      const completedGoals = categoryGoals.filter(g => g.progress === 100).length;
      
      if (categoryGoals.length === 0) {
        return {
          name: cat.name,
          score: 0,
          trend: 0,
          color: cat.color,
          goalsCompleted: 0,
          totalGoals: 0
        };
      }
      
      const avgProgress = categoryGoals.reduce((sum, g) => sum + g.progress, 0) / categoryGoals.length;
      
      return {
        name: cat.name,
        score: avgProgress / 10,
        trend: Math.random() * 2 - 0.5, // Simulated trend for now
        color: cat.color,
        goalsCompleted: completedGoals,
        totalGoals: categoryGoals.length
      };
    }).filter(c => c.totalGoals > 0);
  };

  // Generate performance graph data
  const generateGraphData = () => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const progress = dailyProgress.find(
        p => format(new Date(p.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date: format(date, 'yyyy-MM-dd'),
        score: progress ? progress.disciplineScore : 0,
        label: format(date, days <= 7 ? 'EEE' : 'MMM d')
      };
    });
  };

  // Generate insights
  const generateInsights = () => {
    const insights = [];
    const categoryData = calculateCategoryData();
    const score = calculateOverallScore();
    
    if (streak.current_streak >= 7) {
      insights.push({
        type: 'success' as const,
        title: 'Streak Champion! 🔥',
        description: `You've maintained a ${streak.current_streak}-day streak. Your consistency is paying off.`,
      });
    }

    const bestCat = categoryData.reduce((a, b) => a.score > b.score ? a : b, { score: 0, name: '' });
    if (bestCat.score >= 7) {
      insights.push({
        type: 'success' as const,
        title: `Excelling in ${bestCat.name} ⭐`,
        description: `Your ${bestCat.name} score of ${bestCat.score.toFixed(1)} is exceptional. Keep it up!`,
      });
    }

    const worstCat = categoryData.reduce((a, b) => a.score < b.score ? a : b, { score: 10, name: '' });
    if (worstCat.score < 5 && worstCat.name) {
      insights.push({
        type: 'warning' as const,
        title: `Focus on ${worstCat.name}`,
        description: `Your ${worstCat.name} category needs attention. Consider adding more goals in this area.`,
        action: 'Add goals'
      });
    }

    if (score < 5 && goals.length > 0) {
      insights.push({
        type: 'tip' as const,
        title: 'Break Down Large Goals',
        description: 'Try splitting big goals into smaller, achievable tasks to boost your completion rate.',
      });
    }

    if (goals.length === 0) {
      insights.push({
        type: 'tip' as const,
        title: 'Get Started',
        description: 'Create your first goals to begin tracking your discipline score.',
        action: 'Create goal'
      });
    }

    return insights;
  };

  const isLoading = goalsLoading || streakLoading || progressLoading;
  const overallScore = calculateOverallScore();
  const categoryData = calculateCategoryData();
  const graphData = generateGraphData();
  const insights = generateInsights();
  
  const bestCategory = categoryData.length > 0 
    ? categoryData.reduce((a, b) => a.score > b.score ? a : b)
    : undefined;
  const worstCategory = categoryData.length > 0 
    ? categoryData.reduce((a, b) => a.score < b.score ? a : b)
    : undefined;

  // Calculate consistency (days with any activity / total days)
  const consistency = dailyProgress.length > 0 
    ? Math.round((dailyProgress.filter(d => d.goalsCompleted > 0).length / dailyProgress.length) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="heading-display text-3xl text-primary mb-2">
            Discipline Analysis
          </h1>
          <p className="text-muted-foreground text-sm">
            Deep dive into your performance metrics and find ways to improve
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 bg-muted rounded-3xl col-span-1" />
            <Skeleton className="h-96 bg-muted rounded-3xl col-span-2" />
          </div>
        ) : (
          <>
            {/* Main Score Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Overall Score */}
              <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center animate-fade-in-up">
                <h2 className="text-sm text-muted-foreground mb-6">
                  Overall Discipline Score
                </h2>
                <ScoreRing 
                  score={overallScore} 
                  size="xl" 
                  label="discipline"
                />
                <div className="mt-6 w-full">
                  <div className="flex justify-center gap-2">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => handleTimeRangeChange(range)}
                        className={cn(
                          "px-4 py-2 text-xs rounded-full border transition-all",
                          selectedTimeRange === range
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insights Panel */}
              <div className="lg:col-span-2 animate-fade-in-up stagger-2">
                <InsightsPanel 
                  insights={insights}
                  bestCategory={bestCategory ? { name: bestCategory.name, score: bestCategory.score } : undefined}
                  worstCategory={worstCategory ? { name: worstCategory.name, score: worstCategory.score } : undefined}
                  streakDays={streak.current_streak}
                  consistency={consistency}
                />
              </div>
            </div>

            {/* Performance Graph */}
            <div className="mb-8 animate-fade-in-up stagger-3">
              <PerformanceGraph data={graphData} timeRange={selectedTimeRange} />
            </div>

            {/* Category Breakdown */}
            <div className="animate-fade-in-up stagger-4">
              <CategoryBreakdown categories={categoryData} />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
