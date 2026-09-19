import type { LessonContent } from "@/content/lessons/types";

export const castingLessonContent: LessonContent = {
  slug: "casting",
  intuitiveExplanation: [
    "Sometimes the value you have is the wrong type for the job: the text \"20\" reads as a number, but Python treats it as text. Casting — type conversion — is changing a value on purpose from one type to another.",
    "Python gives you three conversion functions: int() turns a value into an integer, float() into a decimal number, str() into text. \"20\" → int() → 20: the characters become a real number.",
    "Two things to hold on to: conversion produces a new value with a new type (the original stays as it was), and conversion only works when it makes sense — \"20\" can become 20, but \"hello\" cannot become a number at all.",
  ],
  academicExplanation: [
    "Type conversion (casting) is the deliberate transformation of a value into another type by calling a conversion function: int(), float(), or str(). The call produces a new value with the target type; the value that was passed in stays unchanged.",
    "The target type is chosen by the function: int(\"20\") becomes the integer 20, float(\"12.5\") becomes the float 12.5, and str(100) becomes the string \"100\". After conversion, the new value behaves like any value of its type — int(\"20\") is a number, while \"20\" remains text.",
    "Conversion is explicit: storing \"100\" in a variable never turns it into a number. Conversion also has to make sense for the target type — text that spells no number, like \"hello\", cannot be converted into an integer, and Python stops with a message when a conversion is impossible.",
  ],
  codeExamples: [
    {
      title: "The conversion functions",
      language: "python",
      code: "\"20\"  → int()   → 20\n20    → float() → 20.0\n100   → str()   → \"100\"",
      explanation: "Each function is named after the type it produces: int() for integer, float() for float, str() for string. The value goes in, a new value with the new type comes out.",
    },
    {
      title: "The main example: text that reads as a number",
      language: "python",
      code: "age_text = \"20\"\nage = int(age_text)\nprint(age)\n\noutput:\n20",
      explanation: "age_text holds the string \"20\". int(age_text) converts it into the integer 20, and assignment stores the converted value under a new name. age_text itself still holds \"20\".",
    },
    {
      title: "float() and str() work the same way",
      language: "python",
      code: "price_text = \"12.5\"\nprice = float(price_text)   # 12.5 sebagai float\n\nscore = 100\nscore_text = str(score)     # \"100\" sebagai str",
      explanation: "float() produces a decimal number; str() produces text. The function you call decides the type of the new value.",
    },
  ],
  keyTerms: [
    { term: "Casting / type conversion", definition: "Changing a value on purpose from one type to another." },
    { term: "int()", definition: "Converts a value into an integer: \"20\" becomes 20." },
    { term: "float()", definition: "Converts a value into a decimal number: \"12.5\" becomes 12.5, 5 becomes 5.0." },
    { term: "str()", definition: "Converts a value into text: 100 becomes \"100\"." },
    { term: "Conversion result", definition: "The new value with the new type that a conversion produces; the original value stays unchanged." },
  ],
  commonMistakes: [
    {
      title: "Expecting assignment to convert",
      explanation: "value = \"100\" stores a string — assignment never changes the type. Only an explicit call like int(value) converts.",
    },
    {
      title: "Forgetting the quotes around the original",
      explanation: "\"20\" is text and int(\"20\") is the number 20. They only look alike; the conversion is what separates them.",
    },
    {
      title: "Calling the wrong conversion function",
      explanation: "The function's name is the target type. Text that reads as a whole number needs int(); choosing float() would produce a decimal instead.",
    },
    {
      title: "Converting text that makes no sense",
      explanation: "Conversion works when the value makes sense for the target type. \"hello\" cannot become an integer, and Python stops with a message when a conversion is impossible.",
    },
  ],
  quickChecks: [
    {
      question: "What is int(\"20\")?",
      options: ["The integer 20", "The string \"20\"", "The float 20.0", "Nothing — text cannot convert"],
      answer: "The integer 20",
      explanation: "int() converts text that reads as a whole number into the integer 20.",
    },
    {
      question: "value = \"100\" — what is the type of value?",
      options: [
        "str — assignment never converts",
        "int — the characters are digits",
        "float — 100 can be a decimal",
        "It changes to int after storing",
      ],
      answer: "str — assignment never converts",
      explanation: "Storing a value keeps its type. Only int(value) would produce a number.",
    },
    {
      question: "price_text = \"12.5\" holds text. Which call makes it a float?",
      options: ["float(price_text)", "int(price_text)", "str(price_text)", "price_text = 12.5"],
      answer: "float(price_text)",
      explanation: "The function's name is the target type: float() produces the decimal number 12.5.",
    },
  ],
};
