import type { LessonContent } from "@/content/lessons/types";

export const variablesLessonContent: LessonContent = {
  slug: "variables",
  intuitiveExplanation: [
    "Anggap variable kayak nama yang lu kasih ke suatu value supaya program bisa manggil value itu lagi tanpa nulis semuanya dari awal.",
    "Misalnya jumlah kopi malam ini adalah 2. Kita bisa memberi angka itu nama cups_of_coffee. Saat program butuh jumlahnya, ia memakai nama tersebut. Kalau jumlah kopinya berubah, nama yang sama bisa dihubungkan ke value baru.",
    "Analogi kotak membantu buat awal, tapi jangan dipegang terlalu harfiah. Di Python, cara yang lebih tepat adalah membayangkan sebuah nama yang terikat ke suatu object atau value.",
  ],
  academicExplanation: [
    "A variable is a program-level identifier whose binding allows code to refer to a value. An assignment statement evaluates the expression on its right-hand side and binds the resulting object to the target name on its left-hand side.",
    "When the same identifier is assigned again, Python rebinds that name to the new object. This is called reassignment. The identifier is not necessarily a physical container in memory, so the common box metaphor is an introductory model rather than a complete description of language semantics.",
    "Python is dynamically typed: values have types, while a name can be rebound to values of different types. Clear identifiers communicate intent and make those bindings easier for people to follow.",
  ],
  codeExamples: [
    {
      title: "Assigning a value",
      language: "python",
      code: "cups_of_coffee = 2\nprint(cups_of_coffee)",
      explanation: "The value 2 is assigned to the identifier cups_of_coffee.",
    },
    {
      title: "Reassigning a variable",
      language: "python",
      code: "score = 10\nscore = 15\nprint(score)  # 15",
      explanation: "The second assignment rebinds score, so the earlier value is no longer the one reached through that name.",
    },
    {
      title: "Using a variable again",
      language: "python",
      code: "name = \"Arya\"\nprint(name)",
      explanation: "The name stores the value once; print(name) reaches it again wherever the program needs it.",
    },
    {
      title: "Choosing readable names",
      language: "python",
      code: "student_name = \"Arya\"\ncompleted_lessons = 4\n\nprint(student_name, completed_lessons)",
      explanation: "Descriptive snake_case names reveal what each value means without requiring extra guesswork.",
    },
  ],
  keyTerms: [
    { term: "Variable", definition: "A named reference used by a program to reach a value." },
    { term: "Value", definition: "The data a program works with, such as 42, True, or \"Arya\"." },
    { term: "Assignment", definition: "The operation that binds a target name to the result of an expression." },
    { term: "Identifier", definition: "A valid programmer-chosen name used to identify something in code." },
    { term: "Reassignment", definition: "Assigning a new value to a name that was already bound." },
  ],
  commonMistakes: [
    {
      title: "Assuming reassignment merges values",
      explanation: "Each assignment replaces the binding. After score = 10 and score = 20, the name points to 20 only — the two values are not combined.",
    },
    {
      title: "Using an invalid identifier",
      explanation: "A name cannot start with a digit, contain spaces or hyphens, or use a reserved Python keyword such as class.",
    },
    {
      title: "Reading a variable before assignment",
      explanation: "Python cannot retrieve a local name that has not been bound yet and will raise a NameError.",
    },
    {
      title: "Choosing a name with no meaning",
      explanation: "Names like x can be fine in tiny formulas, but descriptive names are easier to understand in application code.",
    },
  ],
  quickChecks: [
    {
      question: "What does this program print?",
      code: "name = \"Arya\"\nprint(name)",
      options: ["Arya", "name", "NameError"],
      answer: "Arya",
      explanation: "print(name) reads the value reached through the name — \"Arya\" — and displays it.",
    },
    {
      question: "Which one is a valid, readable Python identifier?",
      options: ["2nd_score", "student-score", "student_score", "class"],
      answer: "student_score",
      explanation: "It starts with a letter, uses only letters and an underscore, and is not a Python keyword.",
    },
    {
      question: "score starts at 10, then score = 20 runs. What does print(score) show?",
      options: ["20 — the name now points to the new value", "10 — the first assignment wins", "10 and 20 — both values stay attached"],
      answer: "20 — the name now points to the new value",
      explanation: "Reassignment replaces the binding: after score = 20, the name reaches 20. The old 10 is no longer attached to the name.",
    },
  ],
};
