import type { LessonContent } from "@/content/lessons/types";

export const returnValuesLessonContent: LessonContent = {
  slug: "return-values",
  intuitiveExplanation: [
    "Function sejauh ini bisa menerima value lewat parameter dan menjalankan body-nya. Satu bagian masih kurang: bagaimana hasil kerja function sampai ke baris yang memanggilnya? Di situlah return masuk.",
    "print dan return itu beda jauh. print menampilkan value ke layar — programnya sendiri nggak dapat apa-apa. return menyerahkan value balik ke program: return number * 2 mengirim hasil hitungan ke baris yang memanggil function-nya.",
    "Alurnya gini: value masuk lewat parameter → function bekerja → return mengirim hasilnya balik → caller menerimanya. result = double(5) menampung 10 di result, dan dari situ value bisa dipakai lagi kapan saja.",
  ],
  academicExplanation: [
    "return is the statement that sends a value back from a function to its caller. When Python reaches return number * 2, the expression is evaluated and handed to the call site: double(5) is an expression whose value is 10.",
    "The returned value behaves like any other value. It can be stored (result = double(5)), used directly inside a larger expression (print(double(5) + 1)), or passed along to another call. Reaching return also ends the function immediately — any lines below it inside the body never run.",
    "print and return solve different problems: print displays a value for the human watching the screen; return delivers a value to the program itself. A function without a return gives the caller nothing to use.",
  ],
  codeExamples: [
    {
      title: "Return and store",
      language: "python",
      code: "def double(number):\n    return number * 2\n\nresult = double(5)\nprint(result)\n\noutput:\n10",
      explanation: "double(5) runs the body, computes 5 * 2, and return hands 10 back to the call. The assignment catches it: result now holds 10, and print shows it.",
    },
    {
      title: "print is not return",
      language: "python",
      code: "def greet():\n    print(\"Hello\")          # displays — nothing comes back\n\ndef get_greeting():\n    return \"Hello\"          # hands the value to the caller\n\ngreet()                     # prints Hello, gives back nothing\nmessage = get_greeting()    # message now holds \"Hello\"\nprint(message)",
      explanation: "greet() shows Hello on the screen, but the program itself receives nothing. get_greeting() displays nothing — it hands the string back, so message can hold it and use it later.",
    },
    {
      title: "Use the returned value directly",
      language: "python",
      code: "def double(number):\n    return number * 2\n\nprint(double(5) + 1)\n\noutput:\n11",
      explanation: "The call itself is a value: double(5) becomes 10 right where it stands, so the addition sees 10 + 1. Storing first is optional when the value is used immediately.",
    },
    {
      title: "Execution stops at return",
      language: "python",
      code: "def limited(number):\n    return number * 2\n    print(\"this line never runs\")\n\nprint(limited(4))\n\noutput:\n8",
      explanation: "return is the exit: the function hands back 8 and ends immediately. The print below it never runs — inside a body, nothing after return executes.",
    },
  ],
  keyTerms: [
    { term: "return", definition: "The statement that hands a value back from the function to wherever it was called." },
    { term: "Return value", definition: "The value a function sends back with return — the result of calling it." },
    { term: "Caller", definition: "The line that called the function; it receives whatever the function returned." },
    { term: "Result", definition: "The value produced by the call, stored like result = double(5) holding 10." },
    { term: "print vs return", definition: "print displays a value on the screen; return hands a value back to the program. Different jobs." },
    { term: "Store", definition: "Catch the returned value in a variable so it can be used later: result = double(5)." },
  ],
  commonMistakes: [
    {
      title: "Printing instead of returning",
      explanation: "def double(number): print(number * 2) shows 10 on screen but gives the program nothing. return number * 2 is what hands the value back.",
    },
    {
      title: "Calling without storing or using the returned value",
      explanation: "double(5) alone computes 10 and drops it. The returned value must be stored or used — otherwise the call did work for nothing.",
    },
    {
      title: "Writing code after return and expecting it to run",
      explanation: "Execution stops at return. Any line below it inside the body never runs.",
    },
    {
      title: "Hardcoding the final result outside the function",
      explanation: "result = 10 skips the function entirely. The function must compute and return the value; the caller only receives it.",
    },
    {
      title: "Expecting return to display something on screen",
      explanation: "return is silent. Nothing appears until print — or another display — shows the returned value.",
    },
  ],
  quickChecks: [
    {
      question: "What does this program print?",
      code: "def double(number):\n    return number * 2\n\nresult = double(5)\nprint(result)",
      options: ["10", "None", "number * 2", "5"],
      answer: "10",
      explanation: "double(5) returns 10; the assignment stores it in result, and print shows the stored value.",
    },
    {
      question: "What is the difference between print and return inside a function?",
      options: [
        "print displays on screen; return hands a value back to the caller",
        "They do the same job with different names",
        "return displays on screen; print hands a value back",
        "print stops the function; return continues it",
      ],
      answer: "print displays on screen; return hands a value back to the caller",
      explanation: "print is for the human watching; return is for the program. Only return gives the caller a value to store and use.",
    },
    {
      question: "What does this program print?",
      code: "def limited(number):\n    return number * 2\n    print(\"done\")\n\nprint(limited(4))",
      options: [
        "8 — the line after return never runs",
        "8 and then done — both lines run",
        "done — the last line in the body wins",
        "Nothing — return ends the whole program",
      ],
      answer: "8 — the line after return never runs",
      explanation: "return ends the function immediately: limited(4) hands back 8, and the print(\"done\") line below it never executes.",
    },
  ],
};
