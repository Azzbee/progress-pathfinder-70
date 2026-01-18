import { useEffect, useState } from 'react';

interface SplashAnimationProps {
  isActive: boolean;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  onComplete?: () => void;
}

export default function SplashAnimation({ 
  isActive, 
  color = 'hsl(195 85% 50%)', 
  size = 'medium',
  onComplete 
}: SplashAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!visible) return null;

  const sizeMultiplier = size === 'small' ? 0.6 : size === 'large' ? 1.5 : 1;
  const baseSize = 80 * sizeMultiplier;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 50 }}
    >
      {/* Expanding ripples */}
      {[0, 1, 2].map((i) => (
        <div
          key={`ripple-${i}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: baseSize,
            height: baseSize,
            border: `2px solid ${color}`,
            opacity: 0,
            animation: `splash-ripple 0.6s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}

      {/* Rising droplets */}
      {[...Array(7)].map((_, i) => {
        const angle = (i / 7) * 360;
        const distance = 20 + Math.random() * 15;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const delay = Math.random() * 0.1;
        
        return (
          <div
            key={`droplet-${i}`}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: 6 * sizeMultiplier,
              height: 8 * sizeMultiplier,
              background: `linear-gradient(180deg, ${color}, transparent)`,
              opacity: 0,
              transform: `translate(calc(-50% + ${x}px), -50%)`,
              animation: `droplet-rise 0.5s ease-out forwards`,
              animationDelay: `${delay}s`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            }}
          />
        );
      })}

      {/* Center splash burst */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: baseSize * 0.4,
          height: baseSize * 0.4,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          animation: `splash-burst 0.4s ease-out forwards`,
        }}
      />
    </div>
  );
}
