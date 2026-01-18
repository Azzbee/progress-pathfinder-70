import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Calendar, TrendingUp, Award, Trophy, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const navItems = [
  { icon: Target, path: '/dashboard', label: 'Goals' },
  { icon: Calendar, path: '/schedule', label: 'Schedule' },
  { icon: TrendingUp, path: '/progress', label: 'Progress' },
  { icon: Award, path: '/discipline', label: 'Discipline' },
  { icon: Trophy, path: '/leaderboard', label: 'Leaderboard' },
  { icon: MessageCircle, path: '/ai-coach', label: 'AI Coach' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="glass-card border-t border-border/50 backdrop-blur-xl bg-card/90 px-2 py-2 rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 min-w-[56px]',
                  isActive 
                    ? 'nav-active-flow text-primary-foreground scale-110' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 transition-all duration-300',
                  isActive && 'drop-shadow-lg'
                )} />
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
