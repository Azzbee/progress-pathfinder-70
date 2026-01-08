import { Lightbulb, AlertTriangle, Star, ArrowRight, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  type: 'success' | 'warning' | 'tip';
  title: string;
  description: string;
  action?: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  bestCategory?: { name: string; score: number };
  worstCategory?: { name: string; score: number };
  streakDays: number;
  consistency: number;
}

export default function InsightsPanel({ 
  insights, 
  bestCategory, 
  worstCategory, 
  streakDays,
  consistency 
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
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-mono">CURRENT_STREAK</span>
          </div>
          <div className="text-3xl font-mono font-bold text-primary matrix-glow">
            {streakDays}
            <span className="text-lg text-muted-foreground ml-1">days</span>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-mono">CONSISTENCY</span>
          </div>
          <div className="text-3xl font-mono font-bold text-card-foreground">
            {consistency}
            <span className="text-lg text-muted-foreground ml-1">%</span>
          </div>
        </div>
      </div>

      {/* Best/Worst Categories */}
      {(bestCategory || worstCategory) && (
        <div className="grid grid-cols-2 gap-4">
          {bestCategory && (
            <div className="glass-card p-4 border-l-4 border-primary">
              <span className="text-xs text-muted-foreground font-mono block mb-1">EXCELLING_IN</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-card-foreground">{bestCategory.name}</span>
                <span className="text-primary font-bold">{bestCategory.score.toFixed(1)}</span>
              </div>
            </div>
          )}
          
          {worstCategory && (
            <div className="glass-card p-4 border-l-4 border-orange-400">
              <span className="text-xs text-muted-foreground font-mono block mb-1">FOCUS_NEEDED</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-card-foreground">{worstCategory.name}</span>
                <span className="text-orange-400 font-bold">{worstCategory.score.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Insights */}
      <div>
        <h3 className="heading-serif text-lg text-primary mb-4">SYSTEM_INSIGHTS</h3>
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
                  <h4 className="font-mono text-sm text-card-foreground mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                      {insight.action}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {insights.length === 0 && (
            <div className="glass-card p-6 text-center">
              <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-mono text-sm">
                // ANALYZING_PATTERNS...
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
