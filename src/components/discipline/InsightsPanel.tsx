import { Lightbulb, AlertTriangle, Star, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  type: 'success' | 'warning' | 'tip';
  title: string;
  description: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  bestCategory?: { name: string; score: number };
  worstCategory?: { name: string; score: number };
  streakDays: number;
}

export default function InsightsPanel({ 
  insights, 
  bestCategory, 
  worstCategory, 
  streakDays,
}: InsightsPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <Star className="w-5 h-5 text-primary" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default: return <Lightbulb className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-primary/50';
      case 'warning': return 'border-orange-400/50';
      default: return 'border-yellow-400/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats - Only Streak */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Current Streak</span>
        </div>
        <div className="text-3xl font-display font-bold text-primary">
          {streakDays}
          <span className="text-lg text-muted-foreground ml-1">days</span>
        </div>
      </div>

      {/* Best/Worst Categories - Excelling In & Focus Needed */}
      {(bestCategory || worstCategory) && (
        <div className="grid grid-cols-2 gap-4">
          {bestCategory && (
            <div className="glass-card p-4 border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Excelling In</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">{bestCategory.name}</span>
                <span className="text-primary font-bold">{bestCategory.score.toFixed(1)}</span>
              </div>
            </div>
          )}
          
          {worstCategory && (
            <div className="glass-card p-4 border-l-4 border-orange-400">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-muted-foreground">Focus Needed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">{worstCategory.name}</span>
                <span className="text-orange-400 font-bold">{worstCategory.score.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Insights - No action buttons */}
      <div>
        <h3 className="heading-display text-lg text-primary mb-4">System Insights</h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={cn(
                "glass-card p-4 border-l-4 animate-fade-in-up",
                getInsightBorderColor(insight.type),
                `stagger-${index + 1}`
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {insights.length === 0 && (
            <div className="glass-card p-6 text-center">
              <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Analyzing patterns...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete more goals to unlock personalized insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
