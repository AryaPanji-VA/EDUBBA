import Link from "next/link";

export type PracticeMode = "guided" | "sandbox" | "thinking";

const practiceModes: { id: PracticeMode; label: string; href: string }[] = [
  { id: "guided", label: "Guided Practice", href: "/practice/python" },
  { id: "sandbox", label: "Sandbox", href: "/practice/python/sandbox" },
  { id: "thinking", label: "Logic & Thinking", href: "/practice/thinking" },
];

export function PracticeModeNav({ active }: { active: PracticeMode }) {
  return (
    <nav className="practice-mode-nav" aria-label="Practice modes">
      {practiceModes.map((mode) => {
        const isActive = mode.id === active;
        return (
          <Link
            key={mode.id}
            className={isActive ? "active" : undefined}
            href={mode.href}
            aria-current={isActive ? "page" : undefined}
          >
            {mode.label}
          </Link>
        );
      })}
    </nav>
  );
}
