import type { LessonContent } from "@/content/lessons/types";

export const parametersArgumentsLessonContent: LessonContent = {
  slug: "parameters-arguments",
  intuitiveExplanation: [
    "Function dari lesson lalu punya kelemahan diam-diam: sekali isinya print(\"Hello\", \"Arya\"), dia cuma bisa menyapa Arya selamanya. Mau menyapa orang lain, berarti harus nulis function baru — padahal polanya sama persis.",
    "Parameter menutup celah itu: sebuah slot bernama di dalam def, misalnya def greet(name):. Saat function dipanggil, argument — value yang ditulis di dalam kurung panggilan, misalnya greet(\"Arya\") — mengisi slot itu.",
    "Jadi satu definisi cukup: greet(\"Arya\") menyapa Arya, greet(\"Bima\") menyapa Bima. Argument-nya yang berubah, behavior ikut berubah — function-nya tetap satu.",
  ],
  academicExplanation: [
    "A parameter is the name written inside the def — greet(name) declares a slot called name that exists only inside the function. An argument is the value supplied at the call — greet(\"Arya\") supplies \"Arya\". The two words name different things: the parameter is the label in the definition; the argument is the value in the call.",
    "The flow runs one way: argument → parameter → body. At the call, the argument's value fills the parameter, and every use of that name inside the body works with the supplied value — print(\"Hello\", name) shows whatever was passed in.",
    "A def with several parameters takes several arguments, and they fill the parameters left to right: introduce(\"Arya\", 20) gives name the value \"Arya\" and age the value 20, in written order. The count must match too — a call with no argument leaves the parameter nothing to hold.",
  ],
  codeExamples: [
    {
      title: "The parameter is a slot in the definition",
      language: "python",
      code: "def greet(name):\n    print(\"Hello\", name)",
      explanation: "name is the parameter — a name declared inside the def. The body uses it like a variable, but it holds nothing yet; the value arrives when the function is called.",
    },
    {
      title: "One definition, different arguments",
      language: "python",
      code: "def greet(name):\n    print(\"Hello\", name)\n\ngreet(\"Arya\")\ngreet(\"Bima\")\n\noutput:\nHello Arya\nHello Bima",
      explanation: "\"Arya\" and \"Bima\" are arguments — the values supplied at each call. Each call fills the same parameter with a different value, so one definition produces different behavior.",
    },
    {
      title: "Two parameters, filled left to right",
      language: "python",
      code: "def introduce(name, age):\n    print(name, age)\n\nintroduce(\"Arya\", 20)\n\noutput:\nArya 20",
      explanation: "Arguments fill parameters by position: \"Arya\" goes to name, 20 goes to age. The written order of the call decides which value lands where.",
    },
    {
      title: "What goes wrong: a call with no argument",
      language: "python",
      code: "def greet(name):\n    print(\"Hello\", name)\n\ngreet()\n\nerror:\nTypeError: greet() missing 1 required positional argument: 'name'",
      explanation: "The def promises one value; greet() supplies none. With nothing to fill name, the call fails — the number of arguments must match the parameters.",
    },
  ],
  keyTerms: [
    { term: "Parameter", definition: "The name inside the def — greet(name) declares the slot name, usable inside the body." },
    { term: "Argument", definition: "The value supplied at the call — greet(\"Arya\") passes \"Arya\" into the parameter." },
    { term: "Call", definition: "name(...) runs the function; the values written in the parentheses fill the parameters." },
    { term: "Function body", definition: "The indented lines under the def; they run using the values the call supplied." },
    { term: "Reuse", definition: "One definition serves many calls — different arguments, different behavior." },
    { term: "Value", definition: "What the argument carries into the body — \"Arya\", 20, whatever the function works with." },
  ],
  commonMistakes: [
    {
      title: "Hardcoding inside the body",
      explanation: "print(\"Hello\", \"Arya\") inside the function ignores name. The parameter exists to receive the call's value — the body must use it.",
    },
    {
      title: "Argument count mismatch",
      explanation: "greet() against a one-parameter def supplies nothing for name. The call must provide one argument per parameter.",
    },
    {
      title: "Swapping the two words",
      explanation: "The parameter is the name in the definition; the argument is the value at the call. greet(name) declares, greet(\"Arya\") supplies.",
    },
    {
      title: "Using the parameter outside the function",
      explanation: "name exists only while the body runs. Outside the function, the name is not defined — the slot lives and dies with each call.",
    },
    {
      title: "Dropping the parameter when rewriting the def",
      explanation: "def greet(): with print(name) in the body leaves the body holding a name the definition never declared. The def line and the body must agree.",
    },
  ],
  quickChecks: [
    {
      question: "In def greet(name):, what is name?",
      options: [
        "The parameter — the name declared in the definition",
        "The argument — the value passed at the call",
        "A variable that exists outside the function",
        "A built-in Python keyword",
      ],
      answer: "The parameter — the name declared in the definition",
      explanation: "The name in the def line is the parameter: the slot the body refers to, filled only when the function is called.",
    },
    {
      question: "In greet(\"Arya\"), what is \"Arya\"?",
      options: [
        "The argument — the value supplied at the call",
        "The parameter — the name in the definition",
        "The function body",
        "The function's name",
      ],
      answer: "The argument — the value supplied at the call",
      explanation: "The value written in the call's parentheses is the argument; it travels into the parameter when the call runs.",
    },
    {
      question: "introduce(name, age) is called with introduce(20, \"Arya\"). What happens?",
      options: [
        "name gets 20 and age gets \"Arya\" — left to right",
        "Python matches by meaning, so name gets \"Arya\"",
        "Error — every value must be written in quotes",
        "Nothing — the call is skipped",
      ],
      answer: "name gets 20 and age gets \"Arya\" — left to right",
      explanation: "Arguments fill parameters left to right, by position: 20 lands in name, \"Arya\" lands in age. Python does not guess meanings.",
    },
  ],
};
