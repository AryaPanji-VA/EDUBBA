"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import type { UiLanguage } from "@/lib/i18n/ui-copy";

const LANGUAGES: { value: UiLanguage; label: string }[] = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
];

// Segmented language control, same .switcher pattern as ThemeSwitcher.
// The selected state uses the .on accent dot (aria-pressed), never color alone.
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="switcher" role="group" aria-label="Language / Bahasa">
      {LANGUAGES.map((option) => (
        <button
          key={option.value}
          type="button"
          className={language === option.value ? "on" : ""}
          aria-pressed={language === option.value}
          lang={option.value}
          onClick={() => setLanguage(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
