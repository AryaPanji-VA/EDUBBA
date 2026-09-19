import type { LessonContent } from "@/content/lessons/types";

export const commentsLessonContent: LessonContent = {
  slug: "comments",
  intuitiveExplanation: [
    "Code is read twice: Python runs it, and humans try to understand it. A comment is a note inside your code file written for the human reader — a short line that explains what the code is doing and why.",
    "A comment starts with the hash sign #. Everything after # on that line belongs to the note, and Python completely ignores it when the program runs. The instruction does its work; the comment just travels along.",
    "So the full picture of one small program looks like this: Python reads the code, skips the comments, runs the instructions, and produces output. Three different things on one screen: code, comment, output.",
  ],
  academicExplanation: [
    "A comment is a note in the source code intended for human readers. The hash sign # begins a comment, and the rest of that line is ignored when the program is executed. Comments have no effect on the program's behavior or its output.",
    "A comment may occupy its own line above the code it describes, or appear on the same line after an instruction. In both forms, only the part before # is executed; the note itself is passed over.",
    "A useful comment adds context that the code cannot say by itself — the purpose behind an instruction — rather than repeating what the code already shows. Short and helpful beats long and obvious.",
  ],
  codeExamples: [
    {
      title: "A comment on its own line",
      language: "python",
      code: "# Ini adalah comment\nprint(\"Hello!\")\n\noutput:\nHello!",
      explanation: "Line 1 is a comment — a note for humans, ignored by Python. Line 2 is code — the instruction that runs. What appears is the output: only what the instruction displays.",
    },
    {
      title: "A comment on the same line",
      language: "python",
      code: "print(\"Hello!\") # menampilkan sapaan\n\noutput:\nHello!",
      explanation: "A comment can also follow code on the same line. Only the part before # runs; the note after it is skipped. The output is unchanged.",
    },
    {
      title: "A helpful note vs a repeated one",
      language: "python",
      code: "print(\"Hello!\") # print Hello          ← mengulang code\nprint(\"Hello!\") # sapaan untuk user baru  ← menjelaskan maksud",
      explanation: "The first note repeats what the code already shows. The second explains the intent — why the line exists. Good comments are short and add meaning, not an echo.",
    },
  ],
  keyTerms: [
    { term: "Comment", definition: "A note in the source code for human readers; ignored when the program runs." },
    { term: "Hash (#)", definition: "The sign that starts a comment; everything after it on the line is a note." },
    { term: "Inline comment", definition: "A comment written on the same line, after an instruction." },
    { term: "Intent", definition: "The purpose behind an instruction — the thing a good comment explains." },
  ],
  commonMistakes: [
    {
      title: "Expecting the comment to run",
      explanation: "Python skips comments completely. A comment never produces output and never changes what the instructions do.",
    },
    {
      title: "Writing notes that repeat the code",
      explanation: "# print Hello adds nothing — the code already says that. Explain the intent instead: who is this for, and why does it exist?",
    },
    {
      title: "Forgetting the hash sign",
      explanation: "Without #, a note is read as code — a shape Python does not recognize. Every note starts with #.",
    },
    {
      title: "Writing essays inside the code",
      explanation: "Comments are notes, not paragraphs. A short line that captures the intent helps; a wall of text gets skipped by humans too.",
    },
  ],
  quickChecks: [
    {
      question: "What is a comment?",
      options: [
        "A note in the source code for human readers",
        "An instruction Python runs quietly",
        "A special kind of output",
        "A way to stop the program",
      ],
      answer: "A note in the source code for human readers",
      explanation: "Comments explain the code to people; Python passes over them when the program runs.",
    },
    {
      question: "What does Python do with a comment?",
      options: [
        "It ignores it — the note has no effect on the run",
        "It runs it before the code",
        "It displays it as output",
        "It saves it for the next run",
      ],
      answer: "It ignores it — the note has no effect on the run",
      explanation: "Everything after # on a line is skipped by Python. The output comes only from the instructions.",
    },
    {
      question: "print(\"Hello!\") # menampilkan sapaan — what appears?",
      options: [
        "Hello! — the code runs and the comment is skipped",
        "Hello! menampilkan sapaan — the comment is displayed too",
        "Nothing — a line with a comment is skipped entirely",
        "The comment, then Hello!",
      ],
      answer: "Hello! — the code runs and the comment is skipped",
      explanation: "Only the part before # is executed. An inline comment never changes the output.",
    },
  ],
};
