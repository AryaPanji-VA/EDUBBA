import type { LessonContent } from "@/content/lessons/types";

export const courseReviewLessonContent: LessonContent = {
  slug: "course-review",
  intuitiveExplanation: [
    "Tiga puluh lesson udah lewat — sekarang saatnya ngulang, bukan nambah materi. Enam keluarga konsep jadi peta review-nya: values, logic, repetition, reusable code, collections, dan putting it together.",
    "Nggak ada sintaks baru di sini. Yang diuji itu retrieval — manggil balik model mental lu dan gabungin: nge-trace variable, nge-trace loop, milih collection dari kebutuhan datanya, sampai milih perbaikan yang bener pas tipe campur.",
    "Puncaknya final challenge: cetak nilai yang >= 70 dari satu list. List + for + if + print — empat konsep lama di satu program kecil. Selesai ini, course-nya tamat, dan yang lu punya adalah fondasi.",
  ],
  academicExplanation: [
    "This lesson is the capstone review of Programming Fundamentals: retrieval and application, not new theory. Six concept families organize the review — A values (variables, data types, numbers, strings, booleans), B logic (operators, input, conditionals), C repetition (for, while, range), D reusable code (functions, parameters, return, scope), E collections (list, dictionary, tuple, set), and F putting it together (errors and try-except, problem decomposition).",
    "The activity shapes are deliberately varied: tracing how a value changes across reassignment lines, tracing what a for loop accumulates, choosing a collection from the data's need rather than habit, and choosing the right fix when types mix. The peak is the final challenge — one small program that combines list, for, conditional, and print with no syntax beyond the course.",
    "The closing message is honest: You now have the foundations to read, reason about, and build small programs. That is not a mastery claim — it is a foundation to read, reason, and build from, with each concept family linking to a next stage of learning deepened by practice.",
  ],
  codeExamples: [
    {
      title: "Values and logic, traced by hand",
      language: "python",
      code: "x = 3\nx = x * 2\nprint(x > 5)\n\noutput:\nTrue",
      explanation: "Reassignment reads the old value first: x = x * 2 takes 3, doubles it, and stores 6 back into x. The comparison 6 > 5 is evaluated after that — the boolean True.",
    },
    {
      title: "Repetition, traced by hand",
      language: "python",
      code: "total = 0\nfor n in [2, 4, 6]:\n    total = total + n\n\nprint(total)\n\noutput:\n12",
      explanation: "total starts at 0 and the loop adds each n: 0 + 2, then + 4, then + 6. The accumulator keeps the running sum; the loop variable n alone would only remember the last value.",
    },
    {
      title: "Choosing a collection by need",
      language: "python",
      code: "steps   = [\"open\", \"mix\", \"pour\"]\npoint   = (10, 20)\nprofile = {\"name\": \"Arya\"}\ntags    = {\"python\", \"coding\"}\n\nprofile[\"name\"] → \"Arya\"    \"python\" in tags → True",
      explanation: "Four needs, four collections: order plus duplicates → list; a fixed group → tuple; labeled values → dictionary; unique values plus membership → set. The data's promise picks the tool — not habit.",
    },
    {
      title: "The final challenge pattern",
      language: "python",
      code: "scores = [55, 72, 68, 90, 70]\nfor score in scores:\n    if score >= 70:\n        print(score)\n\noutput:\n72\n90\n70",
      explanation: "List + for + if + print composed into one small program: the loop visits each value, the conditional keeps only 70 or higher, and print shows each on its own line. No new syntax anywhere.",
    },
  ],
  keyTerms: [
    { term: "Concept family", definition: "A cluster of related concepts learned and reviewed together — six families map this whole course: values, logic, repetition, reusable code, collections, and putting it together." },
    { term: "Retrieval", definition: "Pulling a mental model back out of your head instead of rereading — the review works because recalling strengthens memory more than recognizing." },
    { term: "Trace", definition: "Following a variable line by line: read the old value, compute, overwrite. Tracing is the skill behind both prediction activities and debugging." },
    { term: "Accumulator", definition: "A variable that collects a result across loop passes, like total = total + n — the running sum survives after the loop ends." },
    { term: "Final challenge", definition: "The capstone practice: print only the scores >= 70 from a list by combining list + for + conditional + print in one program." },
    { term: "Foundation", definition: "What this course honestly built: the ability to read, reason about, and build small programs — a starting point, not a mastery score." },
  ],
  commonMistakes: [
    {
      title: "Picking a collection by habit",
      explanation: "Reaching for a list because it is the most familiar ignores each collection's trade: order and duplicates → list, labels → dictionary, fixed group → tuple, uniqueness and membership → set. Read the data's need first.",
    },
    {
      title: "Assuming the review needs new syntax",
      explanation: "Every activity here reuses concepts already learned. If an answer seems to require something never taught, that is a signal an old concept needs retrieving — not new syntax to invent.",
    },
    {
      title: "Mis-tracing a reassignment",
      explanation: "x = x * 2 is not an equation — it reads the current value, computes, and overwrites. Forgetting the read-then-overwrite order makes the line's result surprising.",
    },
    {
      title: "Forgetting the colon or the indent",
      explanation: "for and if lines need a : at the end and an indented body underneath. In a composed program, one missing colon breaks the whole structure.",
    },
    {
      title: "Reading the closing as a mastery score",
      explanation: "Finishing the course flow is not a mastery assessment. The honest result: foundations to read, reason about, and build small programs — the rest comes from continued practice.",
    },
  ],
  quickChecks: [
    {
      question: "x = 3, then x = x * 2, then print(x > 5). What shows?",
      options: ["True — x becomes 6, and 6 > 5", "False — x is still 3", "Error — x = x * 2 needs a new variable name"],
      answer: "True — x becomes 6, and 6 > 5",
      explanation: "The reassignment reads 3, doubles it, and stores 6 back into x; then 6 > 5 evaluates to True.",
    },
    {
      question: "total = 0, a for loop over [2, 4, 6] adds each n to total, then print(total). What shows?",
      options: ["12 — 2 + 4 + 6 accumulated into total", "6 — only the last value of n survives", "Error — a for loop cannot add numbers"],
      answer: "12 — 2 + 4 + 6 accumulated into total",
      explanation: "The accumulator collects every pass: 0 + 2, + 4, + 6. The loop variable n alone would only remember 6.",
    },
    {
      question: "Keep the unique tags of one photo and ask is this tag in it? Which collection fits?",
      options: ["A set — unique values, and in answers membership", "A list — every collection starts as a list", "A dictionary — tags need labels and values"],
      answer: "A set — unique values, and in answers membership",
      explanation: "The need is uniqueness plus membership — exactly the set's trade. A list would store duplicates; a dictionary is for labeled values.",
    },
  ],
};
