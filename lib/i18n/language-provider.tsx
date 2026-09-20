"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { lessonLanguageStorageKey } from "@/content/lessons/shared-copy";
import { uiCopy, type UiCopyKey, type UiLanguage } from "@/lib/i18n/ui-copy";

// Product-wide language preference. One persisted choice (the existing
// `robin.lessonLanguage` key) drives both lesson content localization and
// global UI chrome — no competing second language state. Settings is the
// only place that changes it; lesson headers read it.
type LanguageContextValue = {
  language: UiLanguage;
  setLanguage: (next: UiLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue>({ language: "id", setLanguage: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR-safe default matches the lesson architecture default ("id");
  // the persisted choice wins on mount.
  const [language, setLanguageState] = useState<UiLanguage>("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(lessonLanguageStorageKey);
      if (saved === "id" || saved === "en") setLanguageState(saved);
    } catch { /* Session still works. */ }
  }, []);

  // Cross-tab consistency: another tab changing the preference updates this one.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === lessonLanguageStorageKey && (event.newValue === "id" || event.newValue === "en")) {
        setLanguageState(event.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: UiLanguage) => {
    setLanguageState(next);
    try { localStorage.setItem(lessonLanguageStorageKey, next); } catch { /* Session still works. */ }
  }, []);

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

// Flat UI-chrome dictionary lookup for the current language.
export function useUiCopy(): Record<UiCopyKey, string> {
  const { language } = useLanguage();
  return uiCopy[language];
}
