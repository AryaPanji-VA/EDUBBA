import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { ThemeSwitcher } from "@/components/theme-switcher";

// Utility page: compact header, tight spacing, one clear section.
// The sidebar account control already links to Profile — no duplicate here.
// ThemeSwitcher is the existing component: same theme names, provider, and
// persistence. No theme engine changes.
export default function SettingsPage() {
  return (
    <AppShell active="settings">
      <TopBar breadcrumb={<><b>Settings</b></>} />
      <div className="content settings-page">
        <header className="settings-head">
          <span className="eyebrow">Settings</span>
          <h1 className="settings-title">Appearance</h1>
          <p className="settings-sub">Environment dan mode gelap/terang. Tersimpan otomatis di browser ini — bukan akun, bukan login.</p>
        </header>

        <section className="panel settings-panel" aria-label="Appearance">
          <div className="settings-appearance">
            <ThemeSwitcher />
          </div>
          <p className="panel-footnote">After Dark, Signal, dan Deep Space — masing-masing punya mode dark dan light. Pilihan tersimpan di perangkat ini.</p>
        </section>
      </div>
    </AppShell>
  );
}
