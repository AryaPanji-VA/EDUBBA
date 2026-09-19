import type { LessonContent } from "@/content/lessons/types";

export const numbersLessonContent: LessonContent = {
  slug: "numbers",
  intuitiveExplanation: [
    "Data Types introduced the two number types; this lesson looks closer at them. Numbers are the values programs count with — a score, a temperature, a price — and Python keeps two kinds apart: int for whole numbers, float for decimals.",
    "The shape of the value tells you the type: 10, 0, and -4 are written as int; 3.14, 0.5, and -2.5 are written as float. Even -4 is a perfectly normal number — the minus sign does not stop it from being numeric.",
    "And the payoff of storing numbers in variables: they can be calculated. 10 + 5, 10 - 5, 10 * 2, 10 / 2 — Python computes the result, and the result is itself a number.",
  ],
  academicExplanation: [
    "Python represents whole numbers as int (10, 0, -4) and numbers with a decimal point as float (3.14, 0.5, -2.5). The written form decides the type: 5 and 5.0 name the same quantity to a human, but Python stores one as int and the other as float.",
    "Variables hold numeric values the same way they hold any value: the name points to the number, and the number has its type — name → value → type. Reassignment can store a newly calculated number under an existing name.",
    "Numbers support calculation. The four basic operations — +, -, *, / — combine numeric values into a new numeric value: 10 + 5 is 15, and storing that result in a variable works exactly like any other assignment.",
  ],
  codeExamples: [
    {
      title: "Whole numbers and decimals",
      language: "python",
      code: "10      # int\n0       # int\n-4      # int\n\n3.14    # float\n0.5     # float\n-2.5    # float",
      explanation: "The shape names the type: whole numbers (positive, zero, or negative) are int; a decimal point makes the value float.",
    },
    {
      title: "5 and 5.0 are different types",
      language: "python",
      code: "type(5)     # <class 'int'>\ntype(5.0)   # <class 'float'>",
      explanation: "To a human both read as five, but Python stores 5 as int and 5.0 as float. Same quantity, different representation. (Python prints extra detail around the name — the int / float part is what matters.)",
    },
    {
      title: "Numbers in a variable, then calculated",
      language: "python",
      code: "score = 100\ntemperature = 36.5\n\n# angka bisa dihitung\ntotal = 10 + 5\nprint(total)\n\noutput:\n15",
      explanation: "Variables hold numeric values like any value. The four basic calculations — +, -, *, / — turn numbers into a new number, and assignment stores it under a name.",
    },
  ],
  keyTerms: [
    { term: "int", definition: "The type for whole numbers: 10, 0, -4." },
    { term: "float", definition: "The type for numbers written with a decimal point: 3.14, 0.5, -2.5." },
    { term: "Calculation", definition: "Combining numeric values with +, -, *, / into a new number." },
    { term: "Reassignment with calculation", definition: "Storing a freshly calculated number back under an existing name: score = score + 5." },
  ],
  commonMistakes: [
    {
      title: "Calling 5.0 an int",
      explanation: "The value reads as five, but the decimal point makes it a float. 5 and 5.0 are different types in Python.",
    },
    {
      title: "Treating negative numbers as non-numeric",
      explanation: "-4 is a perfectly normal int. The minus sign only says the value is below zero.",
    },
    {
      title: "Putting quotes around a number",
      explanation: "\"5\" has quotes, so it is a string of characters — not a number. Only unquoted 5 is an int.",
    },
    {
      title: "Expecting the calculation text to print",
      explanation: "print(10 + 5) does not display \"10 + 5\". Python computes first and displays the result: 15.",
    },
  ],
  quickChecks: [
    {
      question: "What is the type of 5.0?",
      options: ["float", "int", "str", "Not a number"],
      answer: "float",
      explanation: "The decimal point makes it a float, even though the value reads as five.",
    },
    {
      question: "What does print(10 * 2) display?",
      options: ["20", "10 * 2", "102", "Nothing"],
      answer: "20",
      explanation: "Python calculates first: 10 * 2 is 20, and the result is what gets printed.",
    },
    {
      question: "What is the type of -4?",
      options: ["int", "float", "str", "Not a number"],
      answer: "int",
      explanation: "-4 is a whole number — negative, but still an int.",
    },
  ],
};
