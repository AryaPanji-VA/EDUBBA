// Thinking activities are authored in Indonesian. This file carries the
// English (en) variant, keyed by the activity id. Interaction ids, correct
// ids, expected field values, placeholders, and mastery evidence are never
// changed. Arrays are positional with a `?? original` fallback per item.

import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { ThinkingActivity, ThinkingInteraction, ThinkingOption } from "./types";

type ThinkingOverride = {
  title?: string;
  prompt?: string;
  instruction?: string;
  hint?: string;
  explanation?: string;
  optionLabels?: string[];
  optionNotes?: string[];
  fieldLabels?: string[];
  partialFeedback?: string;
};

// optionNotes entries only surface where the source option carries a
// misconception.note; positions without one hold "" and are never applied.
const enByActivity: Record<string, ThinkingOverride> = {
  "thinking-decompose-age": {
    title: "Your age next year",
    prompt: "The program should ask for an age, then show the user's age next year.",
    instruction: "Select every small step that is genuinely needed.",
    hint: "Think from the input, the type conversion, the processing, then the output.",
    explanation: "A big problem becomes clear when you break it into: read the age, convert it to a number, add one, then show the result.",
    optionLabels: [
      "Ask the user for their age",
      "Convert the input text into an integer",
      "Add 1 to the age",
      "Show the result",
      "Ask for a favorite color",
    ],
    optionNotes: ["", "", "", "", "A favorite color does not help compute next year's age."],
    partialFeedback: "The order does not matter yet, but every part of input → process → output must be there.",
  },
  "thinking-decompose-total": {
    title: "Break down the addition process",
    prompt: "We want to read two numbers and show their sum.",
    instruction: "Arrange the parts of the problem from input to output.",
    hint: "The program cannot add anything before both values are available.",
    explanation: "Both inputs must be available and numeric before the addition runs; the result can only be shown afterwards.",
    optionLabels: [
      "Show the result",
      "Read the first number",
      "Add the two numbers",
      "Read the second number",
      "Make sure both inputs are numeric",
    ],
  },
  "thinking-pattern-double": {
    title: "Find the relationship",
    prompt: "2 → 4, 3 → 6, 4 → 8. Which relationship holds every time?",
    instruction: "Pick the rule that works for every pair.",
    hint: "Test the same rule on all three examples.",
    explanation: "Every output is the input times two. A pattern must explain every example, not just one.",
    optionLabels: [
      "output = input × 2",
      "output = input + 2",
      "output = input²",
    ],
    optionNotes: ["", "The +2 rule fits 2 → 4, but fails on 3 → 6 and 4 → 8.", "The square only fits the first example."],
  },
  "thinking-pattern-quotes": {
    title: "What do quotes do?",
    prompt: "5 is an int, \"5\" is a str, and \"18\" is also a str. Which pattern shows up?",
    instruction: "Pick the conclusion every example supports.",
    hint: "Look at how the value is written, not what the number looks like.",
    explanation: "Digits wrapped in quotes become text. Without quotes, the same digits can be a numeric value.",
    optionLabels: [
      "Quotes turn digits into a string",
      "All digits are always integers",
      "The number of digits decides the type",
    ],
    optionNotes: ["", "Digits inside quotes are text characters.", "A value's length does not decide whether it is an int or a str."],
  },
  "thinking-abstract-greeting": {
    title: "Keep what matters",
    prompt: "The program only needs to greet the user by name.",
    instruction: "Select the information to keep. Ignore details that do not serve the goal.",
    hint: "The goal is only a personal greeting.",
    explanation: "Abstraction keeps the relevant details: the name and the greeting format. Age and favorite color are not needed.",
    optionLabels: [
      "The user's name",
      "The greeting text format",
      "The user's age",
      "A favorite color",
    ],
    optionNotes: ["", "", "The age is not used to build a name greeting.", "A favorite color is outside the program's goal."],
    partialFeedback: "Keep only the data and rules that directly produce the greeting.",
  },
  "thinking-order-sum": {
    title: "Order the sum program",
    prompt: "The program reads two numbers, adds them, then shows the result.",
    instruction: "Use the up/down buttons until the execution order is right.",
    hint: "An operation can only use data that has already been read.",
    explanation: "Both inputs must be read before they are added, and the result must exist before it is displayed.",
    optionLabels: [
      "Display result",
      "Read first number",
      "Add the numbers",
      "Read second number",
    ],
  },
  "thinking-order-temperature": {
    title: "From Celsius to Fahrenheit",
    prompt: "The program converts Celsius to Fahrenheit with the formula C × 9 / 5 + 32.",
    instruction: "Arrange executable steps from start to finish.",
    hint: "The user's input needs to become a number before it enters the formula.",
    explanation: "The safe order is: read the input, convert it to a number, compute the formula, then show the result.",
    optionLabels: [
      "Compute C × 9 / 5 + 32",
      "Show the Fahrenheit value",
      "Read the Celsius input",
      "Convert the input to a float",
    ],
  },
  "thinking-trace-reassignment": {
    title: "Follow the value of x",
    prompt: "Trace the program line by line.",
    instruction: "Fill in the value of x after each assignment and the final output.",
    hint: "The second line reads x's old value before storing a new one.",
    explanation: "x starts at 5. The expression x + 2 evaluates to 7, then x is rebound to 7, so print shows 7.",
    fieldLabels: [
      "x after line 1",
      "x after line 2",
      "output",
    ],
    partialFeedback: "Part of the trace is right. Check again when x's value changes.",
  },
  "thinking-trace-types": {
    title: "Trace the type, not the look",
    prompt: "Two values look similar, but their types differ.",
    instruction: "Fill in each variable's type and the program's output.",
    hint: "Notice the quotes on the first assignment.",
    explanation: "label holds a string because it uses quotes; count holds an integer. The printed type names are str and int.",
    fieldLabels: [
      "type of label",
      "type of count",
      "output",
    ],
    partialFeedback: "One part is correct. Compare the values with and without quotes again.",
  },
  "thinking-pseudocode-greeting": {
    title: "A greeting in pseudocode",
    prompt: "Turn the task 'ask for a name, then show Hello + name' into pseudocode steps.",
    instruction: "Arrange the steps without worrying about Python syntax yet.",
    hint: "Get the data before using it in the message.",
    explanation: "Pseudocode captures the program's intent: get the name, build the message, then show the message.",
    optionLabels: [
      "DISPLAY message",
      "ASK name",
      "SET message TO \"Hello \" + name",
    ],
  },
  "thinking-pseudocode-area": {
    title: "Rectangle area",
    prompt: "Build a flow that computes the area from a length and a width.",
    instruction: "Arrange pseudocode that has input, processing, and output.",
    hint: "The formula cannot be computed before both measurements exist.",
    explanation: "The program reads the length and width, multiplies them, then shows the area.",
    optionLabels: [
      "SET area TO length × width",
      "ASK length",
      "DISPLAY area",
      "ASK width",
    ],
  },
  "thinking-debug-age": {
    title: "Why does age + 1 fail?",
    prompt: "age = input(\"Age: \") then print(age + 1) raises a TypeError. What is the main cause?",
    instruction: "Pick the diagnosis that explains the concept, not just a guessed fix.",
    hint: "What type does input() return? What type is the number 1?",
    explanation: "input() returns a string. Python cannot add a string and an integer, so age needs to be converted with int() before any number math.",
    optionLabels: [
      "input() gives a string; age needs to be converted to int",
      "The number 1 must be written as \"1\"",
      "print must be moved before the input",
      "input() cannot accept numbers",
    ],
    optionNotes: [
      "",
      "Turning 1 into a string only changes the operation into text joining, not age addition.",
      "Moving print before the input means age does not exist yet.",
      "input() can accept digits, but the result is still a string.",
    ],
  },
  "thinking-conditional-trace": {
    title: "Which branch runs?",
    prompt: "umur = 15, then the program checks umur >= 18. Which branch does Python run?",
    instruction: "Pick the output that actually appears.",
    hint: "Answer the condition's question first for age 15: is 15 >= 18 True or False?",
    explanation: "15 >= 18 is False, so the if block is skipped and the else block runs: Belum dewasa.",
    optionLabels: [
      "print(\"Dewasa\")",
      "print(\"Belum dewasa\")",
      "Both",
      "Error",
    ],
    optionNotes: [
      "15 >= 18 is False, so the if block does not run.",
      "",
      "Exactly one branch runs in a single if/else chain.",
      "The blocks are consistently indented, so there is no error.",
    ],
  },
  "thinking-conditional-order": {
    title: "Arrange the grading flow",
    prompt: "The grade-deciding program needs arranging from input to output.",
    instruction: "Order the steps from earliest.",
    hint: "The score must be read and become a number before it can be compared with 90 or 80.",
    explanation: "Read the score, convert it to a number, compare it with the grade ranges from the top, pick the grade, then display it. A comparison needs a value that is already a number.",
    optionLabels: [
      "Show the grade",
      "Read the score from the user",
      "Compare the score with the grade ranges",
      "Convert the input to a number",
      "Pick the grade from the first True branch",
    ],
  },
  "thinking-conditional-debug": {
    title: "Why does this comparison fail?",
    prompt: "age = input(\"Age: \") then if age >= 18: prints Adult. The program crashes for input 19.",
    instruction: "Pick the most accurate diagnosis.",
    hint: "What type does input() return, and what type does a comparison with 18 need?",
    explanation: "input() returns a string. A string cannot be compared to the number 18 like that — Python raises a TypeError. Convert first with int().",
    optionLabels: [
      "input() produces a string; it must be converted with int() first",
      "The if block is not indented enough",
      "The colon is missing",
    ],
    optionNotes: [
      "",
      "Indentation affects what is inside the block, not whether the comparison is valid.",
      "A colon is required, but it is not what crashes the program here.",
    ],
  },
  "thinking-conditional-pseudocode": {
    title: "Complete the branch pseudocode",
    prompt: "The Dewasa/Belum dewasa pseudocode is missing two keywords.",
    instruction: "Fill the two empty boxes with the right Python keywords.",
    hint: "The first keyword opens the question; the second closes it as a fallback branch with no condition.",
    explanation: "if opens the main condition, else closes the chain as the fallback branch that runs when the earlier condition is False.",
    fieldLabels: [
      "____ umur >= 18 → shows \"Dewasa\"",
      "____ → shows \"Belum dewasa\"",
    ],
    partialFeedback: "One keyword is right. Think about which one opens the question and which one is the fallback.",
  },
  "thinking-loop-trace": {
    title: "Chase the total",
    prompt: "total collects numbers across the loop. What shows at the end?",
    instruction: "Pick the output that actually appears.",
    hint: "Write down number and total on every pass: range(1, 4) gives number 1, 2, 3.",
    explanation: "total collects 1 + 2 + 3 = 6. print(total) runs once after the loop finishes.",
    optionLabels: ["6", "10", "3", "0"],
    optionNotes: [
      "",
      "range(1, 4) stops before 4, so 4 is never added in.",
      "total is not the last value of number — it holds the running sum.",
      "total changes on every pass because the adding line sits inside the loop.",
    ],
  },
  "thinking-loop-order": {
    title: "Arrange the while cycle",
    prompt: "The program wants to greet five times using while. Arrange the cycle from the earliest step.",
    instruction: "Order the steps from earliest.",
    hint: "The state must exist before it is checked, and it is updated after the loop body runs.",
    explanation: "Set the counter first, then check the condition, run the body, increase the counter — and go back to checking. This order is what lets a while stop.",
    optionLabels: [
      "Increase count",
      "Set count = 1",
      "Show the greeting",
      "Check count <= 5",
    ],
  },
  "thinking-loop-debug": {
    title: "Why does it never stop?",
    prompt: "count = 1, while count <= 5: print(count) — the program spins forever without ending.",
    instruction: "Pick the most accurate diagnosis.",
    hint: "Compare the condition with the loop body: what could make 1 <= 5 become False?",
    explanation: "No line changes count inside the loop, so the condition 1 <= 5 stays True forever — an infinite loop. Add count = count + 1 inside the block.",
    optionLabels: [
      "count is never updated inside the loop",
      "print should be outside the loop",
      "A while condition cannot use <=",
    ],
    optionNotes: [
      "",
      "The position of print decides what repeats, not when the loop stops.",
      "<= is a valid comparison for a while condition.",
    ],
  },
  "thinking-loop-pattern": {
    title: "Find the repeating rule",
    prompt: "A loop prints 2, 4, 6, 8. The line inside it applies the same rule on every pass.",
    instruction: "Pick the rule that is consistent for every pass.",
    hint: "i takes 0, 1, 2, 3 — try computing each candidate formula for all four values.",
    explanation: "With i = 0, 1, 2, 3, the formula (i + 1) × 2 gives 2, 4, 6, 8. The right rule must fit ALL iterations, not one.",
    optionLabels: [
      "print((i + 1) * 2)",
      "print(i * 2)",
      "print(i + 2)",
    ],
    optionNotes: ["", "i * 2 gives 0, 2, 4, 6 — only two of them match.", "i + 2 gives 2, 3, 4, 5 — not the even numbers."],
  },
  "thinking-function-decompose": {
    title: "Break down the greeting function",
    prompt: "You want one function that can greet different names without rewriting the logic.",
    instruction: "Select every step that is genuinely needed.",
    hint: "Separate the reusable definition from the real value supplied at call time.",
    explanation: "Define greet with a name parameter, use name in the body, then call it with a real argument. A favorite color does not serve the greeting's goal.",
    optionLabels: [
      "Define greet(name)",
      "Use name in the greeting body",
      "Call greet with a name argument",
      "Ask for a favorite color",
    ],
    optionNotes: ["", "", "", "A favorite color is not used to produce the name greeting."],
    partialFeedback: "Part of the flow is there. Make sure the function takes an input, uses that input, and is actually called.",
  },
  "thinking-function-order": {
    title: "Follow the return value",
    prompt: "The program defines add, calls it, stores the result, then shows the result.",
    instruction: "Order the events from the very first.",
    hint: "The function must exist before it is called; the result can only be stored after the return happens.",
    explanation: "The definition comes first. The call passes arguments to the parameters, the body computes and return hands the value over, then the caller stores and displays it.",
    optionLabels: [
      "Show result",
      "Call add(3, 4)",
      "Define add(a, b)",
      "Store the value in result",
      "The body returns a + b",
    ],
  },
  "thinking-function-trace": {
    title: "Trace two calls",
    prompt: "The same function is called twice with different arguments.",
    instruction: "Fill in the value each call returns and the final output.",
    hint: "Each call has its own local x. Compute x + 1 separately.",
    explanation: "next_number(4) returns 5 and next_number(7) returns 8. Both results are then printed as 5 8.",
    fieldLabels: [
      "value of first",
      "value of second",
      "output",
    ],
    partialFeedback: "One part is right. Trace each call separately before looking at the final print.",
  },
  "thinking-function-debug": {
    title: "Why does the function object print?",
    prompt: "The program writes print(add) and shows something like <function add ...>, not the number 5.",
    instruction: "Pick the most accurate diagnosis.",
    hint: "Compare add with add(2, 3). Which one only points at the function, and which one runs it?",
    explanation: "add is the function object itself. add(2, 3) uses parentheses and arguments to call it, so the return produces 5.",
    optionLabels: [
      "The function is never called; use add(2, 3)",
      "print cannot display numbers",
      "return must use a string",
    ],
    optionNotes: [
      "",
      "print can display numbers; the problem is that add is never called.",
      "return is allowed to hand back an integer like 5.",
    ],
  },
  "thinking-operator-pattern": {
    title: "Find the even pattern",
    prompt: "For the numbers 2, 4, 6, and 8, the same expression always produces 0.",
    instruction: "Pick the expression that captures the pattern of all those even numbers.",
    hint: "% gives the remainder of a division. Even numbers divide by 2 with nothing left.",
    explanation: "number % 2 gives a remainder of 0 for every even integer. This pattern uses the remainder operator, not plain division.",
    optionLabels: [
      "number % 2 == 0",
      "number / 2 == 0",
      "number % 2 == 1",
    ],
    optionNotes: [
      "",
      "Dividing an even number by 2 does not always produce 0; what you are looking for is the remainder.",
      "A remainder of 1 is the pattern for positive odd integers, not even ones.",
    ],
  },
  "thinking-operator-trace": {
    title: "Trace precedence",
    prompt: "Trace the expression 2 + 3 * 4 in two stages.",
    instruction: "Fill in the multiplication result first, then the final result.",
    hint: "Without parentheses, * has higher precedence than +.",
    explanation: "3 * 4 produces 12. After that, 2 + 12 produces 14.",
    fieldLabels: [
      "result of 3 * 4",
      "value of result",
    ],
    partialFeedback: "One stage is right. Make sure the multiplication finishes before the addition.",
  },
  "thinking-operator-order": {
    title: "Arrange the range check",
    prompt: "The program wants to check whether score sits between 70 and 100.",
    instruction: "Order the reasoning steps.",
    hint: "Get the score first, form two boundary questions, then combine the boolean results.",
    explanation: "Read the score, evaluate the lower and upper bounds, combine both with and, then use the boolean result.",
    optionLabels: [
      "Combine the two results with and",
      "Evaluate score <= 100",
      "Get the value of score",
      "Evaluate score >= 70",
    ],
  },
  "thinking-operator-debug": {
    title: "Why is this equality invalid?",
    prompt: "age = 18 then print(age = 18) raises a SyntaxError.",
    instruction: "Pick the most accurate diagnosis.",
    hint: "One equals sign stores; how many signs does an equality comparison use?",
    explanation: "= is an assignment. Inside this expression we need the equality comparison ==, so write print(age == 18).",
    optionLabels: [
      "Use == to compare age with 18",
      "Turn 18 into a string",
      "A comparison cannot sit inside print",
    ],
    optionNotes: [
      "",
      "The type of 18 is not the problem; the operator inside the expression is.",
      "A comparison is allowed inside print and produces a bool.",
    ],
  },
};

function localizeOptions(options: ThinkingOption[], override: ThinkingOverride): ThinkingOption[] {
  return options.map((option, index) => {
    const label = override.optionLabels?.[index] ?? option.label;
    const note = option.misconception ? override.optionNotes?.[index] : undefined;
    if (option.misconception && note) {
      return { ...option, label, misconception: { ...option.misconception, note } };
    }
    return { ...option, label };
  });
}

function localizeInteraction(interaction: ThinkingInteraction, override: ThinkingOverride): ThinkingInteraction {
  if (interaction.kind === "single-choice") {
    return {
      kind: "single-choice",
      correctOptionId: interaction.correctOptionId,
      options: localizeOptions(interaction.options, override),
    };
  }
  if (interaction.kind === "multi-select") {
    return {
      kind: "multi-select",
      correctOptionIds: interaction.correctOptionIds,
      partialFeedback: override.partialFeedback ?? interaction.partialFeedback,
      options: localizeOptions(interaction.options, override),
    };
  }
  if (interaction.kind === "ordering") {
    return {
      kind: "ordering",
      correctOrder: interaction.correctOrder,
      steps: localizeOptions(interaction.steps, override),
    };
  }
  return {
    kind: "fields",
    partialFeedback: override.partialFeedback ?? interaction.partialFeedback,
    fields: interaction.fields.map((field, index) => ({
      ...field,
      label: override.fieldLabels?.[index] ?? field.label,
    })),
  };
}

export function localizeThinkingActivities(activities: ThinkingActivity[], language: LessonLanguage): ThinkingActivity[] {
  if (language !== "en") return activities;
  return activities.map((activity) => {
    const override = enByActivity[activity.id];
    if (!override) return activity;
    return {
      ...activity,
      title: override.title ?? activity.title,
      prompt: override.prompt ?? activity.prompt,
      instruction: override.instruction ?? activity.instruction,
      hint: override.hint ?? activity.hint,
      explanation: override.explanation ?? activity.explanation,
      interaction: localizeInteraction(activity.interaction, override),
    };
  });
}
