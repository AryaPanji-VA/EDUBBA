import { clientServerAndLayersActivities } from "./client-server-and-layers-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const clientServerAndLayersCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Network Foundations",
    prompt: "Explain in your own words why the network is organized in layers — and what that buys a brand-new application.",
    placeholder: "Each layer does its own job, so a new app...",
    oneLine: "Your answer",
    diagram: "diagram",
    codeLabel: "diagram",
    sourceCheck: "Source Mode: no AI evaluation. Review roles and layers, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Jaringan",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa jaringan diatur per lapisan (layer) — dan apa untungnya buat aplikasi baru yang mau lahir.",
    placeholder: "Tiap lapisan urus bagiannya sendiri, jadi aplikasi baru...",
    oneLine: "Jawaban kamu",
    diagram: "diagram",
    codeLabel: "diagram",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau peran dan lapisan, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Bentuk tiap aplikasi yang lu pakai", content: ["Tiap aplikasi yang lu buka sedang mengalami percakapan yang sama: dia minta, sesuatu di sana menjawab. Client-server adalah bentuknya web, API, game, email.", "Dan di bawah bentuk itu duduk tumpukan berlapis yang membuat semuanya bisa berubah independen. Dua ide, satu lesson."] },
  { title: "INTUITION · Meminta dan menjawab", content: ["Client memulai: dia menginginkan sesuatu. Server menunggu, memproses, menjawab.", "Itulah seluruh tulang punggung web — request, response — diulang miliaran kali per detik dengan variasi apa yang diminta."] },
  { title: "SEE · Layers sebagai ekspedisi", content: ["Lu menulis surat; ekspedisinya urus pelacakan; sistem posnya merutekan; jalanan mengangkut. Masing-masing memikirkan satu hal.", "Itulah layering: pemisahan tanggung jawab. Aplikasi baru tak butuh mengubah jalanan; jalanan baru tak butuh mengubah aplikasi."] },
  { title: "PREDICT · Siapa yang bicara duluan?", content: ["Siapa yang memulai interaksinya?"], explanation: "Request dulu, response kemudian. Percakapan client-server selalu dimulai dengan request dari client." },
  { title: "PREDICT · DNS itu buat apa?", content: ["Apa yang DNS lakukan di momen itu?"], explanation: "DNS itu pencarian sebelum menelepon: nama masuk, nomor yang bisa dirutekan keluar. Request halaman aslinya terjadi setelahnya, langsung ke server." },
  { title: "PREDICT · Kenapa perlu layers?", content: ["Kenapa jaringannya tidak perlu berubah untuk aplikasi baru itu?"], explanation: "Tiap lapisan melayani yang di atasnya lewat antarmuka yang terdefinisi. Aplikasi baru memakai HTTP, TCP, IP tanpa perubahan — kemandirian itulah inti layering." },
  { title: "TRY · Sebetul si peminta", content: ["Sebut peran itu (Inggris atau Indonesia). Satu kata."], explanation: "Client: dia yang memulai. Server menunggu, memproses, dan menjawab." },
  { title: "FORMALIZE · Client-server dan layers", content: ["Model client-server membagi peran: client memulai request; server menunggu, memproses, dan menjawab. Banyak client, layanan terpusat, berkoordinasi lewat protokol yang terdefinisi.", "Alamat IP mengidentifikasi antarmuka jaringan; DNS menerjemahkan nama yang mudah dibaca manusia menjadi alamat IP — pencarian sebelum hampir setiap koneksi.", "Layering mengatur tumpukannya: tiap lapisan memberi layanan ke lapisan di atasnya dan memakai lapisan di bawahnya lewat antarmuka terdefinisi — aplikasi (HTTP) di transport (TCP) di internetworking (IP) di link. Pemisahan itu membuat tiap lapisan berevolusi independen."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [clientServerAndLayersCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Fondasi jaringan lengkap → protokol secara dalam di semester berikutnya", "Handshake TCP, algoritma routing, dan seluruh stack menunggu mata kuliah berikutnya. Yang lu pegang sekarang petaannya: peran, paket, dan lapisan.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getClientServerAndLayersActivities(language: LessonLanguage) {
  return clientServerAndLayersActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [clientServerAndLayersCopy[language].prompt] } : {}),
  }));
}

export function localizeClientServerAndLayersContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Model client-server membagi peran: client memulai request; server menunggu, memproses, dan menjawab. Browser mengambil halaman, aplikasi memuat feed, dan mail client mengambil pesan — semuanya interaksi client-server. Kekuatan polanya adalah sentralisasi layanan: banyak client, satu (atau sekelompok) server, berkoordinasi melalui protokol yang terdefinisi.",
      "Pengalamatan membuat pengiriman mungkin: alamat IP mengidentifikasi antarmuka jaringan, dan Domain Name System (DNS) menerjemahkan nama yang mudah dibaca manusia menjadi alamat IP — sebuah pencarian sebelum hampir setiap koneksi.",
      "Layering mengatur seluruh tumpukan: tiap lapisan memberi layanan ke lapisan di atasnya dan memakai lapisan di bawahnya, berkomunikasi lewat antarmuka terdefinisi. Protokol aplikasi (HTTP) menunggangi transport (TCP) yang menunggangi internetworking (IP) yang menunggangi link fisik. Pemisahan tanggung jawab membiarkan tiap lapisan berevolusi independen — aplikasi baru tak butuh perubahan pada routing, dan teknologi link baru tak butuh perubahan pada aplikasi.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu request, satu response", "Tumpukannya, sebagai ekspedisi"][index] ?? example.title,
      explanation: ["Client memulai; server menjawab. Setiap detail protokol adalah elaborasi dari tulang punggung request-response ini.", "Layering itu pemisahan tanggung jawab: lu menulis surat tanpa tahu jalanan; jalanan mengangkut tanpa membaca surat."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Pihak yang memulai sebuah request.", "Pihak yang menunggu request, memprosesnya, dan menjawab.", "Identifier yang bisa ditemukan di jaringan, ditetapkan pada antarmuka perangkat.", "Sistem yang menerjemahkan nama yang mudah dibaca manusia menjadi alamat IP.", "Mengatur tumpukan agar tiap lapisan melayani yang di atasnya dan memakai yang di bawahnya, lewat antarmuka terdefinisi."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengira server yang memulai", "Ketuker DNS dengan server", "Membayangkan satu program raksasa"][index] ?? mistake.title,
      explanation: ["Server itu menunggu. Percakapannya dimulai dari request client — selalu. Push notification itu susunan cerdas di atasnya, bukan pengecualian.", "DNS itu pencarian buku telepon sebelum menelepon — dia menemukan alamatnya, lalu client menyambung ke servernya sendiri.", "Tumpukannya itu lapisan-lapisan, bukan monolit. HTTP tidak merutekan, IP tidak mengantar aplikasi — tiap lapisan satu tugas."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Siapa yang memulai interaksi web?", "Apa yang dilakukan DNS?"][index] ?? check.question,
      explanation: ["Request dulu, response kemudian: percakapan client-server selalu dimulai dari client.", "DNS adalah pencarian sebelum koneksi: nama masuk, alamat yang bisa dirutekan keluar."][index] ?? check.explanation,
    })),
  };
}

export const clientServerAndLayersMasteryConceptLabels: Record<string, string> = {
  client_server: "Client-server", layering: "Layering",
};

export function clientServerAndLayersReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("server_initiates_confusion")) return id
    ? "Replay koneksi barunya: browser dan server baru saja tersambung. Siapa yang mengirim pesan pertama — dan berisi apa?"
    : "Replay the fresh connection: browser and server just connected. Who sends the first message — and what does it contain?";
  if (result.misconceptions.includes("layering_confusion")) return id
    ? "Uji analoginya: surat, ekspedisi, pos, jalanan. Kalau jalanan diubah jadi serat optik, apa yang harus ditulis ulang di suratnya?"
    : "Test the analogy: letter, courier, post, roads. If roads upgrade to fiber, what must be rewritten in the letter?";
  return id
    ? "Jelaskan ulang untungnya: lapisan bikin aplikasi baru lahir tanpa menyentuh yang di bawahnya — pakai contoh sendiri."
    : "Restate the benefit: layers let new applications appear without touching what's below — use your own example.";
}
