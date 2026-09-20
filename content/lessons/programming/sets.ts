import type { LessonContent } from "@/content/lessons/types";

export const setsLessonContent: LessonContent = {
  slug: "sets",
  intuitiveExplanation: [
    "List, dictionary, tuple udah lewat — sekarang collection yang punya satu obsesi: isinya harus unik. tags = {\"python\", \"coding\", \"python\"} ditulis dengan \"python\" dua kali, tapi set-nya cuma nyimpen sekali.",
    "Duplikatnya collapse: len(tags) — tool hitung dari lesson Lists — balikin 2, bukan 3. Itu bukti paling bersih bahwa value kembar nggak disimpan dobel.",
    "Pertanyaan natural-nya bukan \"value keberapa?\" tapi \"ada nggak?\": \"python\" in tags → True. Dan set nggak punya posisi — tags[0] nggak valid, jadi jangan pernah andelin urutan print-nya.",
  ],
  academicExplanation: [
    "A set is a collection of unique values, written as a literal with curly braces: tags = {\"python\", \"coding\", \"python\"}. When a value appears more than once, the duplicates collapse — the set holds one copy, and len(tags) returns 2, not 3.",
    "The natural question a set answers is membership: \"python\" in tags evaluates to True, and a value that is not in the set gives False. There is no positional access — tags[0] is not valid, because a set promises uniqueness, not positions — and it makes no ordering promise either, so the order a set displays in must never be relied on.",
    "The three collections now cover three different trades: a list is ordered, allows duplicates, and is read by index; a tuple is ordered, fixed, and read by index; a set keeps unique values and answers membership, with no positional indexing at all. (One syntax note: an empty {} builds a dictionary, not a set — a set literal needs at least one value shown.)",
  ],
  codeExamples: [
    {
      title: "Duplicates collapse",
      language: "python",
      code: "tags = {\"python\", \"coding\", \"python\"}\nprint(len(tags))\n\noutput:\n2",
      explanation: "Three values were written, two survived: the second \"python\" collapses into the first. len from Lists is the cleanest proof — the set stores unique values only.",
    },
    {
      title: "Membership with in",
      language: "python",
      code: "tags = {\"python\", \"coding\", \"python\"}\nprint(\"python\" in tags)\nprint(\"html\" in tags)\n\noutput:\nTrue\nFalse",
      explanation: "in asks the set directly whether a value is in it. No positions, no keys — just the question \"is this value in the collection?\" and a boolean answer.",
    },
    {
      title: "No indexing — a set is not positional",
      language: "python",
      code: "tags = {\"python\", \"coding\"}\n\nprint(tags[0])\n\noutput:\nTypeError: 'set' object is not subscriptable",
      explanation: "Square brackets with a number ask for a position, and a set has none. Conceptually, the question \"the value at position 0?\" does not exist here — membership with in is the valid way in.",
    },
    {
      title: "Three collections, three trades",
      language: "python",
      code: "names = [\"Arya\", \"Bima\", \"Arya\"]   # list  → ordered, duplicates allowed, indexed\npoint = (10, 20)                      # tuple → ordered, fixed items, indexed\ntags  = {\"python\", \"coding\"}          # set   → unique values, no positional indexing\n\nnames[0] → \"Arya\"    point[1] → 20    tags[0] → TypeError",
      explanation: "Same bracket-family syntax, three different promises. Pick by what the data needs: order and duplicates → list; a fixed group → tuple; uniqueness and membership → set.",
    },
  ],
  keyTerms: [
    { term: "Set", definition: "A collection of unique values written with curly braces: {\"python\", \"coding\"}." },
    { term: "Unique", definition: "The defining trait — each value appears at most once; duplicates collapse into one." },
    { term: "Duplicate", definition: "A value written more than once. The set keeps a single copy, not one per write." },
    { term: "Membership (`in`)", definition: "The natural question sets answer: \"python\" in tags → True or False." },
    { term: "Unordered", definition: "No order promise — never rely on the order a set prints in." },
    { term: "Collection", definition: "One variable holding many values — alongside list, dictionary, and tuple." },
  ],
  commonMistakes: [
    {
      title: "Indexing a set like a list",
      explanation: "tags[0] asks for position 0, and a set has no positions — the access is invalid. Ask membership with in instead.",
    },
    {
      title: "Relying on the print order",
      explanation: "The order a set displays in is not a promise. Two prints of the same set are not guaranteed to look the same, so never build logic on it.",
    },
    {
      title: "Expecting duplicates to be counted",
      explanation: "{\"python\", \"coding\", \"python\"} holds 2 values, not 3. A written duplicate collapses instead of being stored twice.",
    },
    {
      title: "Reading {} as an empty set",
      explanation: "An empty {} builds a dictionary, not a set. A set literal needs at least one value shown.",
    },
    {
      title: "Using a set when position matters",
      explanation: "If the data needs a first item, a second item, or repeated values in order, a list is the right collection — a set throws position away.",
    },
  ],
  quickChecks: [
    {
      question: "tags = {\"python\", \"coding\", \"python\"}. How many values does the set hold?",
      options: ["2 — the duplicate collapses into one", "3 — every written value is stored", "1 — identical values cancel out entirely"],
      answer: "2 — the duplicate collapses into one",
      explanation: "A set keeps unique values only: the second \"python\" collapses into the first, and len(tags) counts 2.",
    },
    {
      question: "tags = {\"python\", \"coding\"}. What does \"python\" in tags give?",
      options: ["True — the set contains that value", "False — in only works on lists", "False — the value needs an index to be found"],
      answer: "True — the set contains that value",
      explanation: "in is the natural question for a set: is this value in the collection? It answers with a boolean.",
    },
    {
      question: "tags = {\"python\", \"coding\"}. Which access is invalid for a set?",
      options: ["tags[0] — sets have no positions", "\"python\" in tags — a membership check", "len(tags) — counting the values"],
      answer: "tags[0] — sets have no positions",
      explanation: "Square brackets ask for a position, and a set has none. Membership and len are the valid ways in.",
    },
  ],
};
