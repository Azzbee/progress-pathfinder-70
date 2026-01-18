import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Calendar, TrendingUp, Brain, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const navItems = [
  { icon: Target, path: '/', label: 'Goals', emoji: '🎯' },
  { icon: Calendar, path: '/schedule', label: 'Schedule', emoji: '📅' },
  { icon: TrendingUp, path: '/progress', label: 'Progress', emoji: '📈' },
  { icon: Brain, path: '/discipline', label: 'Discipline', emoji: '🧠' },
  { icon: Trophy, path: '/leaderboard', label: 'Board', emoji: '🏆' },
  { icon: Settings, path: '/settings', label: 'Settings', emoji: '⚙️' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { playDroplet } = useSoundEffects();

  const handleNavClick = (path: string) => {
    playDroplet();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-card border-t border-border/50 backdrop-blur-xl bg-card/95 px-2 py-2 rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all duration-300 min-w-[52px]',
                  isActive 
                    ? 'nav-active-flow text-primary-foreground scale-105' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                )}
              >
                <span className="text-lg">{item.emoji}</span>
                <span className={cn(
                  'text-[10px] font-medium transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
