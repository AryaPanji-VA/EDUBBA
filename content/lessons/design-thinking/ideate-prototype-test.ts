import type { LessonContent } from "@/content/lessons/types";

export const ideatePrototypeTestLessonContent: LessonContent = {
  slug: "ideate-prototype-test",
  intuitiveExplanation: [
    "Ideation itu sengaja melebarkan dulu sebelum menyempitkan. Otak kita otomatis menempel di ide pertama yang masuk — padahal ide pertama hampir selalu ide paling umum, yang sudah dipikirkan semua orang. Aturan mainnya: pisahkan momen menghasilkan dari momen menilai.",
    "Dari sekian ide, pilih sedikit untuk dijadikan prototype — versi paling murah yang bisa dipakai orang. Prototipe bukan produk mini; fungsinya menjawab satu pertanyaan, bukan memamerkan fitur. Kertas, sketsa, atau cerita yang diperagakan sering cukup.",
    "Lalu test: taruh di depan pengguna sungguhan, lihat di mana mereka tersandung, dan tahan keinginan menjelaskan. Hasilnya bukan nilai lulus/gagal, tapi pemahaman baru tentang masalah — yang mengirim kembali ke tahap mana pun di loop.",
  ],
  academicExplanation: [
    "Ideation applies divergence before convergence: first generate many options while deliberately suspending judgment, then select. The separation matters because evaluation during generation suppresses unusual ideas, while unusual ideas are precisely where novel solutions come from. Techniques such as brainstorming, brainwriting, and analogous inspiration are structured ways to enforce the separation.",
    "A prototype is an artifact built to answer a specific question at minimum cost. Fidelity is chosen to match the question: paper sketches answer layout questions, clickable mockups answer flow questions, Wizard-of-Oz setups answer whether a service concept has value. A prototype that tries to answer every question at once becomes expensive and hard to learn from.",
    "Testing observes real users interacting with the artifact with minimal facilitator intervention. The measure of interest is where users hesitate, misread, or invent workarounds — behavior, not opinions. Test results feed the loop: they may send the team back to ideation, to the problem frame, or forward to refinement.",
  ],
  codeExamples: [
    {
      title: "One question per prototype",
      language: "text",
      code: "Q: \"Do transfer students see class changes at a glance?\"\nPrototype: paper sketch of one screen\nCost: 15 minutes\n\nNext question, next prototype.",
      explanation: "The artifact exists to answer one named question cheaply. It does not need working code, styling, or completeness.",
    },
    {
      title: "Divergence then convergence",
      language: "text",
      code: "IDEATE     [12 ideas, no judging yet]\nSELECT     [2 ideas, chosen against the POV]\nPROTOTYPE  [2 cheap artifacts]\nTEST       [5 users, observe silently]",
      explanation: "Widen first, narrow second. Selection criteria come from the POV, not from whoever argues loudest.",
    },
    {
      title: "What a test observes",
      language: "text",
      code: "User: pauses 8s at screen 2, taps the logo twice, says\n      \"is this loading?\"\n\nData: hesitation + wrong-tap + verbalized guess\nNot data: whether they \"liked\" it.",
      explanation: "Behavior during a test is the evidence. Opinions about the artifact are secondary; what users do outranks what they say about it.",
    },
  ],
  keyTerms: [
    { term: "Divergent thinking", definition: "Generating many options while suspending judgment." },
    { term: "Convergent thinking", definition: "Narrowing many options to a few, against explicit criteria." },
    { term: "Prototype", definition: "A low-cost artifact built to answer one specific question." },
    { term: "Fidelity", definition: "How finished a prototype feels; chosen to match the question it answers." },
    { term: "Think-aloud test", definition: "A test where users narrate their thoughts while using an artifact, observed with minimal intervention." },
  ],
  commonMistakes: [
    {
      title: "Judging ideas while generating them",
      explanation: "\"We tried that in 2019\" kills ideas mid-generation. Record first, evaluate later — the separation is the technique.",
    },
    {
      title: "Falling in love with the first idea",
      explanation: "The first idea is usually the most obvious one. Divergence exists to get past it before committing.",
    },
    {
      title: "Prototyping everything at high fidelity",
      explanation: "A polished prototype answers its question no better than a sketch, costs far more, and makes the team reluctant to throw it away.",
    },
    {
      title: "Explaining during the test",
      explanation: "Every explanation you give while testing deletes the exact data you came for: where the user gets lost without help.",
    },
  ],
  quickChecks: [
    {
      question: "What is the primary job of a prototype?",
      options: ["To answer one specific question at minimum cost", "To preview the final product's look", "To impress stakeholders"],
      answer: "To answer one specific question at minimum cost",
      explanation: "Prototypes are questions made tangible: pick the question, build the cheapest artifact that answers it.",
    },
    {
      question: "During a test, the user pauses and taps the wrong element. What is this?",
      options: ["Evidence — hesitation and misdirection are data", "A failure of the user", "Noise to ignore"],
      answer: "Evidence — hesitation and misdirection are data",
      explanation: "Where users hesitate, misread, or work around is exactly the information a test exists to collect.",
    },
    {
      question: "Why separate idea generation from evaluation?",
      options: ["Judgment during generation suppresses unusual ideas", "It makes meetings shorter", "Evaluation is unnecessary in design"],
      answer: "Judgment during generation suppresses unusual ideas",
      explanation: "Novel solutions live in the ideas people would dismiss first; deferring judgment keeps them alive long enough to be considered.",
    },
  ],
};
