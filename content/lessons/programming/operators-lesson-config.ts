import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

export function operatorsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("assignment_vs_equality")) return id ? "Pisahkan dua kerja: = menyimpan value, == menanyakan apakah dua value sama. Coba jelaskan hasil dari masing-masing." : "Separate two jobs: = stores a value, == asks whether two values are equal. Explain each result.";
  if (result.misconceptions.includes("comparison_not_boolean")) return id ? "Trace age >= 18 sebagai pertanyaan. Jawabannya cuma True atau False—jelaskan bagaimana if nanti memakai jawaban itu." : "Trace age >= 18 as a question. Its result is True or False—explain how if can use that result.";
  if (result.misconceptions.includes("and_or_confusion")) return id ? "and butuh dua sisi True; or cukup satu. Coba uji dua aturan itu pada score = 85." : "and needs both sides True; or needs only one. Test those rules with score = 85.";
  return id ? "Jelaskan alurnya: value masuk ke expression, operator bekerja, lalu expression menghasilkan angka atau bool." : "Explain the flow: values enter an expression, the operator works, and the expression produces a number or bool.";
}

export const operatorsMasteryConceptLabels: Record<string, string> = {
  arithmetic_operations: "Arithmetic", comparison_operators: "Comparisons",
  logical_operators: "Logic", operator_precedence: "Precedence",
};
