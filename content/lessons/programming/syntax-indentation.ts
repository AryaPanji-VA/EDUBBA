import type { LessonContent } from "@/content/lessons/types";

export const syntaxIndentationLessonContent: LessonContent = {
  slug: "syntax-indentation",
  intuitiveExplanation: [
    "Python reads your code exactly as it is written — letter by letter, space by space. Syntax is simply the set of rules for writing instructions so Python can read them.",
    "You already know one complete instruction: print(\"Hello!\"). Its shape is the syntax you need right now: print in lowercase, parentheses carrying what to show, quotes marking the exact text.",
    "Python also cares about how lines are arranged. The spaces at the start of a line are called indentation — and in Python they are not decoration. They help Python see which lines belong together.",
  ],
  academicExplanation: [
    "Syntax is the set of rules that defines how instructions must be written for Python to read them. The language reads names case-sensitively: print and Print are different spellings, and only the lowercase form is the instruction you have learned.",
    "A print instruction has three visible parts: the name print, parentheses that carry what should be displayed, and quotation marks that mark the exact text. Writing the parts in their expected shape is what makes the line readable to Python.",
    "Indentation is the whitespace at the start of a line. In Python it is significant: lines that are indented the same amount are read as belonging to the same group. For the instructions you know so far, the convention is simple — start each print line flush left, with no leading spaces.",
  ],
  codeExamples: [
    {
      title: "The shape of one instruction",
      language: "python",
      code: "print(\"Hello!\")\n\noutput:\nHello!",
      explanation: "print — the instruction name, in lowercase. ( ) — carries what to display. \" \" — marks the exact text. Three parts, one complete instruction.",
    },
    {
      title: "Spelling matters: print vs Print",
      language: "python",
      code: "print(\"Hello!\")\n\noutput:\nHello!\n\nPrint(\"Hello!\")\n\noutput:\n(not recognized — different spelling)",
      explanation: "Python reads names exactly as spelled. Only lowercase print is the instruction you know — Print with a capital P is a different spelling Python does not recognize.",
    },
    {
      title: "Indentation changes the shape",
      language: "python",
      code: "Versi rapi:              Versi menjorok:\nprint(\"Pertama\")              print(\"Pertama\")\nprint(\"Kedua\")           print(\"Kedua\")",
      explanation: "Left side: every instruction starts flush left — the shape you have learned. Right side: leading spaces change how the lines are read, because in Python indentation carries meaning. For now, keep every print line flush left.",
    },
  ],
  keyTerms: [
    { term: "Syntax", definition: "The rules for how Python instructions must be written." },
    { term: "Case-sensitive", definition: "Uppercase and lowercase spellings are treated as different names." },
    { term: "Indentation", definition: "The spaces at the start of a line; in Python they carry meaning." },
    { term: "Block", definition: "A group of lines that belong together; in Python, indentation shows the grouping." },
  ],
  commonMistakes: [
    {
      title: "Writing Print instead of print",
      explanation: "Python reads spellings exactly. The instruction you know is lowercase print — Print with a capital P is a different name.",
    },
    {
      title: "Treating indentation as decoration",
      explanation: "In Python, the spaces at the start of a line help define structure. Indentation is part of how the code is read, not a styling choice.",
    },
    {
      title: "Assuming Python ignores spaces",
      explanation: "Python reads your code space by space. Extra spaces at the start of a line change the shape of the code.",
    },
    {
      title: "Mixing indentation styles",
      explanation: "Lines that belong together should be indented consistently. Keeping every print line flush left is the clean habit for now.",
    },
  ],
  quickChecks: [
    {
      question: "What is syntax?",
      options: [
        "The rules for how Python instructions must be written",
        "The output a program produces",
        "A way to make code look pretty",
        "The name of the Python application",
      ],
      answer: "The rules for how Python instructions must be written",
      explanation: "Syntax is the writing rules of the language — the shape that makes an instruction readable to Python.",
    },
    {
      question: "Are print and Print the same in Python?",
      options: [
        "No — Python reads names exactly as spelled",
        "Yes — capitalization never matters",
        "Yes, as long as the quotes are correct",
        "No — Print is the newer version",
      ],
      answer: "No — Python reads names exactly as spelled",
      explanation: "Python is case-sensitive: the spelling is part of the name. Only lowercase print is the instruction you have learned.",
    },
    {
      question: "What does indentation do in Python?",
      options: [
        "It helps define which lines belong together — it carries meaning",
        "Nothing — spaces at the start of a line are ignored",
        "It only makes the code look nicer",
        "It turns code into output",
      ],
      answer: "It helps define which lines belong together — it carries meaning",
      explanation: "In Python, indentation is significant: it shows grouping. For now, keep every print line flush left.",
    },
  ],
};
