import type { LessonContent } from "@/content/lessons/types";

export const tuplesLessonContent: LessonContent = {
  slug: "tuples",
  intuitiveExplanation: [
    "List dan dictionary sudah lu kuasai: list itu kumpulan berurutan yang isinya bisa diubah, dictionary itu pasangan key → value. Tuple melengkapi keluarganya: dia juga kumpulan berurutan, tapi isinya justru tidak dimaksudkan untuk diubah.",
    "point = (10, 20) adalah satu tuple: dua value yang ditulis dalam kurung biasa dan memang seharusnya bersama — sebuah koordinat. Membacanya persis seperti list: point[0] memberi 10, posisi pertama tetap di index 0.",
    "Bedanya satu dan itu penting: colors = [\"red\", \"blue\"] boleh diganti (colors[0] = \"green\" sah), tapi point[0] = 99 ditolak Python. Item tuple fixed — dan justru itu gunanya: value yang tidak boleh berubah jadi tidak bisa berubah.",
  ],
  academicExplanation: [
    "A tuple is an ordered collection of values written with a tuple literal — round brackets with comma-separated values: point = (10, 20). One variable holds both values as a single group that belongs together: a coordinate.",
    "A tuple is ordered and indexed exactly like a list: point[0] reads the first item (10), point[1] reads the second (20), counting still starts at 0. Reading from a tuple needs nothing new — every indexing rule from Lists applies as is.",
    "The difference is mutability. A list's items can change in place: colors[0] = \"green\" is valid. A tuple's items are fixed: point[0] = 99 is not valid — Python refuses the change. That refusal is the feature: when a group of values must never drift apart or change, a tuple makes changing them impossible rather than merely discouraged.",
  ],
  codeExamples: [
    {
      title: "The tuple literal — a fixed pair",
      language: "python",
      code: "point = (10, 20)\nprint(point[0])\n\noutput:\n10",
      explanation: "The round brackets build a tuple literal: two values, comma-separated, stored in one variable. point holds a coordinate — two values that belong together as one group.",
    },
    {
      title: "List vs tuple — one works, one is refused",
      language: "python",
      code: "colors = [\"red\", \"blue\"]      # list — items can change\npoint = (10, 20)              # tuple — items are fixed\n\ncolors[0] = \"green\"           # works: colors → [\"green\", \"blue\"]\npoint[0] = 99                 # error: Python refuses the change",
      explanation: "Same shape of statement, opposite results. The list accepts item assignment — its items can change. The tuple refuses it — its items are fixed, and that is exactly what the parentheses promise.",
    },
    {
      title: "Reading both items — indexing like a list",
      language: "python",
      code: "point = (10, 20)\n\npoint[0] → 10   # posisi ke-1\npoint[1] → 20   # posisi ke-2",
      explanation: "Indexing works like a list: zero-based, square brackets. point[0] reads the first item, point[1] the second. Reading a tuple requires nothing new from Lists.",
    },
    {
      title: "Which one fits?",
      language: "python",
      code: "origin = (0, 0)                     # fixed pair → tuple\npoint = (10, 20)                    # fixed pair → tuple\n\ntodo = [\"study\", \"exercise\"]        # grows and changes → list\ntodo.append(\"sleep\")                # lists can grow",
      explanation: "A coordinate is a fixed group: the values belong together and must not change — tuple. A to-do list grows and changes over time — list. Choose the collection whose behavior matches the data's life.",
    },
  ],
  keyTerms: [
    { term: "Tuple", definition: "An ordered collection whose items are not meant to be changed: point = (10, 20) is one tuple holding a fixed pair." },
    { term: "Tuple literal", definition: "The round-bracket form that builds a tuple: (10, 20) — comma-separated values inside parentheses." },
    { term: "Ordered", definition: "A tuple keeps its values in a defined order, and indexing reads them in that order — point[0] is always the first item." },
    { term: "Immutable (fixed items)", definition: "A tuple's items cannot change in place: point[0] = 99 is refused by Python. Fixed items are the feature, not a limitation." },
    { term: "Index", definition: "The numeric position used to read one item: point[0] reads the first, point[1] the second — zero-based, same as a list." },
    { term: "Mutable vs fixed", definition: "The list-vs-tuple decision: a list's items can change (colors[0] = \"green\" works); a tuple's items are fixed (point[0] = 99 errors)." },
  ],
  commonMistakes: [
    {
      title: "Assigning to a tuple item and expecting it to work",
      explanation: "point[0] = 99 looks like the list assignment colors[0] = \"green\" — but the tuple's items are fixed. Python refuses the change instead of replacing the item.",
    },
    {
      title: "Mixing up ( ) and [ ]",
      explanation: "The brackets mean different collections: (10, 20) builds a tuple whose items are fixed; [10, 20] builds a list whose items can change. Swapping them swaps the behavior.",
    },
    {
      title: "Thinking a tuple is unordered",
      explanation: "A tuple is ordered, exactly like a list: point[0] is the first item, point[1] the second, counting from 0. Only mutability differs — never the order.",
    },
    {
      title: "Trying to add items to a tuple",
      explanation: "A tuple is a fixed group: there is no append, no growing. If the collection must grow — a to-do list, a scoreboard — it wants to be a list from the start.",
    },
    {
      title: "Forgetting why fixed data is useful",
      explanation: "Fixed items protect values that must never change: an origin (0, 0) stays (0, 0). With a mutable list, one accidental assignment could silently corrupt a value that should be permanent.",
    },
  ],
  quickChecks: [
    {
      question: "point = (10, 20). What does point[0] give?",
      options: ["10", "20", "(10, 20)", "An error — tuples cannot be indexed"],
      answer: "10",
      explanation: "A tuple is ordered and indexed like a list: index 0 is the first item, so point[0] reads 10.",
    },
    {
      question: "colors = [\"red\", \"blue\"] and point = (10, 20). Which line does Python refuse?",
      options: ["point[0] = 99", "colors[0] = \"green\"", "Both lines", "Neither line"],
      answer: "point[0] = 99",
      explanation: "The list's items can change, so colors[0] = \"green\" works. The tuple's items are fixed — Python refuses point[0] = 99.",
    },
    {
      question: "Which data fits a tuple?",
      options: [
        "A coordinate (10, 20) — a fixed pair that belongs together",
        "A to-do list that gains new tasks every day",
        "A scoreboard that updates after every game",
        "A shopping cart that keeps growing",
      ],
      answer: "A coordinate (10, 20) — a fixed pair that belongs together",
      explanation: "Fixed values that belong together and must not change fit a tuple. Collections that grow and change fit a list.",
    },
  ],
};
