import { packetsAndProtocolsActivities } from "./packets-and-protocols-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const packetsAndProtocolsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Network Foundations",
    prompt: "Explain in your own words why networks send data as small numbered packets — and what that buys over sending everything at once.",
    placeholder: "Small pieces mean loss is local...",
    oneLine: "Your answer",
    diagram: "diagram",
    codeLabel: "diagram",
    sourceCheck: "Source Mode: no AI evaluation. Review packet structure and sequence numbers, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Jaringan",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa jaringan ngirim data dalam paket-paket kecil bernomor — dan apa keuntungannya dibanding kirim sekaligus.",
    placeholder: "Potongan kecil artinya kehilangan itu lokal...",
    oneLine: "Jawaban kamu",
    diagram: "diagram",
    codeLabel: "diagram",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau struktur paket dan nomor urut, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa nggak sekalian dikirim?", content: ["Pindah rumah pakai satu truk raksasa: kalau tersangkut, semua ikut macet. Jaringan memilih bedah: banyak amplop kecil, bernomor dan beralamat, lewat jalan yang bisa beda-beda.", "Pilihan itu — packet switching — yang bikin Internet fleksibel dan tahan banting."] },
  { title: "INTUITION · Banyak amplop kecil", content: ["Sebuah transfer dipotong jadi paket-paket: header (amplopnya — alamat, nomor urut) dan payload (potongan isinya).", "Tiap paket berjalan independen. Tidak ada lajur yang dipesan; tujuannya merakit ulang pesan dari potongan-potongan bernomor itu."] },
  { title: "PREDICT · Datang tak berurutan", content: ["Paket datang teracak. Bisakah tujuan merekonstruksi datanya dengan benar?"], explanation: "Routing independen membuat urutan datang jadi bebas dan tidak berbahaya: tujuan mengurutkan berdasarkan nomor urut saat perakitan ulang." },
  { title: "PREDICT · Satu paket hilang", content: ["Berapa biaya kehilangan itu?"], explanation: "Kegagalannya lokal: 3.499 paket lain tetap jalan, dan hanya #417 yang dikirim ulang. Independensi itulah ketahanannya." },
  { title: "SEE · Header dan payload", content: ["Header itu metadata untuk perjalanannya: siapa pengirimnya, mau ke mana, potongan ke berapa, protokol apa yang mengaturnya.", "Payload adalah fragmen aslinya. Memisahkan keduanya yang membuat jaringan yang sama bisa mengangkut apa saja."] },
  { title: "TRY · Sebut bagian amplopnya", content: ["Sebut bagian itu (Inggris atau Indonesia). Satu kata."], explanation: "Header: alamat, nomor urut, identifier protokol — amplop yang membuat router bisa mengantar dan tujuan bisa merakit." },
  { title: "FORMALIZE · Paket dan protokol", content: ["Packet switching membagi data menjadi paket-paket yang dirutekan secara independen. Sebuah paket membawa header (sumber, tujuan, nomor urut, identifier protokol) dan payload (fragmen data).", "Routing independen berarti paket bisa lewat jalur berbeda dan tiba tak berurutan; nomor urut memungkinkan perakitan ulang. Ini kontras dengan circuit switching yang memesan jalur tetap untuk seluruh percakapan.", "Protokol mendefinisikan aturannya di tiap tingkat: pengalamatan dan penerusan (IP), pemulihan kehilangan dan urutan ujung-ke-ujung (TCP), dan format pesan aplikasi (HTTP dan lainnya). Keandalan dibangun oleh protokol di atas link yang rutin kehilangan paket — lewat acknowledgment, nomor urut, dan pengiriman ulang."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [packetsAndProtocolsCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Paket & protokol → client-server & layers", "Lesson berikutnya membangun bentuk-bentuk yang menunggangi paket — siapa minta, siapa jawab, dan bagaimana seluruh tumpukannya diatur jadi layers.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getPacketsAndProtocolsActivities(language: LessonLanguage) {
  return packetsAndProtocolsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [packetsAndProtocolsCopy[language].prompt] } : {}),
  }));
}

export function localizePacketsAndProtocolsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Packet switching membagi data menjadi satuan-satuan diskrit — paket — yang masing-masing dirutekan secara independen menuju tujuan. Setiap paket membawa header (alamat sumber dan tujuan, informasi urutan, identifier protokol) dan payload (fragmen data aplikasi).",
      "Karena tiap paket dirutekan independen, paket-paket dari transfer yang sama bisa melintasi jalur berbeda dan tiba tak berurutan; nomor urut di tujuan memungkinkan perakitan ulang. Ini berbeda dengan circuit switching, yang memesan jalur khusus untuk seluruh percakapan.",
      "Protokol mendefinisikan aturan di tiap langkah: bagaimana paket dialamatkan dan diteruskan (IP), bagaimana kehilangan dan urutan dipulihkan ujung-ke-ujung (TCP), dan bagaimana aplikasi memformat pesannya (HTTP dan lainnya). Keandalan bukan sifat kabelnya — link kehilangan paket secara rutin — melainkan sifat yang dibangun protokol di atasnya, lewat acknowledgment, nomor urut, dan pengiriman ulang.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu file, banyak amplop bernomor", "Kehilangan itu lokal"][index] ?? example.title,
      explanation: ["Nomor urut membuat kedatangan tak berurutan jadi tidak berbahaya: tujuan merakit berdasarkan nomor, bukan waktu tiba.", "Independensi melokalkan kegagalan: satu paket hilang berbiaya satu pengiriman ulang, bukan seluruh transfer. Ini properti ketahanan inti dari packet switching."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Satuan data yang dirutekan secara independen: header plus payload.", "Bagian amplop dari paket: alamat, nomor urut, identifier protokol.", "Fragmen data aktual yang dibawa di dalam paket.", "Merutekan tiap paket secara independen, alih-alih memesan sirkuit tetap.", "Membangun ulang data aslinya di tujuan memakai nomor urut."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Membayangkan lajur yang dipesan", "Mengharapkan urutan saat tiba", "Menganggap kabel itu bebas kehilangan"][index] ?? mistake.title,
      explanation: ["Tidak ada jalur yang dipesan untuk transfermu. Tiap paket mencari jalurnya sendiri, berbagi link dengan paket semua orang.", "Jalur berbeda berarti delay berbeda: paket rutin tiba tak berurutan. Nomor urut — bukan urutan tiba — yang mendefinisikan pesannya.", "Kehilangan itu normal di jaringan nyata. Keandalan dibangun di atas kabel oleh protokol yang mendeteksi dan mengirim ulang."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Kenapa paket membawa nomor urut?", "Satu paket dari ribuan hilang. Dalam packet switching, biayanya…"][index] ?? check.question,
      explanation: ["Routing independen berarti urutan tiba bebas; nomor urut memulihkan urutan aslinya saat perakitan ulang.", "Kegagalan itu lokal: independensi yang membuat jaringan packet-switched tahan banting."][index] ?? check.explanation,
    })),
  };
}

export const packetsAndProtocolsMasteryConceptLabels: Record<string, string> = {
  packet_switching: "Packet switching", protocol_layering: "Protocol layering",
};

export function packetsAndProtocolsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("order_confusion")) return id
    ? "Bongkar lagi momennya: #1 #3 #2 tiba. Apa yang dipakai tujuan untuk menyusun — jam tiba, atau nomor di amplopnya?"
    : "Replay the moment: #1 #3 #2 arrive. What does the destination use to order them — arrival time, or the number on the envelope?";
  if (result.misconceptions.includes("lossless_wire_confusion")) return id
    ? "Hitung ulang: dari 3.500 paket, satu hilang. Berapa yang harus dikirim ulang — dan kenapa sisanya aman?"
    : "Recount: of 3,500 packets, one is lost. How many need retransmitting — and why are the rest safe?";
  return id
    ? "Jelaskan ulang keuntungannya: potongan kecil bernomor bikin kehilangan jadi kecil dan lokal — bandingkan dengan satu truk raksasa."
    : "Restate the benefit: small numbered pieces make loss small and local — compare with one giant truck.";
}
