"use client";

import { EdubbaBrand } from "@/components/edubba-brand";
import type { ReactNode } from "react";

// Reusable top command bar matching the Kimi mockup's .topbar layout.
// Breadcrumb → optional contextual controls. Appearance (theme/mode) controls
// live in Settings; the persistent header stays focused on wayfinding.
type TopBarProps = {
  breadcrumb?: ReactNode;
  // Contextual controls injected on the right (e.g., ID/EN, Source Mode)
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
          {contextual != null && (
            <div className="top-right">
              {contextual}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
