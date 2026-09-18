import { useNavigate } from "@tanstack/react-router";
import {
  Brain,
  Check,
  CloudOff,
  Gamepad2,
  HeartPulse,
  RefreshCw,
  Sparkles,
  Wifi,
} from "lucide-react";
import { useState } from "react";

import { BigButton } from "@/components/ui/BigButton";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatCard } from "@/components/ui/StatCard";
import { useI18n } from "@/hooks/use-i18n";
import { useOffline } from "@/hooks/use-offline";
import { simulateSync, useOfflineStore } from "@/lib/offline";
import { useAppStore } from "@/lib/store";
import type { Difficulty, GameResult, SkillArea } from "@/lib/types";
import { cn } from "@/lib/utils";

const CARD_EMOJIS = ["🌺", "🍛", "🐘", "🏔️", "🦜"];

interface Card {
  id: number;
  emoji: string;
  matched: boolean;
}

function buildDeck(): Card[] {
  const emojis = CARD_EMOJIS.slice(0, 4);
  const doubled = [...emojis, ...emojis];
  return doubled
    .map((emoji, i) => ({ id: i, emoji, matched: false }))
    .sort(() => Math.random() - 0.5);
}

const STEPS = [
  { label: "Elder Dashboard", emoji: "🏠" },
  { label: "Memory Game", emoji: "🧠" },
  { label: "Score", emoji: "🏆" },
  { label: "AI Adapts", emoji: "🤖" },
  { label: "Caregiver View", emoji: "🤝" },
  { label: "Go Offline", emoji: "📴" },
  { label: "Play Offline", emoji: "🎮" },
  { label: "Restore", emoji: "🌐" },
  { label: "Sync", emoji: "🔄" },
];

export function DemoModePage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const journey = useAppStore((s) => s.journey);
  const gameResults = useAppStore((s) => s.gameResults);
  const addGameResult = useAppStore((s) => s.addGameResult);
  const markResultsSynced = useAppStore((s) => s.markResultsSynced);

  const { status, pendingSync, syncing, syncedCount } = useOffline();

  const [step, setStep] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [adaptedDifficulty, setAdaptedDifficulty] = useState<Difficulty | null>(
    null,
  );
  const [simulating, setSimulating] = useState(false);

  const offline = status === "offline";

  const goTo = (next: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
  };

  const startGame = () => {
    setResult(null);
    setAdaptedDifficulty(null);
    goTo(1);
  };

  const handleGameComplete = (res: GameResult) => {
    addGameResult(res);
    setResult(res);
    // Simulated AI adaptation based on performance.
    const current = journey.recommendedDifficulty.Memory;
    let next: Difficulty = current;
    if (res.score >= 85 && current < 5) next = (current + 1) as Difficulty;
    else if (res.score <= 50 && current > 1) next = (current - 1) as Difficulty;
    setAdaptedDifficulty(next);
    goTo(2);
  };

  const goOffline = () => {
    // Flip the shared store to offline synchronously so the badge and demo page
    // both show "Offline" immediately, with no stale synced count and no retry.
    useOfflineStore.getState().setOffline();
    goTo(5);
  };

  const playOffline = () => {
    // Record a real local activity (not just a counter) so it can be marked
    // synced on reconnect and appear in the caregiver dashboard.
    const res: GameResult = {
      id: `offline-${Date.now()}`,
      gameId: "memory-match",
      gameName: "Memory Match",
      skillArea: "Memory",
      difficulty: journey.recommendedDifficulty.Memory,
      accuracy: 88,
      responseTimeMs: 12000,
      attempts: 4,
      completion: 100,
      score: 82,
      timestamp: Date.now(),
      synced: false,
    };
    useOfflineStore.getState().queueOfflineActivity(res);
    addGameResult(res);
    goTo(6);
  };

  const restoreInternet = () => {
    setSimulating(true);
    window.setTimeout(() => {
      useOfflineStore.getState().setOnline();
      simulateSync(() => {
        const ids = useOfflineStore
          .getState()
          .offlineActivities.map((a) => a.id);
        markResultsSynced(ids);
      });
      setSimulating(false);
      goTo(7);
    }, 900);
  };

  const resetDemo = () => {
    setResult(null);
    setAdaptedDifficulty(null);
    useOfflineStore.getState().clearSyncedCount();
    goTo(0);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="🧪"
        title={t("demoMode")}
        subtitle="A guided walkthrough of the SmritiCare experience"
        action={<ConnectionBadge />}
      />

      {/* Stepper */}
      <nav
        aria-label="Demo steps"
        className="flex flex-wrap items-center gap-2"
      >
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={s.label}
              type="button"
              data-ocid={`demo.step.${i}`}
              aria-current={active ? "step" : undefined}
              onClick={() => goTo(i)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                active
                  ? "bg-primary text-primary-foreground shadow-subtle"
                  : done
                    ? "bg-success/15 text-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              <span aria-hidden="true">{done ? "✓" : s.emoji}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Step 0 — Elder Dashboard */}
      {step === 0 ? (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <DemoBadge />
            <span className="text-sm font-semibold text-muted-foreground">
              Asha Devi · 72 · Guwahati, Assam
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label={t("totalGames")}
              value={`${journey.totalGames}`}
              icon={Gamepad2}
              tone="primary"
            />
            <StatCard
              label={t("streak")}
              value={`${journey.streak}`}
              icon={Sparkles}
              tone="warm"
            />
            <StatCard
              label={t("recommendedLevel")}
              value={`${journey.recommendedDifficulty.Memory}`}
              icon={Brain}
            />
            <StatCard
              label={t("weeklyActivity")}
              value={`${journey.weeklyActivity.reduce((a, b) => a + b, 0)}`}
              icon={HeartPulse}
              tone="success"
            />
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-subtle">
            <h2 className="font-display text-xl font-bold">
              Today's gentle plan
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              A short memory game keeps your mind bright. Let's begin with a
              friendly round of Memory Match.
            </p>
            <BigButton
              type="button"
              data-ocid="demo.start_game_button"
              className="mt-4"
              onClick={startGame}
            >
              <Gamepad2 className="size-5" aria-hidden="true" />
              {t("start")} Memory Game
            </BigButton>
          </div>
        </section>
      ) : null}

      {/* Step 1 — Memory Game */}
      {step === 1 ? (
        <MemoryGameStep
          onComplete={handleGameComplete}
          onBack={() => goTo(0)}
        />
      ) : null}

      {/* Step 2 — Score */}
      {step === 2 && result ? (
        <section className="flex flex-col items-center gap-6">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl bg-card p-6 shadow-elevated md:p-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-5xl" aria-hidden="true">
                🌟
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                {t("wonderful")}
              </h2>
              <p className="text-lg text-muted-foreground">{result.gameName}</p>
            </div>
            <ProgressRing
              value={result.score}
              size={140}
              strokeWidth={12}
              label={t("score")}
              tone="warm"
            />
            <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label={t("accuracy")} value={`${result.accuracy}%`} />
              <StatCard label={t("attempts")} value={`${result.attempts}`} />
              <StatCard
                label={t("completion")}
                value={`${result.completion}%`}
              />
              <StatCard
                label={t("difficulty")}
                value={`${result.difficulty}`}
              />
            </div>
            <BigButton
              type="button"
              data-ocid="demo.see_ai_button"
              className="w-full"
              onClick={() => goTo(3)}
            >
              <Brain className="size-5" aria-hidden="true" />
              See how the AI adapts
            </BigButton>
          </div>
        </section>
      ) : null}

      {/* Step 3 — AI Adapts Difficulty */}
      {step === 3 && result && adaptedDifficulty ? (
        <section className="flex flex-col gap-6">
          <div className="rounded-3xl bg-card p-6 shadow-subtle">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="size-6 text-primary" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold">
                  AI adapts the difficulty
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("prototypeLogic")} · {t("demoData")}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Before
                </p>
                <p className="mt-1 font-display text-3xl font-bold">
                  Level {result.difficulty}
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Recommended next
                </p>
                <p className="mt-1 font-display text-3xl font-bold">
                  Level {adaptedDifficulty}
                </p>
              </div>
            </div>
            <p className="mt-4 text-base text-muted-foreground">
              {adaptedDifficulty > result.difficulty
                ? "Great performance! The AI gently raises the challenge to keep your mind engaged."
                : adaptedDifficulty < result.difficulty
                  ? "The AI eases the level so you can build confidence at a comfortable pace."
                  : "The AI keeps the level steady — you're right on track."}
            </p>
            <BigButton
              type="button"
              data-ocid="demo.see_caregiver_button"
              className="mt-5"
              onClick={() => goTo(4)}
            >
              <HeartPulse className="size-5" aria-hidden="true" />
              See the caregiver dashboard update
            </BigButton>
          </div>
        </section>
      ) : null}

      {/* Step 4 — Caregiver Dashboard Updates */}
      {step === 4 ? (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <DemoBadge />
            <span className="text-sm font-semibold text-muted-foreground">
              Caregiver view · Rohan (son)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label={t("totalGames")}
              value={`${journey.totalGames}`}
              icon={Gamepad2}
              tone="primary"
            />
            <StatCard
              label={t("streak")}
              value={`${journey.streak}`}
              icon={Sparkles}
              tone="warm"
            />
            <StatCard
              label={t("avgAdherence")}
              value="86%"
              icon={HeartPulse}
              tone="success"
            />
            <StatCard label={t("alerts")} value="0" icon={Brain} />
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-subtle">
            <h2 className="font-display text-xl font-bold">Latest activity</h2>
            {gameResults.length === 0 ? (
              <EmptyState
                emoji="🌿"
                title={t("noGamesPlayed")}
                description="Complete a game to see it appear here."
              />
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {gameResults
                  .slice()
                  .reverse()
                  .slice(0, 3)
                  .map((g) => (
                    <li
                      key={g.id}
                      data-ocid={`demo.activity.${g.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xl"
                          aria-hidden="true"
                        >
                          🧠
                        </span>
                        <div>
                          <p className="font-semibold">{g.gameName}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("score")}: {g.score} · {t("level")}{" "}
                            {g.difficulty}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-sm font-semibold",
                          g.synced
                            ? "bg-success/15 text-foreground"
                            : "bg-warning/15 text-warning",
                        )}
                      >
                        {g.synced ? "✓ Synced" : "Pending sync"}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
            <BigButton
              type="button"
              data-ocid="demo.go_offline_button"
              variant="outline"
              className="mt-5"
              onClick={goOffline}
            >
              <CloudOff className="size-5" aria-hidden="true" />
              Simulate internet loss
            </BigButton>
          </div>
        </section>
      ) : null}

      {/* Step 5 — Go Offline */}
      {step === 5 ? (
        <section className="flex flex-col items-center gap-6">
          {simulating ? (
            <LoadingState className="w-full max-w-xl" />
          ) : offline ? (
            <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl bg-card p-8 text-center shadow-subtle">
              <span className="flex size-16 items-center justify-center rounded-full bg-warning/15 text-warning">
                <CloudOff className="size-8" aria-hidden="true" />
              </span>
              <h2 className="font-display text-2xl font-bold">
                Offline Mode 🔴
              </h2>
              <p className="max-w-md text-lg text-muted-foreground">
                {t("offlineNotice")} You can keep playing — your progress is
                stored locally and will sync when you reconnect.
              </p>
              <BigButton
                type="button"
                data-ocid="demo.play_offline_button"
                className="mt-2"
                onClick={playOffline}
              >
                <Gamepad2 className="size-5" aria-hidden="true" />
                Continue playing offline
              </BigButton>
            </div>
          ) : (
            <ErrorState
              message="The connection did not drop as expected. Please try again."
              onRetry={goOffline}
            />
          )}
        </section>
      ) : null}

      {/* Step 6 — Play Offline */}
      {step === 6 ? (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <ConnectionBadge />
            <span className="text-sm font-semibold text-muted-foreground">
              {pendingSync} activity queued locally
            </span>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-subtle">
            <h2 className="font-display text-xl font-bold">Playing offline</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Your game is saved on this device. Nothing is lost while you're
              offline.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <BigButton
                type="button"
                data-ocid="demo.queue_activity_button"
                variant="outline"
                onClick={playOffline}
              >
                <Gamepad2 className="size-5" aria-hidden="true" />
                Play another round
              </BigButton>
              <BigButton
                type="button"
                data-ocid="demo.restore_button"
                onClick={restoreInternet}
              >
                <Wifi className="size-5" aria-hidden="true" />
                Restore internet
              </BigButton>
            </div>
          </div>
        </section>
      ) : null}

      {/* Step 7 — Restore + Sync */}
      {step === 7 ? (
        <section className="flex flex-col items-center gap-6">
          {simulating ? (
            <LoadingState className="w-full max-w-xl" />
          ) : syncing ? (
            <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl bg-card p-8 text-center shadow-subtle">
              <RefreshCw
                className="size-10 animate-spin text-primary"
                aria-hidden="true"
              />
              <h2 className="font-display text-2xl font-bold">
                {t("synchronizing")}
              </h2>
              <p className="text-lg text-muted-foreground">
                Uploading {pendingSync} queued activities…
              </p>
            </div>
          ) : syncedCount !== null && syncedCount > 0 ? (
            <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl bg-card p-8 text-center shadow-subtle">
              <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="size-8" aria-hidden="true" />
              </span>
              <h2 className="font-display text-2xl font-bold">
                ✓ {syncedCount} {t("activitiesSynced")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("syncComplete")} Your caregiver can now see the latest
                activity.
              </p>
              <BigButton
                type="button"
                data-ocid="demo.restart_button"
                className="mt-2"
                onClick={resetDemo}
              >
                <RefreshCw className="size-5" aria-hidden="true" />
                Restart demo
              </BigButton>
            </div>
          ) : (
            <ErrorState
              message="The sync did not complete as expected. Please try again."
              onRetry={restoreInternet}
            />
          )}
        </section>
      ) : null}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <BigButton
          type="button"
          variant="outline"
          size="sm"
          data-ocid="demo.back_button"
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
        >
          {t("back")}
        </BigButton>
        <BigButton
          type="button"
          variant="ghost"
          size="sm"
          data-ocid="demo.home_button"
          onClick={() => navigate({ to: "/" })}
        >
          {t("home")}
        </BigButton>
      </div>
    </div>
  );
}

function MemoryGameStep({
  onComplete,
  onBack,
}: {
  onComplete: (result: GameResult) => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const journey = useAppStore((s) => s.journey);
  const difficulty = journey.recommendedDifficulty.Memory;

  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(() => Date.now());

  const totalPairs = deck.length / 2;

  const handleFlip = (card: Card) => {
    if (flipped.length === 2 || card.matched || flipped.includes(card.id))
      return;
    const next = [...flipped, card.id];
    setFlipped(next);

    if (next.length === 2) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const [a, b] = next.map((id) => deck.find((c) => c.id === id)!);
      if (a.emoji === b.emoji) {
        const newMatched = matchedCount + 1;
        setMatchedCount(newMatched);
        setDeck((d) =>
          d.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, matched: true } : c,
          ),
        );
        setFlipped([]);
        if (newMatched === totalPairs) {
          finishGame(newMatched, newAttempts);
        }
      } else {
        window.setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const finishGame = (pairs: number, usedAttempts: number) => {
    const elapsed = Date.now() - startTime;
    const accuracy = Math.round((pairs / totalPairs) * 100);
    const score = Math.round(
      accuracy * 0.6 +
        Math.max(0, 100 - (usedAttempts / (totalPairs * 2)) * 100) * 0.4,
    );
    const res: GameResult = {
      id: `demo-game-${Date.now()}`,
      gameId: "memory-match",
      gameName: "Memory Match",
      skillArea: "Memory" as SkillArea,
      difficulty,
      accuracy,
      responseTimeMs: elapsed,
      attempts: usedAttempts,
      completion: 100,
      score,
      timestamp: Date.now(),
      synced: false,
    };
    onComplete(res);
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Memory Match</h2>
          <p className="text-sm text-muted-foreground">
            {t("skillArea")}: {t("memory")} · {t("level")} {difficulty}
          </p>
        </div>
        <span className="text-base font-semibold text-muted-foreground">
          {matchedCount} / {totalPairs}
        </span>
      </div>

      <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-3">
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          return (
            <button
              key={card.id}
              type="button"
              data-ocid={`demo.game.card.${card.id}`}
              aria-label={isFlipped ? card.emoji : "Hidden card"}
              onClick={() => handleFlip(card)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl transition-all duration-300 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                isFlipped
                  ? "border-primary bg-primary/10 shadow-subtle"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-subtle",
              )}
            >
              {isFlipped ? <span aria-hidden="true">{card.emoji}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <BigButton
          type="button"
          variant="outline"
          size="sm"
          data-ocid="demo.game.back_button"
          onClick={onBack}
        >
          {t("back")}
        </BigButton>
        <span className="text-base font-semibold text-muted-foreground">
          {t("attempts")}: {attempts}
        </span>
      </div>
    </section>
  );
}
