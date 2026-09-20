"use client";

import Link from "next/link";
import { useUiCopy } from "@/lib/i18n/language-provider";
import type { UiCopyKey } from "@/lib/i18n/ui-copy";

export type PracticeMode = "guided" | "sandbox" | "thinking";

const practiceModes: { id: PracticeMode; labelKey: UiCopyKey; href: string }[] = [
  { id: "guided", labelKey: "practice.guided", href: "/practice/python" },
  { id: "sandbox", labelKey: "practice.sandbox", href: "/practice/python/sandbox" },
  { id: "thinking", labelKey: "practice.thinking", href: "/practice/thinking" },
];

export function PracticeModeNav({ active }: { active: PracticeMode }) {
  const copy = useUiCopy();
  return (
    <nav className="practice-mode-nav" aria-label={copy["practice.modes"]}>
      {practiceModes.map((mode) => {
        const isActive = mode.id === active;
        return (
          <Link
            key={mode.id}
            className={isActive ? "active" : undefined}
            href={mode.href}
            aria-current={isActive ? "page" : undefined}
          >
            {copy[mode.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}
