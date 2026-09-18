export type Role = "elderly" | "caregiver" | "healthcare-worker" | "guest";

export type Language =
  | "en"
  | "hi"
  | "as"
  | "bn"
  | "mni"
  | "kha"
  | "lus"
  | "nag"
  | "brx"
  | "ne"
  | "grt"
  | "sat";

export type SkillArea =
  | "Memory"
  | "Attention"
  | "Recognition"
  | "RoutineRecall"
  | "Engagement";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type GameType =
  | "memory-match"
  | "pattern-memory"
  | "attention-focus"
  | "recognition"
  | "routine-recall"
  | "engagement"
  | "mood-check";

export type Mood = "happy" | "calm" | "okay" | "low" | "tired";

export interface GameResult {
  id: string;
  gameId: string;
  gameName: string;
  skillArea: SkillArea;
  difficulty: Difficulty;
  accuracy: number; // 0-100
  responseTimeMs: number;
  attempts: number;
  completion: number; // 0-100
  score: number;
  timestamp: number;
  synced: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // "HH:mm"
  days: string[];
  category: "medication" | "exercise" | "meal" | "social" | "other";
  icon: string;
  enabled: boolean;
}

export interface MemoryPack {
  id: string;
  title: string;
  description: string;
  category: string;
  items: string[];
  emoji: string;
}

export interface PackObject {
  emoji: string;
  name: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  skillArea: SkillArea;
  icon: string;
  color: string;
  difficulty: Difficulty;
  durationMin: number;
}

export interface CaregiverPatient {
  id: string;
  name: string;
  age: number;
  relationship: string;
  lastActive: string;
  mood: Mood;
  adherence: number; // 0-100
  gamesPlayed: number;
  streak: number;
}

export interface HealthcareWorkerState {
  id: string;
  region: string;
  patients: number;
  activeToday: number;
  avgAdherence: number;
  alerts: number;
  trend: number[];
}

export interface AccessibilitySettings {
  textSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  voiceAssistance: boolean;
  reduceAnimation: boolean;
  reminderVolume: number; // 0-100
}

export interface AIJourney {
  skillScores: Record<SkillArea, number>;
  recommendedDifficulty: Record<SkillArea, Difficulty>;
  totalGames: number;
  streak: number;
  lastPlayed: number | null;
  weeklyActivity: number[];
}

export interface MoodEntry {
  date: string;
  mood: Mood;
}

export interface ConnectionState {
  status: "connected" | "offline";
  pendingSync: number;
  syncing: boolean;
  lastSynced: number | null;
}

export interface NEState {
  id: string;
  name: string;
  capital: string;
  language: string;
  emoji: string;
  population: string;
  description: string;
}
