import type { AccessibilitySettings } from "./types";

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  textSize: "normal",
  highContrast: false,
  voiceAssistance: false,
  reduceAnimation: false,
  reminderVolume: 70,
};

export const TEXT_SIZE_SCALE: Record<
  AccessibilitySettings["textSize"],
  number
> = {
  normal: 1,
  large: 1.15,
  xlarge: 1.3,
};

/**
 * Applies accessibility settings to the document root so they actually affect
 * the interface: root font-size scaling, a high-contrast class, and a
 * reduced-motion class.
 */
export function applyAccessibility(settings: AccessibilitySettings): void {
  const root = document.documentElement;
  if (!root) return;

  root.style.fontSize = `${TEXT_SIZE_SCALE[settings.textSize] * 100}%`;

  root.classList.toggle("high-contrast", settings.highContrast);
  root.classList.toggle("reduce-motion", settings.reduceAnimation);
}

export function textSizeLabel(size: AccessibilitySettings["textSize"]): string {
  switch (size) {
    case "normal":
      return "Normal";
    case "large":
      return "Large";
    case "xlarge":
      return "Extra large";
  }
}

export type VolumeLevel = "muted" | "low" | "medium" | "high";

/**
 * Maps the reminder volume (0-100) to a coarse level so the interface can show
 * a readable "High / Medium / Low" label that changes with the setting.
 */
export function volumeLevel(volume: number): VolumeLevel {
  if (volume <= 0) return "muted";
  if (volume < 40) return "low";
  if (volume < 75) return "medium";
  return "high";
}

export function volumeLevelLabel(volume: number): string {
  switch (volumeLevel(volume)) {
    case "muted":
      return "Muted";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
  }
}
