import type { LogIntent } from "./types";

// Pure intent parser — mirrors lib/memory/commands.ts pattern.
// Detects learning-log intents from natural language (ID/EN).
// Returns "normal" for anything that doesn't match.

const SAVE_RE = /\b(catat|catatin|catet|catetin|ringkas|ringkasin|save|log\s|simpan\s|simpanin)\b/i;
const RECALL_RE = /\b(terakhir|kemarin|baru\saja|baru\sbelajar|recall|what\s+did\s+i|what\s+did\s+we|apa\s+yang\s+gue\s+pelajarin|apa\s+yang\s+lu\s+pelajarin|apa\s+yang\s+gue\s+blm|apa\s+yang\s+belum|lemah\s+di|masih\s+lemah|weak\s+at|weak\s+concepts?|where\s+am\s+i\s+weak)\b/i;
const CONTINUE_RE = /\b(lanjut|lanjutin|continue|next\s+step|next\s+lesson|where\s+do\s+i\s+continue|where\s+to\s+next)\b/i;

// Guard: questions about learning content (not log intent) should pass through.
const QUESTION_RE = /\b(bin|robin|apa\s+itu|jelasin|jelaskan|explain|what\s+is|how\s+does|kenapa|mengapa|why|how)\b/i;

export function parseLogIntent(message: string): LogIntent {
  const text = message.toLowerCase().trim();

  // Don't intercept questions about learning content (e.g. "bin apa itu variable?")
  const isQuestion = QUESTION_RE.test(text);

  // Check SAVE first — "catat apa yang gue pelajarin" has both save + recall keywords,
  // but the save intent (catat/ringkas/save) takes priority when present.
  if (SAVE_RE.test(text) && !isQuestion) return { type: "save_log" };
  // Check CONTINUE before RECALL — "lanjut dari mana" could match recall patterns.
  if (CONTINUE_RE.test(text) && !isQuestion) return { type: "continue_learning" };
  if (RECALL_RE.test(text)) return { type: "recall_log" };
  return { type: "normal" };
}
