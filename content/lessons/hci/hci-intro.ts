import type { LessonContent } from "@/content/lessons/types";

export const hciIntroLessonContent: LessonContent = {
  slug: "hci-intro",
  intuitiveExplanation: [
    "Pernah pakai aplikasi yang bikin bingung, lalu mikir “aku yang lambat ya”? Hampir selalu bukan. Kemampuan memakai itu bukan milik pengguna semata — ia hasil kerjasama antara manusia dan antarmuka. Antarmuka yang baik bikin orang terasa pintar; yang buruk bikin orang merasa bodoh.",
    "HCI (Human-Computer Interaction) mempelajari kerjasama itu: bagaimana manusia melihat, mengingat, memperhatikan, dan membuat kesalahan — dan bagaimana desain bisa bekerja bersama batasan-batasan itu, bukan melawannya.",
    "Inti usabilitas ada tiga: bisa ditemukan (findable), bisa dipahami (understandable), dan bisa dikoreksi (recoverable). Kalau pengguna salah klik, apa yang terjadi? Jawaban desain yang baik: ketukan salah itu bukan bencana, cuma jalan yang mudah ditarik balik.",
  ],
  academicExplanation: [
    "Human-Computer Interaction is the study and practice of designing interfaces so that people can use computational systems effectively, efficiently, and satisfactorily. Its subject is the interaction — the two-way exchange between human and system — rather than the human alone or the machine alone.",
    "HCI draws on psychology for the human side: perception (what users notice), memory (what they can hold, which is little), attention (which is selective and easily captured by the wrong things), and error (which is a normal property of human cognition, not a moral failing of users).",
    "A central principle follows: usability is a property of the interaction, not a fixed trait of the user. When many users make the same mistake at the same place, the evidence points to the design. Interfaces that respect human limits — visible state, predictable actions, undo — make average users effective.",
  ],
  codeExamples: [
    {
      title: "The interface is part of the task",
      language: "text",
      code: "Task:     \"send today's slides to the group\"\nInterface: file picker sorted by name, 200+ files,\n           no recency, no search\n\nThe task got harder. The human did not get dumber.",
      explanation: "The same person, same goal, same minute: one interface makes the task trivial, another makes it a memory test. Difficulty lives in the interaction.",
    },
    {
      title: "Recoverable error beats punished error",
      language: "text",
      code: "Tap wrong item →\n  Design A: item deleted instantly, no undo\n  Design B: item moves to a trash folder\n\nSame tap. Different consequences. Different design.",
      explanation: "Human error is guaranteed; the design question is what happens next. Recovery paths keep small mistakes small.",
    },
  ],
  keyTerms: [
    { term: "HCI", definition: "The study and design of the interaction between people and computational systems." },
    { term: "Usability", definition: "The degree to which a system can be used to achieve goals effectively, efficiently, and satisfactorily." },
    { term: "Interaction", definition: "The two-way exchange between human and system — where usability actually lives." },
    { term: "Human error (in HCI)", definition: "A normal property of human cognition; a signal for design, not an accusation against users." },
  ],
  commonMistakes: [
    {
      title: "Blaming the user",
      explanation: "\"Users keep tapping the wrong button\" is a design finding. When many people make the same mistake in the same place, the interface is the common factor.",
    },
    {
      title: "Designing for yourself",
      explanation: "The designer knows the interface's history and intentions; users meet it cold. Your own ease with your design is not evidence about users.",
    },
    {
      title: "Confusing learnability with familiarity",
      explanation: "\"It's familiar\" describes habit, not clarity. A new pattern that matches the task can beat an old pattern that fights it.",
    },
  ],
  quickChecks: [
    {
      question: "Many users make the same mistake at the same screen. What does HCI say this indicates?",
      options: ["A design problem — the interface is the common factor", "Careless users", "Insufficient user training at most, never design"],
      answer: "A design problem — the interface is the common factor",
      explanation: "Repeating the same error at the same place points to the one element all those users share: the interface.",
    },
    {
      question: "What does \"recoverable\" mean for an interface?",
      options: ["Mistakes have an easy path back", "Users never make mistakes", "Errors show technical error codes"],
      answer: "Mistakes have an easy path back",
      explanation: "Recoverability assumes error is normal and keeps it cheap: undo, trash folders, confirmations for destructive actions.",
    },
  ],
};
