import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

// For Loops lesson-owned Robin Check retry reinforcement prompts.
export function loopsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("hardcoded_prints_confusion")) return id
    ? "Bandingin print(\"Arya\") / print(\"Bima\") / print(\"Citra\") satu-satu dengan satu baris for name in names: — mana yang tetap bekerja kalau list-nya diganti jadi sepuluh nama?"
    : "Compare print(\"Arya\") / print(\"Bima\") / print(\"Citra\") one by one with the single line for name in names: — which one still works if the list becomes ten names?";
  if (result.misconceptions.includes("body_runs_once")) return id
    ? "Ambil list [\"Hi\", \"Hey\"]: berapa kali blok yang menjorok dijalankan? Sebutin satu per satu value yang diambil loop variable di tiap putaran."
    : "Take the list [\"Hi\", \"Hey\"]: how many times does the indented block run? Name the value the loop variable holds on each pass.";
  if (result.misconceptions.includes("loop_variable_confusion")) return id
    ? "Pisahkan dua hal: berapa banyak putaran yang dijalankan for name in [\"Arya\", \"Bima\", \"Citra\"], dan value apa saja yang name ambil di tiap putaran."
    : "Separate two things: how many passes for name in [\"Arya\", \"Bima\", \"Citra\"] runs, and which values name takes on each pass.";
  if (result.misconceptions.includes("indentation_confusion")) return id
    ? "Liat lagi for word in [\"Hi\", \"Hey\"]: dengan dua print di bawahnya — baris mana yang jalan di tiap putaran, dan baris mana yang cuma jalan sekali setelah loop?"
    : "Look again at for word in [\"Hi\", \"Hey\"]: with two prints under it — which lines run on every iteration, and which line runs only once after the loop?";
  if (result.misconceptions.includes("prints_last_value")) return id
    ? "Trace pelan-pelan: di iterasi pertama, value apa yang dipegang loop variable? Terus di iterasi kedua dan ketiga? Print jalan sekali per value, bukan cuma di value terakhir."
    : "Trace slowly: what value does the loop variable hold on the first iteration? Then the second and third? The print runs once per value, not only for the last one.";
  return id
    ? "Jelaskan alurnya: apa yang Python ambil dari list di tiap putaran, ke mana value itu disimpan, dan apa yang dilakukan baris yang menjorok."
    : "Explain the flow: what Python takes from the list on each pass, where that value is stored, and what the indented lines do.";
}

// For Loops lesson-owned mastery concept labels for the mastery summary UI.
// All four legacy concept keys keep their labels so persisted progress renders.
export const loopsMasteryConceptLabels: Record<string, string> = {
  loop_iteration: "Loop iteration", range_boundaries: "Range boundaries",
  while_condition: "While condition", counter_accumulator: "Counter & accumulator",
};
