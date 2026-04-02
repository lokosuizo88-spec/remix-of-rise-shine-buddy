import { useState, useEffect } from 'react';
import { DifficultyLevel, DIFFICULTY_CONFIG } from '@/types/alarm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MathChallengeProps {
  difficulty: DifficultyLevel;
  onComplete: () => void;
  onFail: () => void;
}

function generateProblem(difficulty: DifficultyLevel) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const [min, max] = config.mathRange;
  const rand = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;

  if (difficulty === 'suave') {
    const a = rand(min, max);
    const b = rand(min, max);
    const op = Math.random() > 0.5 ? '+' : '-';
    return { question: `${a} ${op} ${b}`, answer: op === '+' ? a + b : a - b };
  }

  if (difficulty === 'medio') {
    const a = rand(min, max);
    const b = rand(2, 12);
    const op = Math.random() > 0.5 ? '×' : '÷';
    if (op === '×') return { question: `${a} × ${b}`, answer: a * b };
    const product = a * b;
    return { question: `${product} ÷ ${b}`, answer: a };
  }

  if (difficulty === 'bestia') {
    const a = rand(min, max);
    const b = rand(10, 30);
    const c = rand(2, 10);
    return { question: `${a} + ${b} × ${c}`, answer: a + b * c };
  }

  // imposible
  const a = rand(min, max);
  const b = rand(20, 50);
  const c = rand(10, 30);
  const d = rand(2, 8);
  return { question: `(${a} + ${b}) × ${c} - ${d}²`, answer: (a + b) * c - d * d };
}

export function MathChallenge({ difficulty, onComplete, onFail }: MathChallengeProps) {
  const [problem, setProblem] = useState(() => generateProblem(difficulty));
  const [answer, setAnswer] = useState('');
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setProblem(generateProblem(difficulty));
    setAnswer('');
    setAttempts(0);
  }, [difficulty]);

  const handleSubmit = () => {
    const num = parseInt(answer, 10);
    if (num === problem.answer) {
      onComplete();
    } else {
      setAttempts(a => a + 1);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (attempts >= 4) {
        onFail();
        setProblem(generateProblem(difficulty));
        setAttempts(0);
      }
      setAnswer('');
    }
  };

  return (
    <div className={`flex flex-col items-center gap-6 p-6 ${shake ? 'animate-shake' : ''}`}>
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-2">Resuelve esto 🧮</p>
        <h2 className="text-4xl font-display font-bold text-foreground">{problem.question} = ?</h2>
      </div>

      <Input
        type="number"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Tu respuesta..."
        className="text-center text-2xl h-14 bg-muted border-primary/30 font-bold max-w-[200px]"
        autoFocus
      />

      <Button
        onClick={handleSubmit}
        disabled={!answer}
        className="gradient-party text-foreground font-bold text-lg px-8 py-3 h-auto rounded-full"
      >
        Comprobar ✓
      </Button>

      {attempts > 0 && (
        <p className="text-fun-pink text-sm animate-bounce-soft">
          ❌ Intentos fallidos: {attempts}/5
        </p>
      )}
    </div>
  );
}
