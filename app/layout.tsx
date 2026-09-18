import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { DEFAULT_THEME, DEFAULT_MODE } from "@/lib/theme/theme-state";
import { LocalUserGate } from "@/lib/local-user/local-user-provider";
import "./globals.css";
import "@/styles/themes.css";
import "@/styles/environments.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "EDUBBA — Arya's CS workspace",
  description: "EDUBBA learning platform with Robin, the AI study companion.",
  // App icon: the EDUBBA appicon of the app's default theme (signal).
  // Browser chrome has no theme concept, so the default-theme variant is
  // used; after-dark/deep-space appicons exist in the same asset pack if a
  // theme-aware icon is ever wanted. No new asset was generated.
  icons: { icon: "/edubba-theme-system/signal/edubba-appicon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Server-renders default theme/mode attributes on <html> so CSS tokens apply immediately.
  // The pre-paint script (theme-init.js) runs beforeInteractive and overrides these
  // before first paint if localStorage has different values.
  // ThemeProvider initializes with the same SSR defaults to avoid hydration mismatch,
  // then syncs from the DOM data attributes after mount.
  return (
    <html lang="en" data-theme={DEFAULT_THEME} data-mode={DEFAULT_MODE} suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <ThemeProvider>
          <LocalUserGate>{children}</LocalUserGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
