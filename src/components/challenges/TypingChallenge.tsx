import { useState, useEffect, useMemo } from 'react';
import { DifficultyLevel, TYPING_PHRASES } from '@/types/alarm';

interface TypingChallengeProps {
  difficulty: DifficultyLevel;
  onComplete: () => void;
  onFail: () => void;
}

export function TypingChallenge({ difficulty, onComplete, onFail }: TypingChallengeProps) {
  const phrase = useMemo(() => {
    const p = TYPING_PHRASES[Math.floor(Math.random() * TYPING_PHRASES.length)];
    if (difficulty === 'suave') return p.split(' ').slice(0, 4).join(' ');
    if (difficulty === 'medio') return p.split(' ').slice(0, 6).join(' ');
    return p;
  }, [difficulty]);

  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);

  const isCorrectSoFar = phrase.toLowerCase().startsWith(input.toLowerCase());
  const isComplete = input.toLowerCase() === phrase.toLowerCase();

  useEffect(() => {
    if (isComplete) onComplete();
  }, [isComplete, onComplete]);

  useEffect(() => {
    if (input.length > 0 && !isCorrectSoFar) {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setInput('');
        onFail();
      }, 500);
    }
  }, [input, isCorrectSoFar, onFail]);

  return (
    <div className={`flex flex-col items-center gap-6 p-6 ${shake ? 'animate-shake' : ''}`}>
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-2">Escribe sin errores ✍️</p>
        <h2 className="text-lg font-display font-bold text-foreground leading-relaxed">
          {phrase.split('').map((char, i) => (
            <span
              key={i}
              className={
                i < input.length
                  ? input[i]?.toLowerCase() === char.toLowerCase()
                    ? 'text-fun-green'
                    : 'text-destructive'
                  : 'text-muted-foreground'
              }
            >
              {char}
            </span>
          ))}
        </h2>
      </div>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Empieza a escribir..."
        className="w-full max-w-sm p-4 rounded-xl bg-muted border border-primary/30 text-foreground text-lg font-body resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        rows={3}
        autoFocus
      />

      <div className="w-full max-w-sm bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="h-full gradient-party transition-all duration-300 rounded-full"
          style={{ width: `${(input.length / phrase.length) * 100}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {input.length}/{phrase.length} caracteres
      </p>
    </div>
  );
}
