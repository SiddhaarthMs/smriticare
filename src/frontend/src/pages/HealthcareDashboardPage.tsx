import {
  Activity,
  AlertTriangle,
  Brain,
  Download,
  HeartPulse,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/hooks/use-i18n";
import { DEMO_HEALTHCARE_WORKER, DEMO_NE_STATES } from "@/lib/demo-data";
import { chartColor } from "@/lib/utils";

interface StateMetric {
  id: string;
  name: string;
  emoji: string;
  participants: number;
  active: number;
  cognitiveScore: number;
  adherence: number;
}

const STATE_METRICS: StateMetric[] = [
  {
    id: "assam",
    name: "Assam",
    emoji: "🌺",
    participants: 1240,
    active: 892,
    cognitiveScore: 74,
    adherence: 78,
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    emoji: "🌧️",
    participants: 860,
    active: 610,
    cognitiveScore: 71,
    adherence: 74,
  },
  {
    id: "mizoram",
    name: "Mizoram",
    emoji: "⛰️",
    participants: 540,
    active: 402,
    cognitiveScore: 76,
    adherence: 81,
  },
  {
    id: "manipur",
    name: "Manipur",
    emoji: "🦌",
    participants: 720,
    active: 505,
    cognitiveScore: 73,
    adherence: 76,
  },
  {
    id: "nagaland",
    name: "Nagaland",
    emoji: "🛕",
    participants: 610,
    active: 428,
    cognitiveScore: 72,
    adherence: 75,
  },
  {
    id: "tripura",
    name: "Tripura",
    emoji: "🏯",
    participants: 690,
    active: 470,
    cognitiveScore: 70,
    adherence: 72,
  },
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    emoji: "🏔️",
    participants: 480,
    active: 330,
    cognitiveScore: 75,
    adherence: 79,
  },
  {
    id: "sikkim",
    name: "Sikkim",
    emoji: "🏔️",
    participants: 350,
    active: 262,
    cognitiveScore: 77,
    adherence: 83,
  },
];

const WEEKLY_ACTIVE = [
  { week: "W1", active: 2100 },
  { week: "W2", active: 2350 },
  { week: "W3", active: 2280 },
  { week: "W4", active: 2620 },
  { week: "W5", active: 2810 },
  { week: "W6", active: 3050 },
  { week: "W7", active: 3290 },
];

const CHART_COLORS = [
  chartColor(1),
  chartColor(2),
  chartColor(3),
  chartColor(4),
  chartColor(5),
  chartColor(1),
  chartColor(2),
  chartColor(3),
];

export function HealthcareDashboardPage() {
  const { t } = useI18n();
  const hw = DEMO_HEALTHCARE_WORKER;

  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [exported, setExported] = useState(false);

  const totalParticipants = STATE_METRICS.reduce(
    (sum, s) => sum + s.participants,
    0,
  );
  const totalActive = STATE_METRICS.reduce((sum, s) => sum + s.active, 0);
  const avgCognitive = Math.round(
    STATE_METRICS.reduce((sum, s) => sum + s.cognitiveScore, 0) /
      STATE_METRICS.length,
  );

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 900);
  };

  const handleExport = () => {
    setExported(true);
    window.setTimeout(() => setExported(false), 1600);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="🩺"
        title={t("healthcareDashboard")}
        subtitle={`${t("region")}: ${hw.region} · ${t("demoData")}`}
        action={
          <div className="flex items-center gap-2">
            <DemoBadge />
            <ConnectionBadge />
          </div>
        }
      />

      {/* Population-level stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("patients")}
          value={totalParticipants.toLocaleString()}
          icon={Users}
          tone="primary"
          hint="8 NE states"
        />
        <StatCard
          label={t("activeToday")}
          value={totalActive.toLocaleString()}
          icon={Activity}
          hint="This week"
        />
        <StatCard
          label="Avg. cognitive score"
          value={`${avgCognitive}/100`}
          icon={Brain}
          hint="Across all states"
        />
        <StatCard
          label={t("alerts")}
          value={`${hw.alerts}`}
          icon={AlertTriangle}
          tone="warm"
          hint="Needs attention"
        />
      </section>

      {/* Engagement by state */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Engagement by state
            </h2>
            <p className="text-sm text-muted-foreground">
              Active participants across the 8 Northeast Indian states
            </p>
          </div>
          <button
            type="button"
            data-ocid="healthcare.export_button"
            onClick={handleExport}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <Download className="size-4" aria-hidden="true" />
            {exported ? "Exported ✓" : "Export report"}
          </button>
        </div>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={STATE_METRICS}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <Tooltip cursor={{ fill: "var(--muted)" }} />
              <Bar
                dataKey="active"
                name="Active participants"
                radius={[8, 8, 0, 0]}
              >
                {STATE_METRICS.map((entry, index) => (
                  <Cell
                    key={entry.id}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Active users trend + cognitive scores */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-card p-6 shadow-subtle">
          <h2 className="font-display text-2xl font-bold">
            Active users trend
          </h2>
          <p className="text-sm text-muted-foreground">
            Weekly active participants
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_ACTIVE}>
                <defs>
                  <linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1">
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
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="active"
                  name="Active users"
                  stroke={chartColor(1)}
                  strokeWidth={3}
                  fill="url(#activeFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-subtle">
          <h2 className="font-display text-2xl font-bold">
            Cognitive scores by state
          </h2>
          <p className="text-sm text-muted-foreground">
            Average cognitive score (0–100)
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={STATE_METRICS}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="cognitiveScore"
                  name="Cognitive score"
                  radius={[0, 8, 8, 0]}
                >
                  {STATE_METRICS.map((entry, index) => (
                    <Cell
                      key={entry.id}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Regional breakdown table */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Regional breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              Simulated population metrics by state
            </p>
          </div>
          <button
            type="button"
            data-ocid="healthcare.refresh_button"
            onClick={handleRefresh}
            className="inline-flex h-11 items-center gap-2 rounded-full border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <RefreshCw
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {refreshing ? "Refreshing…" : "Refresh data"}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="py-3 pr-4">State</th>
                <th className="py-3 pr-4 text-right">Participants</th>
                <th className="py-3 pr-4 text-right">Active</th>
                <th className="py-3 pr-4 text-right">Cognitive</th>
                <th className="py-3 pr-4 text-right">Adherence</th>
                <th className="py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {STATE_METRICS.map((state, index) => {
                const expanded = expandedState === state.id;
                return (
                  <StateRow
                    key={state.id}
                    state={state}
                    index={index}
                    expanded={expanded}
                    onToggle={() =>
                      setExpandedState(expanded ? null : state.id)
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alerts */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle">
        <h2 className="font-display text-2xl font-bold">{t("alerts")}</h2>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-warning/10 p-4">
            <AlertTriangle
              className="size-5 shrink-0 text-warning"
              aria-hidden="true"
            />
            <p className="text-base">
              Adherence dropped below 60% for 2 participants in Kamrup this
              week.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-warning/10 p-4">
            <AlertTriangle
              className="size-5 shrink-0 text-warning"
              aria-hidden="true"
            />
            <p className="text-base">
              1 participant has not played any games in the last 5 days.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-success/10 p-4">
            <HeartPulse
              className="size-5 shrink-0 text-success"
              aria-hidden="true"
            />
            <p className="text-base">
              Overall regional adherence improved by 3% this week.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

interface StateRowProps {
  state: StateMetric;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

function StateRow({ state, index, expanded, onToggle }: StateRowProps) {
  const { t } = useI18n();
  const stateInfo = DEMO_NE_STATES.find((s) => s.id === state.id);

  return (
    <>
      <tr
        data-ocid={`healthcare.state_row.${index + 1}`}
        className="border-b transition-colors hover:bg-muted/40"
      >
        <td className="py-3 pr-4">
          <span className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true">{state.emoji}</span>
            {state.name}
          </span>
        </td>
        <td className="py-3 pr-4 text-right tabular-nums">
          {state.participants.toLocaleString()}
        </td>
        <td className="py-3 pr-4 text-right tabular-nums">
          {state.active.toLocaleString()}
        </td>
        <td className="py-3 pr-4 text-right tabular-nums">
          {state.cognitiveScore}
        </td>
        <td className="py-3 pr-4 text-right tabular-nums">
          {state.adherence}%
        </td>
        <td className="py-3 text-right">
          <button
            type="button"
            data-ocid={`healthcare.state_toggle.${index + 1}`}
            onClick={onToggle}
            aria-expanded={expanded}
            className="inline-flex h-10 items-center gap-1 rounded-full border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {expanded ? "Hide" : "View"}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr data-ocid={`healthcare.state_detail.${index + 1}`}>
          <td colSpan={6} className="bg-muted/30 px-4 py-4">
            <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">
              <p className="text-base font-semibold">
                {state.emoji} {state.name} · {stateInfo?.capital ?? ""}
              </p>
              <p className="text-base text-muted-foreground">
                {stateInfo?.description ?? ""}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("patients")}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    {state.participants.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("activeToday")}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    {state.active.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cognitive
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    {state.cognitiveScore}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("avgAdherence")}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold">
                    {state.adherence}%
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
