import type { PracticeExercise } from "../types";

export const operatorsPracticeExercises: PracticeExercise[] = [
  {
    id: "operators-predict-1", lessonSlug: "operators", concept: "Arithmetic and precedence", type: "predict_output", language: "python",
    prompt: "Write exactly what this program prints.", hint: "Multiplication runs before addition unless parentheses change the order.",
    explanation: "3 * 4 is evaluated first, producing 12. Then 2 + 12 produces 14.", masteryConcepts: ["arithmetic_operations", "operator_precedence"],
    code: "print(2 + 3 * 4)", expectedOutput: "14",
    misconceptionOutputs: [
      { output: "20", misconception: "left_to_right_only", note: "Python applies multiplication before addition." },
      { output: "24", misconception: "operation_confusion", note: "Only 3 and 4 are multiplied before 2 is added." },
    ], sampleSolution: "14",
  },
  {
    id: "operators-predict-2", lessonSlug: "operators", concept: "Comparison and logic", type: "predict_output", language: "python",
    prompt: "Evaluate both comparisons, then write the output.", hint: "and is True only when both comparison expressions are True.",
    explanation: "85 is at least 75 and no more than 100. True and True evaluates to True.", masteryConcepts: ["comparison_operators", "logical_operators"],
    code: "score = 85\nprint(score >= 75 and score <= 100)", expectedOutput: "True",
    misconceptionOutputs: [
      { output: "False", misconception: "and_or_confusion", note: "Both sides are True, so and produces True." },
      { output: "85", misconception: "comparison_returns_operand", note: "Comparison expressions produce a boolean, not the original number." },
    ], sampleSolution: "True",
  },
  {
    id: "operators-fix-1", lessonSlug: "operators", concept: "Assignment versus equality", type: "fix_code", language: "python",
    prompt: "Fix the expression so the program compares age with 18 and prints True.", hint: "One equals sign stores a value; two equals signs compare values.",
    explanation: "age == 18 is an equality comparison and evaluates to True. = cannot be used as that comparison inside print.", masteryConcepts: ["comparison_operators"],
    starterCode: "age = 18\nprint(age = 18)",
    requiredPatterns: [
      { source: "age\\s*=\\s*18", description: "keep the age assignment" },
      { source: "print\\s*\\(\\s*age\\s*==\\s*18\\s*\\)", description: "compare age with 18 using ==" },
    ],
    misconceptionPatterns: [{ source: "print\\s*\\(\\s*age\\s*=\\s*18\\s*\\)", misconception: "assignment_vs_equality", note: "The expression still uses assignment instead of equality comparison." }],
    sampleSolution: "age = 18\nprint(age == 18)",
  },
  {
    id: "operators-fix-2", lessonSlug: "operators", concept: "Logical range", type: "fix_code", language: "python",
    prompt: "The rule should be True only for scores from 70 through 100. Fix the logical operator.", hint: "Both the lower and upper boundary must be satisfied.",
    explanation: "and requires score to satisfy both boundaries. With or, almost every number would pass at least one side.", masteryConcepts: ["comparison_operators", "logical_operators"],
    starterCode: "score = 85\nprint(score >= 70 or score <= 100)",
    requiredPatterns: [
      { source: "score\\s*>=\\s*70", description: "keep the lower-bound comparison" },
      { source: "score\\s*<=\\s*100", description: "keep the upper-bound comparison" },
      { source: "score\\s*>=\\s*70\\s+and\\s+score\\s*<=\\s*100", description: "require both boundaries with and" },
    ],
    misconceptionPatterns: [{ source: "score\\s*>=\\s*70\\s+or\\s+score\\s*<=\\s*100", misconception: "and_or_confusion", note: "or accepts a value when only one boundary is satisfied; this range needs and." }],
    sampleSolution: "score = 85\nprint(score >= 70 and score <= 100)",
  },
  {
    id: "operators-write-1", lessonSlug: "operators", concept: "Arithmetic expression", type: "write_code", language: "python",
    prompt: "Set price = 12 and quantity = 3. Calculate total with multiplication, then print total.", hint: "Bind both values first, then use price * quantity in the assignment to total.",
    explanation: "The multiplication expression evaluates to 36, which is stored in total and printed.", masteryConcepts: ["arithmetic_operations"],
    requiredPatterns: [
      { source: "price\\s*=\\s*12", description: "assign price" }, { source: "quantity\\s*=\\s*3", description: "assign quantity" },
      { source: "total\\s*=\\s*price\\s*\\*\\s*quantity", description: "calculate total with multiplication" }, { source: "print\\s*\\(\\s*total\\s*\\)", description: "print total" },
    ],
    misconceptionPatterns: [{ source: "total\\s*=\\s*price\\s*\\+\\s*quantity", misconception: "operation_confusion", note: "A total price for repeated items needs multiplication, not addition." }],
    sampleSolution: "price = 12\nquantity = 3\ntotal = price * quantity\nprint(total)",
  },
  {
    id: "operators-write-2", lessonSlug: "operators", concept: "Comparison and logical expression", type: "write_code", language: "python",
    prompt: "Set age = 20. Print one expression that is True when age is at least 18 and not greater than 65.", hint: "Write two comparisons joined by and inside print.",
    explanation: "Both boundary comparisons are True for age 20, so the joined expression prints True.", masteryConcepts: ["comparison_operators", "logical_operators"],
    requiredPatterns: [
      { source: "age\\s*=\\s*20", description: "assign age" },
      { source: "print\\s*\\(\\s*age\\s*>=\\s*18\\s+and\\s+age\\s*<=\\s*65\\s*\\)", description: "print the bounded logical expression" },
    ],
    misconceptionPatterns: [
      { source: "age\\s*>=\\s*18\\s+or\\s+age\\s*<=\\s*65", misconception: "and_or_confusion", note: "The value must satisfy both boundaries, so use and." },
      { source: "age\\s*=\\s*18", misconception: "assignment_vs_equality", note: "Use a comparison inside the expression; do not assign a new age there." },
    ],
    sampleSolution: "age = 20\nprint(age >= 18 and age <= 65)",
  },
];
