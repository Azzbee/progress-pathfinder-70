import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  shape: 'circle' | 'square' | 'star';
}

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

const COLORS = [
  'hsl(195 90% 55%)',   // primary blue
  'hsl(175 75% 45%)',   // accent teal
  'hsl(42 95% 55%)',    // gold
  'hsl(285 60% 60%)',   // purple
  'hsl(158 65% 50%)',   // green
  'hsl(8 78% 60%)',     // coral
  'hsl(225 70% 60%)',   // indigo
];

export default function ConfettiAnimation({ isActive, onComplete }: ConfettiAnimationProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = [];
      const pieceCount = 50;

      for (let i = 0; i < pieceCount; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          y: -10 - Math.random() * 20,
          rotation: Math.random() * 360,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 6 + Math.random() * 8,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 1.5,
          shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star',
        });
      }

      setPieces(newPieces);

      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3500);

      return () => clearTimeout(timeout);
    }
  }, [isActive, onComplete]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute confetti-piece"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.shape !== 'star' ? piece.color : 'transparent',
            borderRadius: piece.shape === 'circle' ? '50%' : piece.shape === 'square' ? '2px' : '0',
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ...(piece.shape === 'star' && {
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              backgroundColor: piece.color,
            }),
          }}
        />
      ))}
      
      {/* Central burst effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="confetti-burst" />
      </div>
      
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) rotate(180deg) scale(1.1);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) rotate(360deg) scale(0.9);
            opacity: 0.9;
          }
          75% {
            transform: translateY(75vh) rotate(540deg) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes confetti-sway {
          0%, 100% {
            margin-left: 0;
          }
          25% {
            margin-left: 15px;
          }
          75% {
            margin-left: -15px;
          }
        }
        
        @keyframes burst {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(2);
            opacity: 0.5;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        
        .confetti-piece {
          animation: 
            confetti-fall var(--duration, 2.5s) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards,
            confetti-sway 1s ease-in-out infinite;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .confetti-burst {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(195 90% 55% / 0.4), hsl(175 75% 45% / 0.2), transparent);
          animation: burst 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
