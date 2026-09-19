import type { LessonContent } from "@/content/lessons/types";

export const helloPythonLessonContent: LessonContent = {
  slug: "hello-python",
  intuitiveExplanation: [
    "Lesson sebelumnya: programming itu memberi instruksi ke komputer. Pertanyaannya, instruksi ditulis pakai bahasa apa? Jawaban lesson ini: Python.",
    "Python adalah sebuah programming language — bahasa dengan aturan tulis yang sederhana dan dekat dengan bahasa manusia. Karena itu Python cocok jadi bahasa pertama: fokus kamu ada di cara berpikir, bukan di menghafal aturan.",
    "Dan inilah program Python pertama kamu: print(\"Halo, dunia!\") — satu baris, satu instruksi, yang meminta Python menampilkan teks Halo, dunia! ke layar. Jalankan, dan output-nya muncul.",
  ],
  academicExplanation: [
    "Python is a programming language: a set of rules for writing instructions a computer can execute. Its syntax is deliberately small and close to plain language, which is why a complete first instruction fits on one line.",
    "A Python program is text. Running it means a Python interpreter reads the file top to bottom and executes each instruction as it is read. Whatever the instructions cause to appear — on a screen, in a file, anywhere — is the program's output.",
    "print() is the Python instruction that displays a value as output. This lesson introduces it as the way to ask Python to show something; the next lesson examines what can be displayed and how the instruction is structured.",
  ],
  codeExamples: [
    {
      title: "Program Python pertama",
      language: "python",
      code: "print(\"Halo, dunia!\")",
      explanation: "One line, one instruction. Running it displays Halo, dunia! as output — the text between the quotes is shown, not the line itself.",
    },
    {
      title: "Output appears in reading order",
      language: "python",
      code: "print(\"Pertama\")\nprint(\"Kedua\")",
      explanation: "Python reads the program top to bottom and executes one instruction at a time. The order of the lines is the order of the output.",
    },
    {
      title: "Same instruction, different text",
      language: "python",
      code: "print(\"Halo, Arya!\")",
      explanation: "The structure stays print(...) — only the text inside changes, and so does the output. The instruction is the pattern; the text is the detail.",
    },
  ],
  keyTerms: [
    { term: "Python", definition: "A programming language used to write instructions a computer can execute." },
    { term: "Program", definition: "Text written in a programming language — a set of instructions the computer can run." },
    { term: "Instruction", definition: "One step that Python can read and execute." },
    { term: "Output", definition: "Whatever a program causes to appear when it runs." },
    { term: "print()", definition: "The Python instruction for displaying something as output." },
  ],
  commonMistakes: [
    {
      title: "Thinking Python is an app you click",
      explanation: "Python is the language. The tool that reads and runs the code (the interpreter) is separate: you write instructions, it executes them.",
    },
    {
      title: "Treating the order of lines as unimportant",
      explanation: "Python reads top to bottom, one instruction at a time. Swap two lines and the output swaps with them.",
    },
    {
      title: "Confusing code with output",
      explanation: "Code is what you write; output is what appears when it runs. print(\"Halo, dunia!\") is the instruction — Halo, dunia! is the output.",
    },
    {
      title: "Trying to memorize Python first",
      explanation: "Python is learned by writing and running small instructions, not by memorizing. One line that runs teaches more than a page that is memorized.",
    },
  ],
  quickChecks: [
    {
      question: "What is Python?",
      options: [
        "A programming language for writing instructions a computer can execute",
        "An app for editing text files",
        "The output a program produces",
        "A collection of errors to memorize",
      ],
      answer: "A programming language for writing instructions a computer can execute",
      explanation: "Python is the language; the instructions you write in it are the program, and running the program produces output.",
    },
    {
      question: "How does Python run a program?",
      options: [
        "It reads the program top to bottom and executes each instruction in order",
        "It reads the program bottom to top",
        "It executes the lines in a random order",
        "It executes only the last line",
      ],
      answer: "It reads the program top to bottom and executes each instruction in order",
      explanation: "One instruction at a time, in the written order — that is why line order and output order match.",
    },
    {
      question: "What is the output of print(\"Halo, dunia!\")?",
      options: [
        "Halo, dunia!",
        "print(\"Halo, dunia!\")",
        "Halo",
        "Nothing — the text is only stored",
      ],
      answer: "Halo, dunia!",
      explanation: "print() displays the text between the quotes. The line of code is the instruction; the displayed text is the output.",
    },
  ],
};
