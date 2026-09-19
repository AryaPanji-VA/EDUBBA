import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

// Functions lesson-owned Robin Check retry reinforcement prompts.
export function functionsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("definition_executes_body")) return id
    ? "Ingat dua momen yang beda: pas Python membaca def, dia cuma mencatat function-nya — nggak ada yang tampil. Baru baris call yang menjalankan body. Coba telusuri lagi baris per baris: di mana Python cuma mengingat, dan di mana body-nya jalan?"
    : "Remember the two separate moments: when Python reads the def, it only records the function — nothing runs. Only the call line executes the body. Trace it again line by line: where does Python just remember, and where does the body run?";
  if (result.misconceptions.includes("definition_without_call")) return id
    ? "def itu cuma bikin function-nya; call dengan kurung — seperti greet() — baru menjalankannya. Coba jelaskan dua momen itu: apa yang terjadi pas def ditulis, dan apa yang terjadi tiap kali call dijalankan."
    : "def only creates the function; a call with parentheses — like greet() — is what runs it. Explain both moments: what happens when the def is written, and what happens every time a call runs.";
  if (result.misconceptions.includes("call_syntax_invalid")) return id
    ? "Call yang benar itu cuma nama plus kurung: greet(). Kalau def-nya sudah pernah dijalankan, call itu nggak bakal error — body-nya jalan, sekali penuh untuk tiap call. Coba telusuri lagi berapa kali body-nya jalan."
    : "A correct call is just the name plus parentheses: greet(). If the def has already run, the call does not error — the body runs once, in full, per call. Trace again how many times the body runs.";
  if (result.misconceptions.includes("prints_name_text")) return id
    ? "Nama function itu bukan output-nya. Yang tampil adalah hasil print di dalam body, dan itu baru muncul ketika function-nya dipanggil dengan kurung. Coba bedakan: greet itu nama resepnya, greet() yang memasaknya."
    : "The function's name is not its output. What appears is the print inside the body, and only once the function is called with parentheses. Separate them: greet is the recipe's name, greet() is what cooks it.";
  return id
    ? "Jelaskan alurnya: apa yang Python lakukan pas membaca def greet():, dan apa yang berubah ketika baris greet() dijalankan."
    : "Explain the flow: what Python does when it reads def greet():, and what changes when the line greet() runs.";
}

// Functions lesson-owned mastery concept labels for the mastery summary UI.
// parameters_arguments and return_values are legacy keys kept for earlier
// mastery rows; the current lesson flow only evidences definition and call.
export const functionsMasteryConceptLabels: Record<string, string> = {
  function_definition: "Definition", function_call: "Calls",
  parameters_arguments: "Parameters & arguments", return_values: "Return values",
};
