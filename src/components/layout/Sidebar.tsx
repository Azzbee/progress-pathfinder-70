import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Brain, 
  Trophy, 
  LogOut,
  Flame
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/', icon: Target, label: 'GOALS' },
  { to: '/schedule', icon: Calendar, label: 'SCHEDULE' },
  { to: '/progress', icon: TrendingUp, label: 'PROGRESS' },
  { to: '/discipline', icon: Brain, label: 'DISCIPLINE' },
  { to: '/leaderboard', icon: Trophy, label: 'LEADERBOARD' },
];

export default function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <aside className="w-64 min-h-screen border-r border-primary/30 bg-card flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-primary/30">
        <h1 className="heading-serif text-2xl text-primary matrix-glow flex items-center gap-2">
          <Flame className="w-6 h-6" />
          DISCIPLINE_OS
        </h1>
        <p className="text-muted-foreground text-xs mt-1">
          // v2.0.26
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 border transition-all duration-200',
                    isActive
                      ? 'border-primary bg-primary/10 text-primary matrix-glow'
                      : 'border-transparent text-muted-foreground hover:border-primary/50 hover:text-primary'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-primary/30">
        <div className="text-xs text-muted-foreground mb-2 truncate">
          {user?.email}
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors text-sm w-full"
        >
          <LogOut className="w-4 h-4" />
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
