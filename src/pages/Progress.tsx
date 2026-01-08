import AppLayout from '@/components/layout/AppLayout';
import { useProgress } from '@/hooks/useProgress';
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
        <div className="glass-card p-3 border border-primary/30">
          <p className="text-xs font-mono text-primary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-mono" style={{ color: entry.color }}>
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
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="heading-serif text-3xl text-primary matrix-glow mb-2">
              PROGRESS_METRICS
            </h1>
            <p className="text-muted-foreground text-sm font-mono">
              // Visualize your goal completion over time
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 glass-card p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-2 text-xs font-mono uppercase transition-all",
                  timeRange === range 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {range === '7d' ? '7 DAYS' : range === '30d' ? '30 DAYS' : '90 DAYS'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'AVG_SCORE', 
              value: avgScore, 
              icon: Activity, 
              trend: trend,
              color: 'text-primary' 
            },
            { 
              label: 'COMPLETION_RATE', 
              value: `${completionRate}%`, 
              icon: Target, 
              color: 'text-primary' 
            },
            { 
              label: 'GOALS_COMPLETED', 
              value: totalCompleted.toString(), 
              icon: BarChart3, 
              color: 'text-primary' 
            },
            { 
              label: 'ACTIVE_STREAK', 
              value: '—', 
              icon: Flame, 
              color: 'text-primary' 
            },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="glass-card p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-mono">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-end gap-2">
                <span className={cn("text-3xl font-mono", stat.color)}>
                  {stat.value}
                </span>
                {stat.trend !== undefined && (
                  <span className={cn(
                    "flex items-center gap-1 text-xs font-mono pb-1",
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
        <div className="glass-card p-6 mb-6 animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="heading-serif text-lg text-primary mb-1">DISCIPLINE_SCORE_TREND</h2>
              <p className="text-xs text-muted-foreground font-mono">// Score fluctuation over time</p>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(120 100% 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(120 100% 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(120 40% 20%)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(120 25% 45%)"
                  tick={{ fill: 'hsl(120 25% 45%)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(120 40% 20%)' }}
                />
                <YAxis 
                  stroke="hsl(120 25% 45%)"
                  tick={{ fill: 'hsl(120 25% 45%)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(120 40% 20%)' }}
                  domain={[0, 10]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(120 100% 45%)"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  dot={{ fill: 'hsl(120 100% 45%)', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, fill: 'hsl(120 100% 50%)', stroke: 'hsl(120 100% 70%)', strokeWidth: 2 }}
                  name="Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-6 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="heading-serif text-lg text-primary mb-1">CATEGORY_PROGRESS</h2>
              <p className="text-xs text-muted-foreground font-mono">// Progress by category over time</p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-3 py-1.5 text-xs font-mono uppercase border transition-all",
                  selectedCategory === 'all'
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-primary/30 text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                ALL
              </button>
              {categoryProgress.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-mono uppercase border transition-all",
                    selectedCategory === cat.category
                      ? "border-current"
                      : "border-primary/30 hover:border-current"
                  )}
                  style={{ 
                    color: selectedCategory === cat.category ? cat.color : undefined,
                    borderColor: selectedCategory === cat.category ? cat.color : undefined,
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
                  stroke="hsl(120 40% 20%)" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(120 25% 45%)"
                  tick={{ fill: 'hsl(120 25% 45%)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(120 40% 20%)' }}
                />
                <YAxis 
                  stroke="hsl(120 25% 45%)"
                  tick={{ fill: 'hsl(120 25% 45%)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(120 40% 20%)' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontFamily: 'IBM Plex Mono',
                    fontSize: '11px',
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
                      dot={{ fill: cat.color, strokeWidth: 0, r: 2 }}
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
          <p className="text-xs text-muted-foreground font-mono">
            // Data visualizations update as you complete goals and tasks
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
