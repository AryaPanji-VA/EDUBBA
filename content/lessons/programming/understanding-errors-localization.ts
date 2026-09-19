import { understandingErrorsActivities } from "./understanding-errors-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const understandingErrorsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Fundamentals",
    prompt: "Explain in your own words: what does Python do when it finds a problem, and what are your steps after seeing an error message?",
    placeholder: "Python stops and tells me..., and then I...",
    oneLine: "One Python line",
    diagram: "run → error → baca → perbaiki → run lagi",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the error message parts and the fix cycle, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fundamental Pemrograman",
    prompt: "Jelasin pakai bahasa lu sendiri: apa yang Python lakukan saat menemukan masalah, dan apa langkah lu setelah melihat pesan error?",
    placeholder: "Python berhenti dan bilang..., lalu lu...",
    oneLine: "Satu baris Python",
    diagram: "run → error → baca → perbaiki → run lagi",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau bagian-bagian pesan error dan siklus perbaikannya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Error itu bicara", content: ["Setiap programmer melihat error setiap hari — beginner dan profesional sama. Error bukan vonis buat lu; itu Python yang bilang \"aku nggak bisa jalanin ini, dan ini alasannya\".", "Lesson ini menutup Module 01 dengan skill yang membawa semua lesson lain: membaca apa yang Python sampaikan dan mengubahnya jadi perbaikan."] },
  { title: "INTUITION · Kapan error terjadi", content: ["Error terjadi saat Python tidak bisa menjalankan code seperti yang ditulis. Daripada menebak, Python berhenti di titik masalahnya dan mencetak sebuah pesan.", "Pesan itu adalah teks paling berguna di layar lu: dia menyebut jenis masalahnya, menunjuk barisnya, dan memberi petunjuk apa yang harus diperbaiki. Tidak ada yang disembunyikan di baliknya."] },
  { title: "SEE · Membaca pesan dalam tiga bagian", content: ["Setiap pesan bisa dibaca dalam tiga bagian: nama errornya (seperti SyntaxError), lokasinya (baris ke berapa Python sedang membaca), dan petunjuk tentang masalahnya sendiri.", "Dua nama menutup hampir semua yang lu tulis di module ini: SyntaxError untuk bentuk tulisan yang tidak lengkap, IndentationError untuk spasi awal baris yang salah. Ejaan yang salah punya pesan sendiri — namanya tidak dikenali."] },
  { title: "SEE · Tiga bentuk rusak yang lu kenal", content: ["Ketiganya berasal dari materi yang sudah lu kenal: nama yang salah eja, kutip yang tidak ditutup, dan baris yang diawali spasi yang tidak seharusnya.", "Tidak ada yang misterius. Masing-masing merusak bentuk penulisan dari lesson Syntax & Indentation — dan masing-masing mendapat pesan yang bilang begitu."] },
  { title: "PREDICT · Jalan atau error?", content: ["Baris ini dijalankan. Apakah berhasil, atau Python berhenti dengan pesan?"], explanation: "Python membaca ejaan secara persis. Print dengan P besar bukan instruksi yang lu kenal, jadi Python berhenti dan bilang nama itu tidak dikenali — petunjuknya mengarah balik ke print huruf kecil." },
  { title: "PREDICT · Jalan atau error? (2)", content: ["Sekarang baris ini. Jalan, atau error?"], explanation: "Kutip yang tidak ditutup merusak bentuk instruksinya, jadi Python melaporkan SyntaxError — dan pesannya menunjuk baris serta bagian yang hilang. Error selalu datang dengan petunjuk itu; tidak pernah jalan buntu." },
  { title: "SPOT · Baris mana yang rusak?", content: ["Tiga baris, satu program, satu bentuk yang rusak. Bug-nya ada di baris mana?"], explanation: "Baris 1 dan baris 3 bentuknya lengkap: print huruf kecil, kurung, kedua kutip. Baris 2 tidak pernah menutup teksnya, jadi Python berhenti di situ dengan SyntaxError dan menunjuk baris itu." },
  { title: "TRY · Perbaiki baris yang rusak", content: ["Baris ini punya bug: nama instruksinya salah eja. Perbaiki barisnya supaya Python bisa menjalankannya — teks yang ditampilkan tetap: Halo, dunia!"], explanation: "print(\"Halo, dunia!\") — siklus perbaikan dalam bentuk mini: pesannya bilang nama itu tidak dikenali, petunjuknya menunjuk ke ejaan, dan perbaikannya adalah print huruf kecil dengan kurung dan kutip yang sama." },
  { title: "FORMALIZE · Siklus perbaikan", content: ["Error berarti Python tidak bisa menjalankan code seperti yang ditulis. Dia berhenti, menyebut jenis masalahnya (SyntaxError untuk bentuk yang tidak lengkap, IndentationError untuk spasi awal yang salah), menunjuk barisnya, dan memberi petunjuk apa yang salah.", "Siklus kerjanya: run → baca error → cari masalahnya → perbaiki → run lagi. Tiap putaran mengubah satu pesan menjadi satu perbaikan, dan output mengonfirmasinya.", "Error adalah bagian normal dari programming — bukan tanda gagal. Membacanya dengan tenang adalah skill beginner yang membuat semua lesson berikutnya mungkin. Module 01 selesai di sini; selanjutnya lu memberi instruksi-instruksi itu sesuatu untuk dikerjakan: Variables."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [understandingErrorsCopy.id.prompt] },
  { title: "CONNECT · Module 01 selesai", content: ["Understanding Errors → Variables → Data Types → Operators", "Module 01 selesai: lu sudah tahu apa itu programming, Python sebagai bahasa, output dengan print(), aturan penulisan, catatan untuk manusia, dan cara membaca error. Module berikutnya memberi instruksi itu sesuatu untuk dikerjakan — Variables: nama untuk value.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getUnderstandingErrorsActivities(language: LessonLanguage) {
  return understandingErrorsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [understandingErrorsCopy[language].prompt] } : {}),
  }));
}

export function localizeUnderstandingErrorsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Setiap programmer melihat error setiap hari. Error bukan kegagalan — itu Python memberi tahu, dengan caranya sendiri, bahwa dia tidak bisa menjalankan code seperti yang ditulis, dan di mana harus mencari.",
      "Pesan error punya tiga bagian yang berguna: nama errornya (seperti SyntaxError atau IndentationError), lokasinya (baris ke berapa), dan petunjuk tentang masalahnya. Membaca tiga bagian itu biasanya sudah cukup untuk menemukan perbaikannya.",
      "Dari situ lahir siklus kerja yang lu pakai sepanjang hidup programming: jalankan code, baca error-nya, cari masalahnya, perbaiki, jalankan lagi. Error bukan ujung dari programming — error adalah cara programming bergerak maju.",
    ],
    academicExplanation: [
      "Error terjadi saat Python tidak bisa menjalankan code seperti yang ditulis. Alih-alih melanjutkan, Python berhenti di titik masalahnya dan mencetak pesan yang menjelaskannya. Pesan itu menyebut jenis masalahnya — misalnya SyntaxError saat bentuk sebuah instruksi tidak lengkap, atau IndentationError saat spasi awal barisnya salah.",
      "Pesan error sederhana bisa dibaca dalam tiga bagian: nama errornya, lokasinya (baris yang sedang dibaca Python), dan petunjuk tentang apa yang salah. Nama instruksi yang salah eja menghasilkan jenis pesan tersendiri yang bilang nama itu tidak dikenali — ejaan yang lu pelajari adalah perbaikannya.",
      "Respons praktis atas error apa pun adalah siklus yang sama: run, baca pesannya, temukan barisnya, perbaiki bentuknya, dan jalankan lagi. Setiap putaran mengubah satu informasi dari Python menjadi satu koreksi di code.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Pesan error itu petunjuk", "Dua nama yang akan sering lu lihat", "Siklus perbaikan dalam aksi"][index] ?? example.title,
      explanation: ["Python berhenti dan menyebut masalahnya alih-alih menebak. Pesannya bilang apa yang salah (string-nya tidak pernah ditutup) — itu petunjuk, bukan hukuman.", "Kutip atau kurung yang kurang dibaca sebagai SyntaxError. Spasi yang salah di awal baris dibaca sebagai IndentationError. Kedua nama itu menunjuk ke bentuk penulisannya.", "Run, baca petunjuknya, perbaiki, run lagi. Satu putaran mengubah pesan menjadi koreksi — dan output mengonfirmasi perbaikannya."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Cara Python bilang bahwa dia tidak bisa menjalankan code seperti yang ditulis — lengkap dengan petunjuknya.", "Petunjuk yang dicetak Python: nama errornya, lokasinya, dan masalahnya.", "Nama error untuk instruksi yang bentuk tulisannya tidak lengkap.", "Nama error untuk spasi yang salah di awal baris.", "Run → baca error → cari masalah → perbaiki → run lagi."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menganggap error sebagai kegagalan", "Menebak tanpa membaca", "Memperbaiki baris yang salah", "Menghapus baris yang rusak"][index] ?? mistake.title,
      explanation: ["Error adalah informasi, bukan vonis. Semua programmer membaca error setiap hari — itu bagian dari cara code jadi lebih baik.", "Pesan sudah menyebut masalahnya dan menunjuk barisnya. Baca tiga bagiannya dulu sebelum mengubah apa pun.", "Pesan menunjuk sebuah lokasi. Mulai dari sana — masalahnya biasanya ada di tempat yang disebut pesan.", "Tujuannya memperbaiki bentuknya, bukan membuang instruksinya. Perbaiki apa yang ditunjuk pesan, lalu jalankan lagi."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa sebenarnya yang diberikan pesan error?", "print(\"Halo — kutip penutupnya hilang. Ini apa?", "Lu melihat sebuah error. Langkah pertamanya apa?"][index] ?? check.question,
      explanation: ["Membaca tiga bagiannya — nama, lokasi, masalah — biasanya sudah cukup untuk menemukan perbaikannya.", "Bentuk tulisan yang tidak lengkap dibaca sebagai SyntaxError. Spasi awal yang salah akan menjadi IndentationError.", "Siklus perbaikan dimulai dengan membaca. Lalu temukan lokasinya, perbaiki, dan jalankan lagi."][index] ?? check.explanation,
    })),
  };
}

export const understandingErrorsMasteryConceptLabels: Record<string, string> = {
  error_as_information: "Errors as information", common_error_shapes: "Common error shapes", fix_cycle: "The fix cycle",
};

export function understandingErrorsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("broken_shape_runs_confusion")) return id
    ? "Cek bentuknya pelan-pelan: ejaan, kurung, kutip buka, kutip tutup. Bagian mana yang tidak sesuai bentuk yang lu kenal?"
    : "Check the shape slowly: the spelling, the parentheses, the opening quote, the closing quote. Which part does not match the shape you know?";
  if (result.misconceptions.includes("error_dead_end_confusion")) return id
    ? "Lagi pesan errornya: dia menyebut jenis masalahnya dan menunjuk barisnya. Informasi apa dua itu buat lu sebelum mulai mengubah code?"
    : "Back to the error message: it names the kind of problem and points at the line. What do those two pieces tell you before you change anything?";
  if (result.misconceptions.includes("guess_without_reading_confusion")) return id
    ? "Jangan tebak dulu — baca baris per baris: mana yang bentuknya lengkap (print huruf kecil, kurung, dua kutip) dan mana yang tidak?"
    : "Do not guess yet — read line by line: which line has the complete shape (lowercase print, parentheses, both quotes) and which does not?";
  return id
    ? "Restate siklusnya: run → error → baca → perbaiki → run lagi. Apa tiga bagian yang selalu ada di pesan error?"
    : "Restate the cycle: run → error → read → fix → run again. What are the three parts every error message gives you?";
}
