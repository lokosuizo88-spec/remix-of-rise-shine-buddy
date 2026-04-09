export type DifficultyLevel = 'suave' | 'medio' | 'bestia' | 'imposible';

export type ChallengeType = 'math' | 'typing' | 'pattern' | 'simon';

export interface AlarmState {
  isRinging: boolean;
  currentDifficulty: DifficultyLevel;
  escapedCount: number;
  challengeType: ChallengeType;
}

export interface DifficultyConfig {
  mathRange: [number, number];
  simonLength: number;
  label: string;
  emoji: string;
}

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
  suave: {
    mathRange: [1, 20],
    simonLength: 3,
    label: 'Suave',
    emoji: '😊',
  },
  medio: {
    mathRange: [10, 50],
    simonLength: 5,
    label: 'Medio',
    emoji: '😤',
  },
  bestia: {
    mathRange: [20, 100],
    simonLength: 7,
    label: 'Bestia',
    emoji: '🔥',
  },
  imposible: {
    mathRange: [50, 200],
    simonLength: 9,
    label: 'Imposible',
    emoji: '💀',
  },
};

export const TYPING_PHRASES: string[] = [
  'El que madruga Dios le ayuda y el que no se queda dormido',
  'Buenos días mundo hoy es un gran día para conquistar el universo',
  'No hay nada imposible para una mente despierta y un corazón valiente',
  'La vida es demasiado corta para quedarse en la cama todo el día',
  'Levántate y brilla porque el mundo necesita tu energía positiva hoy',
  'Cada amanecer es una nueva oportunidad para ser mejor que ayer',
  'El éxito pertenece a los que se levantan temprano con determinación',
  'Despierta tu potencial y haz que este día cuente para siempre',
];
