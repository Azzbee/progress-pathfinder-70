import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen scanlines">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto matrix-bg">
        {children}
      </main>
    </div>
  );
}
