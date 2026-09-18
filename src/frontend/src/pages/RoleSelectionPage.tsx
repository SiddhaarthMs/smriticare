import { Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, Stethoscope, User } from "lucide-react";

import { DemoBadge } from "@/components/ui/DemoBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/hooks/use-i18n";
import { useAppStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const ROLES: {
  role: Role;
  icon: typeof User;
  title: string;
  desc: string;
  to: string;
}[] = [
  {
    role: "elderly",
    icon: User,
    title: "Elderly User",
    desc: "Play gentle games, follow your day, and keep your mind bright.",
    to: "/elderly",
  },
  {
    role: "caregiver",
    icon: HeartHandshake,
    title: "Caregiver",
    desc: "Keep an eye on your loved one's activity and wellbeing.",
    to: "/caregiver",
  },
  {
    role: "healthcare-worker",
    icon: Stethoscope,
    title: "Healthcare Worker",
    desc: "View regional engagement and adherence across your patients.",
    to: "/healthcare",
  },
];

export function RoleSelectionPage() {
  const { t } = useI18n();
  const setRole = useAppStore((s) => s.setRole);

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      <PageHeader
        emoji="👋"
        title={t("whoAreYou")}
        subtitle={t("selectRole")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {ROLES.map(({ role, icon: Icon, title, desc, to }) => (
          <Link
            key={role}
            to={to}
            data-ocid={`role.${role}`}
            onClick={() => setRole(role)}
            className="group flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <DemoBadge />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-bold">{title}</h2>
              <p className="text-base text-muted-foreground">{desc}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 font-semibold text-primary">
              {t("continue")}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
