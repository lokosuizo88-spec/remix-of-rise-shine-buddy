import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VICTORY_MESSAGES } from '@/types/alarm';
import { useAlarms } from '@/hooks/useAlarms';
import { Button } from '@/components/ui/button';

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = ['bg-fun-pink', 'bg-fun-orange', 'bg-fun-purple', 'bg-fun-blue', 'bg-fun-green', 'bg-fun-yellow'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.random() * 8 + 4;

  return (
    <div
      className={`absolute ${color} rounded-sm`}
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        top: -20,
        animation: `confetti-fall ${2 + Math.random() * 2}s linear ${delay}s forwards`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
}

const Victory = () => {
  const navigate = useNavigate();
  const { stats } = useAlarms();
  const [message] = useState(() =>
    VICTORY_MESSAGES[Math.floor(Math.random() * VICTORY_MESSAGES.length)]
  );

  useEffect(() => {
    try { document.exitFullscreen?.(); } catch {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background px-6">
      {/* Confetti */}
      {Array.from({ length: 40 }).map((_, i) => (
        <ConfettiPiece key={i} delay={Math.random() * 2} left={Math.random() * 100} />
      ))}

      <div className="relative z-10 text-center space-y-6">
        <div className="text-8xl animate-bounce-soft">🎉</div>

        <h1 className="text-4xl font-display font-bold text-gradient-party leading-tight">
          ¡VICTORIA!
        </h1>

        <p className="text-lg text-foreground font-body max-w-sm">{message}</p>

        {/* Stats */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-3 max-w-xs mx-auto">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">🔥 Racha</span>
            <span className="font-bold text-fun-orange">{stats.streak} días</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">⏰ Total alarmas</span>
            <span className="font-bold text-fun-purple">{stats.totalAlarms}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">⚡ Tiempo medio</span>
            <span className="font-bold text-fun-green">{stats.avgTimeToDisable}s</span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/')}
          className="gradient-party text-foreground font-display font-bold text-lg px-8 py-3 h-auto rounded-full"
        >
          ¡A por el día! ☀️
        </Button>
      </div>
    </div>
  );
};

export default Victory;
