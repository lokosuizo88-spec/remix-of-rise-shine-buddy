export type DifficultyLevel = 'suave' | 'medio' | 'bestia' | 'imposible';

export type ChallengeType = 'math' | 'simon' | 'typing' | 'pattern' | 'random';

export interface Alarm {
  id: string;
  time: string; // HH:mm
  days: number[]; // 0=Sun, 1=Mon...6=Sat
  enabled: boolean;
  label: string;
  difficulty: DifficultyLevel;
  challengeType: ChallengeType;
  sound: string;
}

export interface AlarmState {
  isRinging: boolean;
  alarmId: string | null;
  currentDifficulty: DifficultyLevel;
  escapedCount: number;
  challengeIndex: number;
  totalChallenges: number;
  startedAt: number | null;
}

export interface AlarmStats {
  streak: number;
  totalAlarms: number;
  avgTimeToDisable: number; // seconds
  lastWakeUp: string | null;
  weeklyTimes: number[]; // seconds per day, last 7 days
}

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  label: string;
  emoji: string;
  color: string;
  mathRange: [number, number];
  simonLength: number;
  typingLength: number;
  challengeCount: number;
}> = {
  suave: {
    label: 'Suave',
    emoji: '😴',
    color: 'hsl(150 70% 50%)',
    mathRange: [1, 20],
    simonLength: 4,
    typingLength: 3,
    challengeCount: 1,
  },
  medio: {
    label: 'Medio',
    emoji: '😤',
    color: 'hsl(45 95% 55%)',
    mathRange: [10, 50],
    simonLength: 5,
    typingLength: 5,
    challengeCount: 1,
  },
  bestia: {
    label: 'Bestia',
    emoji: '🔥',
    color: 'hsl(30 95% 60%)',
    mathRange: [20, 100],
    simonLength: 7,
    typingLength: 8,
    challengeCount: 3,
  },
  imposible: {
    label: 'Imposible',
    emoji: '💀',
    color: 'hsl(0 84% 60%)',
    mathRange: [50, 200],
    simonLength: 9,
    typingLength: 12,
    challengeCount: 5,
  },
};

export const MOTIVATIONAL_PHRASES = [
  "¡Hoy es tu día, campeón! 💪",
  "El mundo te necesita despierto 🌍",
  "Cada día que madrugas, tu yo del futuro te lo agradece 🚀",
  "¿Dormilón? Tú no, ¡tú eres un guerrero! ⚔️",
  "El café ya te espera ☕",
  "Los sueños se cumplen despierto 🌟",
  "Otro día más para conquistar 👑",
  "¡Arriba ese ánimo! El sol ya salió ☀️",
  "Tu cama no paga el alquiler 🏠",
  "Hoy puede ser el mejor día de tu vida... si te levantas 😏",
];

export const BURLESQUE_MESSAGES = [
  "¿Intentaste escapar? Ahora es más difícil 😈",
  "¡Ja! Pensabas que cerrar la app funcionaría... 🤡",
  "Nivel subido. Buena suerte, dormilón 💀",
  "¿Apagar el teléfono? Eso solo me hace más fuerte 👹",
  "La alarma SIEMPRE gana. SIEMPRE. 🏆",
  "¡Vuelves! Te echaba de menos... ahora sufre 😘",
];

export const VICTORY_MESSAGES = [
  "¡LO LOGRASTE! Eres oficialmente un ser humano funcional 🎉",
  "¡DESPIERTO! El mundo no estaba listo para tanta energía 💥",
  "¡VICTORIA! Tu cama llora de la envidia 😭🛏️",
  "¡BOOM! Toma eso, almohada 🥊",
  "¡Increíble! Has derrotado al sueño... por ahora 😎",
  "¡Campeón/a del despertar! Mereces un café doble ☕☕",
];

export const TYPING_PHRASES = [
  "El que madruga, Dios le ayuda y el café le abraza",
  "No hay almohada más cómoda que una conciencia tranquila de haberse levantado a tiempo",
  "Las oportunidades son como los amaneceres, si esperas demasiado te los pierdes",
  "El éxito pertenece a quienes se levantan temprano y trabajan duro",
  "Cada amanecer es una nueva oportunidad para cambiar tu vida",
  "Los campeones no se hacen en los gimnasios sino en algo que llevan muy dentro",
  "La disciplina es el puente entre las metas y los logros conseguidos",
  "No cuentes los días, haz que los días cuenten desde primera hora",
  "El futuro pertenece a aquellos que creen en la belleza de sus sueños despiertos",
  "La vida es demasiado corta para quedarse en la cama cuando hay mundo que conquistar",
];
