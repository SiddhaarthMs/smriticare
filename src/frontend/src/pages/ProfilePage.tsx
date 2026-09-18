import { Link } from "@tanstack/react-router";
import { Settings, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/hooks/use-i18n";
import { DEMO_USER } from "@/lib/demo-data";
import { LANGUAGES } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const FAMILIAR_MEMORIES = [
  {
    id: "nature",
    title: "Nature",
    emoji: "🌿",
    description: "Gardens, rivers, and the Brahmaputra",
  },
  {
    id: "tea-food",
    title: "Tea & food",
    emoji: "🍵",
    description: "Tea gardens and home recipes",
  },
  {
    id: "household",
    title: "Household objects",
    emoji: "🏺",
    description: "Everyday things from home",
  },
  {
    id: "crafts",
    title: "Traditional crafts",
    emoji: "🧵",
    description: "Weaving, pottery, and crafts",
  },
  {
    id: "music",
    title: "Music",
    emoji: "🎵",
    description: "Songs and folk melodies",
  },
  {
    id: "festivals",
    title: "Festivals",
    emoji: "🎉",
    description: "Bihu and celebrations",
  },
  {
    id: "family",
    title: "Family memories",
    emoji: "👨‍👩‍👧‍👦",
    description: "Loved ones and moments",
  },
  {
    id: "landscapes",
    title: "Regional landscapes",
    emoji: "🏔️",
    description: "Hills, valleys, and rivers",
  },
];

export function ProfilePage() {
  const { t, language, setLanguage } = useI18n();
  const accessibility = useAppStore((s) => s.accessibility);
  const journey = useAppStore((s) => s.journey);
  const selectedPackId = useAppStore((s) => s.selectedPackId);
  const setSelectedPack = useAppStore((s) => s.setSelectedPack);

  const togglePack = (id: string) =>
    setSelectedPack(selectedPackId === id ? null : id);

  const avgScore = Math.round(
    (journey.skillScores.Memory +
      journey.skillScores.Attention +
      journey.skillScores.Recognition +
      journey.skillScores.RoutineRecall +
      journey.skillScores.Engagement) /
      5,
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader emoji="👤" title={t("profile")} />

      {/* Profile card */}
      <section className="flex flex-col items-center gap-4 rounded-3xl bg-card p-8 text-center shadow-subtle">
        <span
          className="flex size-24 items-center justify-center rounded-full bg-gradient-warm text-5xl shadow-elevated"
          aria-hidden="true"
        >
          {DEMO_USER.avatarEmoji}
        </span>
        <div>
          <h2 className="font-display text-3xl font-bold">{DEMO_USER.name}</h2>
          <p className="text-lg text-muted-foreground">
            {DEMO_USER.age} · {DEMO_USER.location}
          </p>
        </div>
        <Link
          to="/settings"
          data-ocid="profile.settings_link"
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <Settings className="size-5" aria-hidden="true" />
          {t("settings")}
        </Link>
      </section>

      {/* AI journey summary */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">{t("aiJourney")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("totalGames")}
            value={`${journey.totalGames}`}
            icon={Sparkles}
            tone="primary"
          />
          <StatCard
            label={t("streak")}
            value={`${journey.streak}`}
            tone="warm"
          />
          <div className="flex items-center justify-center rounded-3xl bg-card p-5 shadow-subtle">
            <ProgressRing
              value={avgScore}
              label={t("memory")}
              tone="success"
              size={104}
            />
          </div>
        </div>
        <Link
          to="/ai-journey"
          data-ocid="profile.ai_journey_link"
          className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-5 py-2.5 font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <Sparkles className="size-5" aria-hidden="true" />
          {t("aiJourney")}
        </Link>
      </section>

      {/* Familiar Memories */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">{t("memoryPacks")}</h2>
        <p className="text-base text-muted-foreground">
          Choose the memories you would like to revisit in your games.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {FAMILIAR_MEMORIES.map((pack) => {
            const isSelected = selectedPackId === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                data-ocid={`profile.pack.${pack.id}`}
                aria-pressed={isSelected}
                onClick={() => togglePack(pack.id)}
                className={cn(
                  "flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-subtle"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <span
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl"
                  aria-hidden="true"
                >
                  {pack.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold">{pack.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {pack.description}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {isSelected ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Language */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">{t("language")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                data-ocid={`profile.language.${lang.code}`}
                aria-pressed={isSelected}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "flex items-center justify-between rounded-3xl border-2 p-5 text-left transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-subtle"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">{lang.label}</span>
                  <span className="text-base text-muted-foreground">
                    {lang.native}
                  </span>
                </div>
                {isSelected ? (
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Accessibility */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle">
        <h2 className="font-display text-2xl font-bold">
          {t("accessibility")}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("increaseTextSize")}
            </p>
            <p className="mt-1 text-lg font-semibold capitalize">
              {accessibility.textSize}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("highContrast")}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {accessibility.highContrast ? "On" : "Off"}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("voiceAssistance")}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {accessibility.voiceAssistance ? "On" : "Off"}
            </p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("reduceAnimation")}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {accessibility.reduceAnimation ? "On" : "Off"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
