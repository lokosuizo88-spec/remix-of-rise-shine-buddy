import { useState, useEffect, useCallback, useRef } from 'react';
import { DifficultyLevel, DIFFICULTY_CONFIG } from '@/types/alarm';

interface SimonChallengeProps {
  difficulty: DifficultyLevel;
  onComplete: () => void;
  onFail: () => void;
}

const COLORS = [
  { name: 'rojo', bg: 'bg-fun-pink', active: 'bg-fun-pink/50', ring: 'ring-fun-pink' },
  { name: 'azul', bg: 'bg-fun-blue', active: 'bg-fun-blue/50', ring: 'ring-fun-blue' },
  { name: 'verde', bg: 'bg-fun-green', active: 'bg-fun-green/50', ring: 'ring-fun-green' },
  { name: 'amarillo', bg: 'bg-fun-yellow', active: 'bg-fun-yellow/50', ring: 'ring-fun-yellow' },
];

export function SimonChallenge({ difficulty, onComplete, onFail }: SimonChallengeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [phase, setPhase] = useState<'showing' | 'input' | 'error'>('showing');
  const timeoutRef = useRef<number>();

  const generateSequence = useCallback(() => {
    const seq = Array.from({ length: config.simonLength }, () => Math.floor(Math.random() * 4));
    setSequence(seq);
    setPlayerSequence([]);
    setPhase('showing');
    setIsShowingSequence(true);
    return seq;
  }, [config.simonLength]);

  useEffect(() => {
    const seq = generateSequence();

    // Show sequence to user
    let i = 0;
    const showNext = () => {
      if (i < seq.length) {
        setActiveColor(seq[i]);
        timeoutRef.current = window.setTimeout(() => {
          setActiveColor(null);
          i++;
          timeoutRef.current = window.setTimeout(showNext, 300);
        }, 600);
      } else {
        setIsShowingSequence(false);
        setPhase('input');
      }
    };

    timeoutRef.current = window.setTimeout(showNext, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [generateSequence]);

  const handleColorClick = (colorIndex: number) => {
    if (phase !== 'input') return;

    const newPlayerSeq = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSeq);
    setActiveColor(colorIndex);
    setTimeout(() => setActiveColor(null), 200);

    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      setPhase('error');
      onFail();
      setTimeout(() => {
        const seq = generateSequence();
        let i = 0;
        const showNext = () => {
          if (i < seq.length) {
            setActiveColor(seq[i]);
            timeoutRef.current = window.setTimeout(() => {
              setActiveColor(null);
              i++;
              timeoutRef.current = window.setTimeout(showNext, 300);
            }, 600);
          } else {
            setIsShowingSequence(false);
            setPhase('input');
          }
        };
        timeoutRef.current = window.setTimeout(showNext, 1000);
      }, 1000);
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-2">
          {phase === 'showing' ? '👀 Memoriza la secuencia...' :
           phase === 'error' ? '❌ ¡Incorrecto! Otra vez...' :
           `🎯 Repite la secuencia (${playerSequence.length}/${sequence.length})`}
        </p>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Simon dice... 🧠
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[240px]">
        {COLORS.map((color, i) => (
          <button
            key={color.name}
            onClick={() => handleColorClick(i)}
            disabled={phase !== 'input'}
            className={`
              aspect-square rounded-2xl transition-all duration-200 border-2 border-transparent
              ${activeColor === i ? `${color.bg} scale-110 ring-4 ${color.ring}` : `${color.bg} opacity-40`}
              ${phase === 'input' ? 'cursor-pointer hover:opacity-70 active:scale-95' : 'cursor-not-allowed'}
            `}
          />
        ))}
      </div>

      {isShowingSequence && (
        <div className="flex gap-1">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                activeColor !== null && i <= sequence.indexOf(activeColor)
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
