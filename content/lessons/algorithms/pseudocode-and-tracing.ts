import type { LessonContent } from "@/content/lessons/types";

export const pseudocodeAndTracingLessonContent: LessonContent = {
  slug: "pseudocode-and-tracing",
  intuitiveExplanation: [
    "Pseudocode adalah algoritma yang ditulis untuk manusia: bebas syntax, tapi tetap presisi. Tujuannya memikirkan prosedur dulu, sebelum pusing koma dan kurung. “Untuk setiap item, kalau lebih besar dari yang terbaik, simpan” — itu sudah pseudocode yang sah.",
    "Tracing adalah mengeksekusi algoritma dengan tangan: membuat tabel kecil berisi nilai variabel di setiap langkah, dan mengisinya baris demi baris seperti komputer. Kedengarannya lambat — dan memang — tapi itu cara tercepat menemukan logika yang salah sebelum diberikan ke mesin.",
    "Disiplin tracing itu penting: isi tabelnya hanya dengan yang tertulis di langkahnya, jangan dengan yang “seharusnya terjadi”. Kalau hasil trace tidak sesuai harapan, salah satunya (tabelmu atau algoritmamu) baru saja ketahuan.",
  ],
  academicExplanation: [
    "Pseudocode is an informal notation for algorithms that preserves precision while dropping language syntax. Its rules are minimal: statements are executed in order, indentation groups blocks, and control words (if/then, for each, while) carry their natural meanings. Because nothing needs to compile, pseudocode lets the procedure itself be reviewed before implementation detail is chosen.",
    "Tracing is the manual execution of an algorithm on a concrete input. The tracer maintains a table of every variable's value, updating one row per executed step, strictly following the written steps rather than the intended behavior. Discrepancies between a trace and expectations localize defects: either the trace misread the step, or the step itself is wrong.",
    "Tracing is also the foundation of debugging: a program is a claim, and a trace on a failing input is the evidence that shows exactly where the claim breaks. The habit of tracing short algorithms by hand builds the execution model needed to reason about code before running it.",
  ],
  codeExamples: [
    {
      title: "Pseudocode: find the largest",
      language: "pseudocode",
      code: "best ← first item\nfor each item in the rest:\n    if item > best:\n        best ← item\nreport best",
      explanation: "No syntax, full precision: order of statements, block grouping by indentation, and explicit update. This is the same procedure any language would express.",
    },
    {
      title: "Trace table on [3, 7, 5]",
      language: "text",
      code: "items = [3, 7, 5]\n\nstep            | best\n----------------|-----\nstart           | 3\nitem=7: 7 > 3   | 7   (update)\nitem=5: 5 > 7?  | 7   (no change)\nreport best     | 7",
      explanation: "One row per executed step, values only from the written instructions. The final row is the algorithm's actual answer for this input.",
    },
  ],
  keyTerms: [
    { term: "Pseudocode", definition: "An informal but precise notation for algorithms, free of programming-language syntax." },
    { term: "Trace", definition: "A manual step-by-step execution of an algorithm on a concrete input, recording variable values." },
    { term: "Trace table", definition: "The table of variable values maintained during a trace, one row per executed step." },
    { term: "Execution model", definition: "The mental model of how statements execute in order and update state." },
  ],
  commonMistakes: [
    {
      title: "Writing pseudocode like prose",
      explanation: "\"Then handle the rest\" is a wish, not a step. Pseudocode drops syntax, not precision: every step must still say exactly what happens.",
    },
    {
      title: "Tracing what should happen",
      explanation: "A trace records what the steps actually say, not what you meant. Filling in the expected answer defeats the entire purpose of the trace.",
    },
    {
      title: "Skipping rows",
      explanation: "Jumping to the final value hides exactly the step where things go wrong. The trace is valuable precisely in its middle rows.",
    },
  ],
  quickChecks: [
    {
      question: "Trace: best starts at 3, then item=7 arrives with the step \"if item > best, best ← item\". What is best now?",
      options: ["7", "3", "10"],
      answer: "7",
      explanation: "7 > 3 is true, so the update runs and best becomes 7 — exactly what the written step says, regardless of any other intention.",
    },
    {
      question: "What makes pseudocode different from prose?",
      options: ["It stays precise about order, conditions, and updates", "It uses complete English sentences", "It must compile"],
      answer: "It stays precise about order, conditions, and updates",
      explanation: "Pseudocode drops syntax, not precision: statements have order, conditions are explicit, and updates name exactly what changes.",
    },
  ],
};
