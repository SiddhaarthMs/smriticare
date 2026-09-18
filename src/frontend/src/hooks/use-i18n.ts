import { useMemo } from "react";
import { type TranslationKey, translate } from "../lib/i18n";
import { useAppStore } from "../lib/store";

export function useI18n() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const t = useMemo(
    () => (key: TranslationKey) => translate(language, key),
    [language],
  );

  return { language, setLanguage, t };
}
