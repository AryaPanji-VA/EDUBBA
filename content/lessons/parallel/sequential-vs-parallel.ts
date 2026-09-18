import type { LessonContent } from "@/content/lessons/types";

export const sequentialVsParallelLessonContent: LessonContent = {
  slug: "sequential-vs-parallel",
  intuitiveExplanation: [
    "Satu kasir melayani 100 pelanggan, 30 detik per pelanggan: 50 menit. Sepuluh kasir melayani pelanggan yang berbeda-beda: kira-kira 5 menit. Kerja yang sama, pelanggan yang sama — yang berubah hanya pembagiannya.",
    "Tapi paralel punya syarat dan batasnya. Syaratnya: pekerjaannya bisa dipecah tanpa saling menunggu (kasir tidak perlu pelanggan yang sama). Batasnya: bagian yang harus tetap berurutan tidak bisa dipercepat — antrian pembayaran di satu gerbang tetap satu antrian.",
    "Hukum dapur berlaku: sembilan wanita tidak bisa melahirkan anak dalam satu bulan. Ada pekerjaan yang memang tak bisa dibagi, dan mengenali mana yang mana adalah keterampilannya.",
  ],
  academicExplanation: [
    "Sequential execution performs one operation at a time in order; parallel execution performs multiple operations simultaneously on genuinely independent pieces of work. The benefit of parallelism is bounded by the fraction of work that cannot be parallelized — formalized in Amdahl's law: if fraction s of a task is inherently sequential, the maximum speedup from any number of processors is 1/s.",
    "Dependencies are the core obstacle. Two tasks can run in parallel only when neither needs the other's output. Data dependencies (task B reads what task A writes), ordering requirements, and shared resources serialize work that otherwise looks parallelizable.",
    "Concurrency — tasks in progress at overlapping times, possibly interleaved on one processor — is a distinct concept from parallelism — tasks executing at the same instant on different processors. A single-cored machine can run concurrent tasks but never parallel ones; the distinction matters because the design problems (coordination, interference) arise from concurrency even without parallelism.",
  ],
  codeExamples: [
    {
      title: "One cashier vs ten",
      language: "text",
      code: "100 customers × 30 s each\n\n1 cashier  → ~50 minutes (sequential)\n10 cashiers→ ~5 minutes  (independent lanes)\n\nWork unchanged. Division changed.",
      explanation: "The speedup exists only because customers are independent: no cashier needs another cashier's customer. Same work, different structure.",
    },
    {
      title: "The part that cannot be divided",
      language: "text",
      code: "Task: 90% splittable + 10% must stay sequential\n\n10 processors → time ≈ 9% + 10% = 19%\n100 processors → time ≈ 0.9% + 10% ≈ 11%\n\nFloor: 10% — the sequential part.",
      explanation: "Amdahl's law in action: the sequential fraction sets a hard floor. Beyond a point, more processors buy almost nothing.",
    },
  ],
  keyTerms: [
    { term: "Sequential execution", definition: "Performing one operation at a time, in order." },
    { term: "Parallel execution", definition: "Performing independent operations simultaneously." },
    { term: "Dependency", definition: "A relation where one task needs another's output or ordering; the enemy of parallelism." },
    { term: "Amdahl's law", definition: "Maximum speedup is limited by the fraction of work that must stay sequential." },
    { term: "Concurrency vs parallelism", definition: "Concurrency: overlapping in time (possibly interleaved). Parallelism: executing at the same instant." },
  ],
  commonMistakes: [
    {
      title: "Expecting linear speedup forever",
      explanation: "Doubling processors rarely halves the time: the sequential fraction, coordination cost, and shared resources each take a share. Speedup has a ceiling.",
    },
    {
      title: "Parallelizing dependent work",
      explanation: "If task B needs task A's result, splitting them across processors just adds waiting. Parallelism requires independence, not enthusiasm.",
    },
    {
      title: "Confusing concurrency with parallelism",
      explanation: "One processor can juggle concurrent tasks by switching between them — nothing runs simultaneously. Parallelism requires multiple execution units.",
    },
  ],
  quickChecks: [
    {
      question: "Ten cashiers serve 100 independent customers. Why does total time drop roughly tenfold?",
      options: ["The customers are independent — no cashier waits on another's customer", "Cashiers work ten times faster in groups", "The queue shortens by magic"],
      answer: "The customers are independent — no cashier waits on another's customer",
      explanation: "Parallelism converts into speedup exactly when the pieces do not depend on each other. Independence is the resource being spent.",
    },
    {
      question: "A task is 10% inherently sequential. What is the best possible speedup, even with infinite processors?",
      options: ["10×", "100×", "Unbounded"],
      answer: "10×",
      explanation: "The sequential 10% cannot shrink, so total time can never fall below 10% of the original — a 10× ceiling (Amdahl's law).",
    },
  ],
};
