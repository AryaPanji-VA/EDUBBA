import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

// Variables lesson-owned Robin Check retry reinforcement prompts.
export function variablesReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("equality")) return id
    ? "Bayangkan = sebagai memasang label, sedangkan == sebagai pertanyaan. Pada x = 5, apakah Python membuat binding atau bertanya? Jelaskan perbedaannya."
    : "Think of = as attaching a label and == as asking a question. Does x = 5 create a binding or ask a question? Explain the difference.";
  if (result.misconceptions.includes("printing")) return id
    ? "x = 5 memasang label; print(x) baru menampilkan value. Coba jelaskan apa yang dilakukan tiap baris, dan baris mana yang menghasilkan output."
    : "x = 5 attaches a label; print(x) displays the value. Explain what each line does and which produces output.";
  if (result.misconceptions.includes("immutable_binding")) return id
    ? "Ikuti labelnya: x = 5, lalu x = 8. Label x boleh berpindah. Jelaskan binding awal dan binding setelah assignment kedua."
    : "Follow the label: x = 5, then x = 8. The label can move. Explain the initial binding and the binding after the second assignment.";
  if (result.misconceptions.includes("identity")) return id
    ? "Pisahkan label x dari object dengan value 5: x → 5. Label dan object bukan benda yang sama. Jelaskan tugas masing-masing dan apa yang dilakukan =."
    : "Separate the label x from the object with value 5: x → 5. The label and object are not identical. Explain each role and what = does.";
  return id
    ? "Pakai diagram x → 5. Apa nama labelnya, value apa yang dirujuk, dan bagaimana assignment menghubungkannya? Coba lengkapi penjelasan kamu."
    : "Use the diagram x → 5. What is the label, which value does it refer to, and how does assignment connect them? Complete your explanation.";
}

// Variables lesson-owned mastery concept labels for the mastery summary UI.
export const variablesMasteryConceptLabels: Record<string, string> = {
  variable: "Variable", assignment: "Assignment", reassignment: "Reassignment",
  expression: "Expressions", name_binding: "Name binding", identifier_naming: "Naming",
};
