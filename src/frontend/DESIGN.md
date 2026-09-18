# Design Brief

## Direction

SmritiCare — a calm, warm cognitive-care companion for elderly users and their caregivers, rooted in Northeast Indian cultural familiarity.

## Tone

Warm, trustworthy healthcare with a gentle editorial warmth — cream surfaces, deep teal primary, amber accents; never clinical or cold.

## Differentiation

A "warm care" palette (cream + teal + amber) with large rounded cards and Fraunces serif warmth that feels like family care, not a hospital dashboard.

## Color Palette

| Token      | OKLCH          | Role                          |
| ---------- | -------------- | ----------------------------- |
| background | 0.975 0.015 85 | warm cream canvas             |
| foreground | 0.22 0.025 60  | deep warm charcoal text       |
| card       | 0.995 0.01 85  | elevated surfaces             |
| primary    | 0.42 0.09 190  | calm healthcare teal          |
| accent     | 0.74 0.13 75   | warm amber highlight          |
| muted      | 0.93 0.02 85   | soft secondary surfaces       |
| success    | 0.55 0.16 150  | positive feedback             |
| warning    | 0.72 0.15 80   | gentle caution                |

## Typography

- Display: Fraunces — headings, hero, greeting, big numbers
- Body: DM Sans — UI labels, paragraphs, buttons
- Mono: Geist Mono — scores, timers, data
- Scale: hero `text-4xl md:text-5xl font-display`, h2 `text-2xl md:text-3xl`, label `text-sm font-semibold tracking-wide uppercase`, body `text-base md:text-lg`

## Elevation & Depth

Cards sit on cream with `shadow-subtle`; interactive/active surfaces lift with `shadow-elevated`; depth via layered surfaces, not gradients.

## Structural Zones

| Zone    | Background        | Border   | Notes                          |
| ------- | ----------------- | -------- | ------------------------------ |
| Header  | bg-card           | border-b | distinct from content          |
| Content | bg-background     | —        | alternate bg-muted/30 sections |
| Footer  | bg-muted/40       | border-t | attribution                    |

## Spacing & Rhythm

Section gaps `gap-8 md:gap-12`; card padding `p-5 md:p-6`; generous `py-6 md:py-10` page padding for elderly readability.

## Component Patterns

- Buttons: rounded-full, large `h-14 px-8 text-lg`, primary teal, hover lift
- Cards: `rounded-3xl bg-card shadow-subtle`, generous padding
- Badges: rounded-full pill, soft tinted backgrounds

## Motion

- Entrance: `animate-fade-in-up` on page load
- Hover: subtle translate + shadow lift, 0.3s
- Decorative: `animate-soft-float` on hero accents; reduced-motion honored

## Constraints

- AA+ contrast in light and dark
- Large touch targets (min 44px)
- No clinical diagnosis claims
- Demo data clearly labelled

## Signature Detail

Large rounded "care cards" with a warm teal-and-amber palette and Fraunces greeting that makes an elderly user feel welcomed, not monitored.
