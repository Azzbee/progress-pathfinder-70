import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen water-bg relative overflow-hidden">
      {/* Animated wave layers at bottom */}
      <div className="wave-container">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
      </div>
      
      {/* Floating bubble decorations */}
      <div className="bubble-decoration bubble-1" />
      <div className="bubble-decoration bubble-2" />
      <div className="bubble-decoration bubble-3" />
      <div className="bubble-decoration bubble-4" />
      
      {/* Caustics light pattern overlay */}
      <div className="fixed inset-0 caustics-pattern pointer-events-none z-0" />
      
      <main className="flex-1 p-4 overflow-auto relative z-10 pb-24">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}