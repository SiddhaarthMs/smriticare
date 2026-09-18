import {
  Accessibility,
  Languages,
  Mic,
  MicOff,
  ShieldAlert,
  Volume2,
} from "lucide-react";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/hooks/use-i18n";
import { textSizeLabel, volumeLevelLabel } from "@/lib/accessibility";
import { LANGUAGES } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import type { AccessibilitySettings } from "@/lib/types";
import { cn } from "@/lib/utils";

function ToggleRow({
  label,
  checked,
  onChange,
  ocid,
  status,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  ocid: string;
  status?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4">
      <span className="text-lg font-semibold">{label}</span>
      <div className="flex shrink-0 items-center gap-3">
        {status}
        <button
          type="button"
          data-ocid={ocid}
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative h-9 w-16 shrink-0 rounded-full transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            checked ? "bg-primary" : "bg-border",
          )}
        >
          <span
            className={cn(
              "absolute top-1 size-7 rounded-full bg-background shadow-subtle transition-all",
              checked ? "left-8" : "left-1",
            )}
          />
        </button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { t, language, setLanguage } = useI18n();
  const accessibility = useAppStore((s) => s.accessibility);
  const updateAccessibility = useAppStore((s) => s.updateAccessibility);

  const set = (patch: Partial<AccessibilitySettings>) =>
    updateAccessibility(patch);

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader emoji="⚙️" title={t("settings")} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Accessibility className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold">
            {t("accessibility")}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/60 p-4">
            <span className="text-lg font-semibold">
              {t("increaseTextSize")}
            </span>
            <div className="flex gap-2">
              {(["normal", "large", "xlarge"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  data-ocid={`settings.textsize.${size}`}
                  aria-pressed={accessibility.textSize === size}
                  onClick={() => set({ textSize: size })}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    accessibility.textSize === size
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent",
                  )}
                >
                  {textSizeLabel(size)}
                </button>
              ))}
            </div>
          </div>

          <ToggleRow
            label={t("highContrast")}
            checked={accessibility.highContrast}
            onChange={(v) => set({ highContrast: v })}
            ocid="settings.highcontrast.toggle"
          />
          <ToggleRow
            label={t("voiceAssistance")}
            checked={accessibility.voiceAssistance}
            onChange={(v) => set({ voiceAssistance: v })}
            ocid="settings.voice.toggle"
            status={
              <span
                data-ocid="settings.voice.status"
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  accessibility.voiceAssistance
                    ? "bg-primary/15 text-primary"
                    : "bg-border/60 text-muted-foreground",
                )}
              >
                {accessibility.voiceAssistance ? (
                  <Mic className="size-4" aria-hidden="true" />
                ) : (
                  <MicOff className="size-4" aria-hidden="true" />
                )}
                {accessibility.voiceAssistance ? "Voice on" : "Voice off"}
              </span>
            }
          />
          <ToggleRow
            label={t("reduceAnimation")}
            checked={accessibility.reduceAnimation}
            onChange={(v) => set({ reduceAnimation: v })}
            ocid="settings.reduceanimation.toggle"
          />

          <div className="flex flex-col gap-3 rounded-2xl bg-muted/60 p-4">
            <div className="flex items-center gap-2">
              <Volume2 className="size-5 text-primary" aria-hidden="true" />
              <span className="text-lg font-semibold">
                {t("reminderVolume")}
              </span>
              <span className="ml-auto flex items-center gap-2 font-display text-xl font-bold">
                <span
                  data-ocid="settings.volume.level"
                  className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary"
                >
                  {volumeLevelLabel(accessibility.reminderVolume)}
                </span>
                {accessibility.reminderVolume}%
              </span>
            </div>
            <input
              type="range"
              data-ocid="settings.volume.slider"
              min={0}
              max={100}
              step={5}
              value={accessibility.reminderVolume}
              onChange={(e) => set({ reminderVolume: Number(e.target.value) })}
              aria-label={t("reminderVolume")}
              className="h-2 w-full cursor-pointer accent-[var(--primary)]"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Languages className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold">{t("language")}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {LANGUAGES.map((lang) => {
            const selected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                data-ocid={`settings.language.${lang.code}`}
                aria-pressed={selected}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  selected
                    ? "border-primary bg-primary/10 shadow-subtle"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{lang.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {lang.native}
                  </span>
                </div>
                {selected ? (
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section
        data-ocid="settings.disclaimer"
        className="flex flex-col gap-3 rounded-3xl border border-warning/30 bg-warning/10 p-6"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-warning" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold">Medical disclaimer</h2>
        </div>
        <p className="text-base text-foreground">
          SmritiCare is a prototype for cognitive engagement and assistance. It
          does not diagnose dementia or replace professional healthcare.
        </p>
      </section>
    </div>
  );
}
