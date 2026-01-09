import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen soft-bg relative overflow-hidden">
      {/* Background decorations */}
      <div className="bubble-decoration bubble-1" />
      <div className="bubble-decoration bubble-2" />
      <div className="bubble-decoration bubble-3" />
      
      <Sidebar />
      <main className="flex-1 p-4 pt-20 lg:p-8 lg:pt-8 overflow-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}