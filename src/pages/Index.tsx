import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlarms } from '@/hooks/useAlarms';
import { MOTIVATIONAL_PHRASES, DIFFICULTY_CONFIG } from '@/types/alarm';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Clock, TrendingUp, Bell, Moon } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { alarms, alarmState, stats, toggleAlarm, deleteAlarm, getNextAlarm } = useAlarms();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [phrase] = useState(() =>
    MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (alarmState.isRinging) navigate('/alarm');
  }, [alarmState.isRinging, navigate]);

  const nextAlarm = getNextAlarm();
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <div className="gradient-party p-6 pb-12 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">WakeUp! 🔔</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/stats')}
            className="text-foreground/80 hover:text-foreground"
          >
            <TrendingUp className="w-5 h-5" />
          </Button>
        </div>

        {/* Clock */}
        <div className="text-center py-4">
          <div className="text-7xl font-display font-bold tracking-tight text-foreground">
            {hours}:{minutes}
          </div>
          <div className="text-2xl font-display text-foreground/60 mt-1">{seconds}</div>
        </div>

        {/* Next alarm */}
        {nextAlarm && (
          <div className="flex items-center justify-center gap-2 mt-2 bg-background/20 rounded-full px-4 py-2 mx-auto w-fit">
            <Bell className="w-4 h-4 text-foreground/80" />
            <span className="text-sm text-foreground/80">
              Próxima: {nextAlarm.time} {DIFFICULTY_CONFIG[nextAlarm.difficulty].emoji}
            </span>
          </div>
        )}
      </div>

      {/* Motivational phrase */}
      <div className="px-6 -mt-6">
        <div className="bg-card rounded-2xl p-4 shadow-lg border border-border">
          <p className="text-center text-sm text-card-foreground font-body">{phrase}</p>
        </div>
      </div>

      {/* Stats mini */}
      {stats.streak > 0 && (
        <div className="px-6 mt-4">
          <div className="flex gap-3">
            <div className="flex-1 bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-2xl font-display font-bold text-fun-orange">{stats.streak}</p>
              <p className="text-xs text-muted-foreground">🔥 Racha</p>
            </div>
            <div className="flex-1 bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-2xl font-display font-bold text-fun-purple">{stats.totalAlarms}</p>
              <p className="text-xs text-muted-foreground">⏰ Total</p>
            </div>
            <div className="flex-1 bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-2xl font-display font-bold text-fun-green">{stats.avgTimeToDisable}s</p>
              <p className="text-xs text-muted-foreground">⚡ Media</p>
            </div>
          </div>
        </div>
      )}

      {/* Alarms list */}
      <div className="px-6 mt-6 flex-1">
        <h2 className="text-lg font-display font-bold text-foreground mb-3">Tus alarmas</h2>

        {alarms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">😴</p>
            <p className="text-muted-foreground font-body">No tienes alarmas todavía</p>
            <p className="text-sm text-muted-foreground/60">¡Crea una y empieza a despertar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alarms.map(alarm => (
              <div
                key={alarm.id}
                className={`bg-card rounded-2xl p-4 border border-border flex items-center gap-4 transition-opacity ${
                  alarm.enabled ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div className="flex-1" onClick={() => navigate(`/edit/${alarm.id}`)}>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-display font-bold text-card-foreground">
                      {alarm.time}
                    </span>
                    <span className="text-lg">{DIFFICULTY_CONFIG[alarm.difficulty].emoji}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{alarm.label}</p>
                  {alarm.days.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                        <span
                          key={i}
                          className={`text-xs w-5 h-5 rounded-full flex items-center justify-center ${
                            alarm.days.includes(i)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAlarm(alarm.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <Switch
                  checked={alarm.enabled}
                  onCheckedChange={() => toggleAlarm(alarm.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FABs */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        {alarms.some(a => a.enabled) && (
          <Button
            onClick={() => navigate('/sleep')}
            className="bg-card border border-border rounded-full w-14 h-14 shadow-xl p-0 hover:bg-card/80"
          >
            <Moon className="w-6 h-6 text-fun-purple" />
          </Button>
        )}
        <Button
          onClick={() => navigate('/create')}
          className="gradient-party rounded-full w-16 h-16 shadow-xl animate-pulse-glow p-0"
        >
          <Plus className="w-8 h-8 text-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
