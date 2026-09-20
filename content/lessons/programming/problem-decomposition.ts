import type { LessonContent } from "@/content/lessons/types";

export const problemDecompositionLessonContent: LessonContent = {
  slug: "problem-decomposition",
  intuitiveExplanation: [
    "Program rata-rata dua nilai keliatan kayak satu blok gede, tapi coba baca pelan-pelan: minta nilai pertama, minta nilai kedua, ubah jadi angka, hitung rata-rata, bandingin dengan 70, milih hasil, print. Tujuh langkah kecil — dan nggak ada satu pun yang baru buat lu.",
    "Ini namanya problem decomposition: pecah masalah besarnya dulu sebelum nyentuh keyboard. Tiap langkah cuma butuh konsep yang udah lu kuasai — input() dari User Input, int() dari Casting, variable dari Variables, + dan / dari Operators, if/else dari Conditionals, print() dari print().",
    "Polanya selalu sama: INPUT (dua nilai dari user), PROCESS (konversi, hitung, bandingin, milih), OUTPUT (satu hasil ke layar). Kalau lu bisa sebutin input sama output-nya duluan, bagian tengahnya tinggal diisi satu langkah sekaligus.",
  ],
  academicExplanation: [
    "Problem decomposition is the habit of splitting a big task into small steps before writing code. The two-scores program looks like one blob, but read slowly it is seven steps: get the first score, get the second score, convert the values to numbers, calculate the average, compare the average with 70, choose the result, print the result.",
    "Every step maps onto a concept already learned: reading data is User Input with input(), converting text is Casting with int(), storing values is Variables, the arithmetic is Operators with + and /, the comparison and choice is Conditionals with if / else, and showing the result is print(). Decomposition introduces no new syntax at all — it is a way of thinking, not a language feature.",
    "The shape is input, process, output: two scores come in (INPUT), everything in between transforms them (PROCESS), and one printed result comes out (OUTPUT). Naming the input and the output first pins down the goal, and the process in between can then be solved one step at a time.",
  ],
  codeExamples: [
    {
      title: "Decompose first, code later",
      language: "python",
      code: "# 1. get the first score\n# 2. get the second score\n# 3. convert both scores to numbers\n# 4. calculate the average\n# 5. compare the average with 70\n# 6. choose the result\n# 7. print the result",
      explanation: "The whole program as a plan: seven comments, one per step, in an order that can run. Nothing here is syntax to learn — it is the problem, split.",
    },
    {
      title: "The compact final program",
      language: "python",
      code: "first_text = input(\"First score: \")\nsecond_text = input(\"Second score: \")\nfirst = int(first_text)\nsecond = int(second_text)\naverage = (first + second) / 2\n\nif average >= 70:\n    result = \"Pass\"\nelse:\n    result = \"Try Again\"\n\nprint(result)\n\noutput:\nPass  (when both scores are 80 and 60)",
      explanation: "The compact program only after the decomposition: each of the seven steps becomes one or two lines of known syntax. Read the plan top to bottom and the code follows it exactly.",
    },
    {
      title: "Every step is a concept you know",
      language: "python",
      code: "# get the first score      → User Input   (input())\n# convert to numbers       → Casting      (int())\n# calculate the average    → Variables + Operators (+ and /)\n# compare and choose       → Conditionals (if / else)\n# print the result         → print()",
      explanation: "Decomposition is also a map back to what you already own: each step points at a lesson you finished. No step asks for a function, a keyword, or anything new.",
    },
    {
      title: "Input, process, output",
      language: "python",
      code: "# INPUT\ntext1 = input(\"First score: \")\ntext2 = input(\"Second score: \")\n\n# PROCESS\nfirst = int(text1)\nsecond = int(text2)\naverage = (first + second) / 2\nif average >= 70:\n    result = \"Pass\"\nelse:\n    result = \"Try Again\"\n\n# OUTPUT\nprint(result)",
      explanation: "The three zones of the same program. Data enters (INPUT), gets transformed (PROCESS), one result leaves (OUTPUT). Name the two ends first and the middle fills itself in, step by step.",
    },
  ],
  keyTerms: [
    { term: "Problem Decomposition", definition: "Splitting a big task into small steps before writing code — plan first, code later." },
    { term: "Input", definition: "The data a program collects — here, the two scores read from the user with input()." },
    { term: "Process", definition: "Everything between input and output: convert the values, calculate the average, compare, choose." },
    { term: "Output", definition: "The result the program shows — here, one printed line: Pass or Try Again." },
    { term: "Step", definition: "One small, doable action in the plan, written in an order that can run." },
    { term: "Known Concept", definition: "A tool already learned: input(), int(), variables, + and /, if / else, print(). Decomposition needs no new syntax." },
  ],
  commonMistakes: [
    {
      title: "Writing code before planning",
      explanation: "Diving straight into the editor skips the decomposition. Write the seven small steps first — as comments — then turn them into code one at a time.",
    },
    {
      title: "Treating the printed result as the starting point",
      explanation: "The output is the last step, not the first. The program cannot print Pass before it has collected and averaged the scores.",
    },
    {
      title: "Believing decomposition needs new syntax",
      explanation: "Splitting a problem is thinking, not a language feature. Every step here uses input(), int(), variables, + and /, if / else, and print() — all already learned.",
    },
    {
      title: "Steps in an order that cannot run",
      explanation: "Averaging before reading the scores, or converting after averaging, cannot run. Each step must hand its result to the next one in a runnable order.",
    },
    {
      title: "Averaging text instead of numbers",
      explanation: "(first + second) / 2 on the raw input() strings does not produce a real average — convert each value with int() first, then do the arithmetic.",
    },
  ],
  quickChecks: [
    {
      question: "In the two-scores program, which part is the INPUT?",
      options: ["Two scores collected from the user", "The average calculation", "The printed Pass or Try Again"],
      answer: "Two scores collected from the user",
      explanation: "Input is what the program collects: the two scores from input(). The calculation is process, the printed line is output.",
    },
    {
      question: "Which step must come right after reading both scores?",
      options: ["Convert both scores to numbers with int()", "Print the result", "Compare the average with 70"],
      answer: "Convert both scores to numbers with int()",
      explanation: "input() returns text, and text cannot be averaged — int() must cast each score between collecting and calculating.",
    },
    {
      question: "What does decomposing this problem require?",
      options: ["Only concepts you already know", "A new Python keyword for planning", "A special function for splitting problems"],
      answer: "Only concepts you already know",
      explanation: "Decomposition is thinking, not syntax. Every step maps to input(), int(), variables, + and /, if / else, or print().",
    },
  ],
};
