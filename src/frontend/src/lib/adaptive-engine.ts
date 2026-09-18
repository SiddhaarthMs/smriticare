import type { Difficulty, GameResult, SkillArea } from "./types";

export interface DifficultyRecommendation {
  skillArea: SkillArea;
  currentDifficulty: Difficulty;
  recommendedDifficulty: Difficulty;
  score: number; // 0-100 composite
  reason: string;
  direction: "up" | "down" | "stay";
}

export interface SkillProfile {
  score: number;
  currentDifficulty: Difficulty;
  recentResults: GameResult[];
}

/**
 * Prototype adaptive engine.
 *
 * This is algorithmic prototype logic, NOT a clinical assessment. It combines
 * accuracy, response time, attempts, and completion into a composite score and
 * nudges difficulty up or down within a safe band.
 */
export function computeSkillScore(result: GameResult): number {
  const accuracyWeight = 0.5;
  const completionWeight = 0.2;
  const timeWeight = 0.2;
  const attemptsWeight = 0.1;

  // Response time: faster is better, capped at 30s for a floor of 0.
  const timeScore = Math.max(0, 100 - (result.responseTimeMs / 30000) * 100);
  // Attempts: fewer is better, capped at 10 attempts.
  const attemptsScore = Math.max(0, 100 - (result.attempts / 10) * 100);

  const score =
    result.accuracy * accuracyWeight +
    result.completion * completionWeight +
    timeScore * timeWeight +
    attemptsScore * attemptsWeight;

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function buildSkillProfile(
  skillArea: SkillArea,
  results: GameResult[],
  currentDifficulty: Difficulty,
): SkillProfile {
  const recent = results
    .filter((r) => r.skillArea === skillArea)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  if (recent.length === 0) {
    return { score: 0, currentDifficulty, recentResults: [] };
  }

  const avgScore =
    recent.reduce((sum, r) => sum + computeSkillScore(r), 0) / recent.length;

  return {
    score: Math.round(avgScore),
    currentDifficulty,
    recentResults: recent,
  };
}

export function recommendDifficulty(
  skillArea: SkillArea,
  results: GameResult[],
  currentDifficulty: Difficulty,
): DifficultyRecommendation {
  const profile = buildSkillProfile(skillArea, results, currentDifficulty);

  if (profile.recentResults.length === 0) {
    return {
      skillArea,
      currentDifficulty,
      recommendedDifficulty: currentDifficulty,
      score: 0,
      reason:
        "No games played yet in this area. We'll start at the current level and adjust as you play.",
      direction: "stay",
    };
  }

  const { score } = profile;
  let recommended: Difficulty = currentDifficulty;
  let direction: "up" | "down" | "stay" = "stay";
  let reason = "";

  if (score >= 85 && currentDifficulty < 5) {
    recommended = (currentDifficulty + 1) as Difficulty;
    direction = "up";
    reason = `Your average score of ${score}% is excellent. You're ready for a slightly more challenging level.`;
  } else if (score >= 70 && score < 85) {
    direction = "stay";
    reason = `Your average score of ${score}% is good. Staying at this level keeps you comfortably challenged.`;
  } else if (score >= 50 && score < 70) {
    direction = "stay";
    reason = `Your average score of ${score}% shows steady progress. A little more practice at this level will help.`;
  } else if (score < 50 && currentDifficulty > 1) {
    recommended = (currentDifficulty - 1) as Difficulty;
    direction = "down";
    reason = `Your average score of ${score}% suggests this level is a bit hard right now. Let's ease back one step to build confidence.`;
  } else {
    direction = "stay";
    reason = `Your average score of ${score}% is a starting point. Keep playing and we'll find the right level for you.`;
  }

  return {
    skillArea,
    currentDifficulty,
    recommendedDifficulty: recommended,
    score,
    reason,
    direction,
  };
}

export function buildJourneyRecommendations(
  results: GameResult[],
  currentDifficulties: Record<SkillArea, Difficulty>,
): DifficultyRecommendation[] {
  const areas: SkillArea[] = [
    "Memory",
    "Attention",
    "Recognition",
    "RoutineRecall",
    "Engagement",
  ];
  return areas.map((area) =>
    recommendDifficulty(area, results, currentDifficulties[area]),
  );
}
