import { Link, Outlet } from "@tanstack/react-router";
import {
  Accessibility,
  ChevronDown,
  FlaskConical,
  HeartPulse,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import type * as React from "react";
import { useState } from "react";

import { useI18n } from "@/hooks/use-i18n";
import type { TranslationKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ConnectionBadge } from "../ui/ConnectionBadge";
import { DemoBadge } from "../ui/DemoBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";

export interface AppLayoutProps {
  children?: React.ReactNode;
}

const ROLE_OPTIONS: { value: Role; label: TranslationKey }[] = [
  { value: "elderly", label: "elderly" },
  { value: "caregiver", label: "caregiver" },
  { value: "healthcare-worker", label: "healthcareWorker" },
  { value: "guest", label: "guest" },
];

const ROLE_LABEL: Record<Role, TranslationKey> = {
  elderly: "elderly",
  caregiver: "caregiver",
  "healthcare-worker": "healthcareWorker",
  guest: "guest",
};

export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const accessibility = useAppStore((s) => s.accessibility);
  const updateAccessibility = useAppStore((s) => s.updateAccessibility);

  const [demoMode, setDemoMode] = useState(true);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-card shadow-subtle">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link
            to="/"
            data-ocid="header.logo_link"
            className="flex items-center gap-2 rounded-full focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              {t("appName")}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {demoMode ? <DemoBadge /> : null}
            <ConnectionBadge />

            {/* Role switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger
                data-ocid="header.role_switcher"
                className="inline-flex h-10 items-center gap-1.5 rounded-full border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <UserRound className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t(ROLE_LABEL[role])}</span>
                <ChevronDown className="size-4 opacity-70" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{t("roleSelection")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as Role)}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      data-ocid={`header.role.${option.value}`}
                    >
                      {t(option.label)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Accessibility quick controls */}
            <DropdownMenu>
              <DropdownMenuTrigger
                data-ocid="header.accessibility"
                aria-label={t("accessibility")}
                className="inline-flex size-10 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <Accessibility className="size-5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t("accessibility")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between gap-3 px-2 py-2">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Sun className="size-4 text-accent" aria-hidden="true" />
                    {t("increaseTextSize")}
                  </span>
                  <Switch
                    data-ocid="accessibility.text_size"
                    checked={accessibility.textSize !== "normal"}
                    onCheckedChange={(checked) =>
                      updateAccessibility({
                        textSize: checked ? "large" : "normal",
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-2 py-2">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Moon className="size-4 text-primary" aria-hidden="true" />
                    {t("highContrast")}
                  </span>
                  <Switch
                    data-ocid="accessibility.high_contrast"
                    checked={accessibility.highContrast}
                    onCheckedChange={(checked) =>
                      updateAccessibility({ highContrast: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-2 py-2">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <FlaskConical
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {t("reduceAnimation")}
                  </span>
                  <Switch
                    data-ocid="accessibility.reduce_animation"
                    checked={accessibility.reduceAnimation}
                    onCheckedChange={(checked) =>
                      updateAccessibility({ reduceAnimation: checked })
                    }
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Demo mode toggle */}
            <button
              type="button"
              data-ocid="header.demo_toggle"
              aria-pressed={demoMode}
              aria-label={t("demoMode")}
              onClick={() => setDemoMode((value) => !value)}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-full border transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                demoMode
                  ? "border-accent/40 bg-accent/15 text-accent-foreground"
                  : "border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <FlaskConical className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
          {children ?? <Outlet />}
        </div>
      </main>

      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center md:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">{t("prototypeNote")}</p>
        </div>
      </footer>
    </div>
  );
}
