import type { LessonContent } from "@/content/lessons/types";

export const listsLessonContent: LessonContent = {
  slug: "lists",
  intuitiveExplanation: [
    "Sejauh ini satu variable cuma menampung satu value. List membuka pintu sebaliknya: satu variable bisa menampung banyak value sekaligus, dalam satu urutan yang rapi.",
    "names = [\"Arya\", \"Bima\", \"Citra\"] adalah satu variable berisi tiga nama. Tiap value punya posisi — dan posisi itu dihitung mulai dari 0: names[0] memberi \"Arya\", names[1] memberi \"Bima\". Jadi posisi ke-1 itu ada di index 0.",
    "List juga bisa berubah: names[1] = \"Dina\" mengganti isinya di tempat. Dan len(names) menghitung isinya — tiga value, hasilnya 3.",
  ],
  academicExplanation: [
    "A list is one ordered collection of values stored in a single variable. The literal form uses square brackets: names = [\"Arya\", \"Bima\", \"Citra\"] binds one variable, names, to a collection holding three strings in a defined order.",
    "Each value in the list is an element, and each element sits at an index — a numeric position counted from zero. names[0] reads \"Arya\", names[1] reads \"Bima\": the first position is index 0, so the last index of a three-element list is 2, always one less than len(names), which counts the elements. Indexing beyond the last position has no element to give, and Python reports an IndexError.",
    "Lists are mutable: an assignment through an index, names[1] = \"Dina\", replaces the element at that position inside the same list object — the variable keeps pointing at one collection whose contents changed. When a for loop walks the list (for name in names:), it visits those elements in the same order the indexes define.",
  ],
  codeExamples: [
    {
      title: "One variable, many values",
      language: "python",
      code: "names = [\"Arya\", \"Bima\", \"Citra\"]\n\nnames → [\"Arya\", \"Bima\", \"Citra\"]",
      explanation: "The square brackets build a list literal: three string values, comma-separated, stored in the single variable names. One variable, one ordered collection.",
    },
    {
      title: "Reading by index — zero-based",
      language: "python",
      code: "names = [\"Arya\", \"Bima\", \"Citra\"]\n\nnames[0] → \"Arya\"   # posisi ke-1\nnames[1] → \"Bima\"   # posisi ke-2\nnames[2] → \"Citra\"   # posisi ke-3",
      explanation: "The index in square brackets picks one element. Counting starts at 0: the first position is index 0, the second is index 1, the third is index 2. The last index is always one less than the number of elements.",
    },
    {
      title: "Items can change — mutable",
      language: "python",
      code: "names = [\"Arya\", \"Bima\", \"Citra\"]\nprint(names[1])\n\nnames[1] = \"Dina\"\nprint(names[1])\n\noutput:\nBima\nDina",
      explanation: "Before the assignment, index 1 holds \"Bima\". names[1] = \"Dina\" replaces that element inside the same list — after it, the same index reads \"Dina\". The list is mutable: its items can change.",
    },
    {
      title: "len() counts, for walks the values",
      language: "python",
      code: "names = [\"Arya\", \"Bima\", \"Citra\"]\n\nlen(names) → 3\n\nfor name in names:\n    print(name)\n\noutput:\nArya\nBima\nCitra",
      explanation: "len(names) counts the elements: 3. And for name in names: — the same walk from the For Loops lesson — visits each element in list order, one per iteration.",
    },
  ],
  keyTerms: [
    { term: "List", definition: "One ordered collection of values stored in a single variable, written with square brackets: [\"Arya\", \"Bima\", \"Citra\"]." },
    { term: "Index", definition: "The numeric position of an element inside the list, written in square brackets: names[0] reads the first element." },
    { term: "Zero-based", definition: "Index counting starts at 0: the first position is index 0, so the last index is always one less than the number of elements." },
    { term: "Element (item)", definition: "One value inside the list. \"Arya\", \"Bima\", and \"Citra\" are the three elements of names." },
    { term: "Mutable", definition: "The list's items can change in place: names[1] = \"Dina\" replaces the element at index 1 inside the same list." },
    { term: "len()", definition: "The built-in tool that counts the elements of a list: len(names) gives 3 for a three-element list." },
  ],
  commonMistakes: [
    {
      title: "Counting positions from one",
      explanation: "names[1] is the SECOND item — \"Bima\", not \"Arya\". The first item is names[0], because index counting starts at 0.",
    },
    {
      title: "Reaching past the last index",
      explanation: "A three-element list has indexes 0, 1, 2. names[3] asks for a position that does not exist, and Python reports an IndexError.",
    },
    {
      title: "Expecting the items to print one by one",
      explanation: "print(names) shows the whole list — [\"Arya\", \"Bima\", \"Citra\"] — in one line. To show one item, index it: print(names[0]).",
    },
    {
      title: "Dropping the quotes on string items",
      explanation: "names = [Arya, Bima, Citra] makes Python look for three variables. String elements need quotes: [\"Arya\", \"Bima\", \"Citra\"].",
    },
    {
      title: "Three variables instead of one list",
      explanation: "name1 = \"Arya\", name2 = \"Bima\", name3 = \"Citra\" is three loose values with no order and no way to walk them. One list keeps them together, ordered, and countable — that is exactly the job a list exists for.",
    },
  ],
  quickChecks: [
    {
      question: "names = [\"Arya\", \"Bima\", \"Citra\"]. What does names[0] give?",
      options: ["\"Arya\"", "\"Bima\"", "\"Citra\"", "IndexError"],
      answer: "\"Arya\"",
      explanation: "Index 0 is the first position — zero-based counting means the first element is read with names[0].",
    },
    {
      question: "After names[1] = \"Dina\" runs on [\"Arya\", \"Bima\", \"Citra\"], what does names[1] give?",
      options: ["\"Bima\"", "\"Dina\"", "\"Arya\"", "The whole list"],
      answer: "\"Dina\"",
      explanation: "The assignment replaced the element at index 1 in place — the list is mutable, so the same index now reads \"Dina\".",
    },
    {
      question: "What does len(names) return for [\"Arya\", \"Bima\", \"Citra\"]?",
      options: ["2", "3", "\"Citra\"", "IndexError"],
      answer: "3",
      explanation: "len() counts the elements: three values in the list, so 3 — even though the highest index is only 2.",
    },
  ],
};
