import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

// Propositions lesson-owned Robin Check retry reinforcement prompts.
export function propositionsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("and_requires_one_true")) return id
    ? "Uji ulang aturannya: p ∧ q butuh dua-duanya true. Cek satu per satu — p true, lalu q false. Bagian mana yang gagal syaratnya?"
    : "Re-test the rule: p ∧ q needs both true. Check one by one — p true, then q false. Which part fails the requirement?";
  if (result.misconceptions.includes("and_confused_with_or")) return id
    ? "Pisahkan dua aturan: ∧ butuh dua-duanya true, ∨ cukup satu. Sekarang evaluasi ulang p ∧ q saat p true dan q false."
    : "Separate the two rules: ∧ needs both true, ∨ needs only one. Now re-evaluate p ∧ q with p true and q false.";
  return id
    ? "Jelaskan ulang syarat ∧: apa yang dibutuhkan supaya hasilnya true, lalu periksa nilai p dan q satu per satu."
    : "Restate the ∧ condition: what is required for a true result, then check the values of p and q one by one.";
}

// Propositions lesson-owned mastery concept labels for the mastery summary UI.
export const propositionsMasteryConceptLabels: Record<string, string> = {
  proposition: "Propositions", truth_value: "Truth values", negation: "Negation",
  conjunction: "Conjunction", disjunction: "Disjunction",
};
