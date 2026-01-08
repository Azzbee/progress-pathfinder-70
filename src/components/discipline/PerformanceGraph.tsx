import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';

interface DataPoint {
  date: string;
  score: number;
  label: string;
}

interface PerformanceGraphProps {
  data: DataPoint[];
  timeRange: '7d' | '30d' | '90d';
}

export default function PerformanceGraph({ data, timeRange }: PerformanceGraphProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card border border-primary/50 p-3">
          <p className="text-xs text-muted-foreground font-mono">{label}</p>
          <p className="text-primary font-mono font-bold">
            Score: {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="heading-serif text-lg text-primary">PERFORMANCE_TIMELINE</h3>
        <span className="text-xs text-muted-foreground font-mono uppercase">
          Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
        </span>
      </div>

      {data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(120 100% 45%)" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="hsl(120 100% 45%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                stroke="hsl(120 25% 35%)"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'hsl(120 40% 20%)' }}
              />
              <YAxis 
                domain={[0, 10]} 
                stroke="hsl(120 25% 35%)"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'hsl(120 40% 20%)' }}
                ticks={[0, 2.5, 5, 7.5, 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(120 100% 45%)"
                strokeWidth={2}
                fill="url(#scoreGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: 'hsl(120 100% 45%)',
                  stroke: 'hsl(120 10% 4%)',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center border border-primary/20">
          <div className="text-center">
            <p className="text-muted-foreground font-mono">// AWAITING_DATA...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Complete daily goals to generate performance data.
            </p>
          </div>
        </div>
      )}

      {/* Performance indicators */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-primary/20">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-primary">
              {Math.max(...data.map(d => d.score)).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground font-mono">PEAK_SCORE</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-card-foreground">
              {(data.reduce((acc, d) => acc + d.score, 0) / data.length).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground font-mono">AVG_SCORE</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-muted-foreground">
              {Math.min(...data.map(d => d.score)).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground font-mono">LOW_SCORE</div>
          </div>
        </div>
      )}
    </div>
  );
}
