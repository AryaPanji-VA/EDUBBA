import type { LessonContent } from "@/content/lessons/types";

export const rangeLoopPatternsLessonContent: LessonContent = {
  slug: "range-loop-patterns",
  intuitiveExplanation: [
    "Sampai pelajaran ini, kalau mau for loop jalan tiga kali, lu nulis list-nya tangan: [0, 1, 2]. range() adalah built-in tool yang menghasilkan deretan angka integer secara otomatis — jadi lu nggak perlu nulis angkanya satu-satu.",
    "Bentuk lengkapnya range(start, stop, step). Mental model inti: range(3) menghasilkan 0, 1, 2 — mulai dari 0 secara default, dan angka stop-nya tidak ikut. Stop itu garis finis, bukan anggota deret.",
    "range() cuma menghasilkan deret — dia nggak print apa-apa sendiri. Pasangkan dengan for: for i in range(3): terus print(i) yang menjorok, dan deret 0, 1, 2 dicetak satu per satu.",
  ],
  academicExplanation: [
    "range() is the built-in that generates a sequence of integers, designed to feed for loops. With one argument, range(3) produces 0, 1, 2 — it starts at 0 by default and counts up to, but not including, the stop value.",
    "The full form is range(start, stop, step): the sequence begins at start, stops just before stop, and moves by step each iteration. range(1, 4) produces 1, 2, 3; range(2, 7, 2) produces 2, 4, 6. The stop value is always excluded, whatever the step.",
    "Because the sequence is fixed in advance, range() also makes the iteration count explicit: range(start, stop) with a positive step runs exactly stop − start times. for i in range(3): binds i to 0, then 1, then 2 — three iterations, one per generated value.",
  ],
  codeExamples: [
    {
      title: "range(3) — counting from zero",
      language: "python",
      code: "for i in range(3):\n    print(i)\n\noutput:\n0\n1\n2",
      explanation: "range(3) generates 0, 1, 2. The loop binds i to each value in order, so the body runs exactly three times. The stop value 3 is never part of the sequence.",
    },
    {
      title: "range(1, 4) — starting where you want",
      language: "python",
      code: "for i in range(1, 4):\n    print(i)\n\noutput:\n1\n2\n3",
      explanation: "Two arguments: start 1, stop 4. The sequence is 1, 2, 3 — it begins at start and stops just before stop. The iteration count is stop − start: 3.",
    },
    {
      title: "range(2, 7, 2) — stepping",
      language: "python",
      code: "for i in range(2, 7, 2):\n    print(i)\n\noutput:\n2\n4\n6",
      explanation: "Three arguments: start 2, stop 7, step 2. The sequence takes strides of 2 — 2, 4, 6 — and still stops before 7. The stop is excluded even though the values land near it exactly.",
    },
    {
      title: "A realistic minute counter",
      language: "python",
      code: "for minute in range(1, 4):\n    print(\"Menit\", minute)\n\noutput:\nMenit 1\nMenit 2\nMenit 3",
      explanation: "Counting minutes 1 to 3 needs range(1, 4): start at 1, stop just before 4. The named loop variable minute keeps the body readable — Menit 1, Menit 2, Menit 3.",
    },
  ],
  keyTerms: [
    { term: "range()", definition: "The built-in tool that generates a sequence of integers for a for loop: range(start, stop, step)." },
    { term: "Start", definition: "The first value of the sequence. With one argument, start is 0 by default; with two or three arguments, it is the first one." },
    { term: "Stop", definition: "The boundary the sequence stops before. The stop value is always excluded from the sequence." },
    { term: "Step", definition: "How far the sequence moves each iteration. The default is 1; range(2, 7, 2) moves 2 at a time." },
    { term: "Sequence", definition: "The ordered integers range() generates — 0, 1, 2 from range(3) — which the for loop walks through, one value per iteration." },
    { term: "Iteration count", definition: "How many times the body runs: the number of values in the sequence. For range(start, stop) with a positive step it is stop − start." },
  ],
  commonMistakes: [
    {
      title: "Assuming range(5) includes 5",
      explanation: "range(5) produces 0, 1, 2, 3, 4. The stop value is a boundary, not a member: the sequence stops just before it.",
    },
    {
      title: "Forgetting the default start is 0",
      explanation: "range(3) starts at 0, not 1. To count 1, 2, 3 you must ask for range(1, 4) — one-based counting needs the start argument written out.",
    },
    {
      title: "Off-by-one when translating \"count from 1 to 5\"",
      explanation: "\"From 1 to 5\" means 1, 2, 3, 4, 5 — five values — so the stop must be one past the last value you want: range(1, 6). Writing range(1, 5) silently drops the 5.",
    },
    {
      title: "Misreading the step",
      explanation: "range(2, 7, 2) gives 2, 4, 6 — strides of 2 starting at 2, and 7 is still not included. A step never pulls the stop value into the sequence.",
    },
    {
      title: "Writing the body without indentation",
      explanation: "for i in range(3): starts a block, so the body must be indented under it. A print at the same level is not part of the loop — the indented line is what repeats.",
    },
    {
      title: "Using range when you already have a list",
      explanation: "for name in [\"Arya\", \"Bima\"] already walks the list directly. range() is the tool for generating a numeric sequence you would otherwise have to type — it adds nothing to a list you can write down.",
    },
  ],
  quickChecks: [
    {
      question: "What does range(1, 4) produce?",
      options: ["1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3", "1, 4"],
      answer: "1, 2, 3",
      explanation: "It starts at 1 and stops just before 4 — the stop value is excluded.",
    },
    {
      question: "How many numbers does range(4) generate?",
      options: ["3", "4", "5", "0"],
      answer: "4",
      explanation: "range(4) generates 0, 1, 2, 3 — four numbers, so the loop body runs four times.",
    },
    {
      question: "What does this loop print?",
      code: "for i in range(2, 7, 2):\n    print(i)",
      options: ["2, 4, 6", "2, 4, 6, 7", "2, 4, 6, 8", "2, 3, 4, 5, 6"],
      answer: "2, 4, 6",
      explanation: "The step of 2 lands on 2, 4, 6 — and the stop 7 is still excluded, whatever the step.",
    },
  ],
};
