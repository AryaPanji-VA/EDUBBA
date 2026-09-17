import type { LessonContent } from "@/content/lessons/types";

export const propositionsLessonContent: LessonContent = {
  slug: "propositions",
  intuitiveExplanation: [
    "Proposition itu pernyataan yang bisa dinilai benar atau salah. Bukan perintah, bukan pertanyaan. “Jakarta ada di Indonesia” bisa dinilai: benar. “2 + 2 = 5” juga bisa dinilai: salah. Dua-duanya proposition — proposition nggak harus benar, dia cuma harus bisa dinilai.",
    "Misalnya p menyebut “Jakarta ada di Indonesia” (benar) dan q menyebut “2 + 2 = 5” (salah). Negasi ¬p membalik nilai kebenaran: kalau p benar, ¬p salah. Conjunction p ∧ q dibaca “p dan q”: hasilnya benar cuma kalau dua-duanya benar. Disjunction p ∨ q dibaca “p atau q” secara inklusif: benar kalau minimal satu benar — termasuk kalau dua-duanya benar.",
    "Kenapa komputer peduli? Setiap kondisi di program — if, filter, pencarian — pada dasarnya mengevaluasi proposition dan memakai nilai benar/salahnya untuk memutuskan. Logika propositional adalah bahasa dasar buat nalar itu dengan tepat.",
  ],
  academicExplanation: [
    "A proposition is a declarative sentence that is either true or false, but not both. Commands, questions, and sentences whose truth conditions are not well defined are not propositions. The truth value of a proposition is the label T (true) or F (false) assigned to it.",
    "The negation ¬p of a proposition p has the opposite truth value. The conjunction p ∧ q is true exactly when both p and q are true. The disjunction p ∨ q is true when at least one of p and q is true; this is the inclusive or of standard propositional logic, so the case where both are true still yields T.",
    "A truth table lists every combination of truth values for the propositions involved together with the resulting value of the compound statement. Truth tables are the standard tool for defining connectives and for reasoning about compound propositions.",
  ],
  codeExamples: [
    {
      title: "Naming propositions",
      language: "notation",
      code: "p: \"Jakarta is the capital of Indonesia\"   → T\nq: \"2 + 2 = 5\"                             → F\n\n¬p      negation      \"not p\"\np ∧ q   conjunction   \"p and q\"\np ∨ q   disjunction   \"p or q\"",
      explanation: "Short names keep compound statements readable. Each named proposition has a definite truth value; each connective combines them by fixed rules.",
    },
    {
      title: "Negation truth table",
      language: "notation",
      code: "p │ ¬p\nT │ F\nF │ T",
      explanation: "Negation reverses the truth value of p. Exactly one of p and ¬p is true.",
    },
    {
      title: "Conjunction truth table",
      language: "notation",
      code: "p │ q │ p ∧ q\nT │ T │ T\nT │ F │ F\nF │ T │ F\nF │ F │ F",
      explanation: "The conjunction is true only in the first row, where both propositions are true. One false input is enough to make it false.",
    },
    {
      title: "Disjunction truth table",
      language: "notation",
      code: "p │ q │ p ∨ q\nT │ T │ T\nT │ F │ T\nF │ T │ T\nF │ F │ F",
      explanation: "The disjunction is false only in the last row, where both propositions are false. Both-true still yields T: this is inclusive or.",
    },
  ],
  keyTerms: [
    { term: "Proposition", definition: "A declarative sentence with a definite truth value, true or false." },
    { term: "Truth value", definition: "The label T (true) or F (false) assigned to a proposition." },
    { term: "Negation (¬)", definition: "A connective whose result is true exactly when the proposition it applies to is false." },
    { term: "Conjunction (∧)", definition: "A connective whose result is true exactly when both propositions are true." },
    { term: "Disjunction (∨)", definition: "A connective whose result is true when at least one proposition is true (inclusive or)." },
    { term: "Truth table", definition: "A table listing every combination of truth values and the resulting value of a compound statement." },
  ],
  commonMistakes: [
    {
      title: "Treating commands or questions as propositions",
      explanation: "\"Close the door!\" is a command and \"Where do you live?\" is a question; neither has a truth value, so neither is a proposition.",
    },
    {
      title: "Thinking a proposition must be true",
      explanation: "\"2 + 2 = 5\" is false, but it is still a proposition with truth value F. Being judgeable is what matters, not being true.",
    },
    {
      title: "Reading ∨ as exclusive or",
      explanation: "In standard propositional logic, p ∨ q is true even when both p and q are true. The exclusive reading (never both) is a different operator.",
    },
    {
      title: "Confusing ∧ with ∨",
      explanation: "∧ requires both propositions to be true; ∨ requires at least one. Swapping them changes the truth conditions of the compound statement.",
    },
  ],
  quickChecks: [
    {
      question: "Which sentence is a proposition?",
      options: ["Surabaya is a city in Indonesia.", "Please close the door.", "What time is it?"],
      answer: "Surabaya is a city in Indonesia.",
      explanation: "It is a declarative sentence that can be judged true. The other two are a command and a question, which have no truth value.",
    },
    {
      question: "If p is true and q is false, what is p ∨ q?",
      options: ["true", "false"],
      answer: "true",
      explanation: "The disjunction is true when at least one proposition is true; here p is true.",
    },
    {
      question: "If p is false, what is ¬p?",
      options: ["true", "false"],
      answer: "true",
      explanation: "Negation reverses the truth value: p false makes ¬p true.",
    },
  ],
};
