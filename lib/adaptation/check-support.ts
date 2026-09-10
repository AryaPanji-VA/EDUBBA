import type { CheckEvaluation } from "@/lib/robin/check";
import type { Adaptation } from "./policy";

// Runs AFTER evaluation. Only feedback text can change; no second AI call.
export function adaptCheckFeedback(evaluation: CheckEvaluation, policy: Adaptation, language: "id" | "en"): CheckEvaluation {
  if (!policy.concepts.length || evaluation.signal === "strong") return evaluation;
  const concrete = evaluation.signal === "shaky" || policy.concepts.some((entry) => entry.scaffolding === "concrete");
  const id = language === "id";
  let hint: string;
  if (concrete) {
    if (evaluation.misconceptions.includes("equality")) hint = id
      ? "Coba bedakan dua aksi: x = 5 menghubungkan nama ke object, sedangkan x == 5 mengecek kesamaan value."
      : "Separate the two actions: x = 5 binds a name to an object, while x == 5 checks value equality.";
    else if (evaluation.misconceptions.includes("printing")) hint = id
      ? "Ikuti dua baris: x = 5 membuat binding; print(x) baru menampilkan value."
      : "Trace two lines: x = 5 creates a binding; print(x) displays the value.";
    else if (evaluation.misconceptions.includes("immutable_binding")) hint = id
      ? "Bayangkan label x: setelah x = 5, label menunjuk ke 5; setelah x = 8, label yang sama menunjuk ke 8."
      : "Picture the label x: after x = 5 it points to 5; after x = 8 the same label points to 8.";
    else hint = id
      ? "Pakai diagram x → 5: x adalah nama, 5 adalah value object yang dirujuk, dan assignment membuat hubungan itu. Nama bukan object-nya."
      : "Use x → 5: x is the name, 5 is the referenced object's value, and assignment makes that connection. The name is not the object.";
  } else hint = id
    ? "Lengkapi satu langkah: bagaimana assignment menghubungkan nama x dengan object bernilai 5?"
    : "Complete one reasoning step: how does assignment connect the name x to the object with value 5?";
  const feedback = `${evaluation.feedback}\n\n${hint}`;
  return feedback.length <= 1_200 ? { ...evaluation, feedback } : evaluation;
}
