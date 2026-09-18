# Design Brief

## Direction

Warm Terracotta Care — a calm, premium healthcare + technology visual system for SmritiCare, an AI cognitive gaming and memory assistance platform for elderly dementia patients in remote Northeast India.

## Tone

Warm, calm, and trustworthy — an anti-clinical, human healthcare aesthetic with generous elderly-friendly type, soft rounded cards, and NER-inspired terracotta/teal/cream accents that feel culturally familiar without stereotypes.

## Differentiation

A "care" palette of warm terracotta, river teal, and cream replaces the cold blue/white clinical cliché, paired with an elegant serif display and large, high-contrast type that makes the interface feel like a reassuring companion rather than a dashboard.

## Color Palette

| Token      | OKLCH (light)    | Role                                  |
| ---------- | ---------------- | ------------------------------------- |
| background | 0.965 0.02 80    | warm cream canvas                     |
| foreground | 0.22 0.03 50     | deep warm brown text                  |
| card       | 0.99 0.015 80    | elevated warm card surface            |
| primary    | 0.47 0.13 32     | warm terracotta action                |
| accent     | 0.5 0.09 175     | river teal focus/highlight            |
| muted      | 0.94 0.02 80     | soft warm secondary surface           |
| success    | 0.52 0.14 150    | calm green feedback                   |

## Typography

- Display: Fraunces — warm humanist serif for hero and section headings
- Body: DM Sans — clean, highly legible for elderly readers and UI labels
- Mono: JetBrains Mono — data, scores, and memory metrics
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl`, label `text-base font-semibold tracking-widest uppercase`, body `text-lg md:text-xl`

## Elevation & Depth

Layered warm surfaces — cards sit on cream via soft `shadow-subtle`, interactive/prominent elements lift with `shadow-elevated`; depth comes from warm-tinted shadows, not hard borders.

## Structural Zones

| Zone    | Background  | Border   | Notes                                  |
| ------- | ----------- | -------- | -------------------------------------- |
| Header  | bg-card     | border-b | sticky, elevated, warm surface         |
| Content | bg-background | —      | alternate `bg-muted/30` per section    |
| Footer  | bg-muted/40 | border-t | calm closing band                      |

## Spacing & Rhythm

Generous section gaps (`py-20 md:py-28`), large touch targets (min 48px), roomy card padding (`p-8`) and comfortable micro-spacing (`gap-6`) tuned for elderly readability and tablet/mobile/desktop responsiveness.

## Component Patterns

- Buttons: rounded-full, terracotta primary with cream text, `shadow-subtle`, hover lifts with `shadow-elevated`
- Cards: `rounded-3xl` warm card surface, `shadow-subtle`, generous padding, large icon tiles
- Badges: `rounded-full` pill, teal/sage tinted surfaces for status and memory categories

## Motion

- Entrance: `animate-fade-in-up` 0.6s on hero and section reveals
- Hover: gentle lift + shadow-elevated over 0.3s `transition-smooth`
- Decorative: `animate-soft-float` 6s on hero illustration only — calm, never distracting

## Constraints

- Elderly-friendly: large fonts, large touch targets, high contrast (AA+), simple navigation
- No tiny text, clutter, or excessive animation; calm and reassuring
- NER-inspired cultural accents without stereotypes; clearly label demo data; no clinical diagnosis claims

## Signature Detail

The warm terracotta + river teal + cream palette with a humanist serif display — healthcare that feels like a caring companion, unmistakably Northeast-Indian in spirit yet universally premium.
