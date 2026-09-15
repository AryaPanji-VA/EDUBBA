import type { PracticeExercise } from "../types";

// Data Types practice set — grounded in the Data Types lesson.
// Concept keys reuse the lesson mastery vocabulary:
// data_type, integer, float, string, boolean, type_inspection.
// Misconception codes reuse the lesson's vocabulary where one exists
// (quote_confusion, type_indifference, decimal_confusion, type_misidentification).

export const dataTypesPracticeExercises: PracticeExercise[] = [
  {
    id: "data-types-predict-1",
    lessonSlug: "data-types",
    concept: "Strings join",
    type: "predict_output",
    language: "python",
    prompt: "Both values are strings. Write exactly what this prints.",
    hint: "When both sides of + are strings, + concatenates instead of adding.",
    explanation: "\"3\" and \"4\" are strings, so + concatenates them into \"34\". Numeric addition only happens when both sides are numbers.",
    masteryConcepts: ["string"],
    code: "print(\"3\" + \"4\")",
    expectedOutput: "34",
    misconceptionOutputs: [
      { output: "7", misconception: "numeric_addition_assumed", note: "+ adds numbers, but here both sides are strings, so they are joined." },
      { output: "Error", misconception: "concat_invalid", note: "Joining two strings is valid Python; no error occurs." },
    ],
    sampleSolution: "34",
  },
  {
    id: "data-types-predict-2",
    lessonSlug: "data-types",
    concept: "Inspecting types",
    type: "predict_output",
    language: "python",
    prompt: "Write exactly what this prints, including the wrapper.",
    hint: "type() prints a full class wrapper, not just the type name.",
    explanation: "type(7) is the integer class, printed as <class 'int'> — the full wrapper, including the word class and the quotes.",
    masteryConcepts: ["type_inspection"],
    code: "print(type(7))",
    expectedOutput: "<class 'int'>",
    misconceptionOutputs: [
      { output: "int", misconception: "prints_type_name_only", note: "type() prints the full wrapper: <class 'int'>." },
      { output: "number", misconception: "generic_type_name", note: "Python reports the specific type name, not a generic category." },
      { output: "str", misconception: "type_misidentification", note: "7 has no quotes, so it is an integer, not a string." },
    ],
    sampleSolution: "<class 'int'>",
  },
  {
    id: "data-types-fix-1",
    lessonSlug: "data-types",
    concept: "Text vs number",
    type: "fix_code",
    language: "python",
    prompt: "This crashes with TypeError. Fix the type so the math works. Target output: 20",
    hint: "Look closely at the first line: what type does price actually hold?",
    explanation: "\"12\" is text, and text + number has no meaning in Python. Storing the integer 12 unquoted makes price + 8 a valid numeric sum: 20.",
    masteryConcepts: ["string", "integer"],
    starterCode: "price = \"12\"\ntotal = price + 8\nprint(total)",
    requiredPatterns: [
      { source: "price\\s*=\\s*12(?![.\\d])", description: "store 12 as a number, not text" },
      { source: "print\\s*\\(\\s*total\\s*\\)", description: "keep printing total" },
    ],
    misconceptionPatterns: [
      { source: "price\\s*=\\s*[\"']12[\"']", misconception: "quote_confusion", note: "The quotes keep price as text." },
      { source: "\\+\\s*[\"']8[\"']", misconception: "type_indifference", note: "Quoting the other number hides the type problem instead of fixing it." },
    ],
    sampleSolution: "price = 12\ntotal = price + 8\nprint(total)",
  },
  {
    id: "data-types-fix-2",
    lessonSlug: "data-types",
    concept: "Bool, not text",
    type: "fix_code",
    language: "python",
    prompt: "finished should be a bool, not text. Fix the value so type() reports bool.",
    hint: "Bool values are spelled without quotes and with a leading capital.",
    explanation: "False (no quotes) is the bool value. \"False\" is a four-letter string, so type() reports <class 'str'>.",
    masteryConcepts: ["boolean", "type_inspection"],
    starterCode: "finished = \"False\"\nprint(type(finished))",
    requiredPatterns: [
      { source: "finished\\s*=\\s*False\\b", description: "store the bool False without quotes" },
      { source: "print\\s*\\(\\s*type\\s*\\(\\s*finished\\s*\\)\\s*\\)", description: "keep printing type(finished)" },
    ],
    misconceptionPatterns: [
      { source: "finished\\s*=\\s*[\"'](False|false|FALSE)[\"']", misconception: "quote_confusion", note: "Quoted False is still a string." },
      { source: "finished\\s*=\\s*true\\b", misconception: "type_misidentification", note: "Python spells the bool value False, with a capital F." },
    ],
    sampleSolution: "finished = False\nprint(type(finished))",
  },
  {
    id: "data-types-write-1",
    lessonSlug: "data-types",
    concept: "Float values",
    type: "write_code",
    language: "python",
    prompt: "Write two lines: bind height to the float 1.75, then print its type. Target output: <class 'float'>",
    hint: "A float is written with a decimal point. Show the type with type(height) inside print.",
    explanation: "1.75 has a decimal point, so Python stores it as a float. print(type(height)) shows <class 'float'>.",
    masteryConcepts: ["float", "type_inspection"],
    requiredPatterns: [
      { source: "height\\s*=\\s*1\\.75\\b", description: "bind height to 1.75" },
      { source: "print\\s*\\(\\s*type\\s*\\(\\s*height\\s*\\)\\s*\\)", description: "print type(height)" },
    ],
    misconceptionPatterns: [
      { source: "height\\s*=\\s*[\"']1\\.75[\"']", misconception: "quote_confusion", note: "Quoted \"1.75\" is a string, not a float." },
    ],
    sampleSolution: "height = 1.75\nprint(type(height))",
  },
  {
    id: "data-types-write-2",
    lessonSlug: "data-types",
    concept: "String or integer",
    type: "write_code",
    language: "python",
    prompt: "Bind label to the text \"42\" — as a string — then print its type. Target output: <class 'str'>",
    hint: "The quotes are the point: with them, 42 is text; without them, it is an integer.",
    explanation: "\"42\" with quotes is a string of two characters. type() reports <class 'str'>. Without quotes, 42 would be the integer.",
    masteryConcepts: ["string", "type_inspection"],
    requiredPatterns: [
      { source: "label\\s*=\\s*[\"']42[\"']", description: "store the text \"42\" with quotes" },
      { source: "print\\s*\\(\\s*type\\s*\\(\\s*label\\s*\\)\\s*\\)", description: "print type(label)" },
    ],
    misconceptionPatterns: [
      { source: "label\\s*=\\s*42(?![.\\d])", misconception: "type_misidentification", note: "Without quotes that is the integer 42, not the text." },
    ],
    sampleSolution: "label = \"42\"\nprint(type(label))",
  },
];
