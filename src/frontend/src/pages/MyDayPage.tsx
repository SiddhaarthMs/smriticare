import { Check, Clock, Plus, X } from "lucide-react";
import { useState } from "react";

import { BigButton } from "@/components/ui/BigButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/hooks/use-i18n";
import { useAppStore } from "@/lib/store";
import type { Reminder } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "medication", labelKey: "medication", icon: "💊" },
  { value: "hydration", labelKey: "meal", icon: "💧" },
  { value: "meal", labelKey: "meal", icon: "🍛" },
  { value: "exercise", labelKey: "exercise", icon: "🚶" },
  { value: "doctor", labelKey: "other", icon: "🩺" },
  { value: "sleep", labelKey: "other", icon: "😴" },
  { value: "family", labelKey: "social", icon: "📞" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

interface RoutineItem {
  id: string;
  title: string;
  time: string;
  icon: string;
  category: CategoryValue;
  done: boolean;
  later: boolean;
}

const INITIAL_ROUTINE: RoutineItem[] = [
  {
    id: "rt-1",
    title: "Morning medicine",
    time: "08:00",
    icon: "💊",
    category: "medication",
    done: false,
    later: false,
  },
  {
    id: "rt-2",
    title: "Drink a glass of water",
    time: "08:30",
    icon: "💧",
    category: "hydration",
    done: false,
    later: false,
  },
  {
    id: "rt-3",
    title: "Gentle walk",
    time: "09:30",
    icon: "🚶",
    category: "exercise",
    done: false,
    later: false,
  },
  {
    id: "rt-4",
    title: "Lunch with family",
    time: "13:00",
    icon: "🍛",
    category: "meal",
    done: false,
    later: false,
  },
  {
    id: "rt-5",
    title: "Doctor appointment",
    time: "15:00",
    icon: "🩺",
    category: "doctor",
    done: false,
    later: false,
  },
  {
    id: "rt-6",
    title: "Call granddaughter",
    time: "17:00",
    icon: "📞",
    category: "family",
    done: false,
    later: false,
  },
  {
    id: "rt-7",
    title: "Evening rest",
    time: "21:00",
    icon: "😴",
    category: "sleep",
    done: false,
    later: false,
  },
];

export function MyDayPage() {
  const { t } = useI18n();
  const reminders = useAppStore((s) => s.reminders);
  const addReminder = useAppStore((s) => s.addReminder);
  const [routine, setRoutine] = useState<RoutineItem[]>(INITIAL_ROUTINE);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [category, setCategory] = useState<CategoryValue>("medication");

  const markDone = (id: string) =>
    setRoutine((items) =>
      items.map((item) =>
        item.id === id ? { ...item, done: !item.done, later: false } : item,
      ),
    );

  const remindLater = (id: string) =>
    setRoutine((items) =>
      items.map((item) =>
        item.id === id ? { ...item, later: !item.later, done: false } : item,
      ),
    );

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const cat = CATEGORIES.find((c) => c.value === category);
    const reminder: Reminder = {
      id: `rem-${Date.now()}`,
      title: trimmed,
      time,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      category: category === "medication" ? "medication" : "other",
      icon: cat?.icon ?? "⏰",
      enabled: true,
    };
    addReminder(reminder);
    setRoutine((items) => [
      ...items,
      {
        id: `rt-${Date.now()}`,
        title: trimmed,
        time,
        icon: cat?.icon ?? "⏰",
        category,
        done: false,
        later: false,
      },
    ]);
    setTitle("");
  };

  const doneCount = routine.filter((r) => r.done).length;

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="🗓️"
        title={t("myDay")}
        subtitle={`${doneCount} of ${routine.length} done today`}
      />

      {/* Add reminder */}
      <section className="rounded-3xl bg-card p-6 shadow-subtle">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reminder-title" className="text-sm font-semibold">
              {t("addReminder")}
            </label>
            <input
              id="reminder-title"
              data-ocid="myday.title_input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Evening tea"
              className="h-14 rounded-2xl border border-input bg-background px-4 text-lg outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reminder-time" className="text-sm font-semibold">
                {t("time")}
              </label>
              <input
                id="reminder-time"
                data-ocid="myday.time_input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-14 rounded-2xl border border-input bg-background px-4 text-lg outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reminder-category"
                className="text-sm font-semibold"
              >
                {t("skillArea")}
              </label>
              <select
                id="reminder-category"
                data-ocid="myday.category_select"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryValue)}
                className="h-14 rounded-2xl border border-input bg-background px-4 text-lg outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {t(c.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <BigButton
            type="submit"
            data-ocid="myday.add_button"
            className="w-full sm:w-auto"
          >
            <Plus className="size-5" aria-hidden="true" />
            {t("addReminder")}
          </BigButton>
        </form>
      </section>

      {/* Daily routine timeline */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">{t("myDay")}</h2>
        {routine.length === 0 ? (
          <EmptyState
            emoji="🗓️"
            title={t("noReminders")}
            description={t("emptyState")}
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {routine.map((item) => (
              <li
                key={item.id}
                data-ocid={`myday.item.${item.id}`}
                className={cn(
                  "flex items-center gap-4 rounded-3xl border bg-card p-4 shadow-subtle transition-all",
                  item.done && "opacity-70",
                )}
              >
                <span
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl",
                    item.done ? "bg-success/15" : "bg-primary/10",
                  )}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-lg font-semibold",
                      item.done && "line-through",
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.time}
                    {item.later ? " · Later" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    data-ocid={`myday.done.${item.id}`}
                    aria-pressed={item.done}
                    aria-label={item.done ? "Undo done" : "Mark done"}
                    onClick={() => markDone(item.id)}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      item.done
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground hover:bg-success/20 hover:text-success",
                    )}
                  >
                    <Check className="size-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    data-ocid={`myday.later.${item.id}`}
                    aria-pressed={item.later}
                    aria-label="Remind later"
                    onClick={() => remindLater(item.id)}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      item.later
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground",
                    )}
                  >
                    <Clock className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* All reminders */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold">{t("reminders")}</h2>
        {reminders.length === 0 ? (
          <EmptyState
            emoji="⏰"
            title={t("noReminders")}
            description={t("emptyState")}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                data-ocid={`myday.reminder.${reminder.id}`}
                className="flex items-center gap-4 rounded-3xl border bg-card p-4 shadow-subtle"
              >
                <span
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl"
                  aria-hidden="true"
                >
                  {reminder.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold">
                    {reminder.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reminder.time} · {reminder.days.join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid={`myday.remove.${reminder.id}`}
                  aria-label="Remove reminder"
                  onClick={() =>
                    useAppStore.getState().removeReminder(reminder.id)
                  }
                  className="flex size-12 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
