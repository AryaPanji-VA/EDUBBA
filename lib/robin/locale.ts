// Shared Robin locale contract. Reuses the canonical EDUBBA lesson-language
// union ("id" | "en") and its localStorage source (lessonLanguageStorageKey
// from content/lessons/shared-copy) so Robin follows the same switcher as the
// rest of the app — no competing locale system.
import { lessonLanguageStorageKey } from "@/content/lessons/shared-copy";

export type RobinLocale = "id" | "en";

// The established default across the app (lesson pages start in Indonesian).
export const fallbackRobinLocale: RobinLocale = "id";

// Bounded validation: only supported locales pass; anything malformed or
// missing falls back instead of being injected into prompts verbatim.
export function parseRobinLocale(value: unknown): RobinLocale {
  return value === "en" || value === "id" ? value : fallbackRobinLocale;
}

// Client helper: the active EDUBBA locale is read per request, so a language
// switch affects the next Robin call without a page reload.
export function getActiveLessonLanguage(): RobinLocale {
  try {
    const stored = typeof localStorage === "undefined" ? null : localStorage.getItem(lessonLanguageStorageKey);
    return parseRobinLocale(stored);
  } catch {
    return fallbackRobinLocale;
  }
}

// Prompt layer handed to the model on every AI request. Explicit learner
// language requests in the current message may still override the default.
export function robinLocaleInstruction(locale: RobinLocale): string {
  const name = locale === "en" ? "English" : "Indonesian";
  return `ACTIVE EDUBBA LANGUAGE: ${name} (${locale}). Use ${name} as the default language for your reply. If the learner explicitly asks for another language in their current message, follow that explicit request. Do not infer the reply language from the message language alone when an active language is supplied. Keep code tokens, Python keywords, and identifiers exact.`;
}
