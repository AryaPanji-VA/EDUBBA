import type { LessonContent } from "@/content/lessons/types";

export const printOutputLessonContent: LessonContent = {
  slug: "print-output",
  intuitiveExplanation: [
    "A program that computes something but never shows it is like talking without a sound. Output is how a program speaks: the text, the numbers, the results that actually appear for you.",
    "In Python, the way you ask for output is print(). print(\"Hello!\") means: Python, display the text Hello!. The word print is the instruction, the parentheses carry what to display, and the quotes mark the exact text.",
    "Run it and Hello! appears. That is the whole deal — and it is also how you will check your own work from now on: write instructions, run them, read the output.",
  ],
  academicExplanation: [
    "Output is whatever a program causes to appear when it runs — text on a screen, a line in a file, a value handed to another program. It is the program's observable effect, as opposed to the code, which is the written instructions.",
    "print() is a Python instruction that displays a value as output. The parentheses enclose what should be displayed; quotation marks mark a piece of exact text (a string of characters). Each print() call displays its content on a new line.",
    "A program with several print() instructions produces its output in execution order: the interpreter reads the program top to bottom and displays each line's content as the instruction is reached. The order of the code is the order of the output.",
  ],
  codeExamples: [
    {
      title: "One instruction, one output",
      language: "python",
      code: "print(\"Hello!\")\n\noutput:\nHello!",
      explanation: "print is the instruction, the parentheses carry what to display, and the quotes mark the exact text. The output appears exactly as written between the quotes.",
    },
    {
      title: "Several instructions, ordered output",
      language: "python",
      code: "print(\"Hello!\")\nprint(\"Welcome to Python\")\n\noutput:\nHello!\nWelcome to Python",
      explanation: "Each print() displays its own text on a new line, in the order the instructions are written. The second instruction starts only after the first has done its work.",
    },
    {
      title: "You choose the text",
      language: "python",
      code: "print(\"Selamat belajar, Python!\")\n\noutput:\nSelamat belajar, Python!",
      explanation: "The structure never changes — print(...) — while the text between the quotes is entirely yours. Change the text and the output follows.",
    },
  ],
  keyTerms: [
    { term: "Output", definition: "Whatever a program causes to appear when it runs." },
    { term: "print()", definition: "The Python instruction for displaying something as output." },
    { term: "Parentheses ( )", definition: "The part of print that carries what should be displayed." },
    { term: "Quotation marks \" \"", definition: "The markers around the exact text that should be displayed." },
    { term: "Execution order", definition: "The top-to-bottom order in which Python runs the instructions — the order the output appears in." },
  ],
  commonMistakes: [
    {
      title: "Confusing the code with the output",
      explanation: "print(\"Hello!\") is the instruction you write. Hello! is what appears when it runs. If your screen shows print(\"Hello!\"), the code is being displayed, not executed.",
    },
    {
      title: "Treating the quotes as decoration",
      explanation: "The quotes mark the exact text to display. Remove them and you are no longer asking Python to show that exact text.",
    },
    {
      title: "Expecting all output at once",
      explanation: "Each print() shows one piece of text on its own line. Output arrives instruction by instruction, in order — not as one merged line.",
    },
    {
      title: "Ignoring the order of the lines",
      explanation: "Swap two print() lines and the output swaps with them. The order of the code is the order of the output.",
    },
  ],
  quickChecks: [
    {
      question: "What is output?",
      options: [
        "Whatever the program causes to appear when it runs",
        "The instructions the programmer wrote",
        "The file where code is saved",
        "Another word for the Python language",
      ],
      answer: "Whatever the program causes to appear when it runs",
      explanation: "Code is the written instructions; output is the observable result of running them.",
    },
    {
      question: "What does print(\"Hello!\") display?",
      options: [
        "Hello!",
        "print(\"Hello!\")",
        "Hello",
        "Nothing — it only stores the text",
      ],
      answer: "Hello!",
      explanation: "The quotes mark the exact text; print displays it. The line of code is the instruction, not the display.",
    },
    {
      question: "print(\"A\") runs first, then print(\"B\"). What appears?",
      options: [
        "A on the first line, B on the second line",
        "B on the first line, A on the second line",
        "A and B together on one line",
        "Only B, because it runs last",
      ],
      answer: "A on the first line, B on the second line",
      explanation: "Python runs the instructions top to bottom, and each print() displays on a new line. Code order = output order.",
    },
  ],
};
