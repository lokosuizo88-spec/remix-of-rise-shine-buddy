import { useState, useEffect, useMemo } from 'react';
import { DifficultyLevel } from '@/types/alarm';

interface PatternChallengeProps {
  difficulty: DifficultyLevel;
  onComplete: () => void;
  onFail: () => void;
}

const GRID_SIZE = 4;

function generatePattern(count: number): number[] {
  const cells: number[] = [];
  while (cells.length < count) {
    const cell = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
    if (!cells.includes(cell)) cells.push(cell);
  }
  return cells;
}

export function PatternChallenge({ difficulty, onComplete, onFail }: PatternChallengeProps) {
  const patternCount = difficulty === 'suave' ? 3 : difficulty === 'medio' ? 5 : difficulty === 'bestia' ? 7 : 9;
  const pattern = useMemo(() => generatePattern(patternCount), [patternCount]);

  const [phase, setPhase] = useState<'showing' | 'input' | 'error'>('showing');
  const [selected, setSelected] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('input'), 2000 + patternCount * 300);
    return () => clearTimeout(timer);
  }, [patternCount]);

  const handleCellClick = (index: number) => {
    if (phase !== 'input' || selected.includes(index)) return;

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (!pattern.includes(index)) {
      setShake(true);
      setPhase('error');
      onFail();
      setTimeout(() => {
        setShake(false);
        setSelected([]);
        setPhase('showing');
        setTimeout(() => setPhase('input'), 2000 + patternCount * 300);
      }, 1000);
      return;
    }

    if (newSelected.length === pattern.length) {
      onComplete();
    }
  };

  return (
    <div className={`flex flex-col items-center gap-6 p-6 ${shake ? 'animate-shake' : ''}`}>
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-2">
          {phase === 'showing' ? '👀 Memoriza el patrón...' :
           phase === 'error' ? '❌ ¡Incorrecto!' :
           `🎯 Toca las celdas correctas (${selected.length}/${pattern.length})`}
        </p>
        <h2 className="text-2xl font-display font-bold text-foreground">Patrón mágico ✨</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full max-w-[240px]">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const isInPattern = pattern.includes(i);
          const isSelected = selected.includes(i);
          const showPattern = phase === 'showing' && isInPattern;

          return (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              disabled={phase !== 'input'}
              className={`
                aspect-square rounded-lg transition-all duration-300 border
                ${showPattern ? 'gradient-party border-primary scale-105' :
                  isSelected && isInPattern ? 'bg-fun-green/80 border-fun-green' :
                  isSelected && !isInPattern ? 'bg-destructive/80 border-destructive' :
                  'bg-muted border-border hover:bg-muted/80'}
                ${phase === 'input' ? 'cursor-pointer active:scale-90' : 'cursor-default'}
              `}
            />
          );
        })}
      </div>
    </div>
  );
}
