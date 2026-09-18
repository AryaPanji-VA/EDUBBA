import { interfaceEvaluationActivities } from "./interface-evaluation-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const interfaceEvaluationCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "HCI Foundations",
    prompt: "Explain in your own words the difference between usability testing and heuristic evaluation — and why they complement rather than replace each other.",
    placeholder: "Testing watches real users, while heuristics...",
    oneLine: "Your answer",
    diagram: "scenario",
    codeLabel: "scenario",
    sourceCheck: "Source Mode: no AI evaluation. Review the two evaluation families, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi HCI",
    prompt: "Jelasin pakai bahasa lu sendiri bedanya usability testing dan heuristic evaluation — dan kenapa keduanya saling melengkapi, bukan saling menggantikan.",
    placeholder: "Testing ngeliatin pengguna beneran, sedangkan heuristik...",
    oneLine: "Jawaban kamu",
    diagram: "skenario",
    codeLabel: "skenario",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau dua keluarga evaluasi itu, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa harus evaluasi", content: ["Tim tidak bisa merasakan antarmukanya sendiri seperti pengguna baru — kebiasaan itu penutup mata. Evaluasi adalah cara terstruktur untuk melihat antarmuka seperti yang dialami orang lain.", "Dua keluarga yang dominan: mengamati pengguna nyata mengerjakan tugas nyata, dan menginspeksi antarmuka terhadap prinsip yang mapan. Keduanya murah dibanding merilis hal yang salah."] },
  { title: "INTUITION · Test lab dan test jalan", content: ["Usability test mengamati orang nyata mengejar tujuan nyata — perilakulah buktinya.", "Audit heuristik menelusuri antarmuka dengan daftar periksa prinsip — strukturlah buktinya. Cepat, tanpa pengguna, tapi temuannya hipotesis sampai dikonfirmasi."] },
  { title: "PREDICT · Pilih metodenya", content: ["Tim harus tahu alur mana yang bikin bingung pendatang baru, dengan peserta tersedia minggu ini. Metode mana yang cocok?"], explanation: "Pertanyaannya soal kebingungan nyata, jadi perilaku nyata adalah buktinya. Heuristik juga membantu, tapi dia mensimulasikan pengguna — bukan mengamatinya." },
  { title: "SEE · Temuan heuristik yang ditulis dengan benar", content: ["Temuan yang bagus menyebut prinsip yang dilanggar, lokasi persisnya, dan konsekuensinya beserta tingkat keparahannya.", "Struktur itu mengubah opini menjadi sesuatu yang bisa dikerjakan tim dan dicek ulang setelah diperbaiki."] },
  { title: "PREDICT · Apa yang dicatat?", content: ["Apa catatan berharga dari momen itu?"], explanation: "Pengguna itu saksi ahli atas gesekannya sendiri dan designer yang tidak andal atas obatnya. Catat di mana mereka tersandung dan kenapa; timnya yang merancang perbaikannya." },
  { title: "TRY · Sebut prinsipnya", content: ["Jawab dengan ide kuncinya — satu kata: visibility / recovery / consistency."], explanation: "Keadaan sistem tidak terlihat saat upload: itu melanggar visibility of system status. (Ketukan ganda yang ditimbulkannya adalah konsekuensinya.)" },
  { title: "FORMALIZE · Mengevaluasi antarmuka", content: ["Evaluasi antarmuka adalah penilaian sistematis terhadap antarmuka berdasarkan kriteria usabilitas. Metode empiris (usability testing) mengamati pengguna nyata mengerjakan tugas nyata; metode inspeksi (heuristic evaluation) mengirim evaluator menelusuri antarmuka dengan daftar periksa prinsip.", "Usability testing mengambil validitasnya dari perilaku: peserta menerima tujuan, bukan instruksi; ukurannya penyelesaian, error, dan waktu, plus di mana keraguan dan jalan pintas muncul. Test kecil (sekitar lima pengguna) secara andal menemukan sebagian besar masalah frekuensi tinggi.", "Heuristic evaluation — visibility of system status, user control and freedom, consistency, error prevention, recognition over recall — cepat dan menemukan masalah struktural, tapi mensimulasikan alih-alih mengamati pengguna. Praktik terbaik menggabungkan: heuristik lebih awal, test pengguna di alur yang berisiko."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [interfaceEvaluationCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Fondasi HCI lengkap → diterapkan ke antarmuka nyata", "Tiga lesson ini — interaksi, affordance/feedback, evaluasi — adalah perangkat kerja: pahami interaksinya, baca janji dan jawabannya, lalu evaluasi secara sistematis.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getInterfaceEvaluationActivities(language: LessonLanguage) {
  return interfaceEvaluationActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [interfaceEvaluationCopy[language].prompt] } : {}),
  }));
}

export function localizeInterfaceEvaluationContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Evaluasi antarmuka adalah penilaian sistematis terhadap antarmuka berdasarkan kriteria usabilitas, sebelum atau sesudah rilis. Dua keluarga yang saling melengkapi dominan: metode empiris (usability testing dengan pengguna nyata melakukan tugas nyata) dan metode inspeksi (review ahli terhadap prinsip yang mapan, seperti heuristik Nielsen).",
      "Usability testing mengambil validitasnya dari pengamatan perilaku nyata dengan tugas nyata: peserta diberi tujuan, bukan instruksi, dan ukuran yang menarik adalah penyelesaian tugas, error, dan waktu — plus di mana keraguan dan jalan pintas muncul. Studi partisipan sedikit (sekitar lima pengguna) secara andal menampakkan mayoritas masalah frekuensi tinggi, makanya test dini dan sering mengalahkan test besar sekali di akhir.",
      "Heuristic evaluation mengirim inspektur menelusuri antarmuka dengan daftar periksa prinsip — visibility of system status, kesesuaian dengan konvensi, kontrol dan kebebasan pengguna, konsistensi, pencegahan error, recognition over recall, fleksibilitas, dan desain minimal-estetis. Murah dan cepat, serta menemukan banyak masalah struktural; titik butanya adalah mensimulasikan alih-alih mengamati pengguna, jadi temuan perlu konfirmasi bila memungkinkan. Praktik terbaik menggabungkan keduanya: heuristik dini, test pengguna di alur berisiko.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Dua metode, dua pertanyaan", "Temuan heuristik yang ditulis dengan benar"][index] ?? example.title,
      explanation: ["Testing mengamati perilaku; inspeksi mensimulasikan pengguna dengan prinsip. Mereka tumpang tindih sebagian dan saling melengkapi.", "Temuan yang bagus menyebut prinsip yang dilanggar, lokasi persisnya, dan konsekuensinya — itulah yang membuatnya bisa ditindaklanjuti, bukan sekadar opini."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Evaluasi empiris: pengguna nyata mencoba tugas nyata sementara pengamat mencatat perilaku.", "Metode inspeksi: evaluator menelusuri antarmuka terhadap prinsip usabilitas yang mapan.", "Prinsip usabilitas yang diakui — misalnya visibility of system status, kontrol pengguna, konsistensi, pencegahan error.", "Tingkat pentingnya sebuah temuan, dinilai dari frekuensi, dampak, dan kegigihan masalahnya."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Testing untuk membuktikan desainnya bagus", "Meminta solusi kepada pengguna", "Memperlakukan heuristik seperti hukum"][index] ?? mistake.title,
      explanation: ["Evaluasi ada untuk menemukan masalah. Test yang dirancang agar tak mungkin gagal — pertanyaan menggiring, tugas yang diterjemahkan jadi klik — menghasilkan konfirmasi, bukan informasi.", "Pengguna itu saksi ahli atas pengalamannya, bukan designer. Catat di mana mereka kesulitan; timnya yang merancang perbaikannya.", "Temuan heuristik adalah hipotesis tentang gesekan. Ketika sebuah heuristik bertentangan dengan pengamatan penggunaan yang kuat, perilakulah yang menang."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa keunggulan utama heuristic evaluation dibanding usability testing?", "Saat usability test, pengguna mengusulkan “tombolnya dibikin hijau aja.” Yang harus dicatat apa?"][index] ?? check.question,
      explanation: ["Inspeksi itu murah dan cepat — minggu ini, tanpa partisipan. Trade-off-nya: dia mensimulasikan pengguna alih-alih mengamatinya, jadi temuannya hipotesis.", "Pengguna itu narator yang andal atas gesekannya sendiri dan designer yang tidak andal atas obatnya. Catat gesekannya; perbaikannya milik tim."][index] ?? check.explanation,
    })),
  };
}

export const interfaceEvaluationMasteryConceptLabels: Record<string, string> = {
  usability_testing: "Usability testing", heuristic_evaluation: "Heuristic evaluation",
};

export function interfaceEvaluationReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("analytics_substitutes_evaluation")) return id
    ? "Analytics bilang di halaman mana pengguna pergi — tapi kenapa mereka pergi? Data apa yang cuma bisa didapat dari mengamati orang?"
    : "Analytics says where users leave — but why do they leave? What data can only come from watching a person?";
  if (result.misconceptions.includes("user_as_designer")) return id
    ? "Pisahkan dua rekamannya: gesekannya (di mana, kenapa) dan obatnya (“tombol hijau”). Yang mana masuk laporan temuan?"
    : "Separate the two records: the friction (where, why) and the remedy (\"green button\"). Which one goes into the findings report?";
  return id
    ? "Jelaskan ulang dua keluarganya dengan kekuatan masing-masing: observasi perilaku vs inspeksi prinsip — dan kenapa hasilnya berbeda jenis."
    : "Restate the two families with their strengths: behavior observation vs principle inspection — and why their outputs differ in kind.";
}
