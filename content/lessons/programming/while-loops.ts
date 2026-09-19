import type { LessonContent } from "@/content/lessons/types";

export const whileLoopsLessonContent: LessonContent = {
  slug: "while-loops",
  intuitiveExplanation: [
    "Di lesson Conditionals, if itu nanya sekali: kalau True, bloknya jalan sekali. While loop nanyanya terus: selama kondisinya masih True, blok yang menjorok jalan lagi dan lagi. Itulah cara program ngulang pekerjaan tanpa copy-paste baris yang sama.",
    "Alurnya gini: kondisi dicek → kalau True, body jalan sekali → state di-update → kondisi dicek lagi → begitu terus — sampai suatu saat ceknya False, dan loop-nya berhenti. Contoh paling klasik: hitung dari 1 sampai 3 — count = 1, while count <= 3, print(count), terus count = count + 1.",
    "Biar loop-nya berhenti, ada tiga bagian yang wajib ada: starting state yang disiapin sebelum loop, kondisi yang dicek setiap putaran, dan update di dalam body yang nggerakkan state ke arah False. Kalau updatenya lupa ditulis, kondisinya nggak pernah berubah — loop-nya muter terus tanpa berhenti. Itu namanya infinite loop.",
  ],
  academicExplanation: [
    "A while loop repeats an indented body while its condition remains True. Python evaluates the condition before every pass: True runs the body once and returns control to the check; False skips the body and execution continues after the loop. Because the check comes first, a while loop can run zero times when the condition is False from the start.",
    "The core example traces like this: count = 1; check 1 <= 3 → True, print 1, update count to 2; check 2 <= 3 → True, print 2, update to 3; check 3 <= 3 → True, print 3, update to 4; final check 4 <= 3 → False, the body is skipped and the loop ends. Output: 1, 2, 3 — the failing check runs no body.",
    "Every working while loop has three pieces: a starting state — the variable the condition depends on, initialized before the loop; a condition — checked before every pass; and an update — inside the body, changing the state so the condition eventually becomes False. The update is what makes the loop stop: without it, the condition never changes and the loop runs indefinitely (an infinite loop).",
    "Contrast: a for loop (later, with range()) repeats across known items; a while loop repeats while a condition remains True. Use while when the number of repetitions is controlled by a condition rather than known in advance.",
  ],
  codeExamples: [
    {
      title: "The core while loop",
      language: "python",
      code: "count = 1\n\nwhile count <= 3:\n    print(count)\n    count = count + 1\n\noutput:\n1\n2\n3",
      explanation: "Pass 1: 1 <= 3 is True, so the body prints 1 and the update moves count to 2. Pass 2: 2 <= 3 is True → prints 2, count becomes 3. Pass 3: 3 <= 3 is True → prints 3, count becomes 4. Final check: 4 <= 3 is False, so the body is skipped and the loop stops. Nothing prints for 4 — the output is exactly 1, 2, 3.",
    },
    {
      title: "Trace of the condition, pass by pass",
      language: "python",
      code: "count = 1\n\n# check 1: count = 1 → 1 <= 3 True  → print 1, update → 2\n# check 2: count = 2 → 2 <= 3 True  → print 2, update → 3\n# check 3: count = 3 → 3 <= 3 True  → print 3, update → 4\n# check 4: count = 4 → 4 <= 3 False → loop stops here\n\noutput:\n1\n2\n3",
      explanation: "Every pass starts with a check. The update happens inside the body, after the print — so the value that just printed is never the value that fails the check. The final check with count = 4 fails, and that pass runs no body.",
    },
    {
      title: "A different target: keep doubling",
      language: "python",
      code: "steps = 0\nvalue = 1\n\nwhile value < 100:\n    value = value * 2\n    steps = steps + 1\n\nprint(steps)\n\noutput:\n7",
      explanation: "The starting state is value = 1 and steps = 0. Each pass doubles value and counts one step: 2, 4, 8, 16, 32, 64, 128. When value = 128, the check 128 < 100 is False, so the loop stops after 7 passes and prints 7. The same three pieces — start, condition, update — just with a different target than a counter.",
    },
    {
      title: "What goes wrong: the missing update",
      language: "python",
      code: "count = 1\n\nwhile count <= 3:\n    print(count)\n# no update inside the body\n\nresult: prints 1 forever — an infinite loop",
      explanation: "Warning example — do not run this. The condition is checked, True, the body prints 1 — and then the check happens again with the same count = 1. Nothing inside the body ever moves count toward 4, so the condition can never become False. The update is the piece that ends the loop; forget it and the loop runs indefinitely.",
    },
  ],
  keyTerms: [
    { term: "While loop", definition: "A block that repeats while its condition remains True — Python checks the condition before every pass." },
    { term: "Condition", definition: "The boolean expression checked before every pass; True runs the body, False ends the loop." },
    { term: "Update", definition: "The line inside the body that changes the loop's state and moves the condition toward False." },
    { term: "Starting state", definition: "The variable the condition depends on, initialized before the loop begins." },
    { term: "Infinite loop", definition: "A loop whose condition never becomes False — usually because the update is missing — so it never stops." },
    { term: "Iteration", definition: "One full pass of the loop: check the condition, run the body once." },
  ],
  commonMistakes: [
    {
      title: "Forgetting the update",
      explanation: "Without count = count + 1 inside the body, the state never changes, the condition stays True, and the loop runs forever. The update is what moves the loop toward its stop.",
    },
    {
      title: "Writing the update outside the body",
      explanation: "count = count + 1 must be indented under the while, inside the body. Un-indented, it runs only after the loop ends — the body repeats with a state that never changes: an infinite loop.",
    },
    {
      title: "A condition that never becomes False",
      explanation: "total = total + 3 skips from 9 straight to 12, so total != 10 is True forever. An update can move the state and still miss the exact stop value — trace the values to be sure the condition can turn False.",
    },
    {
      title: "Assuming the body runs at least once",
      explanation: "while checks FIRST. If the condition is False before the first pass — count = 10, while count <= 3 — the body runs zero times and the program continues after the loop.",
    },
    {
      title: "Off-by-one around the final check",
      explanation: "The loop stops at the first check that fails: after printing 3, count becomes 4 and 4 <= 3 is False — so 4 never prints. Expecting one extra pass (or one fewer) comes from skipping the final failing check in the trace.",
    },
  ],
  quickChecks: [
    {
      question: "How many times does this body run?",
      code: "count = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1",
      options: ["5 times", "4 times", "6 times", "Forever"],
      answer: "5 times",
      explanation: "Checks with count = 1, 2, 3, 4, 5 are all True — five passes. The next check, 6 <= 5, is False, so the loop stops before a sixth pass.",
    },
    {
      question: "What does this print?",
      code: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1",
      options: ["3", "3, 2, 1", "3, 2, 1, 0", "Nothing"],
      answer: "3, 2, 1",
      explanation: "3 > 0, 2 > 0, 1 > 0 are True — three passes print 3, 2, 1. Then 0 > 0 is False, so the loop stops before printing 0.",
    },
    {
      question: "Why does this loop never stop?",
      code: "total = 0\nwhile total != 10:\n    total = total + 3",
      options: [
        "total skips over 10 — it goes 0, 3, 6, 9, 12, so != 10 stays True",
        "The update line is missing",
        "while cannot use !=",
        "It stops after 10 passes",
      ],
      answer: "total skips over 10 — it goes 0, 3, 6, 9, 12, so != 10 stays True",
      explanation: "The update moves total, but by 3 at a time — it jumps from 9 to 12 and never equals 10. The condition can never become False, so the loop runs indefinitely.",
    },
  ],
};
