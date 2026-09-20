import type { LessonContent } from "@/content/lessons/types";

export const miniProjectLessonContent: LessonContent = {
  slug: "mini-project",
  intuitiveExplanation: [
    "Udah nggak ada materi baru di sini — sekarang giliran lu yang bikin. Project-nya: STUDENT SCORE CHECKER, program kecil yang nanya nama sama nilai, terus ngatain Pass atau Try Again. Semua bagian-nya udah pernah lu pelajari satu-satu.",
    "Project-nya dipecah jadi lima checkpoint: 1 Inputs, 2 Conversion, 3 Decision, 4 Output, 5 Error handling. Satu checkpoint = satu potongan program. Benerin potongan kecil jauh lebih gampang daripada nulis semua sekaligus.",
    "Nggak ada function, nggak ada trik baru. Yang lu butuhin cuma variable, string, casting, input, conditional, sama try/except — dan ini bukti kalau konsep-konsep itu udah cukup buat bikin program yang beneran jalan.",
  ],
  academicExplanation: [
    "A mini project is a small program assembled from concepts you already have. The Student Score Checker asks for a student's name and a score, safely converts the score to a number, decides Pass or Try Again at the threshold 70, and prints the result together with the name — with a useful message when the score is not a number.",
    "The project is built through five checkpoints: Inputs (two input() lines), Conversion (int() inside try), Decision (if score >= 70 chooses \"Pass\", otherwise \"Try Again\"), Output (print(name, result)), and Error handling (except ValueError prints a useful message). Each checkpoint is one small, testable piece — and the pieces click together into the whole program.",
    "Validation for this project is semantic, not cosmetic: the exact wording, spacing, and variable names may vary, but the program must really read its inputs, really convert with a guard, really decide with the threshold, and really print the result with the name. A solution that only prints a fixed string without ever reading the inputs is not a working program.",
  ],
  codeExamples: [
    {
      title: "Checkpoint 1 — Inputs",
      language: "python",
      code: "name = input(\"Student name: \")\nscore_text = input(\"Score: \")",
      explanation: "Two inputs, two variables: name keeps the text for later, and score_text holds the raw typed score. input() always returns a string — that is why the conversion checkpoint exists.",
    },
    {
      title: "Checkpoint 2 — Conversion, guarded",
      language: "python",
      code: "try:\n    score = int(score_text)",
      explanation: "int(score_text) is the risky line: it works for \"84\" and fails for \"abc\". Putting it inside try is what lets the except block guard it in Checkpoint 5.",
    },
    {
      title: "Checkpoint 3 & 4 — Decision and output",
      language: "python",
      code: "    if score >= 70:\n        result = \"Pass\"\n    else:\n        result = \"Try Again\"\n\n    print(name, result)\n\noutput:\nBima Pass",
      explanation: "The threshold decides once, the result is stored, and print(name, result) shows the name and the result on one line — print with a comma joins them with a space.",
    },
    {
      title: "Checkpoint 5 — Error handling",
      language: "python",
      code: "except ValueError:\n    print(\"Score must be a number\")\n\noutput:\nScore must be a number",
      explanation: "When the score text cannot be converted, ValueError happens and the fallback prints a useful message instead of the program crashing mid-run.",
    },
  ],
  keyTerms: [
    { term: "Student Score Checker", definition: "The mini project: a small CLI program that checks a score and prints the result with the student's name." },
    { term: "Checkpoint", definition: "One small piece of the project — inputs, conversion, decision, output, or error handling — built and checked on its own." },
    { term: "Guarded conversion", definition: "int(score_text) inside try, so a failed conversion is handled instead of crashing the program." },
    { term: "Threshold", definition: "The value the decision compares against: score >= 70 means Pass, anything below means Try Again." },
    { term: "Semantic validation", definition: "The program is judged by what it really does — read, convert, decide, print — not by matching one exact source string." },
    { term: "Useful failure", definition: "When conversion fails, the program prints a message that helps, instead of a crash or a fake result." },
  ],
  commonMistakes: [
    {
      title: "Hardcoding the output",
      explanation: "print(\"Bima Pass\") with no inputs and no decision is not a program — it always shows the same thing no matter what is typed. The result must come from the inputs and the threshold.",
    },
    {
      title: "Converting without a guard",
      explanation: "score = int(score_text) outside try crashes the whole program on \"abc\". The conversion belongs inside try so except can catch the failure.",
    },
    {
      title: "Forgetting the name in the output",
      explanation: "print(result) loses the student. print(name, result) shows both — the result belongs to a person.",
    },
    {
      title: "Using the wrong threshold",
      explanation: "score > 70 rejects a score of exactly 70. The requirement is score >= 70 — 70 itself passes.",
    },
    {
      title: "Catching with a bare except",
      explanation: "except ValueError: names the one expected failure. A bare except: would also hide real mistakes like a misspelled variable name.",
    },
  ],
  quickChecks: [
    {
      question: "What does input(\"Score: \") give you for the typed text 84?",
      options: ["The string \"84\" — input() always returns text", "The number 84 — input() converts automatically", "Nothing — input() only prints a prompt"],
      answer: "The string \"84\" — input() always returns text",
      explanation: "input() always returns a string, which is exactly why the score needs int(score_text) before the >= 70 comparison.",
    },
    {
      question: "score = 70. What does the required decision print?",
      options: ["Pass — the requirement is score >= 70", "Try Again — 70 is not above 70", "Nothing — 70 fails the conversion"],
      answer: "Pass — the requirement is score >= 70",
      explanation: "70 >= 70 is True, so the if branch runs and result becomes \"Pass\".",
    },
    {
      question: "The user types \"abc\" as the score. What should the finished program do?",
      options: ["Print \"Score must be a number\" — the ValueError fallback", "Crash with ValueError — nothing catches it", "Print \"Try Again\" — abc is below 70"],
      answer: "Print \"Score must be a number\" — the ValueError fallback",
      explanation: "int(\"abc\") raises ValueError, the except block catches it, and the fallback prints a useful message instead of crashing.",
    },
  ],
};
