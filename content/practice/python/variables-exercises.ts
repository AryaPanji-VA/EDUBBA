import type { PracticeExercise } from "../types";

// Variables practice set — grounded in the Variables lesson.
// Concept keys reuse the lesson mastery vocabulary:
// variable, assignment, reassignment, expression, name_binding, identifier_naming.
// Misconception codes reuse the lesson's vocabulary where one exists.

export const variablesPracticeExercises: PracticeExercise[] = [
  {
    id: "variables-predict-1",
    lessonSlug: "variables",
    concept: "Reading a name",
    type: "predict_output",
    language: "python",
    prompt: "Read the code, then write exactly what it prints — nothing else.",
    hint: "print reads the value the name currently reaches. It does not read the spelling of the name.",
    explanation: "print(speed) reads the value bound to the name speed and prints 60. The name itself is never printed.",
    masteryConcepts: ["variable"],
    code: "speed = 60\nprint(speed)",
    expectedOutput: "60",
    misconceptionOutputs: [
      { output: "speed", misconception: "prints_name_text", note: "print shows the value the name reaches, not the name's spelling." },
      { output: "Error", misconception: "declaration_required", note: "speed is already assigned, so no error occurs." },
    ],
    sampleSolution: "60",
  },
  {
    id: "variables-predict-2",
    lessonSlug: "variables",
    concept: "Reassignment",
    type: "predict_output",
    language: "python",
    prompt: "Read the lines in order. Write exactly what this prints.",
    hint: "The second assignment rebinds count. print reads the current binding, not the history.",
    explanation: "count is first bound to 3, then rebound to the result of count + 2, which is 5. print shows the current binding: 5.",
    masteryConcepts: ["reassignment"],
    code: "count = 3\ncount = count + 2\nprint(count)",
    expectedOutput: "5",
    misconceptionOutputs: [
      { output: "3", misconception: "first_assignment_persists", note: "The second assignment replaces the first binding; 3 no longer wins." },
      { output: "count + 2", misconception: "expression_not_evaluated", note: "The right-hand side is evaluated first; print shows 5, not the expression text." },
      { output: "Error", misconception: "reassignment_invalid", note: "Reassignment is ordinary Python; the name is simply rebound." },
    ],
    sampleSolution: "5",
  },
  {
    id: "variables-fix-1",
    lessonSlug: "variables",
    concept: "Name before use",
    type: "fix_code",
    language: "python",
    prompt: "This code raises NameError. Fix it so the name exists before it is read. Target output: 10",
    hint: "A name can only be read after a binding for it exists. Think about which line must run first.",
    explanation: "Python runs top to bottom. total = 10 must execute before print(total) can read the name.",
    masteryConcepts: ["name_binding"],
    starterCode: "print(total)\ntotal = 10",
    requiredPatterns: [
      { source: "total\\s*=\\s*10[\\s\\S]*print\\s*\\(\\s*total\\s*\\)", description: "assign total before printing it" },
    ],
    misconceptionPatterns: [
      { source: "print\\s*\\(\\s*total\\s*\\)[\\s\\S]*total\\s*=\\s*10", misconception: "uses_name_before_binding", note: "The print still runs before the assignment." },
      { source: "print\\s*\\(\\s*[\"']total[\"']\\s*\\)", misconception: "prints_name_text", note: "Quoting total prints the word, not the value." },
    ],
    sampleSolution: "total = 10\nprint(total)",
  },
  {
    id: "variables-fix-2",
    lessonSlug: "variables",
    concept: "Valid identifiers",
    type: "fix_code",
    language: "python",
    prompt: "Python rejects this name. Fix the identifiers so the name is valid and still readable.",
    hint: "An identifier cannot contain a space. Join the words with an underscore.",
    explanation: "user_name is a valid identifier: letters, digits, and underscores, starting with a letter or underscore. The same valid name must be used on both lines.",
    masteryConcepts: ["identifier_naming"],
    starterCode: "user name = \"Arya\"\nprint(user name)",
    requiredPatterns: [
      { source: "user_name\\s*=[\\s\\S]*print\\s*\\(\\s*user_name\\s*\\)", description: "use the valid identifier user_name on both lines" },
    ],
    misconceptionPatterns: [
      { source: "user\\s+name", misconception: "invalid_identifier", note: "A space is not allowed inside a Python name." },
    ],
    sampleSolution: "user_name = \"Arya\"\nprint(user_name)",
  },
  {
    id: "variables-write-1",
    lessonSlug: "variables",
    concept: "First assignment",
    type: "write_code",
    language: "python",
    prompt: "Write two lines: bind the name tempo to the integer 92, then print tempo. Target output: 92",
    hint: "One line performs the binding with =, the next reads the name inside print(...).",
    explanation: "tempo = 92 binds the name to the integer object. print(tempo) reads the value through the name.",
    masteryConcepts: ["assignment"],
    requiredPatterns: [
      { source: "tempo\\s*=\\s*92(?![.\\d])", description: "bind tempo to 92" },
      { source: "print\\s*\\(\\s*tempo\\s*\\)", description: "print tempo" },
    ],
    misconceptionPatterns: [
      { source: "tempo\\s*=\\s*[\"']92[\"']", misconception: "quote_confusion", note: "Quoting 92 stores the text \"92\", not the integer." },
      { source: "print\\s*\\(\\s*[\"']tempo[\"']\\s*\\)", misconception: "prints_name_text", note: "Quotes make Python print the word tempo." },
    ],
    sampleSolution: "tempo = 92\nprint(tempo)",
  },
  {
    id: "variables-write-2",
    lessonSlug: "variables",
    concept: "Rebind with an expression",
    type: "write_code",
    language: "python",
    prompt: "score starts at 7. Add the lines that increase score by 5, then print it. Target output: 12",
    hint: "Read the old value through the name, add 5, and rebind the result to the same name.",
    explanation: "score = score + 5 reads 7 through the name, evaluates 7 + 5, and rebinds score to 12. print(score) then shows 12.",
    masteryConcepts: ["reassignment", "expression"],
    starterCode: "score = 7\n",
    requiredPatterns: [
      { source: "(score\\s*=\\s*score\\s*\\+\\s*5|score\\s*\\+=\\s*5)", description: "increase score by 5 through the name" },
      { source: "print\\s*\\(\\s*score\\s*\\)", description: "print score" },
    ],
    misconceptionPatterns: [
      { source: "score\\s*=\\s*12(?![.\\d])", misconception: "literal_instead_of_expression", note: "That rebinds score to 12 directly; the goal is reading the old value and adding 5." },
      { source: "score\\s*=\\s*[\"']", misconception: "quote_confusion", note: "Quotes would make score a string, not a number." },
    ],
    sampleSolution: "score = 7\nscore = score + 5\nprint(score)",
  },
];
