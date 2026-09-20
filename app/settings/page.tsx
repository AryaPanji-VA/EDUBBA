"use client";

import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useUiCopy } from "@/lib/i18n/language-provider";

// Utility page: compact header, tight spacing, one clear section per concern.
// The sidebar account control already links to Profile — no duplicate here.
// ThemeSwitcher and LanguageSwitcher are the existing persisted patterns:
// same storage keys, same providers. No theme/language engine changes.
export default function SettingsPage() {
  const copy = useUiCopy();
  return (
    <AppShell active="settings">
      <TopBar breadcrumb={<><b>{copy["settings.title"]}</b></>} />
      <div className="content settings-page">
        <header className="settings-head">
          <span className="eyebrow">{copy["settings.title"]}</span>
          <h1 className="settings-title">{copy["settings.appearance"]}</h1>
          <p className="settings-sub">{copy["settings.appearanceSub"]}</p>
        </header>

        <section className="panel settings-panel" aria-label="Appearance">
          <div className="settings-appearance">
            <ThemeSwitcher />
          </div>
          <p className="panel-footnote">{copy["settings.appearanceNote"]}</p>
        </section>

        <header className="settings-head settings-head-section">
          <h2 className="settings-title settings-title-section">{copy["settings.language"]}</h2>
          <p className="settings-sub">{copy["settings.languageSub"]}</p>
        </header>

        <section className="panel settings-panel" aria-label={copy["settings.language"]}>
          <div className="settings-appearance">
            <LanguageSwitcher />
          </div>
          <p className="panel-footnote">{copy["settings.languageNote"]}</p>
        </section>
      </div>
    </AppShell>
  );
}
