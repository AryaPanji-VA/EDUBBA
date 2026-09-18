import type { LessonContent } from "@/content/lessons/types";

export const efficiencyIntuitionLessonContent: LessonContent = {
  slug: "efficiency-intuition",
  intuitiveExplanation: [
    "Cari nama di buku telepon setebal 1000 halaman dengan cara membuka halaman satu, dua, tiga… itu pasti selesai — tapi mungkin butuh 1000 bukaan. Buka tengahnya, buang setengah, ulangi: paling banyak 10 bukaan. Dua algoritma yang benar, biayanya beda jauh.",
    "Pertanyaan efisiensi bukan “berapa lama di komputer lu” (itu tergantung hardware), tapi “bagaimana jumlah kerja tumbuh kalau inputnya tumbuh”. Membaca semua item itu kerja yang tumbuh sebanding jumlah item (linear). Membagi-dua berulang itu kerja yang tumbuh sangat lambat (logaritmik).",
    "Intuisi pertama yang paling berguna: hitung berapa kali algoritma “menyentuh” setiap item input. Sekali per item itu batas wajar untuk banyak masalah; kalau jutaan kali per item, sesuatu mungkin bisa diperbaiki.",
  ],
  academicExplanation: [
    "Efficiency analysis studies how an algorithm's resource use grows with input size, expressed independently of hardware. The standard measure is the growth rate of the number of basic operations as a function of input size n: linear growth does work proportional to n, while logarithmic growth does work proportional to log n.",
    "The contrast between linear search and binary search illustrates the stakes. Linear search examines items one by one, requiring up to n comparisons for n items. Binary search, which requires the data to be sorted, halves the remaining range each comparison, requiring about log₂ n comparisons — for a million items, roughly 20 instead of a million.",
    "Two practical rules anchor beginner intuition. First, count how many times each input item is touched: once per item is a reasonable baseline for many problems, and quadratic behavior — touching every item for every item — is often improvable. Second, recognize when extra structure (like sortedness) can be traded for speed: binary search buys logarithmic work at the price of maintaining order.",
  ],
  codeExamples: [
    {
      title: "Two ways to find a name",
      language: "pseudocode",
      code: "LINEAR:  open page 1, 2, 3, ... until found\n         worst case: 1000 opens (n = 1000 pages)\n\nBINARY:  open the middle, discard half, repeat\n         worst case: ~10 opens (log₂ 1000)",
      explanation: "Both procedures are correct. Their costs differ by two orders of magnitude on the same input — that difference is what efficiency intuition is about.",
    },
    {
      title: "Growth at a glance",
      language: "text",
      code: "n = 1,000,000 items\n\ntouch each once (linear)      1,000,000 steps\nhalve repeatedly (logarithmic)      ~20 steps\n\nThe algorithm did not change the answer.\nIt changed the cost of the answer.",
      explanation: "Growth rate, not clock time: how does the work scale when n grows? That property survives any hardware upgrade.",
    },
  ],
  keyTerms: [
    { term: "Efficiency", definition: "How an algorithm's work grows as input size grows, independent of hardware." },
    { term: "Growth rate", definition: "The relationship between input size and number of operations — e.g. linear, logarithmic." },
    { term: "Linear work", definition: "Work proportional to input size: touch each item about once." },
    { term: "Logarithmic work", definition: "Work proportional to log n: halving the problem repeatedly." },
    { term: "Binary search", definition: "Search in sorted data by halving the remaining range each step." },
  ],
  commonMistakes: [
    {
      title: "Measuring speed in seconds",
      explanation: "Wall-clock time depends on the machine and its load. Growth rate — steps as a function of n — is the property that survives.",
    },
    {
      title: "Assuming faster hardware fixes bad algorithms",
      explanation: "A quadratic algorithm on a million items is hopeless on any laptop; a better algorithm makes it instant. Hardware multiplies constants; growth decides the game.",
    },
    {
      title: "Ignoring the preconditions of a fast method",
      explanation: "Binary search needs sorted data. Using it on unsorted data is not fast — it is simply wrong.",
    },
  ],
  quickChecks: [
    {
      question: "What does efficiency analysis measure?",
      options: ["How work grows with input size, independent of hardware", "Execution time in seconds on your laptop", "Lines of code"],
      answer: "How work grows with input size, independent of hardware",
      explanation: "Growth rate — operations as a function of n — is the hardware-independent property that matters.",
    },
    {
      question: "For a million sorted items, binary search needs about how many comparisons?",
      options: ["About 20", "About a million", "About half a million"],
      answer: "About 20",
      explanation: "Halving a million times over: log₂(1,000,000) ≈ 20. That is the power of logarithmic growth.",
    },
  ],
};
