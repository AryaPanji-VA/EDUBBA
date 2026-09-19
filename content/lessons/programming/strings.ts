import type { LessonContent } from "@/content/lessons/types";

export const stringsLessonContent: LessonContent = {
  slug: "strings",
  intuitiveExplanation: [
    "Names, greetings, messages — programs are full of text, and the text type is string. This lesson looks inside one: a string is a sequence of characters, and every character has a position.",
    "Quotes are what make text a string: \"Arya\" is a string of four characters. Double or single quotes both work — \"Hello\" and 'Hello' are the same string.",
    "And strings come with two handy abilities: + joins them together (\"Hello\" + \" \" + \"Arya\"), and every character can be reached by its index — starting at 0, not 1.",
  ],
  academicExplanation: [
    "A string is a sequence of characters. Quotes — double or single — mark where the string begins and ends, turning the characters between them into one str value: \"Arya\" is the characters A, r, y, a in that order.",
    "Each character has an index: its position in the sequence, counted from 0. In \"Arya\", index 0 is \"A\", index 1 is \"r\". The built-in len() function returns how many characters a string contains — len(\"Arya\") is 4.",
    "Strings join with +, the same sign numbers calculate with. The type of the values decides what + does: 10 + 5 computes 15, while \"10\" + \"5\" glues the characters into \"105\". Same symbol, different types, different results.",
  ],
  codeExamples: [
    {
      title: "Anatomy of a string",
      language: "python",
      code: "name = \"Arya\"\n\nvalue:\nA  r  y  a\n0  1  2  3",
      explanation: "Quotes make \"Arya\" a string of four characters. Each character has an index — its position, counted from 0.",
    },
    {
      title: "Concatenation joins strings",
      language: "python",
      code: "first = \"Hello\"\nname = \"Arya\"\n\nmessage = first + \" \" + name\nprint(message)\n\noutput:\nHello Arya",
      explanation: "+ glues strings end to end. The \" \" in the middle is a one-character string holding the space between the two words.",
    },
    {
      title: "Same +, different types",
      language: "python",
      code: "print(10 + 5)      # 15  (angka: dihitung)\nprint(\"10\" + \"5\")  # 105 (teks: digabung)",
      explanation: "The symbol is the same; the values' types are not. Numbers calculate with +, strings glue with + — and \"105\" is text, not a number.",
    },
  ],
  keyTerms: [
    { term: "String", definition: "The text type: a sequence of characters written in quotes." },
    { term: "Character", definition: "One symbol inside a string — a letter, a space, a digit, anything." },
    { term: "Index", definition: "A character's position in the string, counted from 0." },
    { term: "Concatenation", definition: "Joining strings end to end with +." },
    { term: "len()", definition: "A built-in tool that reports how many characters a string contains." },
  ],
  commonMistakes: [
    {
      title: "Counting index positions from 1",
      explanation: "The first character is at index 0. In \"Arya\", name[1] is \"r\" — the second character, not the first.",
    },
    {
      title: "Mixing up a variable with its string",
      explanation: "name is the variable; \"name\" in quotes would be the four-letter word. Quotes decide whether you mean the variable or the text.",
    },
    {
      title: "Assuming quoted digits are numbers",
      explanation: "\"10\" is a string of two characters, not a number. \"10\" + \"5\" glues them into \"105\" — no calculation happens.",
    },
    {
      title: "Expecting len() to start from 0",
      explanation: "Indexes start at 0, but len() counts characters: \"Arya\" has 4 characters, and its last index is 3.",
    },
  ],
  quickChecks: [
    {
      question: "What does len(\"Arya\") return?",
      options: ["4", "3", "\"Arya\"", "a"],
      answer: "4",
      explanation: "len() counts the characters: A, r, y, a — four of them.",
    },
    {
      question: "What does \"Arya\"[0] give?",
      options: ["\"A\"", "\"r\"", "\"Arya\"", "0"],
      answer: "\"A\"",
      explanation: "Index 0 is the first character — \"A\", not \"r\".",
    },
    {
      question: "What does print(\"10\" + \"5\") display?",
      options: ["105", "15", "10 + 5", "Nothing"],
      answer: "105",
      explanation: "Both values are strings, so + glues them: the text \"105\". Only unquoted numbers would calculate.",
    },
  ],
};
