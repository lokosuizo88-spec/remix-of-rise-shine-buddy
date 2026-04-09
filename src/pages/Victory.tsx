import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarms } from '@/hooks/useAlarms';

const VICTORY_MESSAGES = [
  '¡LO LOGRASTE! 🎉🎊',
  '¡CAMPEÓN/A! Estás despierto/a 🏆',
  '¡ERES IMPARABLE! 💪🔥',
  '¡DESPIERTO/A Y LISTO/A! 🚀',
  '¡NIVEL: MADRUGADOR PRO! ⭐',
];

export default function Victory() {
  const navigate = useNavigate();
  const { stats } = useAlarms();
  const [message] = useState(() => VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)]);
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    const pieces = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#FF6B9D', '#FFB347', '#87CEEB', '#98FB98', '#DDA0DD', '#FFD700'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 2,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map((piece, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-sm animate-bounce-soft"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            opacity: 0.8,
          }}
        />
      ))}

      <div className="text-center z-10">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl font-display font-bold mb-4">{message}</h1>

        <div className="space-y-3 mb-8">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-4xl font-display font-bold text-fun-orange">🔥 {stats.streak}</p>
            <p className="text-xs text-muted-foreground">días seguidos despertando</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-card rounded-2xl p-3 border border-border text-center">
              <p className="text-xl font-bold text-fun-blue">⏱ {stats.avgTimeToDisable}s</p>
              <p className="text-[10px] text-muted-foreground">promedio</p>
            </div>
            <div className="flex-1 bg-card rounded-2xl p-3 border border-border text-center">
              <p className="text-xl font-bold text-fun-green">✅ {stats.totalWakeups}</p>
              <p className="text-[10px] text-muted-foreground">total</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="gradient-party text-foreground font-bold text-lg px-8 py-4 rounded-2xl active:scale-95 transition-transform"
        >
          ¡A por el día! ☀️
        </button>
      </div>
    </div>
  );
}
