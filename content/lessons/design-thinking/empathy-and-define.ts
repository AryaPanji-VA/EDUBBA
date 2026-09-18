import type { LessonContent } from "@/content/lessons/types";

export const empathyAndDefineLessonContent: LessonContent = {
  slug: "empathy-and-define",
  intuitiveExplanation: [
    "Empathy itu kerja detektif, bukan kerja dukun. Yang bisa diamati: apa yang orang lakukan, katakan, dan rasakan di situasi nyata. Yang tidak bisa langsung diamati: alasan dan kebutuhan di baliknya — itu interpretasi, dan interpretasi bisa salah.",
    "Misalnya: “Sari berhenti mengisi form setelah 40 detik” itu observasi. “Sari bingung” itu asumsi — mungkin dia kena telepon, mungkin beneran bingung. Desain yang dibangun di atas asumsi yang belum dicek itu tebakan yang mahal.",
    "Hasil kerja empathy kemudian dipadatkan jadi definisi masalah: siapa, butuh apa, dan kenapa. Satu kalimat POV (point of view) yang tajam lebih berharga dari sepuluh fitur — karena ia memutuskan ide mana yang relevan.",
  ],
  academicExplanation: [
    "Empathy in design research means gathering direct evidence about users' behaviors, words, and feelings in context. Observation is the recorded evidence itself; assumption (or inference) is an interpretation layered on top of it. Sound practice keeps the two explicitly separated, because interpretations must remain open to revision against evidence.",
    "Common empathy methods include contextual interviews, direct observation, and think-aloud sessions. Their value comes from contact with real behavior: what people actually do frequently contradicts what they say they would do, and both differ from what designers assume they need.",
    "The Define stage consolidates research into a problem statement, commonly a point-of-view (POV): [specific user] needs [verb: need] because [insight]. A well-formed POV is grounded in observed evidence, names a need rather than a solution, and is specific enough to generate and filter ideas.",
  ],
  codeExamples: [
    {
      title: "Observation vs assumption",
      language: "text",
      code: "OBSERVATION  \"Sari stopped filling the form after 40 seconds.\"\nASSUMPTION   \"Sari was confused by the form.\"\n\nAlso possible: phone rang, class started, form crashed...",
      explanation: "The observation is recorded evidence. The assumption is one interpretation of it — useful as a hypothesis, dangerous as a fact.",
    },
    {
      title: "A POV statement",
      language: "text",
      code: "TRANSFER STUDENT needs to know which classes changed,\nbecause the schedule shifts without any notification\nand they find out after arriving at the wrong room.",
      explanation: "User, need, and insight grounded in what was observed. It names a need — timely awareness of changes — not a solution such as \"a notification app\".",
    },
  ],
  keyTerms: [
    { term: "Empathy", definition: "Understanding users' actual experience through direct evidence of their behavior, words, and feelings." },
    { term: "Observation", definition: "A recorded fact about what a user did or said, without interpretation." },
    { term: "Assumption / Inference", definition: "An interpretation explaining an observation; useful as a hypothesis, must not be treated as fact." },
    { term: "Point of view (POV)", definition: "A problem statement of the form [user] needs [need] because [insight]." },
  ],
  commonMistakes: [
    {
      title: "Writing assumptions as observations",
      explanation: "\"User was confused\" is an inference. Record what happened (\"user re-read the label three times, then left\") and keep the interpretation separate.",
    },
    {
      title: "Defining the problem as a solution",
      explanation: "\"Students need a push-notification app\" bakes the answer into the problem. The need is timely awareness of schedule changes; an app is one candidate answer.",
    },
    {
      title: "Vague problem statements",
      explanation: "\"Make the campus app better\" cannot generate or filter ideas. A POV names a specific user, need, and insight.",
    },
  ],
  quickChecks: [
    {
      question: "Which sentence is an observation?",
      options: ["Budi stopped scrolling and re-read the error message", "Budi was frustrated with the error message"],
      answer: "Budi stopped scrolling and re-read the error message",
      explanation: "It records visible behavior. The second sentence interprets an internal state — that is an assumption, not an observation.",
    },
    {
      question: "Which part of a POV names the user's need?",
      options: ["needs to know which classes changed", "because the schedule shifts without notification", "TRANSFER STUDENT"],
      answer: "needs to know which classes changed",
      explanation: "The POV structure is [user] needs [need] because [insight] — the need is the middle segment, stated without a solution.",
    },
  ],
};
