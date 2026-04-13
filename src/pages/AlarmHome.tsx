import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarms, Alarm } from '@/hooks/useAlarms';
import { useAlarmMonitor } from '@/hooks/useAlarmMonitor';
import { Bell, Plus, Trash2, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const MOTIVATIONAL = [
  '¡Hoy va a ser un gran día! 🌟',
  'El mundo necesita tu energía 💪',
  '¡Arriba y brilla! ☀️',
  'Cada día es una aventura nueva 🚀',
  '¡Tú puedes con todo! 🔥',
  'Un café y a conquistar el mundo ☕',
];

function getNextAlarmText(alarms: Alarm[]): string | null {
  const enabled = alarms.filter(a => a.enabled);
  if (enabled.length === 0) return null;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  let closest: { alarm: Alarm; diff: number } | null = null;

  for (const a of enabled) {
    const [h, m] = a.time.split(':').map(Number);
    const alarmMins = h * 60 + m;
    let diff = alarmMins - nowMins;
    if (diff <= 0) diff += 1440;

    if (!closest || diff < closest.diff) {
      closest = { alarm: a, diff };
    }
  }

  if (!closest) return null;
  const hours = Math.floor(closest.diff / 60);
  const mins = closest.diff % 60;
  if (hours > 0) return `Próxima en ${hours}h ${mins}min`;
  return `Próxima en ${mins} min`;
}

export default function AlarmHome() {
  const { alarms, toggleAlarm, deleteAlarm, stats } = useAlarms();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [phrase] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  // Monitor alarms and auto-navigate to ringing when it's time
  useAlarmMonitor(alarms);

  // If app was closed while ringing, redirect back
  useEffect(() => {
    if (localStorage.getItem('wakeup_is_ringing') === 'true') {
      navigate('/alarm/ringing');
    }
  }, [navigate]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const nextAlarm = getNextAlarmText(alarms);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header with clock */}
      <div className="gradient-party px-6 pt-12 pb-8 text-center">
        <p className="text-sm opacity-80 mb-1">⏰ WakeUp!</p>
        <h1 className="text-6xl font-display font-bold tracking-tight">
          {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </h1>
        <p className="text-xs opacity-70 mt-1">
          {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        {nextAlarm && (
          <div className="mt-3 inline-flex items-center gap-1 bg-background/20 backdrop-blur rounded-full px-3 py-1 text-xs">
            <Clock size={12} /> {nextAlarm}
          </div>
        )}
      </div>

      {/* Motivational phrase */}
      <div className="px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground italic">{phrase}</p>
      </div>

      {/* Stats bar */}
      {stats.totalWakeups > 0 && (
        <div className="mx-6 mb-4 flex gap-3">
          <div className="flex-1 bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-2xl font-display font-bold text-fun-orange">🔥 {stats.streak}</p>
            <p className="text-[10px] text-muted-foreground">Racha</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-2xl font-display font-bold text-fun-blue">⏱ {stats.avgTimeToDisable}s</p>
            <p className="text-[10px] text-muted-foreground">Promedio</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-3 text-center border border-border">
            <p className="text-2xl font-display font-bold text-fun-green">✅ {stats.totalWakeups}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>
      )}

      {/* Alarm list */}
      <div className="flex-1 px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-bold">Mis alarmas</h2>
          <span className="text-xs text-muted-foreground">{alarms.length} alarma{alarms.length !== 1 ? 's' : ''}</span>
        </div>

        {alarms.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-muted-foreground/30 mb-4 animate-wiggle" />
            <p className="text-muted-foreground text-sm mb-2">No tienes alarmas</p>
            <p className="text-muted-foreground/60 text-xs">Pulsa + para crear tu primera alarma</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map(alarm => (
              <div
                key={alarm.id}
                onClick={() => navigate(`/alarm/edit/${alarm.id}`)}
                className={`bg-card rounded-2xl p-4 border border-border flex items-center gap-4 transition-opacity cursor-pointer active:scale-[0.98] ${!alarm.enabled ? 'opacity-50' : ''}`}
              >
                <div className="flex-1">
                  <p className="text-3xl font-display font-bold">{alarm.time}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alarm.label || 'Sin etiqueta'} · {alarm.difficulty}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {['D','L','M','X','J','V','S'].map((d, i) => (
                      <span
                        key={i}
                        className={`text-[9px] w-4 h-4 flex items-center justify-center rounded-full ${
                          alarm.days.includes(i) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground/40'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alarm.enabled}
                    onCheckedChange={(e) => {
                      e.valueOf(); // prevent navigation
                      toggleAlarm(alarm.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteAlarm(alarm.id); }}
                    className="p-2 text-destructive/60 hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/alarm/create')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-party shadow-lg flex items-center justify-center text-foreground active:scale-90 transition-transform z-50"
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </div>
  );
}
