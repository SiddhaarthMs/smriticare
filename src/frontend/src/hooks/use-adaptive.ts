import { useMemo } from "react";
import {
  type DifficultyRecommendation,
  buildJourneyRecommendations,
  computeSkillScore,
} from "../lib/adaptive-engine";
import { useAppStore } from "../lib/store";
import type { GameResult, SkillArea } from "../lib/types";

export function useAdaptive() {
  const gameResults = useAppStore((s) => s.gameResults);
  const journey = useAppStore((s) => s.journey);

  const recommendations = useMemo<DifficultyRecommendation[]>(
    () =>
      buildJourneyRecommendations(gameResults, journey.recommendedDifficulty),
    [gameResults, journey.recommendedDifficulty],
  );

  const scoreFor = useMemo(
    () => (result: GameResult) => computeSkillScore(result),
    [],
  );

  const recommendationFor = useMemo(
    () => (area: SkillArea) =>
      recommendations.find((r) => r.skillArea === area),
    [recommendations],
  );

  return {
    recommendations,
    scoreFor,
    recommendationFor,
    totalGames: journey.totalGames,
    streak: journey.streak,
    weeklyActivity: journey.weeklyActivity,
  };
}
