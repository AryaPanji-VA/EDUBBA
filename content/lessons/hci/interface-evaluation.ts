import type { LessonContent } from "@/content/lessons/types";

export const interfaceEvaluationLessonContent: LessonContent = {
  slug: "interface-evaluation",
  intuitiveExplanation: [
    "Evaluasi antarmuka itu mirip test mobil: ada yang dilakukan di laboratorium (usability test dengan beberapa pengguna), ada yang dilakukan di jalanan (audit heuristik oleh seorang reviewer). Keduanya menjawab pertanyaan berbeda dengan biaya berbeda.",
    "Usability test memakai pengguna nyata dan tugas nyata; lima pengguna biasanya cukup untuk menemukan sebagian besar masalah utama. Audit heuristik memakai daftar prinsip (visibility of system status, user control, consistency, error prevention, recovery) dan bisa dilakukan minggu ini, tanpa pengguna.",
    "Aturan penting: evaluasi menemukan masalah, bukan membuktikan desain bagus. “Tidak ada masalah ditemukan” biasanya berarti “tidak dicari dengan benar”.",
  ],
  academicExplanation: [
    "Interface evaluation is the systematic assessment of an interface against usability criteria, before or after release. Two complementary families dominate: empirical methods (usability testing with real users performing real tasks) and inspection methods (expert review against established principles, such as Nielsen's heuristics).",
    "Usability testing derives its validity from observing real behavior with real tasks: participants are given goals, not instructions, and the measures of interest are task completion, errors, and time — plus where hesitation and workarounds appear. Small-n studies (roughly five users) reliably surface the majority of high-frequency problems, which is why testing early and often beats testing once at scale.",
    "Heuristic evaluation sends inspectors through an interface with a principle checklist — visibility of system status, match with conventions, user control and freedom, consistency, error prevention, recognition over recall, flexibility, and aesthetic-minimal design among others. It is cheap and fast, and it finds many structural issues; its blind spot is that it simulates rather than observes users, so findings need confirmation where possible. Best practice combines both: heuristics early, testing with users on the risky flows.",
  ],
  codeExamples: [
    {
      title: "Two methods, two questions",
      language: "text",
      code: "Usability test   — \"Watch 5 students enroll using this build.\"\n                   finds: where real people actually get stuck\n\nHeuristic audit — \"Walk the flow against 10 principles.\"\n                   finds: structural issues, this week, no users needed",
      explanation: "Testing observes behavior; inspection simulates the user with principles. They overlap partially and complement each other.",
    },
    {
      title: "A heuristic finding, written properly",
      language: "text",
      code: "Heuristic: visibility of system status\nFinding:  upload shows no progress; users re-tap\nLocation: submission screen, step 3\nSeverity: high — data loss risk from duplicates",
      explanation: "A good finding names the principle violated, the exact location, and the consequence — which is what makes it actionable rather than opinion.",
    },
  ],
  keyTerms: [
    { term: "Usability testing", definition: "Empirical evaluation: real users attempt real tasks while observers record behavior." },
    { term: "Heuristic evaluation", definition: "Inspection method: evaluators walk an interface against established usability principles." },
    { term: "Heuristics", definition: "Recognized usability principles — e.g. visibility of system status, user control, consistency, error prevention." },
    { term: "Severity rating", definition: "A finding's importance, judged by frequency, impact, and persistence of the problem." },
  ],
  commonMistakes: [
    {
      title: "Testing to prove the design works",
      explanation: "Evaluation exists to find problems. A test designed so nothing can fail — leading prompts, tasks phrased as clicks — produces confirmation, not information.",
    },
    {
      title: "Asking users for solutions",
      explanation: "Users are expert witnesses of their experience, not designers. Record where they struggle; the team designs the fix.",
    },
    {
      title: "Treating heuristics as law",
      explanation: "Heuristic findings are hypotheses about friction. Where a heuristic and strong observed usage conflict, the behavior wins.",
    },
  ],
  quickChecks: [
    {
      question: "What is the main advantage of heuristic evaluation over usability testing?",
      options: ["It can be done quickly, without recruiting users", "It always finds more problems than testing", "It replaces the need to observe users entirely"],
      answer: "It can be done quickly, without recruiting users",
      explanation: "Inspection is cheap and fast — this week, no participants. Its trade-off: it simulates users rather than observing them, so findings are hypotheses.",
    },
    {
      question: "During a usability test, the user proposes \"just make the button green.\" What should be recorded?",
      options: ["The struggle that prompted the suggestion — where and why they hesitated", "The solution, to implement exactly as given", "Nothing — user suggestions are noise"],
      answer: "The struggle that prompted the suggestion — where and why they hesitated",
      explanation: "Users are reliable narrators of their own friction and unreliable designers of remedies. Record the friction; the team owns the fix.",
    },
  ],
};
