import { Link } from "@tanstack/react-router";
import {
  Brain,
  CalendarHeart,
  Droplets,
  Heart,
  Mic,
  Pill,
  Sparkles,
  Sun,
} from "lucide-react";

import { MoodSelector } from "@/components/ui/MoodSelector";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ReminderCard } from "@/components/ui/ReminderCard";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/hooks/use-i18n";
import { DEMO_USER } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";

const QUICK_ACTIONS = [
  { to: "/brain-gym", icon: Brain, labelKey: "brainGym", emoji: "🧠" },
  { to: "/my-day", icon: CalendarHeart, labelKey: "myDay", emoji: "🗓️" },
  { to: "/voice", icon: Mic, labelKey: "voice", emoji: "🎙️" },
  { to: "/ai-journey", icon: Sparkles, labelKey: "aiJourney", emoji: "✨" },
] as const;

function greetingKey(
  hour: number,
): "goodMorning" | "goodAfternoon" | "goodEvening" {
  if (hour < 12) return "goodMorning";
  if (hour < 17) return "goodAfternoon";
  return "goodEvening";
}

export function ElderlyHomePage() {
  const { t } = useI18n();
  const reminders = useAppStore((s) => s.reminders);
  const journey = useAppStore((s) => s.journey);

  const activeReminders = reminders.filter((r) => r.enabled);
  const medicine = activeReminders.find((r) => r.category === "medication");
  const hydration = activeReminders.find((r) =>
    r.title.toLowerCase().includes("water"),
  );
  const routine = activeReminders.slice(0, 4);

  const hour = new Date().getHours();
  const greeting = t(greetingKey(hour));
  const cognitiveScore = Math.min(
    100,
    Math.round(
      (journey.skillScores.Memory +
        journey.skillScores.Attention +
        journey.skillScores.Recognition) /
        3,
    ),
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="🌺"
        title={`${greeting}, ${DEMO_USER.name.split(" ")[0]} 👋`}
        subtitle={t("ashaSubtitle")}
      />

      {/* Today's cognitive activity */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("today")}
          value={`${journey.totalGames}`}
          icon={Brain}
          hint={t("totalGames")}
          tone="primary"
        />
        <StatCard
          label={t("streak")}
          value={`${journey.streak}`}
          icon={Sun}
          hint={t("weeklyActivity")}
          tone="warm"
        />
        <div className="flex items-center justify-center rounded-3xl bg-card p-5 shadow-subtle">
          <ProgressRing
            value={cognitiveScore}
            label={t("memory")}
            tone="success"
            size={104}
          />
        </div>
      </section>

      {/* Medicine + hydration reminders */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-subtle">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
            <Pill className="size-7 text-primary" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("medication")}
            </p>
            <p className="truncate text-xl font-bold">
              {medicine ? medicine.title : t("noReminders")}
            </p>
            {medicine ? (
              <p className="text-base text-muted-foreground">{medicine.time}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-subtle">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-3xl">
            <Droplets className="size-7 text-accent" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Hydration
            </p>
            <p className="truncate text-xl font-bold">
              {hydration ? hydration.title : "Drink water"}
            </p>
            <p className="text-base text-muted-foreground">
              {hydration ? hydration.time : "Every 2 hours"}
            </p>
          </div>
        </div>
      </section>

      {/* Mood check */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle md:p-8">
        <MoodSelector />
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {QUICK_ACTIONS.map(({ to, icon: Icon, labelKey, emoji }) => (
          <Link
            key={to}
            to={to}
            data-ocid={`elderly.quick.${to.replace("/", "")}`}
            className="flex flex-col items-center gap-3 rounded-3xl bg-card p-6 text-center shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <span className="text-3xl" aria-hidden="true">
              {emoji}
            </span>
            <Icon className="size-6 text-primary" aria-hidden="true" />
            <span className="font-display text-lg font-semibold">
              {t(labelKey)}
            </span>
          </Link>
        ))}
      </section>

      {/* Family & Memories entry point */}
      <section>
        <Link
          to="/social"
          data-ocid="elderly.family_link"
          className="group flex flex-col gap-4 rounded-3xl bg-gradient-warm p-6 text-accent-foreground shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px] sm:flex-row sm:items-center md:p-8"
        >
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-3xl">
            👨‍👩‍👧‍👦
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Family & Memories
            </h2>
            <p className="mt-1 text-lg opacity-90">
              Call your loved ones, share music, and revisit your favourite
              memories together.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/25 px-5 py-3 font-display text-lg font-semibold">
            <Heart className="size-5" aria-hidden="true" />
            Open
          </span>
        </Link>
      </section>

      {/* Daily routine */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">{t("myDay")}</h2>
          <Link
            to="/my-day"
            data-ocid="elderly.routine_link"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("myDay")}
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {routine.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      </section>

      {/* Reminder notifications */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">{t("reminders")}</h2>
        <div className="flex flex-col gap-3">
          {activeReminders.length === 0 ? (
            <p className="rounded-3xl bg-card p-6 text-center text-lg text-muted-foreground shadow-subtle">
              {t("noReminders")}
            </p>
          ) : (
            activeReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
