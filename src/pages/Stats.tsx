import { useNavigate } from 'react-router-dom';
import { useAlarms } from '@/hooks/useAlarms';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const DAYS_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const Stats = () => {
  const navigate = useNavigate();
  const { stats } = useAlarms();
  const maxTime = Math.max(...stats.weeklyTimes, 1);

  return (
    <div className="min-h-screen pb-8">
      <div className="gradient-sunset p-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-foreground">Estadísticas 📊</h1>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-5 border border-border text-center">
            <p className="text-4xl font-display font-bold text-fun-orange">{stats.streak}</p>
            <p className="text-sm text-muted-foreground mt-1">🔥 Racha actual</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border text-center">
            <p className="text-4xl font-display font-bold text-fun-purple">{stats.totalAlarms}</p>
            <p className="text-sm text-muted-foreground mt-1">⏰ Alarmas apagadas</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border text-center">
            <p className="text-4xl font-display font-bold text-fun-green">{stats.avgTimeToDisable}s</p>
            <p className="text-sm text-muted-foreground mt-1">⚡ Tiempo medio</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border text-center">
            <p className="text-4xl font-display font-bold text-fun-blue">
              {stats.lastWakeUp ? new Date(stats.lastWakeUp).toLocaleDateString('es', { day: 'numeric', month: 'short' }) : '—'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">📅 Último despertar</p>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-display font-bold text-card-foreground mb-4">Última semana</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.weeklyTimes.map((time, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{time}s</span>
                <div
                  className="w-full rounded-t-lg gradient-party transition-all duration-500"
                  style={{ height: `${Math.max((time / maxTime) * 100, 4)}%` }}
                />
                <span className="text-xs text-muted-foreground">{DAYS_LABELS[(new Date().getDay() - 6 + i + 7) % 7]}</span>
              </div>
            ))}
          </div>
        </div>

        {stats.totalAlarms === 0 && (
          <div className="text-center py-8">
            <p className="text-5xl mb-3">📊</p>
            <p className="text-muted-foreground font-body">Aún no hay datos</p>
            <p className="text-sm text-muted-foreground/60">¡Configura tu primera alarma!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
