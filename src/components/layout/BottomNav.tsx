import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const navItems = [
  { path: '/', label: 'Goals', emoji: '🎯' },
  { path: '/schedule', label: 'Schedule', emoji: '📅' },
  { path: '/progress', label: 'Progress', emoji: '📈' },
  { path: '/discipline', label: 'Focus', emoji: '🧠' },
  { path: '/leaderboard', label: 'Ranks', emoji: '🏆' },
  { path: '/ai-coach', label: 'Coach', emoji: '🤖' },
  { path: '/settings', label: 'Settings', emoji: '⚙️' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Gradient fade effect at top */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      
      <div className="mx-2 mb-2 rounded-[28px] overflow-hidden backdrop-blur-2xl bg-white/70 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.5)_inset]">
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        
        {/* Scrollable container */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between min-w-max px-2 py-2 gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl transition-all duration-300 min-w-[56px]',
                    isActive 
                      ? 'bg-gradient-to-br from-primary via-primary to-accent text-white shadow-[0_4px_20px_rgba(14,165,233,0.4)] scale-105' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 active:scale-95'
                  )}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  )}
                  
                  <span className={cn(
                    "text-xl transition-transform duration-300",
                    isActive && "animate-bounce-once"
                  )}>{item.emoji}</span>
                  <span className={cn(
                    'text-[10px] font-semibold tracking-wide transition-all duration-300',
                    isActive ? 'text-white/90' : 'opacity-70'
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
