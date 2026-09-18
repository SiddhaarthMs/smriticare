import { Link, Outlet } from "@tanstack/react-router";
import {
  Activity,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type * as React from "react";

import { useI18n } from "@/hooks/use-i18n";
import type { TranslationKey } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ConnectionBadge } from "../ui/ConnectionBadge";
import { DemoBadge } from "../ui/DemoBadge";

interface NavItem {
  to: string;
  label: TranslationKey;
  icon: typeof LayoutDashboard;
}

const CAREGIVER_NAV: NavItem[] = [
  { to: "/caregiver", label: "caregiverDashboard", icon: LayoutDashboard },
  { to: "/caregiver/patients", label: "patients", icon: Users },
  { to: "/caregiver/reports", label: "weeklyActivity", icon: ClipboardList },
  { to: "/settings", label: "settings", icon: Settings },
];

const HEALTHCARE_NAV: NavItem[] = [
  { to: "/healthcare", label: "healthcareDashboard", icon: LayoutDashboard },
  { to: "/healthcare/patients", label: "patients", icon: Users },
  { to: "/healthcare/region", label: "region", icon: Activity },
  { to: "/settings", label: "settings", icon: Settings },
];

const ROLE_LABEL: Record<Role, TranslationKey> = {
  elderly: "elderly",
  caregiver: "caregiver",
  "healthcare-worker": "healthcareWorker",
  guest: "guest",
};

export interface CaregiverLayoutProps {
  children?: React.ReactNode;
}

export function CaregiverLayout({ children }: CaregiverLayoutProps) {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const role = useAppStore((s) => s.role);

  const isHealthcare = role === "healthcare-worker";
  const navItems = isHealthcare ? HEALTHCARE_NAV : CAREGIVER_NAV;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-card shadow-subtle">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link
            to="/"
            data-ocid="caregiver.logo_link"
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
            <DemoBadge />
            <ConnectionBadge />
            <span className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary sm:inline-flex">
              {t(ROLE_LABEL[role])}
            </span>
          </div>
        </div>
      </header>

      <nav aria-label="Dashboard navigation" className="border-b bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 md:px-6">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              data-ocid={`caregiver.nav.${to.replace("/", "")}`}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              activeProps={{
                className:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              }}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span>{t(label)}</span>
            </Link>
          ))}
        </div>
      </nav>

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
