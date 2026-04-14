import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarms } from '@/hooks/useAlarms';
import { useAlarmSound } from '@/hooks/useAlarmSound';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { DifficultyLevel, ChallengeType } from '@/types/alarm';
import { MathChallenge } from '@/components/challenges/MathChallenge';
import { TypingChallenge } from '@/components/challenges/TypingChallenge';
import { PatternChallenge } from '@/components/challenges/PatternChallenge';
import { SimonChallenge } from '@/components/challenges/SimonChallenge';
import { Bell, Clock } from 'lucide-react';
import { scheduleSnooze } from '@/lib/nativeAlarms';
import { stopAllSounds } from '@/lib/alarmSounds';

const CHALLENGE_TYPES: ChallengeType[] = ['math', 'typing', 'pattern', 'simon'];

const ESCAPE_TAUNTS = [
  '¿Intentaste escapar? 😈',
  '¡No puedes huir! Ahora es más difícil 💀',
  '¡Pillado! Nivel subido 🔥',
  '¿Creías que ibas a poder? 🤣',
  'Error... ¡Ahora sufre! 👹',
];

function pickRandomChallenge(exclude?: ChallengeType): ChallengeType {
  const options = exclude ? CHALLENGE_TYPES.filter(t => t !== exclude) : CHALLENGE_TYPES;
  return options[Math.floor(Math.random() * options.length)];
}

export default function AlarmRinging() {
  const navigate = useNavigate();
  const { alarms, alarmState, setAlarmState, recordWakeup } = useAlarms();
  const [startTime] = useState(Date.now());
  const [challengeKey, setChallengeKey] = useState(0);
  const [escapeMessage, setEscapeMessage] = useState('');
  const [snoozed, setSnoozed] = useState(false);
  const [snoozeMinutes] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date());
  const lastChallengeRef = useRef<ChallengeType | undefined>(undefined);

  // Update clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Determine which alarm is ringing
  const ringingAlarm = useMemo(() => {
    const storedId = localStorage.getItem('wakeup_ringing_alarm_id');
    if (storedId) {
      const found = alarms.find(a => a.id === storedId);
      if (found) return found;
    }
    return alarms.find(a => a.enabled) || null;
  }, [alarms]);

  const currentDifficulty = alarmState.currentDifficulty;

  // Challenge type - properly handles random with no repeats
  const challengeType = useMemo(() => {
    if (ringingAlarm?.challengeType && ringingAlarm.challengeType !== 'random') {
      return ringingAlarm.challengeType;
    }
    const picked = pickRandomChallenge(lastChallengeRef.current);
    lastChallengeRef.current = picked;
    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeKey, ringingAlarm?.challengeType]);

  // Sound - plays continuously
  useAlarmSound({
    isPlaying: true,
    soundType: ringingAlarm?.sound || 'sirena',
  });

  // Anti-cheat
  const handleEscapeDetected = useCallback((newDifficulty: DifficultyLevel, escapeCount: number) => {
    setAlarmState(prev => ({
      ...prev,
      currentDifficulty: newDifficulty,
      escapedCount: escapeCount,
    }));
    setChallengeKey(k => k + 1);
    setEscapeMessage(ESCAPE_TAUNTS[Math.floor(Math.random() * ESCAPE_TAUNTS.length)]);
    setTimeout(() => setEscapeMessage(''), 3000);
  }, [setAlarmState]);

  useAntiCheat({
    isRinging: true,
    alarmState,
    onEscapeDetected: handleEscapeDetected,
  });

  // Set ringing state on mount, persist so anti-cheat detects app reopen
  useEffect(() => {
    setAlarmState(prev => ({
      ...prev,
      isRinging: true,
      currentDifficulty: ringingAlarm?.difficulty || prev.currentDifficulty,
    }));

    // Mark ringing in localStorage so if app is closed and reopened, we come back
    localStorage.setItem('wakeup_is_ringing', 'true');

    return () => {
      setAlarmState(prev => ({ ...prev, isRinging: false, escapedCount: 0 }));
      localStorage.removeItem('wakeup_is_ringing');
      localStorage.removeItem('wakeup_ringing_alarm_id');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = useCallback(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    recordWakeup(elapsed);
    setAlarmState(prev => ({ ...prev, isRinging: false }));
    localStorage.removeItem('wakeup_is_ringing');
    localStorage.removeItem('wakeup_ringing_alarm_id');
    navigate('/victory');
  }, [startTime, recordWakeup, setAlarmState, navigate]);

  const handleFail = useCallback(() => {
    // Challenge handles its own retry internally
  }, []);

  const handleSnooze = useCallback(() => {
    const alarmId = ringingAlarm?.id || 'unknown';
    stopAllSounds();
    scheduleSnooze(alarmId, snoozeMinutes);
    setAlarmState(prev => ({ ...prev, isRinging: false }));
    localStorage.removeItem('wakeup_is_ringing');
    setSnoozed(true);
    // Navigate home after brief delay
    setTimeout(() => navigate('/'), 1500);
  }, [ringingAlarm, snoozeMinutes, setAlarmState, navigate]);

  const ChallengeComponent = {
    math: MathChallenge,
    typing: TypingChallenge,
    pattern: PatternChallenge,
    simon: SimonChallenge,
  }[challengeType];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {/* Ringing bell */}
      <div className="mb-6 animate-alarm-ring">
        <div className="w-20 h-20 rounded-full gradient-party flex items-center justify-center">
          <Bell size={40} className="text-foreground" />
        </div>
      </div>

      {/* Time */}
      <h1 className="text-5xl font-display font-bold mb-2">
        {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </h1>

      {ringingAlarm?.label && (
        <p className="text-sm text-muted-foreground mb-4">{ringingAlarm.label}</p>
      )}

      {/* Escape warning */}
      {escapeMessage && (
        <div className="bg-destructive/20 border border-destructive/40 text-destructive rounded-xl px-4 py-2 mb-4 text-sm font-bold animate-shake">
          {escapeMessage}
        </div>
      )}

      {/* Escape counter */}
      {alarmState.escapedCount > 0 && (
        <p className="text-xs text-fun-pink mb-2">
          🚨 Intentos de escape: {alarmState.escapedCount} · Dificultad: {currentDifficulty.toUpperCase()}
        </p>
      )}

      {/* Difficulty badge */}
      <div className="mb-6">
        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
          Nivel: {currentDifficulty}
        </span>
      </div>

      {/* Snooze feedback */}
      {snoozed && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-bold animate-pulse">
          💤 Snooze: {snoozeMinutes} min...
        </div>
      )}

      {/* Challenge */}
      {!snoozed && (
        <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-lg">
          <ChallengeComponent
            key={challengeKey}
            difficulty={currentDifficulty}
            onComplete={handleComplete}
            onFail={handleFail}
          />
        </div>
      )}

      {/* Snooze button */}
      {!snoozed && alarmState.escapedCount === 0 && (
        <button
          onClick={handleSnooze}
          className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          <Clock size={16} />
          💤 Snooze ({snoozeMinutes} min)
        </button>
      )}
    </div>
  );
}
