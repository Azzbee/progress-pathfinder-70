import AppLayout from '@/components/layout/AppLayout';
import { useProgress } from '@/hooks/useProgress';
import { useStreak } from '@/hooks/useStreak';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Activity, Target, Flame, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from 'recharts';

export default function Progress() {
  const {
    dailyProgress,
    categoryProgress,
    selectedCategory,
    setSelectedCategory,
    timeRange,
    setTimeRange,
    loading,
  } = useProgress();

  const { streak } = useStreak();

  // Calculate summary stats
  const avgScore = dailyProgress.length > 0
    ? (dailyProgress.reduce((acc, d) => acc + d.disciplineScore, 0) / dailyProgress.length).toFixed(1)
    : '0.0';
  
  const totalCompleted = dailyProgress.reduce((acc, d) => acc + d.goalsCompleted, 0);
  const totalGoals = dailyProgress.reduce((acc, d) => acc + d.totalGoals, 0);
  const completionRate = totalGoals > 0 ? Math.round((totalCompleted / totalGoals) * 100) : 0;

  // Trend calculation
  const firstHalf = dailyProgress.slice(0, Math.floor(dailyProgress.length / 2));
  const secondHalf = dailyProgress.slice(Math.floor(dailyProgress.length / 2));
  const firstAvg = firstHalf.length > 0 
    ? firstHalf.reduce((acc, d) => acc + d.disciplineScore, 0) / firstHalf.length 
    : 0;
  const secondAvg = secondHalf.length > 0 
    ? secondHalf.reduce((acc, d) => acc + d.disciplineScore, 0) / secondHalf.length 
    : 0;
  const trend = secondAvg - firstAvg;

  // Chart data
  const chartData = dailyProgress.map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    score: d.disciplineScore,
    completed: d.goalsCompleted,
    total: d.totalGoals,
  }));

  // Category chart data
  const categoryChartData = dailyProgress.map((d, i) => {
    const point: Record<string, string | number> = { date: format(new Date(d.date), 'MMM d') };
    categoryProgress.forEach(cat => {
      if (selectedCategory === 'all' || selectedCategory === cat.category) {
        point[cat.category] = cat.data[i]?.progress || 0;
      }
    });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-2xl border border-primary/30 shadow-soft">
          <p className="text-xs font-display text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-sans" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="heading-display text-3xl text-primary mb-2">
              Your Progress
            </h1>
            <p className="text-muted-foreground text-sm">
              Visualize your goal completion over time
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 glass-card p-1 rounded-full">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-2 text-xs font-medium rounded-full transition-all",
                  timeRange === range 
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Average Score', 
              value: avgScore, 
              icon: Activity, 
              trend: trend,
            },
            { 
              label: 'Completion Rate', 
              value: `${completionRate}%`, 
              icon: Target, 
            },
            { 
              label: 'Goals Completed', 
              value: totalCompleted.toString(), 
              icon: BarChart3, 
            },
            { 
              label: 'Active Streak', 
              value: streak.current_streak.toString(), 
              icon: Flame, 
            },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="glass-card p-5 rounded-3xl animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-display font-bold text-foreground">
                  {stat.value}
                </span>
                {stat.trend !== undefined && (
                  <span className={cn(
                    "flex items-center gap-1 text-xs pb-1",
                    stat.trend >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    {stat.trend >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(stat.trend).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart - Discipline Score */}
        <div className="glass-card p-6 rounded-3xl mb-6 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="heading-display text-lg text-foreground mb-1">Score Trend</h2>
              <p className="text-xs text-muted-foreground">Your discipline score over time</p>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200 85% 55%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(200 85% 55%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(200 30% 85%)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(200 15% 55%)"
                  tick={{ fill: 'hsl(200 15% 55%)', fontSize: 10, fontFamily: 'Nunito' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(200 30% 85%)' }}
                />
                <YAxis 
                  stroke="hsl(200 15% 55%)"
                  tick={{ fill: 'hsl(200 15% 55%)', fontSize: 10, fontFamily: 'Nunito' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(200 30% 85%)' }}
                  domain={[0, 10]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(200 85% 55%)"
                  strokeWidth={3}
                  fill="url(#scoreGradient)"
                  dot={{ fill: 'hsl(200 85% 55%)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(200 85% 60%)', stroke: 'white', strokeWidth: 2 }}
                  name="Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-6 rounded-3xl animate-fade-in-up stagger-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="heading-display text-lg text-foreground mb-1">Category Progress</h2>
              <p className="text-xs text-muted-foreground">Progress by category over time</p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full border transition-all",
                  selectedCategory === 'all'
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                All
              </button>
              {categoryProgress.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border transition-all",
                    selectedCategory === cat.category
                      ? "border-current"
                      : "border-border hover:border-current"
                  )}
                  style={{ 
                    color: selectedCategory === cat.category ? cat.color : undefined,
                    borderColor: selectedCategory === cat.category ? cat.color : undefined,
                    backgroundColor: selectedCategory === cat.category ? `${cat.color}15` : undefined,
                  }}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryChartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(200 30% 85%)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(200 15% 55%)"
                  tick={{ fill: 'hsl(200 15% 55%)', fontSize: 10, fontFamily: 'Nunito' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(200 30% 85%)' }}
                />
                <YAxis 
                  stroke="hsl(200 15% 55%)"
                  tick={{ fill: 'hsl(200 15% 55%)', fontSize: 10, fontFamily: 'Nunito' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(200 30% 85%)' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontFamily: 'Nunito',
                    fontSize: '12px',
                  }}
                />
                {categoryProgress.map((cat) => (
                  (selectedCategory === 'all' || selectedCategory === cat.category) && (
                    <Line
                      key={cat.category}
                      type="monotone"
                      dataKey={cat.category}
                      stroke={cat.color}
                      strokeWidth={2}
                      dot={{ fill: cat.color, strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, fill: cat.color }}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Notice */}
        <div className="mt-6 text-center animate-fade-in-up stagger-4">
          <p className="text-xs text-muted-foreground">
            Data updates as you complete goals and tasks ✨
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
