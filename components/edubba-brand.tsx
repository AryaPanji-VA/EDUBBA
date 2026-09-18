"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme/theme-provider";
import type { Theme } from "@/lib/theme/theme-state";

// Phase 16.5: EDUBBA platform brand. Each theme ships its own pre-colored
// logo assets — the component only picks the correct URL for the active
// theme. No CSS filters, no recoloring: the supplied palettes are preserved.
// Robin remains the companion inside EDUBBA and is branded separately.

const BRAND_BASE = "/edubba-theme-system";

// Theme identity picks the mark palette; mode picks the wordmark variant.
// Light mode uses the supplied black wordmark (edubba-comfy-logo-light.svg
// treatment) with the theme's own mark; dark mode keeps the original
// full-logo assets exactly as supplied. No CSS filters, no recoloring.
const logoByTheme: Record<Theme, { dark: string; light: string }> = {
  "after-dark": {
    dark: `${BRAND_BASE}/after-dark/edubba-logo.svg`,
    light: `${BRAND_BASE}/after-dark/edubba-logo-light.svg`,
  },
  signal: {
    dark: `${BRAND_BASE}/signal/edubba-logo.svg`,
    light: `${BRAND_BASE}/signal/edubba-logo-light.svg`,
  },
  "deep-space": {
    dark: `${BRAND_BASE}/deep-space/edubba-logo.svg`,
    light: `${BRAND_BASE}/deep-space/edubba-logo-light.svg`,
  },
};

// Marks are mid-tone theme colors with acceptable contrast on both light and
// dark backgrounds, so they stay theme-only (no mode variants exist).
const markByTheme: Record<Theme, string> = {
  "after-dark": `${BRAND_BASE}/after-dark/edubba-mark.svg`,
  signal: `${BRAND_BASE}/signal/edubba-mark.svg`,
  "deep-space": `${BRAND_BASE}/deep-space/edubba-mark.svg`,
};

type Props = {
  // "full": horizontal wordmark (sidebar). The mark is also rendered and
  // shown by CSS in the collapsed tablet rail. "mark": compact symbol only.
  variant?: "full" | "mark";
  // Optional extra class for the wrapper (e.g. responsive visibility).
  className?: string;
  // Secondary line rendered under the wordmark (e.g. the theme tagline).
  children?: ReactNode;
};

export function EdubbaBrand({ variant = "full", className, children }: Props) {
  const { theme, mode } = useTheme();
  const logoSrc = mode === "light" ? logoByTheme[theme].light : logoByTheme[theme].dark;

  if (variant === "mark") {
    // Standalone compact mark (e.g. mobile topbar). The image is the only
    // EDUBBA identity in that context, so it carries the accessible name.
    return (
      <span className={`edubba-mark-only ${className ?? ""}`.trim()}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote-theme asset URL must stay stable per theme */}
        <img src={markByTheme[theme]} alt="EDUBBA" width={22} height={27} />
      </span>
    );
  }

  // Full sidebar branding. The link carries the accessible name so the
  // hidden-in-some-viewports images never double-announce.
  return (
    <Link href="/" className={`edubba-brand ${className ?? ""}`.trim()} aria-label="EDUBBA — Dashboard">
      {/* eslint-disable-next-line @next/next/no-img-element -- theme/mode-specific asset URL selected at runtime */}
      <img className="edubba-logo" src={logoSrc} alt="" width={148} height={45} />
      {/* Same brand, compact form for the tablet icon rail. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- theme-specific asset URL selected at runtime */}
      <img className="edubba-mark" src={markByTheme[theme]} alt="" width={32} height={39} />
      {children !== undefined && <span className="edubba-tag">{children}</span>}
    </Link>
  );
}
