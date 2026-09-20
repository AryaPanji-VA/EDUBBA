"use client";

import { useUiCopy } from "@/lib/i18n/language-provider";
import type { UiCopyKey } from "@/lib/i18n/ui-copy";

// Tiny localized chrome label. Lets the server-side AppShell render
// language-aware navigation text without becoming a client component itself.
export function UiText({ k }: { k: UiCopyKey }) {
  const copy = useUiCopy();
  return <>{copy[k]}</>;
}
