import { useI18n } from "@/hooks/use-i18n";
import { useAppStore } from "@/lib/store";
import type { Mood } from "@/lib/types";
import { cn } from "@/lib/utils";

const MOODS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: "happy", emoji: "😊", label: "Happy" },
  { mood: "calm", emoji: "😌", label: "Calm" },
  { mood: "okay", emoji: "🙂", label: "Okay" },
  { mood: "low", emoji: "😔", label: "Low" },
  { mood: "tired", emoji: "😴", label: "Tired" },
];

export function MoodSelector() {
  const { t } = useI18n();
  const currentMood = useAppStore((s) => s.currentMood);
  const setMood = useAppStore((s) => s.setMood);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-semibold">{t("howAreYouFeeling")}</p>
      <div className="flex flex-wrap gap-3">
        {MOODS.map(({ mood, emoji, label }) => {
          const selected = currentMood === mood;
          return (
            <button
              key={mood}
              type="button"
              data-ocid={`mood.${mood}`}
              aria-pressed={selected}
              aria-label={label}
              onClick={() => setMood(mood)}
              className={cn(
                "flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-full border-2 text-2xl transition-all duration-300 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                selected
                  ? "border-primary bg-primary/10 shadow-subtle scale-105"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
