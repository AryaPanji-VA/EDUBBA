import type { LessonContent } from "@/content/lessons/types";

export const setsIntroLessonContent: LessonContent = {
  slug: "sets-intro",
  intuitiveExplanation: [
    "Set itu kumpulan yang punya batas jelas: yang masuk daftar, anggota; yang tidak, bukan. Playlist, daftar kontak, himpunan mahasiswa aktif — semuanya set. Yang penting bukan urutan atau jumlah kemunculan, tapi keanggotaan.",
    "Dua pertanyaan paling dasar tentang set: “apakah elemen ini anggota?” (∈) dan “apakah semua elemen kumpulan ini juga ada di kumpulan itu?” (⊆). Keduanya sering ketuker: 2 ∈ {1, 2, 3} itu tentang elemen, {2} ⊆ {1, 2, 3} itu tentang kumpulan di dalam kumpulan.",
    "Komputer dan database hidup di atas ide ini: mencari data = mengecek keanggotaan; menyaring data = memilih subset. Set adalah bahasa dasar untuk bicara tentang kumpulan data secara tepat.",
  ],
  academicExplanation: [
    "A set is a well-defined collection of distinct objects, called elements or members. Sets are unordered and contain no duplicates: {1, 2, 3} and {3, 1, 2, 2} denote the same set. Membership (x ∈ A) is the fundamental relation between an object and a set.",
    "A set B is a subset of A (written B ⊆ A) when every element of B is also an element of A. Note the difference in type: 2 ∈ {1, 2, 3} relates an element to a set, while {2} ⊆ {1, 2, 3} relates two sets. In particular, {2} ∈ {1, 2, 3} is false, because {2} is not an element of that set.",
    "The empty set ∅ is the set with no elements. It is a subset of every set, because there is nothing in ∅ that could fail to be in another set. Set equality means both directions of subset hold: A = B exactly when A ⊆ B and B ⊆ A.",
  ],
  codeExamples: [
    {
      title: "Membership and subset",
      language: "notation",
      code: "A = {1, 2, 3}\n\n2 ∈ A        true   (2 is an element)\n{2} ⊆ A      true   (a set of elements, all in A)\n{2} ∈ A      false  ({2} is not an element of A)",
      explanation: "∈ asks about an element; ⊆ asks about a whole collection. The statement {2} ∈ A would only be true if A contained the set {2} itself as a member.",
    },
    {
      title: "Order and duplicates do not matter",
      language: "notation",
      code: "{1, 2, 3} = {3, 1, 2}\n{1, 2, 2, 3} = {1, 2, 3}\n\n|A| = 3      (the size counts distinct elements)",
      explanation: "Two sets are equal when they have exactly the same members — writing order and repeated listings do not create new sets.",
    },
    {
      title: "The empty set",
      language: "notation",
      code: "∅ = { }\n\n∅ ⊆ A   for every set A\n∅ ∈ A   only if A happens to contain ∅ as a member",
      explanation: "Emptiness is universal: ∅ fits inside any set because it makes no demands. Membership is a different question.",
    },
  ],
  keyTerms: [
    { term: "Set", definition: "A well-defined collection of distinct objects." },
    { term: "Element / Member", definition: "An object that belongs to a set." },
    { term: "Membership (∈)", definition: "The relation stating that an object is an element of a set." },
    { term: "Subset (⊆)", definition: "The relation stating that every element of one set is also an element of another." },
    { term: "Empty set (∅)", definition: "The set containing no elements; a subset of every set." },
  ],
  commonMistakes: [
    {
      title: "Confusing ∈ with ⊆",
      explanation: "2 ∈ {1, 2, 3} is true, but {2} ∈ {1, 2, 3} is false: {2} is a set, not an element, of that collection.",
    },
    {
      title: "Thinking order or duplicates change a set",
      explanation: "{1, 2, 3}, {3, 2, 1}, and {1, 1, 2, 3} all describe the same set. Only membership matters.",
    },
    {
      title: "Refusing the empty subset",
      explanation: "∅ ⊆ {1, 2} is true for every set. There is no element of ∅ that is missing from {1, 2}, so the subset condition holds.",
    },
  ],
  quickChecks: [
    {
      question: "Is {3} ⊆ {1, 2, 3}?",
      options: ["yes", "no"],
      answer: "yes",
      explanation: "Every element of {3} — namely 3 — is also an element of {1, 2, 3}.",
    },
    {
      question: "Is {3} ∈ {1, 2, 3}?",
      options: ["no", "yes"],
      answer: "no",
      explanation: "The elements of {1, 2, 3} are 1, 2, and 3. The set {3} is not one of them, so it is not a member.",
    },
  ],
};
