import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

// Loops lesson-owned Robin Check retry reinforcement prompts.
export function loopsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("range_exclusive_end")) return id
    ? "Coba tulis angka yang dihasilkan range(5) satu per satu: mulai dari berapa, dan di angka berapa dia berhenti? Jelaskan kenapa angka terakhir itu bukan 5."
    : "Write out the values range(5) produces one by one: where does it start, and where does it stop? Explain why the last value is not 5.";
  if (result.misconceptions.includes("missing_counter_update")) return id
    ? "Ikuti count lewat dua putaran: baris mana yang mengubah count, dan apa yang terjadi kalau baris itu nggak ada di dalam loop?"
    : "Follow count through two passes: which line changes count, and what happens to the condition if that line is missing?";
  if (result.misconceptions.includes("loop_variable_confusion")) return id
    ? "Pisahkan dua hal: berapa banyak putaran yang dijalankan range(5), dan value apa saja yang i ambil di tiap putaran."
    : "Separate two things: how many passes range(5) runs, and which values i takes on each pass.";
  if (result.misconceptions.includes("accumulator_reset")) return id
    ? "Trace total lewat dua putaran kalau total = 0 ada di dalam loop: berapa isi total di awal tiap putaran?"
    : "Trace total for two passes if total = 0 sits inside the loop: what is total at the start of each pass?";
  return id
    ? "Jelaskan alurnya: apa yang Python ambil dari range di tiap putaran, kapan loopnya berhenti, dan apa peran baris yang menjorok."
    : "Explain the flow: what Python takes from the sequence each pass, when the loop stops, and what the indented lines do.";
}

// Loops lesson-owned mastery concept labels for the mastery summary UI.
export const loopsMasteryConceptLabels: Record<string, string> = {
  loop_iteration: "Loop iteration", range_boundaries: "Range boundaries",
  while_condition: "While condition", counter_accumulator: "Counter & accumulator",
};
