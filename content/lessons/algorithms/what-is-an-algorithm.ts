import type { LessonContent } from "@/content/lessons/types";

export const whatIsAnAlgorithmLessonContent: LessonContent = {
  slug: "what-is-an-algorithm",
  intuitiveExplanation: [
    "Resep masak adalah algoritma: bahan (input), langkah-langkah berurutan yang jelas, dan hasil (output). Bedanya dengan resep biasa: algoritma yang benar-benar didefinisikan harus bebas ambigu — “masak sampai matang” tidak cukup untuk komputer, “panaskan 5 menit di api sedang” baru cukup.",
    "Tiga sifat yang membuat urutan langkah layak disebut algoritma: input yang terdefinisi, langkah yang tidak ambigu, dan hasil yang pasti. Ditambah satu lagi: langkahnya harus berakhir — bukan proses yang berputar selamanya tanpa hasil.",
    "Program adalah algoritma yang dinyatakan dalam bahasa yang bisa dijalankan komputer. Satu algoritma bisa ditulis dalam bahasa apa pun — cara berpikirnya tetap sama.",
  ],
  academicExplanation: [
    "An algorithm is a finite, unambiguous sequence of well-defined steps that transforms a defined input into a defined output. Each step must be executable with the information available at that point, require no external judgment, and the sequence must terminate for every valid input.",
    "The definition is language-independent: an algorithm is the procedure itself, while a program is one expression of that procedure in a programming language. The same algorithm can be implemented in Python, pseudocode for humans, or hardware circuitry.",
    "Correctness is the primary property of an algorithm: for every valid input, it must produce the correct output and terminate. Efficiency — how the amount of work grows with input size — is a second, separate property. An algorithm can be correct but impractically slow, or fast but wrong; only the first failure is invisible without careful checking.",
  ],
  codeExamples: [
    {
      title: "Ambiguous recipe vs defined algorithm",
      language: "text",
      code: "Recipe:  \"Cook until done.\"            → judgment needed\nAlgorithm: \"Heat 5 minutes on medium,      → no judgment\n            flip, heat 3 minutes.\"\n\nInput: raw ingredients. Output: cooked food.",
      explanation: "\"Until done\" requires a human judgment call. Fixed durations and settings leave no room for interpretation — that is the unambiguity an algorithm needs.",
    },
    {
      title: "One algorithm, two languages",
      language: "text",
      code: "Algorithm: find the largest number in a list\n\nPseudocode:  set best to first item;\n             for each item, if item > best, set best to item\n\nPython:      best = items[0]\n             for item in items:\n                 if item > best: best = item",
      explanation: "The procedure is the algorithm. Pseudocode and Python are two notations of the same steps.",
    },
  ],
  keyTerms: [
    { term: "Algorithm", definition: "A finite, unambiguous sequence of well-defined steps that transforms input into output." },
    { term: "Input / Output", definition: "The defined data an algorithm receives and the defined result it produces." },
    { term: "Termination", definition: "The property that the sequence of steps finishes for every valid input." },
    { term: "Correctness", definition: "The property that the output is right for every valid input." },
    { term: "Program", definition: "An algorithm expressed in a language a computer can execute." },
  ],
  commonMistakes: [
    {
      title: "Confusing algorithm with program",
      explanation: "A program is one expression of an algorithm. The algorithm is the procedure — the plan that survives translation between languages.",
    },
    {
      title: "Accepting ambiguous steps",
      explanation: "\"Process the data appropriately\" cannot be executed mechanically. Every step must state exactly what to do with what.",
    },
    {
      title: "Ignoring termination",
      explanation: "An endless loop that never yields a result is not an algorithm, however sophisticated its steps.",
    },
  ],
  quickChecks: [
    {
      question: "Which property distinguishes an algorithm from a vague plan?",
      options: ["Every step is unambiguous and the sequence terminates", "It is written in Python", "It runs quickly"],
      answer: "Every step is unambiguous and the sequence terminates",
      explanation: "Defined input, unambiguous steps, guaranteed output — and it must finish. Language and speed are separate concerns.",
    },
    {
      question: "A recipe says \"cook until it looks right.\" As an algorithm step, this is…",
      options: ["Ambiguous — it requires human judgment", "Perfectly defined", "Efficient"],
      answer: "Ambiguous — it requires human judgment",
      explanation: "\"Looks right\" is not executable mechanically; a step must state exactly what to do with what.",
    },
  ],
};
