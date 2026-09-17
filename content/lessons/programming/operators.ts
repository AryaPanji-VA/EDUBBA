import type { LessonContent } from "@/content/lessons/types";

export const operatorsLessonContent: LessonContent = {
  slug: "operators",
  intuitiveExplanation: [
    "Variable menyimpan value dan data type menjelaskan jenis value itu. Operator adalah kata kerja dan tanda yang membuat value tersebut bisa dihitung, dibandingkan, atau digabung menjadi sebuah pertanyaan.",
    "Bayangkan expression sebagai kalimat kecil yang menghasilkan satu value. 10 + 3 menghasilkan 13; age >= 18 menghasilkan boolean True atau False. Hasil boolean itulah yang nanti dipakai Conditionals untuk memilih jalan.",
    "Python mengikuti urutan operasi: perkalian dikerjakan sebelum penjumlahan. Kalau urutannya harus berbeda, pakai tanda kurung supaya niat program terlihat jelas.",
  ],
  academicExplanation: [
    "An expression combines values, variables, and operators and evaluates to a value. Arithmetic operators calculate numbers: +, -, *, /, //, %, and **. In Python, / always produces a float, while // performs floor division and % produces the remainder.",
    "Comparison operators ==, !=, <, >, <=, and >= compare two values and evaluate to a boolean: True or False. Assignment = stores a value in a name; equality == asks whether two values are equal. They have different jobs and cannot be substituted for each other.",
    "Logical operators combine or invert boolean expressions. and is True only when both sides are True; or is True when at least one side is True; not reverses a boolean value. These expressions prepare the conditions later used by if statements.",
    "Operator precedence controls which part of an expression is evaluated first. Multiplication and division happen before addition and subtraction, so 2 + 3 * 4 is 14. Parentheses make an intended order explicit: (2 + 3) * 4 is 20.",
  ],
  codeExamples: [
    { title: "Arithmetic with variables", language: "python", code: "x = 10\ny = 3\n\nprint(x + y)\nprint(x - y)\nprint(x * y)\nprint(x / y)", explanation: "The variables supply numeric values to four arithmetic expressions. Division with / produces a float." },
    { title: "Division and remainder", language: "python", code: "print(10 // 3)\nprint(10 % 3)", explanation: "10 // 3 gives the whole-number quotient 3; 10 % 3 gives the remainder 1." },
    { title: "Comparison becomes bool", language: "python", code: "age = 18\n\nprint(age >= 18)", explanation: "The expression asks a question and evaluates to the boolean True." },
    { title: "Combine comparisons", language: "python", code: "score = 85\n\nprint(score >= 75 and score <= 100)", explanation: "Both comparisons are True, so the expression joined with and is True." },
    { title: "Precedence and parentheses", language: "python", code: "print(2 + 3 * 4)\nprint((2 + 3) * 4)", explanation: "Multiplication runs first in the first expression. Parentheses deliberately change the order in the second." },
  ],
  keyTerms: [
    { term: "Operator", definition: "A symbol or keyword that performs an operation, such as +, >=, or and." },
    { term: "Operand", definition: "A value an operator works with; x and 3 are operands in x + 3." },
    { term: "Expression", definition: "A combination of values, variables, and operators that evaluates to one value." },
    { term: "Arithmetic operator", definition: "An operator that calculates numeric values, such as +, *, //, or %." },
    { term: "Comparison operator", definition: "An operator that compares values and evaluates to True or False." },
    { term: "Logical operator", definition: "and, or, or not; used to combine or invert boolean expressions." },
    { term: "Precedence", definition: "The rules that decide which operation in an expression runs first." },
    { term: "Boolean", definition: "The True or False value produced by comparisons and logical expressions." },
  ],
  commonMistakes: [
    { title: "Mixing up = and ==", explanation: "= assigns a value; == compares two values. Writing print(age = 18) is invalid because assignment is not an equality expression." },
    { title: "Treating / and // as the same", explanation: "/ performs regular division and returns a float. // performs floor division and discards the fractional part toward negative infinity." },
    { title: "Reading % as percentage", explanation: "In Python, % returns the remainder. number % 2 is 0 for an even integer and 1 for an odd positive integer." },
    { title: "Forgetting precedence", explanation: "2 + 3 * 4 is 14, not 20. Use parentheses when another order is intended." },
    { title: "Expecting comparison text", explanation: "age >= 18 evaluates to the boolean True or False, not the strings \"yes\" or \"no\"." },
    { title: "Confusing and with or", explanation: "and requires both sides to be True. or requires at least one side to be True." },
    { title: "Misusing not", explanation: "not reverses one boolean expression. Read not age >= 18 as the opposite of age >= 18." },
    { title: "Comparing incompatible values", explanation: "Python cannot order a string and an integer with < or >=. Convert input before numeric comparisons." },
    { title: "Assuming 10 / 2 is an int", explanation: "Python's / returns 5.0, a float, even when the mathematical result is a whole number." },
  ],
  quickChecks: [
    { question: "What does this expression evaluate to?", code: "2 + 3 * 4", options: ["20", "14", "24", "Error"], answer: "14", explanation: "Multiplication has higher precedence, so 3 * 4 happens before adding 2." },
    { question: "Which expression checks equality?", code: "age = 18", options: ["age = 18", "age == 18", "age != 18", "age and 18"], answer: "age == 18", explanation: "== compares values; = stores a value in a variable." },
    { question: "What type of value does score >= 75 produce?", options: ["str", "int", "bool", "float"], answer: "bool", explanation: "A comparison expression evaluates to True or False, both boolean values." },
  ],
};
