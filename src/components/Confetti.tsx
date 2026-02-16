import { useEffect, useState } from 'react';
import { useTheme, type Theme } from '../context/ThemeContext';
import '../styles/Confetti.css';

const THEME_COLORS: Record<Theme, string[]> = {
  default: ['#6366f1', '#8b5cf6', '#22c55e', '#eab308', '#ef4444', '#ec4899', '#06b6d4'],
  retro: ['#b45309', '#d97706', '#92400e', '#ca8a04', '#a16207', '#78350f', '#f59e0b'],
  brutalist: ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#ffffff'],
  dark: ['#818cf8', '#a78bfa', '#4ade80', '#facc15', '#f87171', '#fb923c', '#38bdf8'],
};
const PARTICLE_COUNT = 50;

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

function Confetti({ onComplete }: { onComplete?: () => void }) {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
      size: 6 + Math.random() * 6,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;
