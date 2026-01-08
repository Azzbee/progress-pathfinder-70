import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from './Dashboard';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center scanlines matrix-bg">
        <div className="text-center">
          <div className="heading-serif text-3xl text-primary matrix-glow mb-4">
            DISCIPLINE_OS
          </div>
          <p className="text-muted-foreground terminal-cursor">
            INITIALIZING SYSTEM
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Dashboard />;
}
