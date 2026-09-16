import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

// Conditionals lesson-owned Robin Check retry reinforcement prompts.
export function conditionalsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("assignment_vs_comparison")) return id
    ? "Pisahkan dua tanda itu: = memasang nilai, == menanyakan kesamaan. Di dalam if, Python butuh pertanyaan. Coba jelaskan bedanya."
    : "Separate the two signs: = assigns a value, == asks about equality. Inside if, Python needs a question. Explain the difference.";
  if (result.misconceptions.includes("indentation_confusion")) return id
    ? "Perhatikan menjoroknya: baris yang menjorok adalah isi blok if. Coba tunjukin baris mana yang jalan ketika kondisinya True."
    : "Look at the indentation: the indented lines are the body of the if block. Point out which lines run when the condition is True.";
  if (result.misconceptions.includes("string_number_comparison")) return id
    ? "input() itu ngasih teks, bukan angka. Jelaskan kenapa teks \"19\" nggak bisa dibandingkan langsung dengan angka 18, dan cara mengubahnya."
    : "input() gives text, not a number. Explain why the text \"19\" cannot be compared directly to the number 18, and how to convert it.";
  if (result.misconceptions.includes("overlapping_branches")) return id
    ? "Ikuti urutannya: Python ngecek kondisi dari atas ke bawah dan jalan di cabang True yang pertama. Jelaskan kenapa elif itu beda dengan dua if terpisah."
    : "Follow the order: Python checks conditions top to bottom and runs the first True branch. Explain why elif differs from two separate ifs.";
  return id
    ? "Jelaskan alurnya: kondisi mana yang dicek duluan, apa yang bikin Python pindah ke elif, dan kapan else akhirnya jalan."
    : "Explain the flow: which condition is checked first, what makes Python move to the elif, and when the else finally runs.";
}

// Conditionals lesson-owned mastery concept labels for the mastery summary UI.
export const conditionalsMasteryConceptLabels: Record<string, string> = {
  conditional_flow: "Conditional flow", comparison_expression: "Comparisons",
  branch_selection: "Branch selection", input_conversion: "Input conversion",
};
