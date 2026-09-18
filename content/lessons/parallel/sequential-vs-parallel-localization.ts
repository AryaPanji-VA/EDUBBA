import { sequentialVsParallelActivities } from "./sequential-vs-parallel-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const sequentialVsParallelCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Parallel and Distributed Foundations",
    prompt: "Explain in your own words why adding processors does not always make a program much faster — using the idea of the part that must stay sequential.",
    placeholder: "The sequential part cannot shrink, so...",
    oneLine: "Your answer",
    diagram: "scenario",
    codeLabel: "scenario",
    sourceCheck: "Source Mode: no AI evaluation. Review independence and the sequential floor, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Paralel dan Terdistribusi",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa nambah prosesor nggak selalu bikin program jauh lebih cepat — pakai ide bagian yang harus tetap berurutan.",
    placeholder: "Bagian yang berurutan tak bisa dipercepat, jadi...",
    oneLine: "Jawaban kamu",
    diagram: "skenario",
    codeLabel: "skenario",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau independensi dan lantai berurutan, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Pekerja nambah, jam tetap", content: ["Prosesor berhenti jadi jauh lebih cepat bertahun-tahun lalu; mereka mulai jadi lebih banyak. Memahami paralelisme berarti memahami bagaimana software jadi cepat hari ini.", "Tapi paralelisme bukan kecepatan gratis — ini pertukaran: independensi diganti waktu. Pertukaran itu punya aturan, dan lesson ini mengajarkannya."] },
  { title: "INTUITION · Jalur kasirnya", content: ["Satu kasir melayani semua orang secara berurutan — sequential. Sepuluh kasir melayani pelanggan yang berbeda — paralel.", "Speedup-nya datang dari satu properti saja: tidak ada kasir yang butuh pelanggan kasir lain. Independensi itulah yang dikonversi menjadi waktu."] },
  { title: "SEE · Lantai yang tak menyusut", content: ["Berapa pun fraksi kerja yang harus tetap berurutan, dia memasang lantai keras pada total waktu.", "Nambah prosesor lewat titik tertentu hampir tak membeli apa-apa — 10% berurutan itu mendominasi. Ini Hukum Amdahl, dan dia menjelaskan kenapa speedup nyata mengecewakan."] },
  { title: "PREDICT · Bisa dipecah?", content: ["Bagian mana yang beneran bisa jalan paralel?"], explanation: "Paralelisme butuh independensi. Sausnya bergantung pada bawang yang sudah dicincang, jadi dua-duanya harus tetap berurutan; sayuran yang berbeda tidak punya ketergantungan seperti itu." },
  { title: "PREDICT · Plafonnya", content: ["Dengan prosesor tak terbatas, seberapa cepat laporannya bisa selesai?"], explanation: "5% yang tetap berurutan tak bisa menyusut, jadi total waktunya berhenti di 5% dari aslinya — plafon 20×, berapa pun jumlah prosesornya." },
  { title: "TRY · Sebut syaratnya", content: ["Lengkapi kalimatnya dengan nama properti itu (Inggris atau Indonesia)."], explanation: "Independensi: paralelisme membelanjakan independensi untuk membeli waktu. Tugas yang bergantung harus diurutkan." },
  { title: "FORMALIZE · Sequential vs parallel", content: ["Eksekusi sequential melakukan satu operasi dalam satu waktu secara berurutan; eksekusi paralel melakukan operasi independen secara bersamaan. Konversi paralelisme menjadi speedup dibatasi fraksi berurutan (Hukum Amdahl: dengan fraksi berurutan s, speedup maksimum 1/s).", "Ketergantungan adalah rintangannya: dua tugas bisa paralel hanya kalau tidak ada yang butuh output atau urutan dari yang lain.", "Konkurensi — tumpang tindih waktu, mungkin saling selang-seling di satu prosesor — berbeda dari paralelisme — eksekusi bersamaan di beberapa prosesor. Satu core bisa konkuren tapi tak pernah paralel."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [sequentialVsParallelCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Sequential vs parallel → distributed basics → koordinasi di semester berikutnya", "Lesson berikutnya membawa ide yang sama melintasi mesin: kerja dibagi bukan cuma antar prosesor tapi antar komputer — tempat koordinasi jadi masalah utamanya.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getSequentialVsParallelActivities(language: LessonLanguage) {
  return sequentialVsParallelActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [sequentialVsParallelCopy[language].prompt] } : {}),
  }));
}

export function localizeSequentialVsParallelContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Eksekusi sequential melakukan satu operasi dalam satu waktu secara berurutan; eksekusi paralel melakukan beberapa operasi secara bersamaan pada bagian kerja yang benar-benar independen. Manfaat paralelisme dibatasi oleh fraksi kerja yang tidak bisa diparalelkan — diformalkan dalam Hukum Amdahl: jika fraksi s dari sebuah tugas memang berurutan, speedup maksimum dari berapa pun prosesor adalah 1/s.",
      "Ketergantungan adalah rintangan intinya. Dua tugas bisa berjalan paralel hanya ketika tidak ada yang butuh output yang lain. Ketergantungan data (tugas B membaca yang ditulis tugas A), syarat pengurutan, dan sumber daya bersama membuat kerja yang tampak bisa diparalelkan menjadi terserialisasi.",
      "Konkurensi — tugas yang berjalan pada waktu yang tumpang tindih, mungkin saling selang-seling di satu prosesor — adalah konsep berbeda dari paralelisme — tugas yang dieksekusi pada saat yang sama di prosesor berbeda. Mesin satu-core bisa menjalankan tugas konkuren tapi tidak pernah paralel; bedanya penting karena masalah desain (koordinasi, interferensi) muncul dari konkurensi bahkan tanpa paralelisme.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu kasir lawan sepuluh", "Bagian yang tak bisa dibagi"][index] ?? example.title,
      explanation: ["Speedup-nya hanya ada karena pelanggannya independen: tidak ada kasir yang butuh pelanggan kasir lain. Kerja sama, struktur bedah.", "Hukum Amdahl dalam aksi: fraksi berurutan memasang lantai keras. Melewati satu titik, prosesor tambahan nyaris tak membeli apa-apa."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Melakukan satu operasi dalam satu waktu, secara berurutan.", "Melakukan operasi independen secara bersamaan.", "Relasi di mana satu tugas butuh output atau urutan tugas lain; musuh paralelisme.", "Speedup maksimum dibatasi oleh fraksi kerja yang harus tetap berurutan.", "Konkurensi: tumpang tindih waktu (mungkin saling selang). Paralelisme: eksekusi pada saat yang sama."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengharapkan speedup linear selamanya", "Memparalelkan kerja yang bergantung", "Ketuker konkurensi dengan paralelisme"][index] ?? mistake.title,
      explanation: ["Menggandakan prosesor jarang memangkas separuh waktunya: fraksi berurutan, biaya koordinasi, dan sumber daya bersama masing-masing mengambil bagian. Speedup punya plafon.", "Kalau tugas B butuh hasil tugas A, memecah mereka ke prosesor berbeda hanya menambah menunggu. Paralelisme butuh independensi, bukan semangat.", "Satu prosesor bisa menjongkoki tugas konkuren dengan bergantian di antara mereka — tidak ada yang jalan bersamaan. Paralelisme butuh unit eksekusi jamak."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Sepuluh kasir melayani 100 pelanggan independen. Kenapa total waktunya turun kira-kira sepuluh kali?", "Sebuah tugas 10%-nya memang berurutan. Apa speedup terbaik yang mungkin, bahkan dengan prosesor tak terbatas?"][index] ?? check.question,
      explanation: ["Paralelisme berubah jadi speedup tepat ketika bagian-bagiannya tidak bergantung satu sama lain. Independensi adalah sumber daya yang dibelanjakan.", "10% yang berurutan tak bisa menyusut, jadi total waktu tak pernah turun di bawah 10% dari aslinya — plafon 10× (Hukum Amdahl)."][index] ?? check.explanation,
    })),
  };
}

export const sequentialVsParallelMasteryConceptLabels: Record<string, string> = {
  parallelism: "Parallelism", dependencies: "Dependencies",
};

export function sequentialVsParallelReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("amdahl_ignored")) return id
    ? "Hitung kasus 90/10-nya: 10 prosesor, lalu 100. Berapa waktu tersisa di tiap kasus — dan berapa lantainya?"
    : "Compute the 90/10 case: 10 processors, then 100. How much time remains in each — and what is the floor?";
  if (result.misconceptions.includes("dependency_ignored")) return id
    ? "Urutkan masaknya: mana yang beneran bebas satu sama lain, dan mana yang harus menunggu hasil yang lain?"
    : "Order the cooking: which steps are genuinely free of each other, and which must wait for another's output?";
  return id
    ? "Jelaskan ulang pertukarannya: independensi dibelanjakan untuk waktu — dan bagian berurutan menahan lantainya."
    : "Restate the trade: independence is spent to buy time — and the sequential part holds the floor.";
}
