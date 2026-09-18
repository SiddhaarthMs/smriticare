import { Bell, BellOff, Mic, Volume1, Volume2, VolumeX } from "lucide-react";
import type * as React from "react";

import { volumeLevel, volumeLevelLabel } from "@/lib/accessibility";
import { useAppStore } from "@/lib/store";
import type { Reminder } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ReminderCardProps extends React.ComponentProps<"div"> {
  reminder: Reminder;
}

export function ReminderCard({
  reminder,
  className,
  ...props
}: ReminderCardProps) {
  const toggleReminder = useAppStore((s) => s.toggleReminder);
  const removeReminder = useAppStore((s) => s.removeReminder);
  const accessibility = useAppStore((s) => s.accessibility);

  const level = volumeLevel(accessibility.reminderVolume);
  const VolumeIcon =
    level === "muted" ? VolumeX : level === "low" ? Volume1 : Volume2;

  return (
    <div
      data-slot="reminder-card"
      data-ocid={`reminder.${reminder.id}`}
      className={cn(
        "flex items-center gap-4 rounded-3xl border bg-card p-4 shadow-subtle transition-all",
        !reminder.enabled && "opacity-60",
        className,
      )}
      {...props}
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
        <span aria-hidden="true">{reminder.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold">{reminder.title}</p>
        <p className="text-sm text-muted-foreground">
          {reminder.time} · {reminder.days.join(", ")}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span
            data-ocid={`reminder.volume.${reminder.id}`}
            className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
          >
            <VolumeIcon className="size-3.5" aria-hidden="true" />
            {volumeLevelLabel(accessibility.reminderVolume)}
          </span>
          {accessibility.voiceAssistance ? (
            <span
              data-ocid={`reminder.voice.${reminder.id}`}
              className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary"
            >
              <Mic className="size-3.5" aria-hidden="true" />
              Voice on
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          data-ocid={`reminder.toggle.${reminder.id}`}
          aria-label={reminder.enabled ? "Disable reminder" : "Enable reminder"}
          aria-pressed={reminder.enabled}
          onClick={() => toggleReminder(reminder.id)}
          className={cn(
            "flex size-12 items-center justify-center rounded-full transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            reminder.enabled
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {reminder.enabled ? (
            <Bell className="size-5" aria-hidden="true" />
          ) : (
            <BellOff className="size-5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          data-ocid={`reminder.delete.${reminder.id}`}
          aria-label="Delete reminder"
          onClick={() => removeReminder(reminder.id)}
          className="flex size-12 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <span className="text-xl" aria-hidden="true">
            ×
          </span>
        </button>
      </div>
    </div>
  );
}
