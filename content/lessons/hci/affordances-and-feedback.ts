import type { LessonContent } from "@/content/lessons/types";

export const affordancesAndFeedbackLessonContent: LessonContent = {
  slug: "affordances-and-feedback",
  intuitiveExplanation: [
    "Tombol yang menonjol di pintu minta ditekan; pelat logam datar minta didorong. Bentuknya sudah “ngomong” sebelum kita mikir. Di antarmuka, affordance adalah janji bentuk: apa yang bisa dilakukan dan bagaimana caranya.",
    "Feedback adalah jawaban sistem. Setiap aksi pengguna layak dapat respons yang bisa dilihat atau didengar — sekecil apa pun: tombol berubah warna, spinner muncul, teks tersimpan. Diam itu bukan netral; diam itu kebingungan.",
    "Dua pertanyaan audit untuk layar apa pun: (1) dari bentuknya saja, aksi apa yang ditawarkan dan mana yang tidak? (2) setelah tiap aksi, apa jawaban yang diberikan sistem? Dua-duanya adalah bagian desain, bukan tambahan opsional.",
  ],
  academicExplanation: [
    "An affordance is the relationship between an object's form and the actions a user can perceive it to support. In physical objects, shape and material signal use — a handle invites pulling, a flat plate invites pushing. In graphical interfaces, conventions (button-like containers, underlined links, grabbable cursors) carry the same signaling role; the perceived action possibilities are what guide behavior, whether or not they match the designer's intent.",
    "Signifiers make affordances specific: a wheelchair-accessible ramp sign, a placeholder in an input field, a disabled state on a button. When users do not act as intended, the common failure is missing or contradictory signifiers, not a missing affordance.",
    "Feedback is the system's response to an action, and it serves three purposes: confirming receipt (something happened), conveying state (what happened), and setting expectations (what happens next, including progress and duration). Interfaces without feedback force users to guess whether their action registered — which reliably produces repeated submissions, hesitation, and abandonment.",
  ],
  codeExamples: [
    {
      title: "Affordance on a door and on a screen",
      language: "text",
      code: "Door:  flat metal plate  → push\n       curved handle    → pull\n\nButton: raised container, label \"Simpan\"\n        → press; something should save",
      explanation: "Form speaks before instruction. A plate-shaped door handle and a raised button both promise an action without words.",
    },
    {
      title: "Three jobs of feedback",
      language: "text",
      code: "Tap \"Simpan\" →\n  receipt: button state changes / spinner appears\n  state:   \"Draft saved 14:02\"\n  future:  progress bar: uploading 40%\n\nSilence: none of the above — user taps again.",
      explanation: "Confirm, explain, and set expectations. Silence produces none of these, so users substitute their own guesses and repeat actions.",
    },
  ],
  keyTerms: [
    { term: "Affordance", definition: "The relationship between an object's form and the actions a user perceives it to support." },
    { term: "Signifier", definition: "A perceivable marker that makes a specific affordance explicit — labels, icons, placeholders, disabled states." },
    { term: "Feedback", definition: "The system's perceivable response to an action: confirming receipt, conveying state, setting expectations." },
    { term: "Silence (as failure)", definition: "The absence of feedback after an action, which users interpret as non-registration and answer by repeating the action." },
  ],
  commonMistakes: [
    {
      title: "Clickable-looking things that do nothing",
      explanation: "Card text styled like a link or a label boxed like a button promises an action; delivering nothing teaches users to distrust the interface.",
    },
    {
      title: "Actions with no visible response",
      explanation: "A save that completes invisibly gets tapped three times. The work was done; the interface failed to say so.",
    },
    {
      title: "Hiding affordances behind habit",
      explanation: "\"Users will discover it by swiping\" works for exactly one audience: the one that already knows. Signifiers scale; secrets don't.",
    },
  ],
  quickChecks: [
    {
      question: "A raised, labeled \"Simpan\" button most directly communicates…",
      options: ["That pressing it performs a save", "The user's file history", "That the page is a draft"],
      answer: "That pressing it performs a save",
      explanation: "The form (raised, button-like container) plus the label (signifier) together promise one specific action.",
    },
    {
      question: "A user taps \"Simpan\" and nothing visibly changes. What typically follows?",
      options: ["They tap it again, possibly several times", "They assume it worked perfectly", "They read the network log"],
      answer: "They tap it again, possibly several times",
      explanation: "Without feedback, the user cannot confirm registration; repeated submission is the predictable response — and a duplicate-save bug waiting to happen.",
    },
  ],
};
