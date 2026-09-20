import type { LessonContent } from "@/content/lessons/types";

export const dictionariesLessonContent: LessonContent = {
  slug: "dictionaries",
  intuitiveExplanation: [
    "Lesson lalu, list nyimpen satu kumpulan value dalam satu urutan: diambil pakai posisi, names[0]. Tapi banyak data bukan soal posisi — nama, nilai, umur. Tiap label punya arti. Dictionary nyimpen value pakai key yang bermakna.",
    "student = {\"name\": \"Arya\", \"score\": 90} bikin dictionary: tiap pasangan key: value nempel satu value ke satu key. student[\"name\"] ngambil value-nya pakai key-nya — bukan posisi.",
    "student[\"score\"] = 95 memakai kurung siku yang sama untuk mengubah value di sebuah key — atau menambah key baru kalau belum ada. Bedanya sama list ada di cara akses: list pakai posisi, dictionary pakai arti.",
  ],
  academicExplanation: [
    "A dictionary is a collection that stores values under meaningful keys instead of numeric positions. Where a list answers \"what sits at position 0?\", a dictionary answers \"what is stored under this key?\".",
    "The literal {\"name\": \"Arya\", \"score\": 90} builds the mapping key → value: each pair attaches one value to one key, and the whole mapping lives in a single variable. student[\"name\"] retrieves by key — the brackets carry the key, and the expression evaluates to the value stored under it.",
    "The same bracket syntax also writes: student[\"score\"] = 95 replaces the value under an existing key, or adds the key if it is not there yet. This lesson keeps the beginner picture — string keys, one flat dictionary, retrieval by key.",
  ],
  codeExamples: [
    {
      title: "The core dictionary",
      language: "python",
      code: "student = {\"name\": \"Arya\", \"score\": 90}\nprint(student[\"name\"])\n\noutput:\nArya",
      explanation: "The literal stores two key-value pairs in one variable. student[\"name\"] asks for the key \"name\" and the dictionary hands back \"Arya\".",
    },
    {
      title: "Retrieve by key",
      language: "python",
      code: "student = {\"name\": \"Arya\", \"score\": 90}\n\nprint(student[\"name\"])\nprint(student[\"score\"])\n\noutput:\nArya\n90",
      explanation: "Each retrieval carries a different key into the brackets, so each print shows the value stored under that key. The key is the whole address — no counting involved.",
    },
    {
      title: "Update one key",
      language: "python",
      code: "student = {\"name\": \"Arya\", \"score\": 90}\nstudent[\"score\"] = 95\n\nprint(student[\"score\"])\n\noutput:\n95",
      explanation: "Before: score is 90. After: student[\"score\"] = 95 replaced the value under \"score\". The same syntax also adds a key that is not in the dictionary yet — one form, two jobs.",
    },
    {
      title: "List vs dictionary",
      language: "python",
      code: "names = [\"Arya\", \"Bima\"]\nstudent = {\"name\": \"Arya\", \"score\": 90}\n\nprint(names[0])         → \"Arya\"   (position)\nprint(student[\"name\"])  → \"Arya\"   (key)",
      explanation: "The list is one ordered collection addressed by numeric position: names[0] means \"first\". The dictionary is addressed by meaning: student[\"name\"] means \"the name\". Same brackets, different kind of address.",
    },
  ],
  keyTerms: [
    { term: "Dictionary", definition: "A collection that stores values under meaningful keys instead of numeric positions." },
    { term: "Key", definition: "The meaningful address of one value — here, a string like \"name\" or \"score\"." },
    { term: "Value", definition: "The data stored under a key; what the dictionary hands back when asked." },
    { term: "Key-value pair", definition: "One \"key\": value entry inside the literal — the unit a dictionary is built from." },
    { term: "Retrieve (access by key)", definition: "Reading a value back with the key in brackets: student[\"name\"]." },
    { term: "Update", definition: "Writing with the same bracket syntax: student[\"score\"] = 95 replaces the value under an existing key, or adds a new key." },
  ],
  commonMistakes: [
    {
      title: "Using a position on a dictionary — or a key on a list",
      explanation: "student[0] reaches for position 0 in a collection that has keys, not positions; names[\"Arya\"] reaches for a key in a collection that has positions. Each collection answers only its own kind of address.",
    },
    {
      title: "Forgetting the quotes on a string key",
      explanation: "student[name] looks up the variable called name; student[\"name\"] looks up the key \"name\". Without quotes, Python reads the word as a variable — not as the key you meant.",
    },
    {
      title: "Retrieving a key the dictionary does not have",
      explanation: "student[\"grade\"] fails when the literal only stored \"name\" and \"score\". A dictionary can only return keys that were actually stored — nothing else comes out.",
    },
    {
      title: "Thinking keys are ordered positions",
      explanation: "\"score\" is not \"the second item\". The key is the entire address: what matters is the meaning you wrote, not where the pair happens to sit between the braces.",
    },
    {
      title: "Building a fake dictionary from separate variables",
      explanation: "name = \"Arya\" and score = 90 are two separate boxes — no keys, no grouping. Only {\"name\": \"Arya\", \"score\": 90} stores the values under keys in one collection.",
    },
  ],
  quickChecks: [
    {
      question: "student = {\"name\": \"Arya\", \"score\": 90}. What does student[\"score\"] give?",
      options: [
        "90 — the value stored under the \"score\" key",
        "1 — the second position in the dictionary",
        "\"score\" — the key comes back",
        "Nothing — score needs an update first",
      ],
      answer: "90 — the value stored under the \"score\" key",
      explanation: "The brackets carry the key \"score\"; the dictionary returns the value stored under it — 90.",
    },
    {
      question: "After student[\"score\"] = 95, what does student[\"score\"] give?",
      options: [
        "95 — the value under \"score\" was replaced",
        "90 — the original value is kept",
        "90 and 95 — both values are stored",
        "An error — the key already exists",
      ],
      answer: "95 — the value under \"score\" was replaced",
      explanation: "The same bracket syntax that stores also updates: writing to an existing key replaces its value.",
    },
    {
      question: "Which access fits a dictionary?",
      options: [
        "student[\"name\"] — the brackets carry a key",
        "student[0] — the brackets carry a position",
        "student(name) — a call, like a function",
        "names[\"Arya\"] — the brackets carry a value",
      ],
      answer: "student[\"name\"] — the brackets carry a key",
      explanation: "A dictionary is addressed by key. Positions belong to lists, and a dictionary is not called like a function.",
    },
  ],
};
