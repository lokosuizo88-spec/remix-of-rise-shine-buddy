import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarms } from '@/hooks/useAlarms';
import { DifficultyLevel, ChallengeType, DIFFICULTY_CONFIG } from '@/types/alarm';
import { ALARM_SOUNDS, AlarmSoundId } from '@/lib/alarmSounds';
import { previewAlarmSound } from '@/hooks/useAlarmSound';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Volume2 } from 'lucide-react';

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const CHALLENGE_TYPES: { value: ChallengeType; label: string; emoji: string }[] = [
  { value: 'random', label: 'Aleatorio', emoji: '🎲' },
  { value: 'math', label: 'Matemáticas', emoji: '🧮' },
  { value: 'simon', label: 'Simon', emoji: '🧠' },
  { value: 'typing', label: 'Escribir', emoji: '✍️' },
  { value: 'pattern', label: 'Patrón', emoji: '✨' },
];

const CreateAlarm = () => {
  const navigate = useNavigate();
  const { addAlarm } = useAlarms();

  const [time, setTime] = useState('07:00');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medio');
  const [challengeType, setChallengeType] = useState<ChallengeType>('random');
  const [sound, setSound] = useState<AlarmSoundId>('default');
  const [label, setLabel] = useState('¡LEVÁNTATE YA! 🏃‍♂️');
  const stopPreviewRef = useRef<(() => void) | null>(null);

  const handlePreview = (id: AlarmSoundId) => {
    stopPreviewRef.current?.();
    stopPreviewRef.current = previewAlarmSound(id);
  };

  const toggleDay = (day: number) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSave = () => {
    addAlarm({ time, days, difficulty, challengeType, label, enabled: true, sound });
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="gradient-sunset p-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-foreground">Nueva alarma ⏰</h1>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Time picker */}
        <div className="bg-card rounded-2xl p-6 border border-border text-center">
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="text-6xl font-display font-bold bg-transparent text-card-foreground text-center w-full outline-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </div>

        {/* Days */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-3 font-body">Días de la semana</p>
          <div className="flex justify-between">
            {DAYS.map((day, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                  days.includes(i)
                    ? 'gradient-party text-foreground scale-110'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-3 font-body">Nivel de dificultad</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(DIFFICULTY_CONFIG) as [DifficultyLevel, typeof DIFFICULTY_CONFIG[DifficultyLevel]][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    difficulty === key
                      ? 'border-primary bg-primary/20 scale-105'
                      : 'border-transparent bg-muted'
                  }`}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <p className="text-sm font-bold text-card-foreground mt-1">{config.label}</p>
                </button>
              )
            )}
          </div>
        </div>

        {/* Challenge type */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-3 font-body">Tipo de desafío</p>
          <div className="flex flex-wrap gap-2">
            {CHALLENGE_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setChallengeType(ct.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  challengeType === ct.value
                    ? 'gradient-party text-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {ct.emoji} {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound selector */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-3 font-body">Sonido de alarma</p>
          <div className="grid grid-cols-2 gap-2">
            {ALARM_SOUNDS.map(s => (
              <button
                key={s.id}
                onClick={() => { setSound(s.id); handlePreview(s.id); }}
                className={`p-3 rounded-xl text-left transition-all border-2 flex items-center gap-2 ${
                  sound === s.id
                    ? 'border-primary bg-primary/20 scale-105'
                    : 'border-transparent bg-muted'
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-card-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.description}</p>
                </div>
                {sound === s.id && <Volume2 className="w-4 h-4 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-3 font-body">Etiqueta</p>
          <Input
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="bg-muted border-primary/30 text-card-foreground"
            placeholder="Ej: ¡A trabajar!"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          className="w-full gradient-party text-foreground font-display font-bold text-lg h-14 rounded-2xl"
        >
          Guardar alarma 🔔
        </Button>
      </div>
    </div>
  );
};

export default CreateAlarm;
