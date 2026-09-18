import { Link, Outlet } from "@tanstack/react-router";
import { Brain, CalendarHeart, Home, Mic, User } from "lucide-react";
import type * as React from "react";

import { useI18n } from "@/hooks/use-i18n";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/elderly", label: "home", icon: Home },
  { to: "/brain-gym", label: "brainGym", icon: Brain },
  { to: "/my-day", label: "myDay", icon: CalendarHeart },
  { to: "/voice", label: "voice", icon: Mic },
  { to: "/profile", label: "profile", icon: User },
] as const;

export interface ElderlyLayoutProps {
  children?: React.ReactNode;
}

export function ElderlyLayout({ children }: ElderlyLayoutProps) {
  const { t } = useI18n();
  const role = useAppStore((s) => s.role);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card shadow-subtle">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <span
              className="flex size-12 items-center justify-center rounded-full bg-gradient-warm text-2xl"
              aria-hidden="true"
            >
              🌺
            </span>
            <div>
              <p className="font-display text-xl font-bold leading-tight md:text-2xl">
                {t("ashaGreeting")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("ashaSubtitle")}
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary sm:inline-flex">
            {role === "elderly" ? t("elderly") : t("guest")}
          </span>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:px-6 md:py-10 md:pb-10">
          {children ?? <Outlet />}
        </div>
      </main>

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-card shadow-elevated md:static md:border-t-0 md:bg-transparent md:shadow-none"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-around gap-1 px-2 py-2 md:justify-start md:gap-2 md:px-6 md:py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              data-ocid={`nav.${to.replace("/", "")}`}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px] md:min-h-16 md:flex-row md:gap-2 md:rounded-full md:px-5 md:text-base",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              activeProps={{
                className:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              }}
            >
              <Icon className="size-6" aria-hidden="true" />
              <span>{t(label)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
