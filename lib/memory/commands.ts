import { memoryOptions, type MemoryInput, type MemoryKey } from "./types";

type Command = { type: "normal" } | { type: "clarify"; reply: string } |
  { type: "save"; memory: MemoryInput } |
  { type: "forget"; key: MemoryKey; value?: string };

export function parseMemoryCommand(message: string): Command {
  const text = message.toLowerCase().trim();
  // Defer to Learning Log when the message is about recording/recalling a study session,
  // not a preference/concept. These phrases must not be intercepted as memory saves.
  if (/\b(catat|catet|catatin|catetin|ringkas|ringkasin)\s+.*(pelajarin|belajar|sesi|hari ini|learned)|\b(apa yang (gue|lu) (pelajarin|belajar|blm|belum))|(terakhir|kemarin).*belajar|(lanjut|lanjutin).*(dari mana|dari terakhir)|\blemah di mana\b|\bmasih lemah\b/.test(text)) {
    return { type: "normal" };
  }
  const forget = /\b(lupain|lupakan|forget|hapus|jangan inget)\b/.test(text);
  const save = /\b(inget|ingat|remember|catet|catat|simpan|save)\b/.test(text);
  if (!forget && !save) return { type: "normal" };
  const clarify = (reply = "Memory yang mana? Sebut satu preference atau konsep, lalu nilai yang mau disimpan. Bisa juga edit di ROBIN LAB."): Command => ({ type: "clarify", reply });
  if (forget && save && !/\bjangan inget\b/.test(text)) return clarify();
  if (forget && /\b(bukan|nggak|tidak|ga|gak)\b/.test(text)) return clarify();
  // Questions, quotations, negation, and mixed instructions never cause a write.
  if (/[?"“”`]/.test(text) || /\b(contoh|misalnya|kalau nanti|jangan hapus|jangan lupain|jangan simpan|jangan catet|don't|do not)\b/.test(text)) {
    // 'contoh kode' is a supported preference, not a quoted example command.
    if (!/contoh kode/.test(text) || /[?"“”`]/.test(text) || /\b(jangan|don't|do not|misalnya)\b/.test(text)) return clarify();
  }
  if (/\b(password|sandi|api.?key|token|secret|rahasia|alamat|address|rekening|kartu kredit|medis|diagnos\w*|agama|religio\w*|politik|seks\w*)\b/.test(text)) {
    return clarify("Gue nggak simpan data sensitif. Memory v1 cuma buat preference belajar dan status konsep. Kita bisa lanjut belajar.");
  }
  const targets: MemoryKey[] = [];
  if (/\b(analogi|analogy|contoh kode|code.first|formal|explanation.style)\b/.test(text)) targets.push("explanation_style");
  if (/\b(pendek|singkat|concise|panjang|detail|detailed|answer.length)\b/.test(text)) targets.push("answer_length");
  if (/\bvariables?\b/.test(text)) targets.push("variables");
  if (/\bname[ _]binding\b/.test(text)) targets.push("name_binding");
  if (/\bassignment\b/.test(text) && /\bcomparison\b/.test(text)) targets.push("assignment_vs_comparison");
  if (targets.length !== 1) return clarify();
  const key = targets[0];
  const values: string[] = [];
  if (key === "explanation_style") {
    if (/\b(analogi|analogy)\b/.test(text)) values.push("analogy-first");
    if (/\b(contoh kode|code.first)\b/.test(text)) values.push("code-first");
    if (/\bformal\b/.test(text)) values.push("formal-first");
  } else if (key === "answer_length") {
    if (/\b(pendek|singkat|concise)\b/.test(text)) values.push("concise");
    if (/\b(panjang|detail|detailed)\b/.test(text)) values.push("detailed");
  } else {
    if (/\b(udah aman|sudah paham|udah paham|understood)\b/.test(text)) values.push("understood");
    if (/\b(ketuker|setengah|shaky)\b/.test(text)) values.push("shaky");
    if (/\b(bingung|struggling|belum paham)\b/.test(text)) values.push("struggling");
  }
  if (values.length > 1) return clarify();
  if (forget) return { type: "forget", key, value: values[0] };
  if (values.length !== 1 || /\b(bukan|nggak|tidak|ga|gak|jangan)\b/.test(text)) return clarify();
  const category = memoryOptions[key].category;
  return { type: "save", memory: { category, key, value: values[0],
    status: category === "learning" ? values[0] as MemoryInput["status"] : null } };
}
