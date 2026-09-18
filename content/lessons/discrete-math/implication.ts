import type { LessonContent } from "@/content/lessons/types";

export const implicationLessonContent: LessonContent = {
  slug: "implication",
  intuitiveExplanation: [
    "Implication p → q itu bentuk dari sebuah janji. “Kalau hujan, gue bawa payung.” Kapan janji itu dilanggar? Cuma satu keadaan: hujan TAPI gue nggak bawa payung. Kalau nggak hujan, janji itu nggak dilanggar apa pun yang gue lakukan.",
    "Kejutan terbesar pemula: kalau p salah, p → q dihitung benar. “Kalau hujan, gue bawa payung” — hari ini cerah, jadi janjinya tetap terpenuhi (vacuously true). Di logika standar, p → q hanya salah ketika p benar dan q salah.",
    "Equivalence p ↔ q lebih ketat: benar cuma kalau p dan q bernilai sama (dua-duanya benar, atau dua-duanya salah). Kompasnya: janji untuk →, kembaran nilai untuk ↔.",
  ],
  academicExplanation: [
    "The implication p → q (if p then q) is false exactly when p is true and q is false, and true in all other cases. In particular, an implication with a false antecedent is true regardless of q; this is called vacuous truth. The implication does not assert that p causes q — it only constrains the combination (T, F) as forbidden.",
    "The converse of p → q is q → p. An implication and its converse are not logically equivalent: q → p can be false while p → q is true. Confusing the direction of an implication is a classic reasoning error.",
    "The biconditional p ↔ q (p if and only if q) is true exactly when p and q have the same truth value. It states that p → q and q → p hold together, making the two propositions interchangeable in truth value.",
  ],
  codeExamples: [
    {
      title: "The only false case of →",
      language: "notation",
      code: "p │ q │ p → q\nT │ T │ T\nT │ F │ F   ← the only false row\nF │ T │ T   ← vacuously true\nF │ F │ T   ← vacuously true",
      explanation: "Read p → q as a promise: it is broken only when p happens and q does not. A false p never breaks the promise.",
    },
    {
      title: "Equivalence requires matching values",
      language: "notation",
      code: "p │ q │ p ↔ q\nT │ T │ T\nT │ F │ F\nF │ T │ F\nF │ F │ T",
      explanation: "p ↔ q is true on the matching rows (T,T and F,F) and false whenever p and q disagree.",
    },
    {
      title: "Implication is not its converse",
      language: "notation",
      code: "p: \"It is raining\"      T\nq: \"I carry an umbrella\" F\n\np → q : F   (promise broken: rain, no umbrella)\nq → p : T   (umbrella day, but no claim about rain)",
      explanation: "The same two propositions make p → q false and q → p true: direction matters, and the two statements are not interchangeable.",
    },
  ],
  keyTerms: [
    { term: "Implication (→)", definition: "A compound proposition that is false exactly when the antecedent is true and the consequent is false." },
    { term: "Antecedent / Consequent", definition: "The proposition before (p) and after (q) the arrow in p → q." },
    { term: "Vacuous truth", definition: "The truth of an implication whose antecedent is false, regardless of the consequent." },
    { term: "Converse", definition: "The statement q → p, which is not logically equivalent to p → q." },
    { term: "Equivalence (↔)", definition: "A compound proposition that is true exactly when both sides have the same truth value." },
  ],
  commonMistakes: [
    {
      title: "Reading → as causation",
      explanation: "p → q does not claim p causes q; it only forbids the combination p true with q false.",
    },
    {
      title: "Rejecting vacuous truth",
      explanation: "\"If 2 + 2 = 5 then Jakarta is in France\" is true in logic, because the antecedent is false. Strange but consistent — the promise was never triggered.",
    },
    {
      title: "Swapping an implication with its converse",
      explanation: "\"If it rains, I carry an umbrella\" does not mean \"If I carry an umbrella, it rains\". The two directions differ in truth conditions.",
    },
  ],
  quickChecks: [
    {
      question: "If p is false and q is true, what is p → q?",
      options: ["true", "false"],
      answer: "true",
      explanation: "The only false case is p true and q false. With p false the implication is vacuously true.",
    },
    {
      question: "When is p → q false?",
      options: ["Only when p is true and q is false", "Whenever q is false", "Whenever p is false"],
      answer: "Only when p is true and q is false",
      explanation: "That single forbidden combination breaks the promise; every other row of the truth table is true.",
    },
  ],
};
