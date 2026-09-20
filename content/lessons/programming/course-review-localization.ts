import { courseReviewActivities } from "./course-review-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const courseReviewCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Putting It Together",
    prompt: "Tell me in your own words: which concept family feels strongest for you right now — and how would you combine a few concepts in one small program?",
    placeholder: "The concept family that feels strongest for me is..., and a small program could combine... with...",
    oneLine: "Retrieve, connect, apply",
    diagram: "6 concept families · course complete",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the six concept families and the final challenge, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Menyatukan Semuanya",
    prompt: "Ceritakan pakai bahasa lu sendiri: keluarga konsep mana yang paling kuat buat lu sekarang — dan bagaimana lu menggabungkan beberapa konsep di satu program kecil?",
    placeholder: "Keluarga konsep yang paling kuat buat gua..., dan program kecil-nya bisa gabungin... sama...",
    oneLine: "Panggil balik, sambungkan, terapkan",
    diagram: "6 keluarga konsep · course selesai",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau enam keluarga konsep dan final challenge-nya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Panggil balik, sambungkan, terapkan", content: ["Tiga puluh lesson udah lewat — poin final review bukan materi baru, tapi retrieval: manggil balik model mental dari kepala lu terus pakai bareng. Lesson ini ngajak lu lewatin enam keluarga konsep: values, logic, repetition, reusable code, collections, dan putting it together.", "Nggak ada sintaks baru di sini. Tiap aktivitas pakai konsep yang udah lu temuin — kerjaannya nyambungin: nge-trace nilai, nge-trace loop, milih collection, dan terakhir bikin satu program kecil yang gabungin list, for, if, dan print."] },
  { title: "RETRIEVE · Enam keluarga, satu toolbox", content: ["Keluarga A — values: variable, tipe data, angka, string, boolean. Keluarga B — logic: operator, input, conditional. Keluarga C — repetition: for, while, range. Tiga keluarga pertama ngebahas apa yang program ketahui, cara dia mutusin, dan cara dia ngulang.", "Keluarga D — reusable code: function, parameter, return, scope. Keluarga E — collections: list, dictionary, tuple, set. Keluarga F — putting it together: errors dan try-except, decomposition masalah. Enam keluarga, satu toolbox — final challenge narik dari beberapa sekaligus."] },
  { title: "CONNECT · Milih collection dari kebutuhan", content: ["Butuh urutan plus duplikat? List. Butuh value berlabel? Dictionary. Butuh grup yang fix? Tuple. Butuh value unik plus membership? Set. Tiap collection punya trade-nya sendiri, dan datanya yang milih tool-nya.", "Kebiasaan yang dibangun course ini: baca kebutuhan dulu — data-nya janji apa? urutan? label? fix? keunikan? — baru milih collection yang nurutin janji itu."] },
  { title: "PREDICT · Trace nilainya", content: ["Tiga baris, tanpa loop, tanpa collection. Apa yang ditampilkan print(x > 5)?"], explanation: "True. Reassignment x = x * 2 baca nilai sekarang (3), dobelin, dan simpen 6 balik ke x — lalu 6 > 5 dievaluasi jadi True." },
  { title: "PREDICT · Trace loop-nya", content: ["Satu accumulator, satu loop atas tiga nilai. Apa yang ditampilkan print(total)?"], explanation: "12. total mulai dari 0 dan loop nambahin tiap n: 0 + 2, terus + 4, terus + 6. Accumulator nyimpen jumlah berjalan; n doang cuma ingat nilai terakhir." },
  { title: "SPOT · Collection mana yang cocok?", content: ["Satu foto sama tag-nya, dan satu pertanyaan: simpen tag unik-nya terus nanya ada nggak tag ini di dalamnya. Collection apa yang cocok?"], explanation: "Set. Datanya butuh keunikan (tag kembar collapse) plus membership (in jawabin True atau False) — persis trade-nya set. List bakal nyimpen duplikat; dictionary buat value berlabel." },
  { title: "PREDICT · Pilih perbaikannya", content: ["Print pertama jalan; yang kedua crash. Baris mana yang benerin?"], explanation: "print(\"Total: \" + str(total)). + antara teks dan angka crash; str(total) ngubah angka jadi teks dulu — konversi yang sama yang bikin age_text jalan. int(\"Total: \") nyoba ngubah labelnya, dan total + \"!\" tetap campur angka sama teks." },
  { title: "TRY · Final challenge — nilai lulus", content: ["Mulai dari scores = [55, 72, 68, 90, 70]. Tambahin tiga baris: for loop di atas scores, if yang menjorok ngecek score >= 70, dan print si loop variable di dalam if. Nggak perlu sintaks baru — list + for + conditional + print, semuanya dari lesson sebelumnya."], explanation: "scores = [55, 72, 68, 90, 70]\nfor score in scores:\n    if score >= 70:\n        print(score) — loop ngevisit tiap nilai, if nyaring yang >= 70, dan print nampilin 72, 90, 70, satu per baris." },
  { title: "FORMALIZE · Fondasi, bukan garis finish", content: ["Course ini ngebangun fondasi dalam enam keluarga: values dan logic buat nyimpen dan mutusin, repetition buat ngulang otomatis, function buat pakai ulang, collections buat ngatur data, plus errors dan decomposition buat nyatuin semuanya. Tiap keluarga dipraktikkan, bukan cuma disebutin.", "Pesan penutup yang jujur: \"You now have the foundations to read, reason about, and build small programs.\" Sengaja bukan klaim mastery — course tiga puluh lesson nggak bikin jago Python, dan review barusan nunjukin konsep mana yang udah mantap dan mana yang masih layak diulang.", "Tiap keluarga konsep nyambung ke tahap belajar berikutnya: program yang lebih kaya tumbuh dari enam keluarga yang sama, didalamin lewat latihan. Fondasinya pegang; bangunannya nyusun di mana pun lu lanjutin."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [courseReviewCopy.id.prompt] },
  { title: "CONNECT · Course tamat", content: ["Course Review / Final Practice → Course Complete", "Programming Fundamentals selesai: tiga puluh lesson dalam enam keluarga konsep — values, logic, repetition, reusable code, collections, dan putting it together. Toolbox-nya jadi bekal lu buat terus latihan.", "Nyelesaikan alur course ini bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getCourseReviewActivities(language: LessonLanguage) {
  return courseReviewActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [courseReviewCopy[language].prompt] } : {}),
  }));
}

export function localizeCourseReviewContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Tiga puluh lesson udah lewat — sekarang saatnya ngulang, bukan nambah materi. Enam keluarga konsep jadi peta review-nya: values, logic, repetition, reusable code, collections, dan putting it together.",
      "Nggak ada sintaks baru di sini. Yang diuji itu retrieval — manggil balik model mental lu dan gabungin: nge-trace variable, nge-trace loop, milih collection dari kebutuhan datanya, sampai milih perbaikan yang bener pas tipe campur.",
      "Puncaknya final challenge: cetak nilai yang >= 70 dari satu list. List + for + if + print — empat konsep lama di satu program kecil. Selesai ini, course-nya tamat, dan yang lu punya adalah fondasi.",
    ],
    academicExplanation: [
      "Lesson ini adalah capstone review dari Programming Fundamentals: retrieval dan application, bukan teori baru. Enam keluarga konsep mengorganisir pengulangan — A values (variable, tipe data, angka, string, boolean), B logic (operator, input, conditional), C repetition (for, while, range), D reusable code (function, parameter, return, scope), E collections (list, dictionary, tuple, set), dan F putting it together (errors/try-except, decomposition masalah).",
      "Bentuk latihannya sengaja variatif: trace nilai yang berubah lewat reassignment, trace akumulasi for loop, milih collection dari kebutuhan datanya — bukan kebiasaan — dan milih perbaikan yang tepat pas tipe campur. Puncaknya final challenge: satu program kecil yang gabungin list, for, conditional, dan print tanpa sintaks di luar course.",
      "Pesan penutupnya jujur: You now have the foundations to read, reason about, and build small programs. Itu bukan klaim mastery — ini fondasi buat baca, nalar, dan bangun program kecil, dengan tiap keluarga konsep nyambung ke tahap belajar berikutnya.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Values dan logic, di-trace manual", "Repetition, di-trace manual", "Milih collection dari kebutuhan", "Pola final challenge"][index] ?? example.title,
      explanation: ["Reassignment baca nilai lama dulu: x = x * 2 ambil 3, dobelin, dan simpen 6 balik ke x. Perbandingan 6 > 5 dievaluasi setelahnya — boolean True.", "total mulai dari 0 dan loop nambahin tiap n: 0 + 2, terus + 4, terus + 6. Accumulator nyimpen jumlah berjalan; loop variable n doang cuma ingat nilai terakhir.", "Empat kebutuhan, empat collection: urutan plus duplikat → list; grup fix → tuple; value berlabel → dictionary; value unik plus membership → set. Janji datanya yang milih tool-nya — bukan kebiasaan.", "List + for + if + print nyatu di satu program kecil: loop ngevisit tiap nilai, if nyaring yang >= 70, print nampilin 72, 90, 70 — masing-masing satu baris. Nggak ada sintaks baru sama sekali."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Keluarga konsep — gugus konsep yang saling nyambung, dipelajari dan di-review bareng: enam keluarga jadi peta course ini.", "Manggil balik model mental dari kepala — lebih kuat daripada baca ulang, karena otak dilatih narik informasi, bukan cuma kenalin ulang.", "Ngikutin perubahan variable baris per baris: nilai lama dibaca dulu, dihitung, terus ditimpa.", "Variable yang ngumpulin hasil tiap putaran loop, kayak total = total + n — jumlah berjalannya bertahan setelah loop selesai.", "Latihan pamungkas course: cetak cuma nilai yang >= 70 dari satu list dengan gabungin list + for + conditional + print dalam satu program.", "Fondasi — hasil course ini: bisa baca, nalar, dan bangun program kecil. Bukan klaim mastery, tapi pijakan buat tahap belajar berikutnya."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Milih collection karena kebiasaan", "Ngira review butuh sintaks baru", "Salah nge-trace reassignment", "Lupa titik dua atau indent", "Ngebaca kelar review sebagai mastery"][index] ?? mistake.title,
      explanation: ["Nyampein list buat semua hal karena paling familiar itu collection_mismatch: tiap collection punya trade — urutan, label, fix, keunikan. Baca kebutuhan datanya dulu, baru milih.", "Semua aktivitas di sini pakai konsep yang udah pernah dilalui. Kalau jawaban kayaknya butuh sesuatu yang nggak pernah diajarin, itu tanda konsep lama yang perlu dipanggil balik — bukan sintaks baru.", "x = x * 2 bukan persamaan — dia baca nilai sekarang, hitung, terus timpa. Urutan baca-terus-timpa ini yang paling sering kelewat.", "for dan if butuh : di akhir barisnya dan body yang menjorok. Di program yang nyatu, satu titik dua yang hilang bisa pemecah semuanya.", "Nyelesaikan alur course bukan penilaian mastery. Hasil yang jujur: fondasi buat baca, nalar, dan bangun program kecil — sisanya datang dari latihan lanjutan."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["x = 3, lalu x = x * 2, lalu print(x > 5). Apa yang tampil?", "total = 0, for loop di atas [2, 4, 6] nambahin tiap n ke total, lalu print(total). Berapa?", "Simpen tag unik satu foto dan nanya ada nggak tag ini di dalamnya. Collection apa yang cocok?"][index] ?? check.question,
      explanation: ["Reassignment baca 3, dobelin, dan simpen 6 balik ke x; lalu 6 > 5 dievaluasi jadi True.", "Accumulator ngumpulin tiap putaran: 0 + 2, + 4, + 6. Loop variable n doang cuma ingat 6.", "Kebutuhannya keunikan plus membership — persis trade-nya set. List bakal nyimpen duplikat; dictionary buat value berlabel."][index] ?? check.explanation,
    })),
  };
}

export const courseReviewMasteryConceptLabels: Record<string, string> = {
  values_and_logic_recall: "Values and logic", repetition_and_reuse_recall: "Repetition and reuse", collections_and_integration: "Collections and integration",
};

export function courseReviewReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("logic_trace_confusion")) return id
    ? "Trace ulang pelan-pelan: x = 3, terus x = x * 2 — nilai lama dibaca dulu atau ditimpa dulu? Di baris mana nilai x berubah?"
    : "Trace it slowly: x = 3, then x = x * 2 — is the old value read first or overwritten first? At which line does x change?";
  if (result.misconceptions.includes("loop_confusion")) return id
    ? "total = 0, terus for n in [2, 4, 6] nambahin n ke total — berapa isi total setelah tiap putaran, dan berapa pas loop selesai?"
    : "total = 0, then for n in [2, 4, 6] adds n to total — what does total hold after each pass, and what when the loop ends?";
  if (result.misconceptions.includes("collection_mismatch")) return id
    ? "Butuh tag unik plus pertanyaan ada nggak — janji apa yang set kasih dan list nggak? Baca kebutuhan datanya dulu, baru milih."
    : "Unique tags plus a membership question — what promise does a set make that a list does not? Read the data's need first, then choose.";
  if (result.misconceptions.includes("new_syntax_assumption")) return id
    ? "Final challenge-nya cuma list + for + if + print — sintaks course mana yang lu kira kurang di sini?"
    : "The final challenge is only list + for + if + print — which course syntax do you think is missing here?";
  return id
    ? "Jelasin balik pakai bahasa lu: keluarga konsep mana yang paling kuat, dan konsep mana yang mau lu ulang dulu?"
    : "Explain back in your own words: which concept family feels strongest, and which one do you want to revisit first?";
}
