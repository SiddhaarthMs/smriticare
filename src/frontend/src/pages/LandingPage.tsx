import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CalendarHeart,
  HeartHandshake,
  Mic,
  Sparkles,
  WifiOff,
} from "lucide-react";

import { BigButton } from "@/components/ui/BigButton";
import { useI18n } from "@/hooks/use-i18n";
import { DEMO_NE_STATES } from "@/lib/demo-data";

const CAPABILITIES = [
  {
    icon: Brain,
    title: "Cognitive games",
    desc: "Gentle, culturally familiar games that keep the mind active and bright.",
  },
  {
    icon: Sparkles,
    title: "AI personalization",
    desc: "A caring companion that adapts games and pace to each elder.",
  },
  {
    icon: Mic,
    title: "Voice & multilingual",
    desc: "Speaks and reads in the languages of the Northeast.",
  },
  {
    icon: CalendarHeart,
    title: "Daily reminders",
    desc: "Gentle nudges for medicine, meals, and time with loved ones.",
  },
  {
    icon: HeartHandshake,
    title: "Caregiver monitoring",
    desc: "Family and carers can check in on activity and wellbeing.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    desc: "Keeps working even where the internet is unreliable.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose a role",
    desc: "Start as an elder, a caregiver, or a healthcare worker.",
  },
  {
    step: "02",
    title: "Play & follow your day",
    desc: "Enjoy gentle games and gentle reminders that fit your routine.",
  },
  {
    step: "03",
    title: "Stay connected",
    desc: "Loved ones and carers see progress and stay in touch.",
  },
] as const;

const WHY_SMRITICARE = [
  {
    title: "Built for elders",
    desc: "Large text, big touch targets, and calm, simple navigation.",
  },
  {
    title: "Culturally familiar",
    desc: "Honours the languages, festivals, and traditions of the Northeast.",
  },
  {
    title: "Trustworthy & private",
    desc: "Your data stays yours — no clinical diagnosis, just gentle support.",
  },
] as const;

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* Hero */}
      <section className="flex flex-col items-center gap-8 text-center animate-fade-in-up">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-accent-foreground">
          <HeartHandshake className="size-4" aria-hidden="true" />
          {t("appName")} — {t("tagline")}
        </span>

        <div className="flex flex-col gap-4">
          <p className="font-display text-lg font-semibold uppercase tracking-widest text-primary md:text-xl">
            Remember. Engage. Connect.
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            An AI-powered companion for memory, routine and connection.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            SmritiCare brings gentle cognitive care, daily reminders, and family
            connection to elders across the Northeast — in their own language,
            at their own pace.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <BigButton asChild size="lg" data-ocid="landing.elder_button">
            <Link to="/elderly">
              Try Elder Mode
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
          </BigButton>
          <BigButton
            asChild
            variant="outline"
            size="lg"
            data-ocid="landing.caregiver_button"
          >
            <Link to="/caregiver">Caregiver Dashboard</Link>
          </BigButton>
        </div>

        {/* Decorative landscape banner */}
        <img
          src="/assets/generated/hero-landscape.dim_1200x700.png"
          alt="Rolling green and terracotta hills with a winding river, inspired by the landscapes of Northeast India"
          className="mt-4 w-full max-w-4xl rounded-[2rem] border border-border object-cover shadow-elevated"
          loading="lazy"
        />

        {/* Tablet-style preview of the elderly dashboard */}
        <div
          data-ocid="landing.tablet_preview"
          className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-elevated"
        >
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-5 py-3">
            <span
              className="size-3 rounded-full bg-accent/70"
              aria-hidden="true"
            />
            <span
              className="size-3 rounded-full bg-warning/70"
              aria-hidden="true"
            />
            <span
              className="size-3 rounded-full bg-success/70"
              aria-hidden="true"
            />
            <span className="ml-3 text-sm font-semibold text-muted-foreground">
              {t("appName")} — Elder Mode
            </span>
          </div>
          <div className="grid gap-4 bg-gradient-subtle p-5 sm:grid-cols-3 md:p-8">
            <div className="flex flex-col gap-3 rounded-3xl bg-card p-5 text-left shadow-subtle">
              <span className="text-3xl" aria-hidden="true">
                🌺
              </span>
              <p className="font-display text-lg font-bold">
                Good morning, Asha
              </p>
              <p className="text-sm text-muted-foreground">
                How are you feeling today?
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl bg-card p-5 text-left shadow-subtle">
              <span className="text-3xl" aria-hidden="true">
                🧠
              </span>
              <p className="font-display text-lg font-bold">Brain Gym</p>
              <p className="text-sm text-muted-foreground">
                Memory Match · 5 min
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl bg-card p-5 text-left shadow-subtle">
              <span className="text-3xl" aria-hidden="true">
                💊
              </span>
              <p className="font-display text-lg font-bold">Morning medicine</p>
              <p className="text-sm text-muted-foreground">Today at 08:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Six ways SmritiCare cares
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Everything an elder needs to stay sharp, safe, and connected — in
            one calm, simple place.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              data-ocid={`landing.capability.${title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
              className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="text-base text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="rounded-3xl bg-gradient-subtle p-6 md:p-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Getting started takes just a few gentle steps.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div
                key={step}
                data-ocid={`landing.how.${step}`}
                className="flex flex-col gap-3 rounded-3xl bg-card p-6 shadow-subtle"
              >
                <span className="font-display text-4xl font-bold text-primary/40">
                  {step}
                </span>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="text-base text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SmritiCare */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Why SmritiCare
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Designed with elders and their families at the heart of every
            decision.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {WHY_SMRITICARE.map(({ title, desc }) => (
            <div
              key={title}
              data-ocid={`landing.why.${title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
              className="flex flex-col gap-3 rounded-3xl bg-card p-6 shadow-subtle"
            >
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="text-base text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Designed for Remote Communities */}
      <section className="rounded-3xl bg-gradient-subtle p-6 md:p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Designed for Remote Communities
            </h2>
            <p className="max-w-3xl text-lg text-muted-foreground">
              SmritiCare speaks the languages and honours the cultures of all
              eight states of Northeast India — and works even where the
              internet is unreliable — so every elder feels at home.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DEMO_NE_STATES.map((state) => (
              <div
                key={state.id}
                data-ocid={`landing.state.${state.id}`}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-subtle"
              >
                <span className="text-2xl" aria-hidden="true">
                  {state.emoji}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{state.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {state.language}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <BigButton asChild size="lg" data-ocid="landing.elder_button_2">
              <Link to="/elderly">
                Try Elder Mode
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
            </BigButton>
            <BigButton
              asChild
              variant="outline"
              size="lg"
              data-ocid="landing.caregiver_button_2"
            >
              <Link to="/caregiver">Caregiver Dashboard</Link>
            </BigButton>
          </div>
        </div>
      </section>
    </div>
  );
}
