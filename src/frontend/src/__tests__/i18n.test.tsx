import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { DEFAULT_ACCESSIBILITY } from "@/lib/accessibility";
import { DEMO_REMINDERS } from "@/lib/demo-data";
import { LANGUAGES, translate } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import type { AIJourney, Language } from "@/lib/types";
import { SettingsPage } from "@/pages/SettingsPage";
import { VoicePage } from "@/pages/VoicePage";

const INITIAL_JOURNEY: AIJourney = {
  skillScores: {
    Memory: 0,
    Attention: 0,
    Recognition: 0,
    RoutineRecall: 0,
    Engagement: 0,
  },
  recommendedDifficulty: {
    Memory: 2,
    Attention: 2,
    Recognition: 2,
    RoutineRecall: 2,
    Engagement: 1,
  },
  totalGames: 0,
  streak: 0,
  lastPlayed: null,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
};

// The original 8 languages must remain selectable and functional when the new
// Northeast languages are added. Do not assert the total count, which will
// intentionally grow.
const ORIGINAL_LANGUAGE_CODES: Language[] = [
  "en",
  "hi",
  "as",
  "bn",
  "mni",
  "kha",
  "lus",
  "nag",
];

// The 4 new Northeast languages added by this change.
const NEW_LANGUAGE_CODES: Language[] = ["brx", "ne", "grt", "sat"];

// Every language the pickers must expose.
const ALL_LANGUAGE_CODES: Language[] = [
  ...ORIGINAL_LANGUAGE_CODES,
  ...NEW_LANGUAGE_CODES,
];

function resetStore() {
  useAppStore.setState({
    role: "guest",
    language: "en",
    accessibility: DEFAULT_ACCESSIBILITY,
    reminders: DEMO_REMINDERS,
    gameResults: [],
    journey: INITIAL_JOURNEY,
    moodEntries: [],
    currentMood: null,
    selectedPackId: "nature",
  });
}

beforeEach(() => {
  cleanup();
  resetStore();
});

describe("translate()", () => {
  it("returns the English value for the English dictionary", () => {
    expect(translate("en", "settings")).toBe("Settings");
    expect(translate("en", "appName")).toBe("SmritiCare");
  });

  it("returns a language-specific translation for a known key", () => {
    expect(translate("hi", "settings")).toBe("सेटिंग्स");
    expect(translate("bn", "settings")).toBe("সেটিংস");
  });

  it("resolves every key to a non-empty string for each language", () => {
    // Every dictionary spreads `...en`, so no key may resolve to undefined.
    const keys = ["settings", "language", "voice", "home", "welcome"] as const;
    for (const lang of LANGUAGES) {
      for (const key of keys) {
        expect(translate(lang.code, key).length).toBeGreaterThan(0);
      }
    }
  });

  it("provides a non-empty translation for every new language on core keys", () => {
    // The new Northeast languages must translate the full interface, not fall
    // back to English. Assert the core navigation keys resolve for each.
    const keys = ["settings", "language", "voice", "home", "welcome"] as const;
    for (const code of NEW_LANGUAGE_CODES) {
      for (const key of keys) {
        expect(translate(code, key).length).toBeGreaterThan(0);
      }
    }
  });
});

describe("language state", () => {
  it("defaults to English", () => {
    expect(useAppStore.getState().language).toBe("en");
  });

  it("persists the selected language in the store", () => {
    useAppStore.getState().setLanguage("hi");
    expect(useAppStore.getState().language).toBe("hi");
  });
});

describe("SettingsPage language picker", () => {
  it("renders every language (original and new) as a selectable option", () => {
    render(<SettingsPage />);
    for (const code of ALL_LANGUAGE_CODES) {
      expect(
        screen.getByTestId(`settings.language.${code}`),
      ).toBeInTheDocument();
    }
  });

  it("switches the interface language when a language is selected", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);
    // English header before switching.
    expect(screen.getByText("Settings")).toBeInTheDocument();
    await user.click(screen.getByTestId("settings.language.hi"));
    expect(useAppStore.getState().language).toBe("hi");
    // The header now renders the Hindi translation.
    expect(screen.getByText("सेटिंग्स")).toBeInTheDocument();
  });

  it("switches the interface to a new Northeast language when selected", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);
    await user.click(screen.getByTestId("settings.language.ne"));
    expect(useAppStore.getState().language).toBe("ne");
    // The Settings header renders the Nepali translation of "settings".
    expect(screen.getByText("सेटिङ")).toBeInTheDocument();
  });
});

describe("VoicePage language picker", () => {
  it("renders every language (original and new) as a selectable option", () => {
    render(<VoicePage />);
    for (const code of ALL_LANGUAGE_CODES) {
      expect(screen.getByTestId(`voice.language.${code}`)).toBeInTheDocument();
    }
  });

  it("switches the interface language when a language is selected", async () => {
    const user = userEvent.setup();
    render(<VoicePage />);
    await user.click(screen.getByTestId("voice.language.bn"));
    expect(useAppStore.getState().language).toBe("bn");
    // The Voice page header renders the Bengali translation of "voice".
    expect(screen.getAllByText("কণ্ঠ").length).toBeGreaterThan(0);
  });

  it("switches the interface to a new Northeast language when selected", async () => {
    const user = userEvent.setup();
    render(<VoicePage />);
    await user.click(screen.getByTestId("voice.language.brx"));
    expect(useAppStore.getState().language).toBe("brx");
    // The Voice page header renders the Bodo translation of "voice".
    expect(screen.getAllByText("राव").length).toBeGreaterThan(0);
  });
});

describe("LANGUAGES registry", () => {
  it("lists each language (original and new) with a code, label, and native name", () => {
    const codes = LANGUAGES.map((l) => l.code);
    for (const code of ALL_LANGUAGE_CODES) {
      expect(codes).toContain(code);
    }
    for (const lang of LANGUAGES) {
      expect(lang.label.length).toBeGreaterThan(0);
      expect(lang.native.length).toBeGreaterThan(0);
    }
  });
});
