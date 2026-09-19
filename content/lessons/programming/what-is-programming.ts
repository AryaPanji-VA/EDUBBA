import type { LessonContent } from "@/content/lessons/types";

export const whatIsProgrammingLessonContent: LessonContent = {
  slug: "what-is-programming",
  intuitiveExplanation: [
    "Programming is, at its core, giving instructions to a computer. But not casual ones — the instructions must be structured: clear, in order, and complete.",
    "Why? Because a computer does not guess what you mean. It executes exactly what is written, one step at a time. Code is how we write those instructions in a language the machine can run.",
    "Every program — a chat app, a game, a calculator — is the same thing at heart: instructions arranged to finish a task or solve a problem. In this lesson you do not need to memorize any Python syntax at all.",
  ],
  academicExplanation: [
    "Programming is the practice of specifying a task as a structured sequence of instructions that a machine can execute. The programmer decides which steps are needed and in which order; the computer executes them without adding intent of its own.",
    "Code is the medium for those instructions: text written in a programming language whose grammar (syntax) defines what counts as a valid instruction, and whose semantics define what each instruction makes the machine do. Writing instructions for a computer differs from writing notes for a person, because the reader cannot infer missing details from context.",
    "A program is the resulting artifact: instructions organized to solve a problem or perform a task. The computer follows the rules of the language exactly — the same instructions produce the same steps every time. Syntax is learned gradually, as a precise way to express instructions, not as a prerequisite memorized in advance.",
  ],
  codeExamples: [
    {
      title: "Greeting program (pseudo-instructions)",
      language: "pseudo",
      code: "1. ambil nama user\n2. buat sapaan: \"Halo, \" + nama\n3. tampilkan sapaan",
      explanation: "Three instructions, one order, one task: greet the user. The computer runs them top to bottom. (The steps stay in Indonesian on purpose — they are the plan, not code yet.)",
    },
    {
      title: "One instruction, written in Python",
      language: "python",
      code: "print(\"Halo, dunia!\")",
      explanation: "Each step of the plan becomes one Python instruction. The step \"tampilkan sapaan\" becomes a single line: print asks for the display, the quotes mark the exact text. You do not need to understand the details yet — the shape is what matters.",
    },
    {
      title: "An instruction with a condition",
      language: "pseudo",
      code: "1. jam = tanya jam sekarang\n2. jika jam >= 18:\n     tampilkan \"Selamat malam!\"\n   else:\n     tampilkan \"Selamat siang!\"",
      explanation: "Programs can also choose a step based on a rule. The computer checks the condition, then runs the matching block — nothing more, nothing less.",
    },
  ],
  keyTerms: [
    { term: "Programming", definition: "Giving structured instructions to a computer to complete a task." },
    { term: "Instruction", definition: "One step a computer can execute, stated clearly and completely." },
    { term: "Code", definition: "The way we write instructions in a programming language the machine can run." },
    { term: "Program", definition: "Instructions organized to solve a problem or perform a task." },
    { term: "Syntax", definition: "The writing rules of a programming language; learned gradually, not memorized first." },
  ],
  commonMistakes: [
    {
      title: "Believing syntax must be memorized first",
      explanation: "Syntax is how instructions are written, not the entrance to programming. Understanding what an instruction is comes first.",
    },
    {
      title: "Assuming the computer understands intent",
      explanation: "A computer does not read minds. An instruction that was never written is never executed, no matter how obvious it feels.",
    },
    {
      title: "Writing ambiguous instructions",
      explanation: "\"Show a suitable greeting\" cannot be executed by a machine. The computer needs a step stating exactly what is done with what.",
    },
    {
      title: "Judging a program by its length",
      explanation: "What matters is whether the instructions are correct and finish the task — not how long or elaborate the code looks.",
    },
  ],
  quickChecks: [
    {
      question: "What is the relationship between code and instructions?",
      options: [
        "Code is how instructions are written in a language the computer can execute",
        "Code and instructions are unrelated things",
        "Code is only used to build app interfaces",
        "Instructions are for humans; code is only for machines",
      ],
      answer: "Code is how instructions are written in a language the computer can execute",
      explanation: "The instructions are the plan; code is the written form in an executable programming language.",
    },
    {
      question: "How does a computer execute instructions?",
      options: [
        "Exactly as written, in order, without guessing the programmer's intent",
        "As the programmer intended, even when it is not written",
        "In any order, as long as the result is correct",
        "Only the instructions the computer considers important",
      ],
      answer: "Exactly as written, in order, without guessing the programmer's intent",
      explanation: "The computer follows the language's rules literally: the same steps run the same way every time.",
    },
    {
      question: "A program is built to…",
      options: [
        "solve a problem or perform a specific task",
        "replace all human work",
        "make the code as long as possible",
        "memorize as much syntax as possible",
      ],
      answer: "solve a problem or perform a specific task",
      explanation: "A program's purpose always lies outside itself: a task to finish. The instructions are only the means.",
    },
  ],
};
