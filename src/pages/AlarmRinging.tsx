import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarms } from '@/hooks/useAlarms';
import { useAlarmSound } from '@/hooks/useAlarmSound';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { DIFFICULTY_CONFIG, BURLESQUE_MESSAGES, ChallengeType, DifficultyLevel } from '@/types/alarm';
import { MathChallenge } from '@/components/challenges/MathChallenge';
import { SimonChallenge } from '@/components/challenges/SimonChallenge';
import { TypingChallenge } from '@/components/challenges/TypingChallenge';
import { PatternChallenge } from '@/components/challenges/PatternChallenge';

const CHALLENGE_TYPES: ChallengeType[] = ['math', 'simon', 'typing', 'pattern'];

const AlarmRinging = () => {
  const navigate = useNavigate();
  const { alarmState, alarms, dismissAlarm, setAlarmState } = useAlarms();
  const [failCount, setFailCount] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [currentChallengeType, setCurrentChallengeType] = useState<ChallengeType>('math');
  const [key, setKey] = useState(0);
  const [escapeMessage, setEscapeMessage] = useState<string | null>(null);

  const alarm = alarms.find(a => a.id === alarmState.alarmId);
  useAlarmSound(alarmState.isRinging, alarm?.sound);

  // Anti-cheat: detect escapes and bump difficulty
  const handleEscapeDetected = useCallback((newDifficulty: DifficultyLevel, escapeCount: number) => {
    setAlarmState(prev => ({
      ...prev,
      currentDifficulty: newDifficulty,
      escapedCount: escapeCount,
    }));
    setEscapeMessage(BURLESQUE_MESSAGES[Math.floor(Math.random() * BURLESQUE_MESSAGES.length)]);
    // Reset challenge progress as punishment
    setCompletedChallenges(0);
    setKey(k => k + 1);
  }, [setAlarmState]);

  useAntiCheat({
    isRinging: alarmState.isRinging,
    alarmState,
    onEscapeDetected: handleEscapeDetected,
  });

  const config = DIFFICULTY_CONFIG[alarmState.currentDifficulty];
  const totalNeeded = config.challengeCount;

  // Pick challenge type
  useEffect(() => {
    const type = alarm?.challengeType || 'random';
    if (type === 'random') {
      setCurrentChallengeType(CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)]);
    } else {
      setCurrentChallengeType(type);
    }
  }, [alarm, completedChallenges]);

  // Redirect if not ringing
  useEffect(() => {
    if (!alarmState.isRinging) navigate('/');
  }, [alarmState.isRinging, navigate]);

  const handleComplete = useCallback(() => {
    const next = completedChallenges + 1;
    if (next >= totalNeeded) {
      dismissAlarm();
      navigate('/victory');
    } else {
      setCompletedChallenges(next);
      setKey(k => k + 1);
      if (alarm?.challengeType === 'random' || totalNeeded > 1) {
        setCurrentChallengeType(CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)]);
      }
    }
  }, [completedChallenges, totalNeeded, dismissAlarm, navigate, alarm]);

  const handleFail = useCallback(() => {
    setFailCount(f => f + 1);
  }, []);

  const burlesqueMsg = escapeMessage || (alarmState.escapedCount > 0
    ? BURLESQUE_MESSAGES[Math.floor(Math.random() * BURLESQUE_MESSAGES.length)]
    : null);

  const ChallengeComponent = useMemo(() => {
    switch (currentChallengeType) {
      case 'math': return MathChallenge;
      case 'simon': return SimonChallenge;
      case 'typing': return TypingChallenge;
      case 'pattern': return PatternChallenge;
      default: return MathChallenge;
    }
  }, [currentChallengeType]);

  if (!alarmState.isRinging) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden select-none">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-fun-pink blur-3xl animate-bounce-soft" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-fun-purple blur-3xl animate-bounce-soft" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-fun-orange blur-3xl animate-bounce-soft" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6">
          <div className="text-6xl animate-alarm-ring mb-2">🔔</div>
          <h1 className="text-3xl font-display font-bold text-gradient-party">
            ¡DESPIERTA!
          </h1>
          {alarm && <p className="text-muted-foreground mt-1 font-body">{alarm.label}</p>}

          {burlesqueMsg && (
            <div className="mt-3 bg-destructive/20 border border-destructive/40 rounded-xl p-3 mx-4 animate-pulse">
              <p className="text-sm text-destructive font-bold">{burlesqueMsg}</p>
              {alarmState.escapedCount > 1 && (
                <p className="text-xs text-destructive/70 mt-1">
                  Intentos de escape: {alarmState.escapedCount} 🤡
                </p>
              )}
            </div>
          )}
        </div>

        {/* Difficulty badge */}
        <div className="flex justify-center gap-3 mb-2 px-6">
          <span className="bg-card border border-border rounded-full px-4 py-1.5 text-sm font-bold text-card-foreground">
            {config.emoji} Nivel: {config.label}
          </span>
          {totalNeeded > 1 && (
            <span className="bg-primary/20 border border-primary/40 rounded-full px-4 py-1.5 text-sm font-bold text-primary">
              {completedChallenges + 1}/{totalNeeded}
            </span>
          )}
        </div>

        {/* Challenge */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-card/80 backdrop-blur rounded-3xl border border-border shadow-2xl">
            <ChallengeComponent
              key={key}
              difficulty={alarmState.currentDifficulty}
              onComplete={handleComplete}
              onFail={handleFail}
            />
          </div>
        </div>

        {/* Fail counter */}
        {failCount > 0 && (
          <div className="text-center pb-8">
            <p className="text-sm text-fun-pink font-bold">
              ❌ Fallos: {failCount} {failCount >= 3 ? '(¡Espabila! 😤)' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmRinging;
