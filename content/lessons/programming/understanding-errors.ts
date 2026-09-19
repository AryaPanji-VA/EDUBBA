import type { LessonContent } from "@/content/lessons/types";

export const understandingErrorsLessonContent: LessonContent = {
  slug: "understanding-errors",
  intuitiveExplanation: [
    "Every programmer sees errors every single day. An error is not a failure — it is Python telling you, in its own way, that it could not run the code as written, and where to look.",
    "An error message has three useful parts: the error's name (like SyntaxError or IndentationError), the location (which line it happened on), and a hint about the problem. Reading those three parts is usually enough to find the fix.",
    "That gives you the working cycle you will use for the rest of your programming life: run the code, read the error, find the problem, fix it, run it again. Errors are not the end of programming — they are how programming moves forward.",
  ],
  academicExplanation: [
    "An error occurs when Python cannot run the code as written. Instead of continuing, Python stops at the problem and prints a message describing it. The message names the kind of problem — for example SyntaxError when an instruction's shape is incomplete, or IndentationError when the leading spaces are wrong.",
    "A simple error message can be read in three parts: the error name, the location (the line Python was reading), and a hint about what went wrong. A misspelled instruction name produces its own kind of message telling you the name is not recognized — the spelling you learned is the fix.",
    "The practical response to any error is the same cycle: run, read the message, locate the line, fix the shape, and run again. Each cycle turns one piece of information from Python into one correction in the code.",
  ],
  codeExamples: [
    {
      title: "An error message is a hint",
      language: "python",
      code: "print(\"Hello!\n\noutput:\nSyntaxError: unterminated string — kutip penutupnya hilang",
      explanation: "Python stops and names the problem instead of guessing. The message says what is wrong (the string was never closed) — that is a hint, not a punishment.",
    },
    {
      title: "Two names you will see often",
      language: "python",
      code: "print(\"Halo          → SyntaxError   (bentuk instruksinya tidak lengkap)\n  print(\"Halo!\")    → IndentationError   (menjorok padahal seharusnya rata kiri)",
      explanation: "Missing quotes or parentheses are read as SyntaxError. Wrong spaces at the start of a line are read as IndentationError. Both names point at the shape of the writing.",
    },
    {
      title: "The fix cycle in action",
      language: "python",
      code: "1. run:            Print(\"Hello!\")   → pesan: 'Print' tidak dikenali\n2. baca petunjuk:  ejaan yang benar adalah print\n3. perbaiki:       print(\"Hello!\")\n4. run lagi:       output:\n                   Hello!",
      explanation: "Run, read the hint, fix, run again. One cycle turns the message into the correction — and the output confirms the fix.",
    },
  ],
  keyTerms: [
    { term: "Error", definition: "Python's way of saying it cannot run the code as written — with a hint about why." },
    { term: "Error message", definition: "The hint Python prints: the error's name, the location, and the problem." },
    { term: "SyntaxError", definition: "The error name for an instruction whose written shape is incomplete." },
    { term: "IndentationError", definition: "The error name for wrong spaces at the start of a line." },
    { term: "Fix cycle", definition: "Run → read the error → find the problem → fix it → run again." },
  ],
  commonMistakes: [
    {
      title: "Treating an error as a failure",
      explanation: "An error is information, not a verdict. Every programmer reads errors daily — they are part of how code gets better.",
    },
    {
      title: "Guessing instead of reading",
      explanation: "The message already names the problem and points to the line. Read those three parts before changing anything.",
    },
    {
      title: "Fixing the wrong line",
      explanation: "The message points to a location. Start there — the problem is usually where the message says it is.",
    },
    {
      title: "Deleting the broken line",
      explanation: "The goal is to repair the shape, not to remove the instruction. Fix what the message points at and run again.",
    },
  ],
  quickChecks: [
    {
      question: "What does an error message actually give you?",
      options: [
        "A hint: the error's name, the location, and the problem",
        "A proof that the program cannot be fixed",
        "A new version of the code",
        "Nothing useful — just a stop sign",
      ],
      answer: "A hint: the error's name, the location, and the problem",
      explanation: "Reading those three parts is usually enough to find the fix.",
    },
    {
      question: "print(\"Halo — the closing quote is missing. What is this?",
      options: [
        "A SyntaxError — the instruction's shape is incomplete",
        "An IndentationError — the line starts with spaces",
        "Not an error — Python closes quotes by itself",
        "An output that prints the quote",
      ],
      answer: "A SyntaxError — the instruction's shape is incomplete",
      explanation: "An incomplete written shape is read as SyntaxError. Wrong leading spaces would be IndentationError.",
    },
    {
      question: "You see an error. What is the first move?",
      options: [
        "Read the message: its name, its location, its hint",
        "Delete the line that failed",
        "Rewrite the whole program from scratch",
        "Ignore it and run the same code again",
      ],
      answer: "Read the message: its name, its location, its hint",
      explanation: "The fix cycle starts with reading. Then locate, fix, and run again.",
    },
  ],
};
