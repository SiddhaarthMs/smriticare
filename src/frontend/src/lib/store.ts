import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_ACCESSIBILITY } from "./accessibility";
import { buildSkillProfile, recommendDifficulty } from "./adaptive-engine";
import { DEMO_REMINDERS } from "./demo-data";
import type {
  AIJourney,
  AccessibilitySettings,
  Difficulty,
  GameResult,
  Language,
  Mood,
  MoodEntry,
  Reminder,
  Role,
  SkillArea,
} from "./types";

const INITIAL_DIFFICULTIES: Record<SkillArea, Difficulty> = {
  Memory: 2,
  Attention: 2,
  Recognition: 2,
  RoutineRecall: 2,
  Engagement: 1,
};

const INITIAL_JOURNEY: AIJourney = {
  skillScores: {
    Memory: 0,
    Attention: 0,
    Recognition: 0,
    RoutineRecall: 0,
    Engagement: 0,
  },
  recommendedDifficulty: INITIAL_DIFFICULTIES,
  totalGames: 0,
  streak: 0,
  lastPlayed: null,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
};

interface AppState {
  role: Role;
  language: Language;
  accessibility: AccessibilitySettings;
  reminders: Reminder[];
  gameResults: GameResult[];
  journey: AIJourney;
  moodEntries: MoodEntry[];
  currentMood: Mood | null;
  selectedPackId: string | null;

  setRole: (role: Role) => void;
  setSelectedPack: (packId: string | null) => void;
  setLanguage: (language: Language) => void;
  setAccessibility: (settings: AccessibilitySettings) => void;
  updateAccessibility: (patch: Partial<AccessibilitySettings>) => void;
  addReminder: (reminder: Reminder) => void;
  toggleReminder: (id: string) => void;
  removeReminder: (id: string) => void;
  addGameResult: (result: GameResult) => void;
  markResultsSynced: (ids: string[]) => void;
  setMood: (mood: Mood) => void;
  resetJourney: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "guest",
      language: "en",
      accessibility: DEFAULT_ACCESSIBILITY,
      reminders: DEMO_REMINDERS,
      gameResults: [],
      journey: INITIAL_JOURNEY,
      moodEntries: [],
      currentMood: null,
      selectedPackId: "nature",

      setRole: (role) => set({ role }),

      setSelectedPack: (packId) => set({ selectedPackId: packId }),

      setLanguage: (language) => set({ language }),

      setAccessibility: (accessibility) => set({ accessibility }),

      updateAccessibility: (patch) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...patch },
        })),

      addReminder: (reminder) =>
        set((state) => ({ reminders: [...state.reminders, reminder] })),

      toggleReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r,
          ),
        })),

      removeReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),

      addGameResult: (result) =>
        set((state) => {
          const gameResults = [...state.gameResults, result];
          const journey = state.journey;
          const today = new Date().getDay();
          const weeklyActivity = [...journey.weeklyActivity];
          weeklyActivity[today] = (weeklyActivity[today] ?? 0) + 1;

          const skillArea = result.skillArea;
          const currentDifficulty = journey.recommendedDifficulty[skillArea];

          // Recompute the skill score for this area from recent results so the
          // elderly home cognitive score and caregiver Cognitive Engagement stat
          // reflect real game performance.
          const profile = buildSkillProfile(
            skillArea,
            gameResults,
            currentDifficulty,
          );
          const skillScores = {
            ...journey.skillScores,
            [skillArea]: profile.score,
          };

          // Recompute the recommended difficulty for this area so the next
          // activity's actual difficulty auto-adjusts to match the AI advice.
          const recommendation = recommendDifficulty(
            skillArea,
            gameResults,
            currentDifficulty,
          );
          const recommendedDifficulty = {
            ...journey.recommendedDifficulty,
            [skillArea]: recommendation.recommendedDifficulty,
          };

          return {
            gameResults,
            journey: {
              ...journey,
              skillScores,
              recommendedDifficulty,
              totalGames: journey.totalGames + 1,
              lastPlayed: result.timestamp,
              weeklyActivity,
            },
          };
        }),

      markResultsSynced: (ids) =>
        set((state) => ({
          gameResults: state.gameResults.map((g) =>
            ids.includes(g.id) ? { ...g, synced: true } : g,
          ),
        })),

      setMood: (mood) =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          const existing = state.moodEntries.find((m) => m.date === today);
          const moodEntries = existing
            ? state.moodEntries.map((m) =>
                m.date === today ? { ...m, mood } : m,
              )
            : [...state.moodEntries, { date: today, mood }];
          return { moodEntries, currentMood: mood };
        }),

      resetJourney: () => set({ journey: INITIAL_JOURNEY }),
    }),
    {
      name: "smriticare-store",
    },
  ),
);
