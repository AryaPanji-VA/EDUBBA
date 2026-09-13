import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { DEFAULT_THEME, DEFAULT_MODE } from "@/lib/theme/theme-state";
import "./globals.css";
import "@/styles/themes.css";
import "@/styles/environments.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "ROBIN — Arya's CS workspace",
  description: "A personal computer science learning workspace for Arya.",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
