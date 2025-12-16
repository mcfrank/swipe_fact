export interface FactData {
  fact: string;
  domain: string;
  emoji: string;
  backgroundColor: string; // Tailwind class suggestion
  textColor?: string; // Optional text color for contrast
}

export enum AppState {
  START_SCREEN = 'START_SCREEN',
  LOADING = 'LOADING',
  SHOWING_FACT = 'SHOWING_FACT',
  EXIT = 'EXIT',
  ERROR = 'ERROR'
}

export enum FactMode {
  OBSERVATION = 'observation', // A new root fact (e.g., "Sky is blue")
  EXPLANATION = 'explanation'  // An explanation of the root (e.g., "Because of atmosphere")
}

export const DOMAINS = [
  'Space',
  'Animals',
  'Food',
  'Sports'
];

export const DOMAIN_CONFIG: Record<string, { emoji: string; color: string; hover: string; border: string }> = {
  'Space': { emoji: '🚀', color: 'bg-indigo-100', hover: 'hover:bg-indigo-200', border: 'border-indigo-300' },
  'Animals': { emoji: '🦁', color: 'bg-orange-100', hover: 'hover:bg-orange-200', border: 'border-orange-300' },
  'Food': { emoji: '🍔', color: 'bg-yellow-100', hover: 'hover:bg-yellow-200', border: 'border-yellow-300' },
  'Sports': { emoji: '⚽', color: 'bg-blue-100', hover: 'hover:bg-blue-200', border: 'border-blue-300' },
};