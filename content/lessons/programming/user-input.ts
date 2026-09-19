import type { LessonContent } from "@/content/lessons/types";

export const userInputLessonContent: LessonContent = {
  slug: "user-input",
  intuitiveExplanation: [
    "Setiap program sejauh ini memakai value yang ditulis langsung di dalam code. User input membuka pintu sebaliknya: program meminta value dari orang yang menjalankannya, saat program berjalan.",
    "input() adalah built-in tool untuk itu: dia menampilkan pesan singkat, menunggu user mengetik, dan menghasilkan value berupa string — selalu string, apa pun yang diketik.",
    "Karena hasilnya string, angka yang diketik user juga datang sebagai teks: mengetik 20 memberi \"20\". Untuk memperlakukannya sebagai angka, konversi eksplisit dari Casting dipakai: int(age_text).",
  ],
  academicExplanation: [
    "input() is the built-in function that receives data from the person running the program. Its argument is a prompt — a short message shown to the user — and its result is always a string containing whatever was typed.",
    "The string result is stored like any value: name = input(\"Name: \") points the name at the typed characters. Because typing digits produces characters, an input like 20 arrives as \"20\", and int(age_text) from the Casting lesson is how a program deliberately turns it into the number 20.",
    "input() and print() are opposite directions of the same pipeline: input() brings data into the program from the user, print() sends data out to the screen. A program can now receive data, operate on it, and show a result.",
  ],
  codeExamples: [
    {
      title: "Basic input",
      language: "python",
      code: "name = input(\"Name: \")\nprint(name)\n\nuser types: Arya\n\noutput:\nArya",
      explanation: "The prompt \"Name: \" appears, the user types Arya, and the name variable holds the string \"Arya\". print then shows it back.",
    },
    {
      title: "Input always arrives as a string",
      language: "python",
      code: "age = input(\"Age: \")\n\nuser types: 20\n\nage → \"20\" → str",
      explanation: "Even though the user typed digits, input() produces the string \"20\". The type follows the tool, not what the characters look like.",
    },
    {
      title: "Two-step conversion, then the compact form",
      language: "python",
      code: "age_text = input(\"Age: \")\nage = int(age_text)\n\n# compact, setelah pola two-step-nya jelas:\nage = int(input(\"Age: \"))",
      explanation: "Two steps first: input() gives \"20\", then Casting's int() turns it into the number 20. Once that pipeline is clear, the compact form nests the calls — same result, one line.",
    },
  ],
  keyTerms: [
    { term: "input()", definition: "The built-in tool that receives typed data from the user and produces a string." },
    { term: "Prompt", definition: "The message inside input() that tells the user what to type." },
    { term: "Input vs output", definition: "input() brings data into the program; print() sends data out to the screen." },
    { term: "String result", definition: "input() always produces a string, even when the user types digits." },
    { term: "Two-step conversion", definition: "Store the input, then convert it explicitly: age_text = input(...), age = int(age_text)." },
  ],
  commonMistakes: [
    {
      title: "Assuming typed digits become a number",
      explanation: "Typing 20 gives the string \"20\". Without int() the value is text — the digits do not convert by themselves.",
    },
    {
      title: "Mixing up input and print",
      explanation: "input() pulls data in from the user; print() pushes data out to the screen. They point in opposite directions.",
    },
    {
      title: "Hardcoding instead of asking",
      explanation: "name = \"Arya\" ignores the person at the keyboard. name = input(\"Name: \") is what actually receives their value.",
    },
    {
      title: "Converting before storing",
      explanation: "The result of input() must be captured first (or passed straight into int()). The two-step order — input, then convert — keeps the pipeline readable.",
    },
  ],
  quickChecks: [
    {
      question: "age = input(\"Age: \") and the user types 20. What does age hold?",
      options: ["The string \"20\"", "The number 20", "The number 20.0", "Nothing yet"],
      answer: "The string \"20\"",
      explanation: "input() always produces a string — the digits arrive as characters.",
    },
    {
      question: "What is the text inside input(\"Name: \") for?",
      options: [
        "It is a prompt — a message shown to the user",
        "It is the value the program stores",
        "It sets the type of the result",
        "It is the variable name",
      ],
      answer: "It is a prompt — a message shown to the user",
      explanation: "The string argument is the prompt: guidance for the person typing, not data.",
    },
    {
      question: "Which line actually receives data from the user?",
      options: [
        "name = input(\"Name: \")",
        "print(name)",
        "name = \"Name: \"",
        "print(\"Name: \")",
      ],
      answer: "name = input(\"Name: \")",
      explanation: "input() is the direction that pulls data in; print() sends data out.",
    },
  ],
};
