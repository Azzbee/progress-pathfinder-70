import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Brain, 
  Trophy, 
  LogOut,
  Flame,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const navItems = [
  { to: '/', icon: Target, label: 'Goals', emoji: '🎯' },
  { to: '/schedule', icon: Calendar, label: 'Schedule', emoji: '📅' },
  { to: '/progress', icon: TrendingUp, label: 'Progress', emoji: '📈' },
  { to: '/discipline', icon: Brain, label: 'Discipline', emoji: '🧠' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', emoji: '🏆' },
];

export default function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { playRipple, playDroplet } = useSoundEffects();

  const handleNavClick = () => {
    playRipple();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => {
          playDroplet();
          setIsOpen(!isOpen);
        }}
        className="fixed top-4 left-4 z-50 lg:hidden w-12 h-12 rounded-2xl bg-card shadow-soft flex items-center justify-center border border-border/50"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed lg:relative z-40 w-72 min-h-screen sidebar-water border-r border-border/50 flex flex-col shadow-soft transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Animated water overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-r-3xl">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-3xl animate-float" />
          <div className="absolute bottom-20 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-accent/5 to-primary/5 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Logo */}
        <div className="p-6 pt-20 lg:pt-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-pulse-glow">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                DisciplineOS
              </h1>
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Your growth companion
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 relative z-10">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.to;
              return (
                <li 
                  key={item.to}
                  className="animate-slide-in-left opacity-0"
                  style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                >
                  <NavLink
                    to={item.to}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 nav-hover-wave',
                      isActive
                        ? 'nav-active-flow text-primary-foreground shadow-soft-lg'
                        : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                    )}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 m-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-border/30 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playDroplet();
              signOut();
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors text-sm w-full mt-3 px-2 py-2 rounded-xl hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
