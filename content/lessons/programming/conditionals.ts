import type { LessonContent } from "@/content/lessons/types";

export const conditionalsLessonContent: LessonContent = {
  slug: "conditionals",
  intuitiveExplanation: [
    "Program nggak selalu jalan lurus dari atas ke bawah. Kadang program harus milih: kalau umur lu 18 ke atas, tampil satu pesan; kalau belum, tampil pesan lain. Milih itulah conditional.",
    "if itu pertanyaan. Kalau jawabannya True, blok yang menjorok ke dalam jalan. Kalau nggak, blok else yang jalan. Ada juga elif — else if — buat nanya lagi kalau pertanyaan sebelumnya belum kena.",
    "Coba biasain prediksi dulu sebelum run: baca kondisinya, tentukan True atau False untuk nilai yang ada, baru tentukan branch mana yang jalan. Ini kebiasaan yang bakal loe pakai terus.",
  ],
  academicExplanation: [
    "A conditional controls decision flow: Python evaluates a boolean expression — a comparison that is either True or False — and executes the indented block only when the result is True.",
    "Comparison operators produce booleans: == (equal), != (not equal), < (less), > (greater), <= (less or equal), >= (greater or equal). Note that == asks a question, while = performs assignment; they are different operators.",
    "if evaluates one condition. elif adds another condition checked only when all previous conditions were False, in order from top to bottom. else has no condition and runs only when everything before it was False. Exactly one branch of an if/elif/else chain runs — the first condition that is True wins, and the rest are skipped.",
    "The indented block belongs to the statement above it. Python uses indentation (4 spaces by convention) instead of braces; forgetting it, or using it inconsistently, changes which lines belong to which branch.",
  ],
  codeExamples: [
    { title: "One question, two paths", language: "python", code: "age = 20\n\nif age >= 18:\n    print(\"Dewasa\")\nelse:\n    print(\"Belum dewasa\")", explanation: "age >= 18 is True for 20, so the if block runs. The else block is skipped." },
    { title: "elif checks in order", language: "python", code: "score = 78\n\nif score >= 90:\n    print(\"A\")\nelif score >= 75:\n    print(\"B\")\nelse:\n    print(\"C\")", explanation: "Python checks top to bottom. 78 >= 90 is False, 78 >= 75 is True, so B prints. The else is never reached." },
    { title: "Comparisons produce booleans", language: "python", code: "print(10 > 3)    # True\nprint(10 == 3)   # False\nprint(10 != 3)   # True\nprint(10 <= 10)  # True", explanation: "Each comparison is an expression whose value is True or False." },
    { title: "Input needs conversion first", language: "python", code: "age = int(input(\"Umur: \"))\n\nif age >= 18:\n    print(\"Kamu sudah dewasa\")\nelse:\n    print(\"Kamu belum dewasa\")", explanation: "input() returns a string. int() converts it to a number so the comparison with 18 is valid." },
  ],
  keyTerms: [
    { term: "Condition", definition: "An expression Python evaluates to True or False to decide which block runs." },
    { term: "if", definition: "Runs its indented block only when its condition is True." },
    { term: "elif", definition: "\"Else if\" — checks another condition, but only when all previous conditions were False." },
    { term: "else", definition: "The fallback branch with no condition; runs only when everything before it was False." },
    { term: "Boolean expression", definition: "An expression whose value is True or False, usually built with comparison operators." },
    { term: "Comparison operator", definition: "==, !=, <, >, <=, >= — operators that compare two values and produce a boolean." },
    { term: "Indentation", definition: "The leading spaces that mark which lines belong to an if/elif/else block." },
  ],
  commonMistakes: [
    { title: "Using = instead of ==", explanation: "= assigns a value; == asks whether two values are equal. if age = 18: is a SyntaxError — the condition must be a question." },
    { title: "Forgetting the colon", explanation: "Every if, elif, and else line ends with :. The colon opens the indented block below it." },
    { title: "Inconsistent indentation", explanation: "The block's lines must be indented by the same amount. Mixing levels makes Python raise an IndentationError or attach lines to the wrong branch." },
    { title: "Comparing input text with a number", explanation: "input() returns a string. \"19\" >= 18 is not a valid comparison — convert first with int(input(...)) or float(input(...))." },
    { title: "Overlapping if statements where elif fits", explanation: "Two separate ifs are both checked, so two blocks can run. In an if/elif/else chain exactly one branch runs — use elif when the choices are mutually exclusive." },
    { title: "Misreading which branch runs", explanation: "Python checks conditions top to bottom and runs the first True branch only. The else does not run when any earlier condition was already True." },
  ],
  quickChecks: [
    { question: "What does this print?", code: "age = 20\nif age >= 18:\n    print(\"Dewasa\")\nelse:\n    print(\"Belum dewasa\")", options: ["Dewasa", "Belum dewasa", "Both lines", "Error"], answer: "Dewasa", explanation: "20 >= 18 is True, so the if block runs and the else block is skipped." },
    { question: "Which operator checks \"not equal\"?", options: ["==", "!=", "<=", "=!"], answer: "!=", explanation: "!= asks whether two values differ. == asks whether they are equal." },
    { question: "age = input(\"Umur: \") then if age >= 18: — what is wrong?", options: ["The colon is missing", "input gives a string; convert it with int() first", "if cannot compare", "Nothing is wrong"], answer: "input gives a string; convert it with int() first", explanation: "input() returns text. A string cannot be compared to the number 18 the way you intend — wrap the input in int()." },
  ],
};
