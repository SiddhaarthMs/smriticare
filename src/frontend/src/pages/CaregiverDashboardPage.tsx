import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Brain,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Gamepad2,
  HeartPulse,
  History,
  Phone,
  Settings,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartEmptyState,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAdaptive } from "@/hooks/use-adaptive";
import { useI18n } from "@/hooks/use-i18n";
import { DEMO_CAREGIVER_PATIENTS, DEMO_REMINDERS } from "@/lib/demo-data";
import { useAppStore } from "@/lib/store";
import type { Mood } from "@/lib/types";
import { chartColor, cn } from "@/lib/utils";

const MOOD_EMOJI: Record<Mood, string> = {
  happy: "😊",
  calm: "😌",
  okay: "🙂",
  low: "😔",
  tired: "😴",
};

const MOOD_SCORE: Record<Mood, number> = {
  happy: 5,
  calm: 4,
  okay: 3,
  low: 2,
  tired: 1,
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SKELETON_BARS = [
  { id: "skeleton-bar-1", height: 45 },
  { id: "skeleton-bar-2", height: 70 },
  { id: "skeleton-bar-3", height: 55 },
  { id: "skeleton-bar-4", height: 85 },
  { id: "skeleton-bar-5", height: 60 },
  { id: "skeleton-bar-6", height: 75 },
  { id: "skeleton-bar-7", height: 50 },
];

const DEMO_ENGAGEMENT = [62, 65, 68, 66, 71, 73, 74];
const DEMO_MOOD = [3, 4, 4, 3, 4, 5, 4];

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "patients", label: "Patients", icon: Users },
  { id: "activity", label: "Activity", icon: ClipboardList },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "routine", label: "Routine", icon: CalendarClock },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "reports", label: "Reports", icon: Brain },
  { id: "settings", label: "Settings", icon: Settings },
];

interface AlertAction {
  label: string;
  message: string;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  tone: "warning" | "success";
  actions: AlertAction[];
}

const ALERTS: AlertItem[] = [
  {
    id: "alert-missed",
    title: "3 consecutive activities missed",
    description:
      "Asha has not completed her daily activities for the last 3 days. A gentle nudge may help.",
    tone: "warning",
    actions: [
      {
        label: "View History",
        message: "Showing Asha's activity history for the last 7 days.",
      },
      {
        label: "Send Reminder",
        message: "A gentle reminder has been sent to Asha's device.",
      },
      {
        label: "Call Caregiver",
        message: "Calling the assigned caregiver for Asha Devi…",
      },
    ],
  },
  {
    id: "alert-medicine",
    title: "Medicine reminder completed",
    description:
      "Asha confirmed taking her morning medicine at 08:05 today. Great adherence.",
    tone: "success",
    actions: [
      {
        label: "View History",
        message: "Showing Asha's medicine adherence history.",
      },
    ],
  },
  {
    id: "alert-engagement",
    title: "Weekly engagement increased",
    description:
      "Cognitive engagement rose from 71% to 78% this week. Keep up the good momentum.",
    tone: "success",
    actions: [
      {
        label: "View History",
        message: "Showing Asha's weekly engagement trend.",
      },
    ],
  },
  {
    id: "alert-noactivity",
    title: "No activity today",
    description:
      "Asha has not played any games or completed activities so far today.",
    tone: "warning",
    actions: [
      {
        label: "Send Reminder",
        message: "A gentle reminder has been sent to Asha's device.",
      },
      {
        label: "Call Caregiver",
        message: "Calling the assigned caregiver for Asha Devi…",
      },
    ],
  },
];

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Activity;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {title}
        </h2>
      </div>
      {subtitle ? (
        <p className="text-base text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}

/**
 * Shared chart card: guarantees a resolved pixel height so the chart paints on
 * first load, and swaps in a loading or empty placeholder instead of a blank
 * box when there is nothing to draw.
 */
function ChartCard({
  title,
  description,
  height = 288,
  loading = false,
  empty = false,
  emptyMessage = "No data available yet.",
  controls,
  children,
  ocid,
}: {
  title: string;
  description: string;
  height?: number;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  controls?: React.ReactNode;
  children: React.ReactNode;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-subtle"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {controls ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {controls}
          </div>
        ) : null}
      </div>
      <div style={{ height }} className="w-full">
        {loading ? (
          <div
            data-ocid={`${ocid}.loading_state`}
            aria-busy="true"
            aria-live="polite"
            className="flex h-full w-full flex-col justify-end gap-2 rounded-2xl bg-muted/40 p-4"
          >
            <span className="sr-only">Preparing chart data…</span>
            <div className="flex h-full items-end gap-2">
              {SKELETON_BARS.map((bar) => (
                <div
                  key={bar.id}
                  className="flex-1 animate-pulse rounded-t-lg bg-muted"
                  style={{ height: `${bar.height}%` }}
                />
              ))}
            </div>
          </div>
        ) : empty ? (
          <ChartEmptyState
            data-ocid={`${ocid}.empty_state`}
            message={emptyMessage}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  ocid,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  ocid: string;
}) {
  return (
    <fieldset
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full bg-muted p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            data-ocid={`${ocid}.${option.value}`}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
              active
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}

const ACTIVITY_CONFIG = {
  games: { label: "Games played", color: chartColor(1) },
} satisfies ChartConfig;

const ENGAGEMENT_CONFIG = {
  engagement: { label: "Engagement %", color: chartColor(1) },
  accuracy: { label: "Accuracy %", color: chartColor(2) },
} satisfies ChartConfig;

const MOOD_CONFIG = {
  mood: { label: "Mood score", color: chartColor(2) },
} satisfies ChartConfig;

const ADHERENCE_CONFIG = {
  adherence: { label: "Adherence %", color: chartColor(3) },
} satisfies ChartConfig;

type ActivityView = "weekly" | "monthly";
type EngagementView = "engagement" | "accuracy";

/**
 * Interactive legend: each entry is a real button that toggles its series on
 * and off, so the legend is both a key and a control.
 */
function SeriesLegend({
  items,
  hidden,
  onToggle,
  ocid,
}: {
  items: { key: string; label: string; color: string }[];
  hidden: Record<string, boolean>;
  onToggle: (key: string) => void;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-wrap items-center justify-center gap-2 pt-3"
    >
      {items.map((item) => {
        const isHidden = Boolean(hidden[item.key]);
        return (
          <button
            key={item.key}
            type="button"
            data-ocid={`${ocid}.${item.key}`}
            aria-pressed={!isHidden}
            onClick={() => onToggle(item.key)}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
              isHidden
                ? "border-border text-muted-foreground line-through opacity-60"
                : "border-transparent bg-muted text-foreground",
            )}
          >
            <span
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function CaregiverDashboardPage() {
  const { t } = useI18n();
  const gameResults = useAppStore((s) => s.gameResults);
  const journey = useAppStore((s) => s.journey);
  const moodEntries = useAppStore((s) => s.moodEntries);
  const currentMood = useAppStore((s) => s.currentMood);
  const reminders = useAppStore((s) => s.reminders);
  const toggleReminder = useAppStore((s) => s.toggleReminder);
  const { recommendations, weeklyActivity, totalGames, streak } = useAdaptive();

  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [activityView, setActivityView] = useState<ActivityView>("weekly");
  const [engagementView, setEngagementView] =
    useState<EngagementView>("engagement");
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!confirmation) return;
    const id = window.setTimeout(() => setConfirmation(null), 4000);
    return () => window.clearTimeout(id);
  }, [confirmation]);

  const hasResults = gameResults.length > 0;

  const skillValues = Object.values(journey.skillScores);
  const cognitiveEngagement = hasResults
    ? Math.round(average(skillValues))
    : 78;

  const activitiesCompleted = hasResults
    ? Math.min(gameResults.length, 15)
    : 12;

  const averageSession = hasResults
    ? formatDuration(average(gameResults.map((r) => r.responseTimeMs)))
    : "8m 42s";

  const gameAccuracy = hasResults
    ? Math.round(average(gameResults.map((r) => r.accuracy)))
    : 84;

  const reminderCompletion = reminders.length
    ? Math.round(
        (reminders.filter((r) => r.enabled).length / reminders.length) * 100,
      )
    : 92;

  const mood = currentMood ?? "happy";

  const activityData = useMemo(() => {
    if (activityView === "weekly") {
      return weeklyActivity.map((value, i) => ({
        label: DAYS[i],
        games: value,
      }));
    }
    // Monthly view: aggregate the weekly buckets into four week blocks so the
    // toggle visibly re-renders the series.
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return weeks.map((label, i) => {
      const slice = weeklyActivity.slice(i * 2, i * 2 + 2);
      return { label, games: slice.reduce((a, b) => a + b, 0) };
    });
  }, [activityView, weeklyActivity]);

  const engagementData = useMemo(
    () =>
      DEMO_ENGAGEMENT.map((base, i) => {
        const dayResults = gameResults.filter(
          (r) => new Date(r.timestamp).getDay() === i,
        );
        const accuracy = dayResults.length
          ? Math.round(average(dayResults.map((r) => r.accuracy)))
          : base;
        return {
          label: DAYS[i],
          engagement: base,
          accuracy,
        };
      }),
    [gameResults],
  );

  const moodData = useMemo(
    () =>
      DEMO_MOOD.map((base, i) => {
        const entry = moodEntries.find((m) => new Date(m.date).getDay() === i);
        const value = entry ? MOOD_SCORE[entry.mood] : base;
        return { label: DAYS[i], mood: value };
      }),
    [moodEntries],
  );

  const adherenceData = useMemo(
    () =>
      DEMO_CAREGIVER_PATIENTS.map((patient) => ({
        label: patient.name.split(" ")[0],
        adherence: patient.adherence,
      })),
    [],
  );

  const routine = [...DEMO_REMINDERS].sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  const recentGames = [...gameResults]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  const showConfirmation = (message: string) => setConfirmation(message);

  const toggleSeries = (key: string) =>
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));

  const activityEmpty = activityData.every((d) => d.games === 0);
  const engagementEmpty = engagementData.length === 0;
  const moodEmpty = moodData.length === 0;
  const adherenceEmpty = adherenceData.length === 0;

  return (
    <div className="flex flex-col gap-10 animate-fade-in-up">
      <PageHeader
        emoji="🤝"
        title={t("caregiverDashboard")}
        subtitle="Asha Devi · 72 · Assamese · Demo data"
        action={
          <div className="flex items-center gap-2">
            <DemoBadge />
            <ConnectionBadge />
          </div>
        }
      />

      {/* In-page navigation */}
      <nav
        aria-label="Dashboard sections"
        className="sticky top-16 z-20 -mx-4 border-b bg-background/95 px-4 py-2 backdrop-blur md:top-0"
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              data-ocid={`caregiver.nav.${id}`}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* Overview */}
      <section
        id="overview"
        data-ocid="caregiver.section.overview"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={Activity}
          title="Overview"
          subtitle="A snapshot of Asha's cognitive health and daily engagement."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Cognitive Engagement"
            value={`${cognitiveEngagement}%`}
            icon={Brain}
            tone="primary"
            hint="Up 7% this week"
          />
          <StatCard
            label="Activities"
            value={`${activitiesCompleted}/15`}
            icon={Target}
            hint="Weekly target"
          />
          <StatCard
            label="Average Session"
            value={averageSession}
            icon={Clock}
            hint="Per game session"
          />
          <StatCard
            label="Game Accuracy"
            value={`${gameAccuracy}%`}
            icon={Gamepad2}
            tone="success"
            hint="Across all games"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-5 rounded-3xl bg-card p-6 shadow-subtle">
            <ProgressRing
              value={reminderCompletion}
              size={96}
              strokeWidth={10}
              label="Reminders"
              tone="success"
            />
            <div className="min-w-0">
              <h3 className="font-display text-xl font-bold">
                Reminder completion
              </h3>
              <p className="mt-1 text-base text-muted-foreground">
                {reminders.filter((r) => r.enabled).length} of{" "}
                {reminders.length} reminders active this week.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-3xl bg-card p-6 shadow-subtle">
            <span
              className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-5xl"
              aria-hidden="true"
            >
              {MOOD_EMOJI[mood]}
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-xl font-bold">Today's mood</h3>
              <p className="mt-1 text-base text-muted-foreground">
                Asha is feeling{" "}
                <span className="font-semibold text-foreground">{mood}</span>{" "}
                today.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {streak}-day streak · {totalGames} games played
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Patients */}
      <section
        id="patients"
        data-ocid="caregiver.section.patients"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={Users}
          title="Patients"
          subtitle="People you care for and their recent activity."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DEMO_CAREGIVER_PATIENTS.map((patient) => (
            <div
              key={patient.id}
              data-ocid={`caregiver.patient.${patient.id}`}
              className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-subtle"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-3xl"
                  aria-hidden="true"
                >
                  {MOOD_EMOJI[patient.mood]}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">
                    {patient.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} · {patient.relationship}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Adherence
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    {patient.adherence}%
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Games
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    {patient.gamesPlayed}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Streak
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    {patient.streak}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Last active: {patient.lastActive}
              </p>
            </div>
          ))}
        </div>

        <ChartCard
          ocid="caregiver.chart.adherence"
          title="Patient adherence comparison"
          description="Reminder adherence across the people in your care this week."
          height={260}
          empty={adherenceEmpty}
          emptyMessage="No patient adherence data to compare yet."
        >
          <ChartContainer config={ADHERENCE_CONFIG} className="h-full w-full">
            <BarChart data={adherenceData} margin={{ top: 8, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={34}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value) => `${value}% adherence`}
                  />
                }
              />
              <Bar
                dataKey="adherence"
                fill={chartColor(3)}
                radius={[8, 8, 0, 0]}
                animationDuration={600}
                hide={Boolean(hiddenSeries.adherence)}
              />
            </BarChart>
          </ChartContainer>
          <SeriesLegend
            ocid="caregiver.chart.adherence.legend"
            hidden={hiddenSeries}
            onToggle={toggleSeries}
            items={[
              {
                key: "adherence",
                label: "Adherence %",
                color: chartColor(3),
              },
            ]}
          />
        </ChartCard>
      </section>

      {/* Activity */}
      <section
        id="activity"
        data-ocid="caregiver.section.activity"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={ClipboardList}
          title="Activity"
          subtitle="Games completed per day over the last 7 days."
        />
        <ChartCard
          ocid="caregiver.chart.activity"
          title="Games completed"
          description="How many cognitive games Asha finished each day."
          height={288}
          empty={activityEmpty}
          emptyMessage="No games completed in this period yet. Activity will appear here once Asha plays."
          controls={
            <ToggleGroup
              label="Activity range"
              ocid="caregiver.chart.activity.view"
              value={activityView}
              onChange={setActivityView}
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
          }
        >
          <ChartContainer config={ACTIVITY_CONFIG} className="h-full w-full">
            <BarChart data={activityData} margin={{ top: 8, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value) => `${value} games`}
                  />
                }
              />
              <Bar
                dataKey="games"
                fill={chartColor(1)}
                radius={[8, 8, 0, 0]}
                animationDuration={600}
                hide={Boolean(hiddenSeries.games)}
              />
            </BarChart>
          </ChartContainer>
          <SeriesLegend
            ocid="caregiver.chart.activity.legend"
            hidden={hiddenSeries}
            onToggle={toggleSeries}
            items={[
              { key: "games", label: "Games played", color: chartColor(1) },
            ]}
          />
        </ChartCard>
      </section>

      {/* Games */}
      <section
        id="games"
        data-ocid="caregiver.section.games"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={Gamepad2}
          title="Games"
          subtitle="Recent game results and adaptive difficulty changes from Elderly Mode."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-3xl bg-card p-6 shadow-subtle">
            <h3 className="font-display text-xl font-bold">Recent results</h3>
            {recentGames.length === 0 ? (
              <div
                data-ocid="caregiver.games.empty_state"
                className="flex flex-col items-center gap-3 rounded-2xl bg-muted/50 p-8 text-center"
              >
                <Gamepad2
                  className="size-10 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-base text-muted-foreground">
                  No games played yet. Results from Elderly Mode will appear
                  here.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {recentGames.map((result) => (
                  <li
                    key={result.id}
                    data-ocid={`caregiver.game.${result.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {result.gameName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.skillArea} · Level {result.difficulty}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{result.accuracy}%</Badge>
                      <span className="font-display text-lg font-bold">
                        {result.score}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-3xl bg-card p-6 shadow-subtle">
            <h3 className="font-display text-xl font-bold">
              Adaptive difficulty
            </h3>
            <p className="text-sm text-muted-foreground">
              Recommended levels based on Asha's recent performance.
            </p>
            <ul className="flex flex-col gap-3">
              {recommendations.map((rec) => (
                <li
                  key={rec.skillArea}
                  data-ocid={`caregiver.difficulty.${rec.skillArea}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{rec.skillArea}</p>
                    <p className="text-sm text-muted-foreground">
                      Score {rec.score}%
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">L{rec.currentDifficulty}</Badge>
                    <ArrowRight
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Badge
                      variant={
                        rec.direction === "up"
                          ? "default"
                          : rec.direction === "down"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      L{rec.recommendedDifficulty}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Routine */}
      <section
        id="routine"
        data-ocid="caregiver.section.routine"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={CalendarClock}
          title="Routine"
          subtitle="Asha's daily schedule of activities and care."
        />
        <div className="rounded-3xl bg-card p-6 shadow-subtle">
          <ol className="flex flex-col gap-4">
            {routine.map((item) => (
              <li
                key={item.id}
                data-ocid={`caregiver.routine.${item.id}`}
                className="flex items-center gap-4"
              >
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.days.join(", ")}
                  </p>
                </div>
                <span className="shrink-0 font-display text-lg font-bold">
                  {item.time}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Reminders */}
      <section
        id="reminders"
        data-ocid="caregiver.section.reminders"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={Bell}
          title="Reminders"
          subtitle="Toggle which reminders are active for Asha."
        />
        <div className="rounded-3xl bg-card p-6 shadow-subtle">
          <ul className="flex flex-col gap-3">
            {reminders.map((reminder) => (
              <li
                key={reminder.id}
                data-ocid={`caregiver.reminder.${reminder.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl"
                    aria-hidden="true"
                  >
                    {reminder.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {reminder.time} · {reminder.category}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={reminder.enabled ? "default" : "outline"}
                  size="sm"
                  data-ocid={`caregiver.reminder.toggle.${reminder.id}`}
                  onClick={() => toggleReminder(reminder.id)}
                >
                  {reminder.enabled ? "Active" : "Paused"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Alerts */}
      <section
        id="alerts"
        data-ocid="caregiver.section.alerts"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={AlertTriangle}
          title="Alerts"
          subtitle="Important updates and actions for Asha's care."
        />
        <div className="flex flex-col gap-4">
          {ALERTS.map((alert) => (
            <div
              key={alert.id}
              data-ocid={`caregiver.alert.${alert.id}`}
              className={cn(
                "flex flex-col gap-4 rounded-3xl p-6 shadow-subtle",
                alert.tone === "warning" ? "bg-warning/10" : "bg-success/10",
              )}
            >
              <div className="flex items-start gap-3">
                {alert.tone === "warning" ? (
                  <AlertTriangle
                    className="mt-0.5 size-6 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    className="mt-0.5 size-6 shrink-0 text-success"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold">
                    {alert.title}
                  </h3>
                  <p className="mt-1 text-base text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pl-9">
                {alert.actions.map((action) => (
                  <Button
                    key={action.label}
                    type="button"
                    variant={
                      action.label === "Call Caregiver" ? "default" : "outline"
                    }
                    size="sm"
                    data-ocid={`caregiver.alert.action.${alert.id}.${action.label
                      .toLowerCase()
                      .replace(/\s+/g, "_")}`}
                    onClick={() => showConfirmation(action.message)}
                  >
                    {action.label === "View History" ? (
                      <History className="size-4" aria-hidden="true" />
                    ) : action.label === "Send Reminder" ? (
                      <Bell className="size-4" aria-hidden="true" />
                    ) : (
                      <Phone className="size-4" aria-hidden="true" />
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reports */}
      <section
        id="reports"
        data-ocid="caregiver.section.reports"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={Brain}
          title="Reports"
          subtitle="Engagement and mood trends over the last 7 days."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            ocid="caregiver.chart.engagement"
            title="Engagement trend"
            description="Cognitive engagement and game accuracy across the week."
            height={256}
            empty={engagementEmpty}
            emptyMessage="No engagement data recorded for this week yet."
            controls={
              <ToggleGroup
                label="Engagement metric"
                ocid="caregiver.chart.engagement.view"
                value={engagementView}
                onChange={setEngagementView}
                options={[
                  { value: "engagement", label: "Engagement" },
                  { value: "accuracy", label: "Accuracy" },
                ]}
              />
            }
          >
            <ChartContainer
              config={ENGAGEMENT_CONFIG}
              className="h-full w-full"
            >
              <AreaChart data={engagementData} margin={{ top: 8, right: 8 }}>
                <defs>
                  <linearGradient
                    id="engagementFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartColor(1)}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColor(1)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={chartColor(2)}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartColor(2)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value) => `${value}%`}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke={chartColor(1)}
                  strokeWidth={3}
                  fill="url(#engagementFill)"
                  animationDuration={600}
                  hide={
                    engagementView !== "engagement" ||
                    Boolean(hiddenSeries.engagement)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke={chartColor(2)}
                  strokeWidth={3}
                  fill="url(#accuracyFill)"
                  animationDuration={600}
                  hide={
                    engagementView !== "accuracy" ||
                    Boolean(hiddenSeries.accuracy)
                  }
                />
              </AreaChart>
            </ChartContainer>
            <SeriesLegend
              ocid="caregiver.chart.engagement.legend"
              hidden={hiddenSeries}
              onToggle={toggleSeries}
              items={[
                {
                  key: "engagement",
                  label: "Engagement %",
                  color: chartColor(1),
                },
                {
                  key: "accuracy",
                  label: "Accuracy %",
                  color: chartColor(2),
                },
              ]}
            />
          </ChartCard>

          <ChartCard
            ocid="caregiver.chart.mood"
            title="Mood trend"
            description="Asha's daily mood score from 1 (tired) to 5 (happy)."
            height={256}
            empty={moodEmpty}
            emptyMessage="No mood check-ins recorded yet."
          >
            <ChartContainer config={MOOD_CONFIG} className="h-full w-full">
              <LineChart data={moodData} margin={{ top: 8, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value) => `${value} / 5`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke={chartColor(2)}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={600}
                  hide={Boolean(hiddenSeries.mood)}
                />
              </LineChart>
            </ChartContainer>
            <SeriesLegend
              ocid="caregiver.chart.mood.legend"
              hidden={hiddenSeries}
              onToggle={toggleSeries}
              items={[
                { key: "mood", label: "Mood score", color: chartColor(2) },
              ]}
            />
          </ChartCard>
        </div>
      </section>

      {/* Settings */}
      <section
        id="settings"
        data-ocid="caregiver.section.settings"
        className="flex scroll-mt-28 flex-col gap-4"
      >
        <SectionHeading
          icon={Settings}
          title="Settings"
          subtitle="Manage accessibility, language, and care preferences."
        />
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-card p-6 shadow-subtle sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HeartPulse className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold">
                Care preferences
              </h3>
              <p className="text-base text-muted-foreground">
                Adjust accessibility, language, and reminder settings for Asha.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="default"
            data-ocid="caregiver.settings_button"
            onClick={() => showConfirmation("Opening care settings…")}
          >
            <Settings className="size-4" aria-hidden="true" />
            Open settings
          </Button>
        </div>
      </section>

      {/* Confirmation toast */}
      {confirmation ? (
        <output
          data-ocid="caregiver.confirmation_toast"
          className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border bg-card p-4 shadow-lg"
        >
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-success"
            aria-hidden="true"
          />
          <p className="text-base font-medium">{confirmation}</p>
          <button
            type="button"
            data-ocid="caregiver.confirmation_close"
            aria-label="Dismiss"
            onClick={() => setConfirmation(null)}
            className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            ✕
          </button>
        </output>
      ) : null}
    </div>
  );
}
