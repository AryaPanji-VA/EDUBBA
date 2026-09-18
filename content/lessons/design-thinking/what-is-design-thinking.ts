import type { LessonContent } from "@/content/lessons/types";

export const whatIsDesignThinkingLessonContent: LessonContent = {
  slug: "what-is-design-thinking",
  intuitiveExplanation: [
    "Ada masalah yang jawabannya tinggal dihitung, dan ada masalah yang jawabannya harus dirancang: bikin mahasiswa betah baca dokumentasi, atau bikin antrean kampus nggak menyebalkan. Design thinking adalah cara kerja untuk masalah jenis kedua.",
    "Intinya dua kata: human-centered dan iteratif. Human-centered artinya mulai dari orang yang mengalaminya, bukan dari solusi favorit kita. Iteratif artinya kita berputar — pahami, definisikan, cari ide, buat purwarupa, uji — lalu kembali lagi dengan pemahaman yang lebih tajam.",
    "Ini bukan garis lurus sekali jalan. Setiap putaran mengoreksi pemahaman kita soal masalahnya, dan itu justru intinya: makin cepat salah di purwarupa murah, makin murah belajarnya.",
  ],
  academicExplanation: [
    "Design thinking is a human-centered, iterative approach to problem solving that is particularly suited to problems whose requirements are unclear, contested, or discovered only through engagement with the people affected. Rather than converging immediately on a solution, it alternates between divergent exploration (empathize, ideate) and convergent synthesis (define, prototype, test).",
    "The commonly taught stages — empathize, define, ideate, prototype, test — describe modes of work, not a mandatory sequence. Teams loop back to earlier stages as tests reveal that the problem framing, not just the solution, was wrong.",
    "The approach trades the cost of being wrong late (building the wrong product well) for the cost of being wrong early and cheaply (testing rough artifacts with real people). Its effectiveness depends on genuine contact with users and honest treatment of what tests reveal.",
  ],
  codeExamples: [
    {
      title: "The loop, not the pipeline",
      language: "text",
      code: "empathize → define → ideate → prototype → test\n        ↑______________________________|\n\nModes of work, not a one-way street.",
      explanation: "The arrows describe a cycle: tests regularly send teams back to reframe the problem or expand ideas, not just to polish the current one.",
    },
    {
      title: "A wrong frame discovered cheaply",
      language: "text",
      code: "Assumed problem: \"Students don't read the docs.\"\n→ interviewed 5 students\n→ actual issue: docs exist, search is broken\n\nCost of learning this: one afternoon.\nCost of learning it after launch: months.",
      explanation: "The first artifact tested was the problem frame itself. Design thinking treats framing as something to validate, not assume.",
    },
  ],
  keyTerms: [
    { term: "Design thinking", definition: "A human-centered, iterative approach to solving problems whose answers must be designed rather than computed." },
    { term: "Human-centered", definition: "Starting from the people who experience the problem — their context, behavior, and needs — rather than from a favored solution." },
    { term: "Iterative", definition: "Working in loops that return to earlier stages with sharper understanding instead of a single pass." },
    { term: "Divergent / convergent", definition: "Alternating between widening the options and narrowing them down." },
  ],
  commonMistakes: [
    {
      title: "Treating the stages as a one-way pipeline",
      explanation: "Running empathize→test exactly once and shipping misses the point: tests often reveal the problem framing was wrong, which sends you back, not forward.",
    },
    {
      title: "Starting from the solution",
      explanation: "\"Let's build an app\" before understanding the people and the problem is the classic failure the approach exists to prevent.",
    },
    {
      title: "Skipping contact with real people",
      explanation: "Substituting your own preferences for user research makes the process theater: it looks like design thinking but learns nothing.",
    },
  ],
  quickChecks: [
    {
      question: "What makes design thinking \"human-centered\"?",
      options: ["It starts from the people who experience the problem", "It uses the newest interface technology", "It lets designers decide what users should want"],
      answer: "It starts from the people who experience the problem",
      explanation: "The starting point is the users' context, behavior, and needs — not a favored solution or technology.",
    },
    {
      question: "A test reveals the problem was framed wrong. What does design thinking say to do?",
      options: ["Loop back and reframe, then continue", "Ship anyway — the stages are complete", "Ignore the test and trust the original idea"],
      answer: "Loop back and reframe, then continue",
      explanation: "The stages are modes of work in a loop; tests routinely send teams back to the problem frame.",
    },
  ],
};
