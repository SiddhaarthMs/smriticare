import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Brain,
  Clock,
  Gauge,
  Minus,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { DemoBadge } from "@/components/ui/DemoBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatCard } from "@/components/ui/StatCard";
import { useAdaptive } from "@/hooks/use-adaptive";
import { useI18n } from "@/hooks/use-i18n";
import { buildSkillProfile } from "@/lib/adaptive-engine";
import { useAppStore } from "@/lib/store";
import type { SkillArea } from "@/lib/types";
import { cn } from "@/lib/utils";

const AREAS: SkillArea[] = [
  "Memory",
  "Attention",
  "Recognition",
  "RoutineRecall",
  "Engagement",
];

const AREA_LABEL: Record<
  SkillArea,
  "memory" | "attention" | "recognition" | "routineRecall" | "engagement"
> = {
  Memory: "memory",
  Attention: "attention",
  Recognition: "recognition",
  RoutineRecall: "routineRecall",
  Engagement: "engagement",
};

const DIRECTION_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  stay: Minus,
} as const;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface FlowStep {
  key: string;
  icon: typeof Activity;
  title: string;
  detail: string;
}

export function AIJourneyPage() {
  const { t } = useI18n();
  const {
    recommendations,
    recommendationFor,
    totalGames,
    streak,
    weeklyActivity,
  } = useAdaptive();
  const gameResults = useAppStore((s) => s.gameResults);
  const journey = useAppStore((s) => s.journey);

  const [selectedArea, setSelectedArea] = useState<SkillArea>("Memory");

  const chartData = weeklyActivity.map((value, i) => ({
    day: DAYS[i],
    games: value,
  }));

  const selectedRec = recommendationFor(selectedArea);
  const selectedProfile = useMemo(
    () =>
      buildSkillProfile(
        selectedArea,
        gameResults,
        journey.recommendedDifficulty[selectedArea],
      ),
    [selectedArea, gameResults, journey.recommendedDifficulty],
  );

  const avgAccuracy = useMemo(() => {
    if (selectedProfile.recentResults.length === 0) return 0;
    return Math.round(
      selectedProfile.recentResults.reduce((s, r) => s + r.accuracy, 0) /
        selectedProfile.recentResults.length,
    );
  }, [selectedProfile.recentResults]);

  const avgResponseTime = useMemo(() => {
    if (selectedProfile.recentResults.length === 0) return 0;
    return Math.round(
      selectedProfile.recentResults.reduce((s, r) => s + r.responseTimeMs, 0) /
        selectedProfile.recentResults.length,
    );
  }, [selectedProfile.recentResults]);

  const gamesPlayed = selectedProfile.recentResults.length;

  const flowSteps: FlowStep[] = [
    {
      key: "activity",
      icon: Activity,
      title: "User Activity",
      detail: `${gamesPlayed} ${gamesPlayed === 1 ? "game" : "games"} played in ${t(AREA_LABEL[selectedArea])}`,
    },
    {
      key: "performance",
      icon: Gauge,
      title: "Performance Data",
      detail: `${avgAccuracy}% accuracy · ${(avgResponseTime / 1000).toFixed(1)}s avg response`,
    },
    {
      key: "analysis",
      icon: Brain,
      title: "AI Analysis",
      detail: `Composite score ${selectedRec?.score ?? 0}%`,
    },
    {
      key: "recommendation",
      icon: TrendingUp,
      title: "Difficulty Recommendation",
      detail: `Level ${selectedRec?.currentDifficulty ?? 1} → Level ${selectedRec?.recommendedDifficulty ?? 1}`,
    },
    {
      key: "personalized",
      icon: Target,
      title: "Personalized Activity",
      detail: selectedRec?.reason ?? "No games played yet in this area.",
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="✨"
        title={t("aiJourney")}
        subtitle={t("prototypeNote")}
        action={<DemoBadge />}
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("totalGames")}
          value={String(totalGames)}
          icon={Activity}
          tone="primary"
        />
        <StatCard
          label={t("streak")}
          value={String(streak)}
          icon={TrendingUp}
          tone="warm"
        />
        <StatCard
          label={t("weeklyActivity")}
          value={String(weeklyActivity.reduce((a, b) => a + b, 0))}
          icon={Clock}
          tone="success"
        />
        <StatCard
          label={t("recommendedLevel")}
          value={String(
            recommendations.filter((r) => r.direction === "up").length,
          )}
          icon={Sparkles}
        />
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-subtle">
        <h2 className="font-display text-2xl font-bold">
          {t("weeklyActivity")}
        </h2>
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Bar
                dataKey="games"
                fill="var(--chart-1)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl font-bold">
            {t("recommendedLevel")}
          </h2>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
            AI-powered adaptive recommendation — {t("prototypeLogic")}
          </span>
        </div>

        {AREAS.map((area) => {
          const rec = recommendationFor(area);
          if (!rec) return null;
          const Icon = DIRECTION_ICON[rec.direction];
          const isSelected = selectedArea === area;
          return (
            <div
              key={area}
              data-ocid={`aijourney.area.${area}`}
              className={cn(
                "flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-subtle transition-all duration-300 sm:flex-row sm:items-center",
                isSelected && "ring-2 ring-primary/40",
              )}
            >
              <ProgressRing
                value={rec.score}
                size={88}
                strokeWidth={9}
                label={t(AREA_LABEL[area])}
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-bold">
                    {t(AREA_LABEL[area])}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                    {t("level")} {rec.recommendedDifficulty}
                  </span>
                </div>
                <p className="mt-1 text-base text-muted-foreground">
                  {t("whyRecommendation")}: {rec.reason}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                  {t("level")} {rec.currentDifficulty}
                  <ArrowRight className="size-4" aria-hidden="true" />
                  {t("level")} {rec.recommendedDifficulty}
                </span>
                <button
                  type="button"
                  data-ocid={`aijourney.area.${area}.explain_button`}
                  onClick={() => setSelectedArea(area)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  How it adapts
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <section
        data-ocid="aijourney.explainability"
        className="rounded-3xl bg-card p-6 shadow-subtle"
      >
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold">
            How SmritiCare Adapts
          </h2>
          <p className="text-base text-muted-foreground">
            Follow how your activity becomes a personalized recommendation.
            Select a skill area to explore its journey.
          </p>
        </div>

        <fieldset className="mt-5">
          <legend className="sr-only">Select a skill area</legend>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((area) => (
              <button
                key={area}
                type="button"
                data-ocid={`aijourney.explainability.skill.${area}`}
                onClick={() => setSelectedArea(area)}
                aria-pressed={selectedArea === area}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  selectedArea === area
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {t(AREA_LABEL[area])}
              </button>
            ))}
          </div>
        </fieldset>

        <ol className="mt-6 grid gap-3 md:grid-cols-5">
          {flowSteps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <li
                key={step.key}
                data-ocid={`aijourney.explainability.step.${index + 1}`}
                className="relative flex flex-col gap-3 rounded-2xl bg-muted/60 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <StepIcon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
                {index < flowSteps.length - 1 ? (
                  <ArrowRight
                    className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-muted-foreground md:block"
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 rounded-2xl border border-border bg-background p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden="true" />
            <h3 className="font-display text-lg font-bold">
              Why this recommendation?
            </h3>
          </div>
          <p className="mt-2 text-base text-foreground">
            {selectedRec?.reason ??
              "No games played yet in this area. We'll start at the current level and adjust as you play."}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            AI-powered adaptive recommendation — {t("prototypeLogic")}. This is
            not a clinical diagnosis.
          </p>
        </div>
      </section>
    </div>
  );
}
