import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

// Functions lesson-owned Robin Check retry reinforcement prompts.
export function functionsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("definition_without_call")) return id
    ? "Pisahkan dua momen: def itu bikin function-nya, call baru menjalankan isinya. Coba jelaskan apa yang terjadi di tiap momen."
    : "Separate two moments: def creates the function, a call runs it. Explain what happens at each moment.";
  if (result.misconceptions.includes("print_not_return")) return id
    ? "print cuma nampilin ke layar; return nyerahin nilai ke pemanggil. Coba jelaskan apa yang diterima result ketika function cuma print."
    : "print only displays on screen; return hands a value to the caller. Explain what result receives when the function only prints.";
  if (result.misconceptions.includes("parameter_argument_mismatch")) return id
    ? "Parameter itu nama di def; argument itu value asli di pemanggilan. Jelaskan pasangan mereka: mana yang menerima, mana yang memberi."
    : "Parameters are names in the def; arguments are real values at the call. Explain the pairing: which receives, which gives.";
  if (result.misconceptions.includes("missing_parentheses")) return id
    ? "Nama doang itu function-nya; tambahkan kurung buat memanggilnya. Jelaskan beda greet dan greet()."
    : "The bare name is the function itself; add parentheses to call it. Explain the difference between greet and greet().";
  return id
    ? "Jelaskan alurnya: apa yang terjadi pas def ditulis, apa yang terjadi pas function dipanggil, dan ke mana hasil return-nya pergi."
    : "Explain the flow: what happens when the def is written, what happens when the function is called, and where the returned value goes.";
}

// Functions lesson-owned mastery concept labels for the mastery summary UI.
export const functionsMasteryConceptLabels: Record<string, string> = {
  function_definition: "Definition", function_call: "Calls",
  parameters_arguments: "Parameters & arguments", return_values: "Return values",
};
