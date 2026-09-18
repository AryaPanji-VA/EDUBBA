"use client";

import { EdubbaBrand } from "@/components/edubba-brand";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { ReactNode } from "react";

// Reusable top command bar matching the Kimi mockup's .topbar layout.
// Breadcrumb → Theme → Mode → optional contextual controls → chip
type TopBarProps = {
  breadcrumb?: ReactNode;
  // Contextual controls injected between switchers and the chip (e.g., ID/EN, Source Mode)
  contextual?: ReactNode;
};

export function TopBar({ breadcrumb, contextual }: TopBarProps) {
  return (
    <div className="mast">
      <div className="mast-inner">
        <div className="topbar">
          {/* Compact EDUBBA mark — phones only (sidebar hidden there). */}
          <EdubbaBrand variant="mark" />
          <div className="crumb">{breadcrumb}</div>
          <div className="top-right">
            <ThemeSwitcher />
            {contextual}
          </div>
        </div>
      </div>
    </div>
  );
}
