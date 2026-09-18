import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Trophy } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { useAdaptive } from "@/hooks/use-adaptive";
import { useI18n } from "@/hooks/use-i18n";
import { DEMO_GAMES } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";
import type { SkillArea } from "@/lib/types";

const SKILL_LABEL: Record<
  SkillArea,
  "memory" | "attention" | "recognition" | "routineRecall" | "engagement"
> = {
  Memory: "memory",
  Attention: "attention",
  Recognition: "recognition",
  RoutineRecall: "routineRecall",
  Engagement: "engagement",
};

export function BrainGymPage() {
  const { t } = useI18n();
  const gameResults = useAppStore((s) => s.gameResults);
  const { recommendationFor } = useAdaptive();

  const bestScoreFor = (gameId: string): number | null => {
    const scores = gameResults
      .filter((r) => r.gameId === gameId)
      .map((r) => r.score);
    return scores.length > 0 ? Math.max(...scores) : null;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="🧠"
        title={t("brainGym")}
        subtitle={t("prototypeNote")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {DEMO_GAMES.map((game) => {
          const recommendation = recommendationFor(game.skillArea);
          const recommended =
            recommendation?.recommendedDifficulty ?? game.difficulty;
          const best = bestScoreFor(game.id);
          return (
            <Link
              key={game.id}
              to="/games/$gameId"
              params={{ gameId: game.id }}
              data-ocid={`braingym.game.${game.id}`}
              className="group flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl"
                  aria-hidden="true"
                >
                  {game.icon}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
                  <Clock className="size-4" aria-hidden="true" />
                  {game.durationMin} min
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-2xl font-bold">{game.name}</h2>
                <p className="text-base text-muted-foreground">
                  {game.description}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3">
                <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-foreground">
                  {t(SKILL_LABEL[game.skillArea])} · {t("level")} {recommended}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  {t("play")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
              {best !== null ? (
                <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                  <Trophy className="size-4" aria-hidden="true" />
                  {t("score")}: {best}
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
