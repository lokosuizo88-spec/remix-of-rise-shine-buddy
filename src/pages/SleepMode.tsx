import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarms } from '@/hooks/useAlarms';
import { useWakeLock } from '@/hooks/useWakeLock';
import { DIFFICULTY_CONFIG } from '@/types/alarm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, BatteryCharging, Volume2, Shield } from 'lucide-react';

const SleepMode = () => {
  const navigate = useNavigate();
  const { alarms, alarmState, getNextAlarm } = useAlarms();
  const { isSupported: wakeLockSupported } = useWakeLock(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dimmed, setDimmed] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect to alarm when it rings
  useEffect(() => {
    if (alarmState.isRinging) navigate('/alarm');
  }, [alarmState.isRinging, navigate]);

  // Request notification permission as backup
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifGranted(p === 'granted'));
    } else {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, []);

  // Prevent accidental close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '¡La alarma no sonará si cierras la app!';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Keep audio context alive in background (silent pulse)
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let interval: number;
    try {
      ctx = new AudioContext();
      interval = window.setInterval(() => {
        if (ctx && ctx.state === 'running') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.value = 0.001; // inaudible
          osc.start();
          osc.stop(ctx.currentTime + 0.01);
        }
      }, 25000); // every 25s to prevent browser throttling
    } catch {
      // Audio context might fail in some environments
    }

    return () => {
      clearInterval(interval);
      ctx?.close();
    };
  }, []);

  const nextAlarm = getNextAlarm();
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');

  const getTimeUntilAlarm = useCallback(() => {
    if (!nextAlarm) return null;
    const [h, m] = nextAlarm.time.split(':').map(Number);
    const now = currentTime;
    let diff = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes());
    if (diff <= 0) diff += 1440;
    const dh = Math.floor(diff / 60);
    const dm = diff % 60;
    return dh > 0 ? `${dh}h ${dm}min` : `${dm}min`;
  }, [nextAlarm, currentTime]);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden cursor-pointer select-none"
      onClick={() => setDimmed(d => !d)}
      style={{
        filter: dimmed ? 'brightness(0.15)' : 'brightness(1)',
        transition: 'filter 0.5s ease',
      }}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-fun-purple/10 blur-[100px] animate-bounce-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-fun-blue/10 blur-[80px] animate-bounce-soft" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-6">
        {/* Back button - only visible when not dimmed */}
        <div className={`absolute top-6 left-6 transition-opacity ${dimmed ? 'opacity-0' : 'opacity-100'}`}>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Moon icon */}
        <Moon className="w-12 h-12 text-fun-purple/60 mb-6 animate-bounce-soft" />

        {/* Clock */}
        <div className="text-8xl font-display font-bold text-foreground tracking-tight">
          {hours}:{minutes}
        </div>

        {/* Next alarm info */}
        {nextAlarm ? (
          <div className="mt-6 text-center space-y-2">
            <p className="text-muted-foreground text-lg font-body">
              ⏰ Alarma a las <span className="text-foreground font-bold">{nextAlarm.time}</span>
            </p>
            <p className="text-muted-foreground/60 text-sm">
              Suena en {getTimeUntilAlarm()} · {DIFFICULTY_CONFIG[nextAlarm.difficulty].emoji} {DIFFICULTY_CONFIG[nextAlarm.difficulty].label}
            </p>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-fun-orange font-bold text-lg">⚠️ No hay alarmas activas</p>
            <p className="text-muted-foreground text-sm mt-1">Vuelve atrás y crea una</p>
          </div>
        )}

        {/* Status indicators */}
        <div className="mt-10 space-y-3 w-full max-w-xs">
          <div className="flex items-center gap-3 bg-card/50 rounded-xl px-4 py-2.5 border border-border/50">
            <Shield className="w-4 h-4 text-fun-green shrink-0" />
            <span className="text-sm text-muted-foreground">
              {wakeLockSupported ? '✅ Pantalla activa' : '⚠️ Wake Lock no soportado'}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-card/50 rounded-xl px-4 py-2.5 border border-border/50">
            <Volume2 className="w-4 h-4 text-fun-green shrink-0" />
            <span className="text-sm text-muted-foreground">✅ Audio listo</span>
          </div>
          <div className="flex items-center gap-3 bg-card/50 rounded-xl px-4 py-2.5 border border-border/50">
            <BatteryCharging className="w-4 h-4 text-fun-yellow shrink-0" />
            <span className="text-sm text-muted-foreground">💡 Conecta el cargador</span>
          </div>
        </div>

        {/* Tap hint */}
        <p className="mt-8 text-xs text-muted-foreground/40 animate-pulse">
          Toca la pantalla para {dimmed ? 'iluminar' : 'atenuar'}
        </p>
      </div>
    </div>
  );
};

export default SleepMode;
