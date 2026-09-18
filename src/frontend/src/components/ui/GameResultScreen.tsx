import { Sparkles } from "lucide-react";

import { useI18n } from "@/hooks/use-i18n";
import type { GameResult } from "@/lib/types";
import { BigButton } from "./BigButton";
import { ProgressRing } from "./ProgressRing";
import { StatCard } from "./StatCard";

export interface GameResultScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onHome: () => void;
}

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function GameResultScreen({
  result,
  onPlayAgain,
  onHome,
}: GameResultScreenProps) {
  const { t } = useI18n();

  return (
    <div
      data-ocid="game_result_screen"
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl bg-card p-6 shadow-elevated md:p-10"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl" aria-hidden="true">
          🌟
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
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
        <StatCard label={t("time")} value={formatTime(result.responseTimeMs)} />
        <StatCard label={t("attempts")} value={`${result.attempts}`} />
        <StatCard label={t("completion")} value={`${result.completion}%`} />
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <BigButton
          type="button"
          data-ocid="game_result.play_again_button"
          variant="primary"
          className="flex-1"
          onClick={onPlayAgain}
        >
          <Sparkles className="size-5" aria-hidden="true" />
          {t("playAgain")}
        </BigButton>
        <BigButton
          type="button"
          data-ocid="game_result.home_button"
          variant="outline"
          className="flex-1"
          onClick={onHome}
        >
          {t("home")}
        </BigButton>
      </div>
    </div>
  );
}
