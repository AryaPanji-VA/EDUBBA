import type { LessonContent } from "@/content/lessons/types";

export const booleansLessonContent: LessonContent = {
  slug: "booleans",
  intuitiveExplanation: [
    "Programs hold states: online or offline, logged in or out, access granted or denied. The boolean type represents exactly those two states — it has only two values, True and False.",
    "The spelling matters: True and False start with a capital letter. Writing true or false is not a boolean, and putting quotes around them — \"True\" — turns them into text.",
    "Booleans also have a natural source: comparing values. 5 > 3 asks whether five is greater than three, and the answer is the boolean True. A comparison is a question, and its answer is True or False.",
  ],
  academicExplanation: [
    "bool is the data type with exactly two values: True and False. Both are written with a capital first letter — lowercase true or false is not a boolean — and quotes change them into strings: \"True\" is a str, not a bool.",
    "Variables hold booleans like any value, and their names often read as the state they describe: is_online, is_logged_in, has_access. The chain stays the same: is_online → True → bool.",
    "Comparisons produce booleans. The expression 5 > 3 compares two numbers and results in True; 5 == 2 results in False. Note the two signs: a single = assigns a value to a name, while the double == compares two values and produces True or False.",
  ],
  codeExamples: [
    {
      title: "Booleans as states",
      language: "python",
      code: "is_online = True\nis_logged_in = False\nhas_access = True\n\nprint(is_online)\n\noutput:\nTrue",
      explanation: "Each variable holds one of the two boolean values. The names read as the states they describe — a helpful naming habit for boolean variables.",
    },
    {
      title: "True vs \"True\"",
      language: "python",
      code: "type(True)      # <class 'bool'>\ntype(\"True\")    # <class 'str'>\ntype(true)      # bukan boolean — ejaannya salah",
      explanation: "Capitalization and quotes both matter: True is the boolean value; \"True\" is text that spells it; lowercase true is not recognized by Python at all.",
    },
    {
      title: "Comparisons produce booleans",
      language: "python",
      code: "age = 20\n\nprint(age == 20)   # True  (== membandingkan)\nprint(age > 18)    # True\nprint(5 == 2)      # False",
      explanation: "A comparison asks a question about values, and its result is a boolean. Note the difference: age = 20 assigns; age == 20 compares.",
    },
  ],
  keyTerms: [
    { term: "Boolean / bool", definition: "The data type with exactly two values: True and False." },
    { term: "Boolean literal", definition: "The written form of a boolean: True or False, with a capital first letter." },
    { term: "State", definition: "A condition a program remembers — online, logged in, has access — often held in a boolean variable." },
    { term: "Comparison", definition: "A question about two values, such as > or ==, that produces a boolean result." },
    { term: "= vs ==", definition: "= assigns a value to a name; == compares two values and produces True or False." },
  ],
  commonMistakes: [
    {
      title: "Putting quotes around a boolean",
      explanation: "\"True\" is a string that spells the word — not the boolean value. Only unquoted True is a bool.",
    },
    {
      title: "Writing lowercase true or false",
      explanation: "Python reads the spelling exactly: the boolean literals are True and False with a capital first letter.",
    },
    {
      title: "Using = when you mean ==",
      explanation: "= assigns a value to a name. == compares two values and produces a boolean. They look similar and do different jobs.",
    },
    {
      title: "Forgetting that the result of a comparison is a value",
      explanation: "score > 5 produces the boolean True or False — a value you can print and store, just like a number or text.",
    },
  ],
  quickChecks: [
    {
      question: "How many values does the boolean type have?",
      options: ["Two — True and False", "One — True", "Many — every word can be one", "Zero — it is only a type name"],
      answer: "Two — True and False",
      explanation: "bool is the two-value type: every boolean is True or False.",
    },
    {
      question: "What is the type of \"False\"?",
      options: ["str — the quotes make it text", "bool — it spells a boolean", "bool — quotes are optional", "int"],
      answer: "str — the quotes make it text",
      explanation: "Quotes turn anything into text. Only unquoted False is the boolean value.",
    },
    {
      question: "age = 20. What does print(age == 20) display?",
      options: ["True — the comparison is correct", "20 — the value is printed", "False — age was assigned, not compared", "age"],
      answer: "True — the comparison is correct",
      explanation: "== compares age with 20 and produces the boolean True. A single = would have assigned instead.",
    },
  ],
};
