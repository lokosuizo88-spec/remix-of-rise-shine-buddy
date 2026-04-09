import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarms } from '@/hooks/useAlarms';
import { DifficultyLevel, ChallengeType, DIFFICULTY_CONFIG } from '@/types/alarm';
import { SoundType, SOUND_OPTIONS } from '@/lib/alarmSounds';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CHALLENGE_OPTIONS: { value: ChallengeType | 'random'; label: string; emoji: string }[] = [
  { value: 'random', label: 'Aleatorio', emoji: '🎲' },
  { value: 'math', label: 'Matemáticas', emoji: '🧮' },
  { value: 'typing', label: 'Escritura', emoji: '✍️' },
  { value: 'pattern', label: 'Patrón', emoji: '🔲' },
  { value: 'simon', label: 'Simon', emoji: '🧠' },
];

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function CreateAlarm() {
  const { addAlarm } = useAlarms();
  const navigate = useNavigate();

  const [time, setTime] = useState('07:00');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [label, setLabel] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medio');
  const [challengeType, setChallengeType] = useState<ChallengeType | 'random'>('random');
  const [sound, setSound] = useState<SoundType>('despertador');

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSave = () => {
    addAlarm({ time, days, label, difficulty, challengeType, sound, enabled: true });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={() => navigate('/')} className="p-2 -ml-2"><ArrowLeft size={20} /></button>
        <h1 className="text-lg font-display font-bold">Nueva alarma ⏰</h1>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Time picker */}
        <div className="text-center">
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="text-6xl font-display font-bold bg-transparent text-center w-full focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </div>

        {/* Days */}
        <div>
          <p className="text-sm font-bold mb-3">Días de la semana</p>
          <div className="flex gap-2 justify-center">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                  days.includes(i)
                    ? 'gradient-party text-foreground scale-110'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div>
          <p className="text-sm font-bold mb-2">Etiqueta</p>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="¡LEVÁNTATE YA! 🏃‍♂️"
            className="w-full p-3 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Difficulty */}
        <div>
          <p className="text-sm font-bold mb-3">Dificultad</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map(d => {
              const cfg = DIFFICULTY_CONFIG[d];
              return (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    difficulty === d
                      ? 'border-primary bg-primary/10 scale-[1.02]'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="text-lg">{cfg.emoji}</span>
                  <p className="text-sm font-bold mt-1">{cfg.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Challenge type */}
        <div>
          <p className="text-sm font-bold mb-3">Tipo de desafío</p>
          <div className="flex flex-wrap gap-2">
            {CHALLENGE_OPTIONS.map(c => (
              <button
                key={c.value}
                onClick={() => setChallengeType(c.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  challengeType === c.value
                    ? 'gradient-party text-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <div>
          <p className="text-sm font-bold mb-3">Sonido</p>
          <div className="flex flex-wrap gap-2">
            {SOUND_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => setSound(s.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sound === s.value
                    ? 'gradient-party text-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          className="w-full gradient-party text-foreground font-bold text-lg py-6 rounded-2xl"
        >
          Guardar alarma 💾
        </Button>
      </div>
    </div>
  );
}
