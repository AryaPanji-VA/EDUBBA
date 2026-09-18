import { whatIsANetworkActivities } from "./what-is-a-network-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const whatIsANetworkCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Network Foundations",
    prompt: "Explain in your own words why two devices connected by a cable cannot necessarily talk to each other — and what changes that.",
    placeholder: "The cable connects; the protocol...",
    oneLine: "Your answer",
    diagram: "diagram",
    codeLabel: "diagram",
    sourceCheck: "Source Mode: no AI evaluation. Review nodes, links, and protocols, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Jaringan",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa dua perangkat yang tersambung kabel belum tentu bisa saling ngobrol — dan apa yang mengubahnya jadi bisa.",
    placeholder: "Kabelnya nyambung, tapi protokolnya...",
    oneLine: "Jawaban kamu",
    diagram: "diagram",
    codeLabel: "diagram",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau node, link, dan protokol, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Semua jalan di atas ini", content: ["Chat, cloud, game, server lesson ini — semuanya melintas jaringan. Memahaminya mulai dari tiga kata dan satu metafora.", "Kata-katanya: node, link, protokol. Metaforanya: sistem pos untuk bit."] },
  { title: "INTUITION · Sistem pos untuk bit", content: ["Jaringan itu node yang tersambung lewat link, saling bertukar data. Itu saja dasarnya: perangkat, koneksi, dan pesan.", "Metafora pos memetakan hampir semuanya: alamat bilang ke siapa, paket membungkus datanya, protokol mengatur aturannya, dan jalurnya bisa beda setiap kali."] },
  { title: "PREDICT · Nyambung tapi diam", content: ["Dua laptop tersambung fisik. Bisakah mereka komunikasi?"], explanation: "Link menciptakan kemungkinan komunikasi; protokol yang mewujudkannya. Tanpa aturan bersama, bit yang diterima tak bisa ditafsirkan." },
  { title: "SEE · Internet itu jaringan dari jaringan", content: ["Internet bukan satu jaringan: dia ribuan jaringan yang dioperasikan independen dan saling tersambung lewat protokol bersama dan pengalamatan yang disepakati.", "Struktur itu kenapa tidak ada satu pihak yang mengendalikannya — jangkauan global muncul dari banyak perjanjian lokal."] },
  { title: "PREDICT · Siapa pemilik Internet?", content: ["Pernyataan mana yang benar?"], explanation: "Internet adalah jaringan dari jaringan. Koherensinya datang dari protokol dan pengalamatan bersama, bukan dari satu pemilik tunggal." },
  { title: "TRY · Sebut perantara", content: ["Sebut perangkat itu (Inggris atau Indonesia). Satu kata."], explanation: "Router: node perantara yang meneruskan paket ke arah tujuannya, memilih di antara kemungkinan jalur." },
  { title: "FORMALIZE · Apa itu jaringan", content: ["Jaringan komputer adalah kumpulan node yang tersambung lewat link, mampu bertukar data. Node mencakup perangkat ujung dan perantara (router, switch) yang meneruskan lalu lintas ke arah tujuan.", "Protokol adalah aturan yang disepakati yang membuat pertukaran mungkin: format pesan, urutan pertukaran, penanganan error, pengalamatan. Interoperabilitas ada karena protokol adalah spesifikasi yang distandarisasi.", "Internet adalah jaringan dari jaringan: jaringan yang dioperasikan independen dan saling tersambung lewat protokol bersama dan pengalamatan yang disepakati. Tidak ada operator tunggal yang memiliki atau mengendalikannya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [whatIsANetworkCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Apa itu jaringan → paket & protokol → client-server & layers", "Lesson berikutnya memperbesar amplopnya sendiri (paket dan aturan yang menggerakkannya), lalu bentuk sistem yang dibangun di atasnya (client-server dan layers).", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getWhatIsANetworkActivities(language: LessonLanguage) {
  return whatIsANetworkActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [whatIsANetworkCopy[language].prompt] } : {}),
  }));
}

export function localizeWhatIsANetworkContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Jaringan komputer adalah kumpulan node — perangkat komputasi — yang tersambung oleh link, mampu bertukar data. Node mencakup perangkat ujung (laptop, ponsel, server) dan perantara (router, switch) yang tugasnya meneruskan lalu lintas ke arah tujuannya.",
      "Protokol adalah aturan yang disepakati yang membuat pertukaran mungkin: format pesan, urutan pertukaran, penanganan error, dan pengalamatan. Interoperabilitas lintas vendor dan lintas dekade ada karena protokol adalah spesifikasi yang distandarisasi, bukan implementasi.",
      "Internet adalah jaringan dari jaringan: jaringan-jaringan yang dioperasikan secara independen dan saling tersambung melalui protokol bersama dan pengalamatan yang disepakati. Sifat penentunya adalah tidak ada operator tunggal yang memiliki atau mengendalikan keseluruhannya — keterjangkauan global muncul dari perjanjian lokal antar jaringan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Metafora pos, dipetakan", "Dua laptop sudah jadi jaringan"][index] ?? example.title,
      explanation: ["Alamat, amplop, aturan, jalur: empat ide yang membawa hampir semua konsep jaringan yang akan lu temui.", "Koneksi fisik hanya kemungkinan komunikasi; protokollah yang mewujudkannya."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Perangkat apa pun di jaringan: perangkat ujung atau perantara seperti router.", "Koneksi antar node: kabel, Wi-Fi, seluler.", "Aturan yang disepakati tentang bagaimana data dikirim, diterima, dan ditafsirkan.", "Jaringan dari jaringan, tersambung oleh protokol dan pengalamatan bersama.", "Node perantara yang tugasnya meneruskan lalu lintas ke arah tujuannya."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Ketuker koneksi dengan komunikasi", "Mengira Internet itu satu jaringan", "Membayangkan jalur tetap untuk data"][index] ?? mistake.title,
      explanation: ["Kabel menciptakan kemungkinan bicara; protokol bersama mewujudkannya. Dua perangkat tersambung dengan aturan berbeda tetap tak bisa bertukar data.", "Internet itu banyak jaringan yang dioperasikan independen dan sepakat pada protokol bersama. Tidak ada satu pihak yang memilikinya.", "Tidak ada lajur yang dipesan. Tiap paket bisa mengambil rute berbeda, dan rutenya berubah seiring jaringannya berubah."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa yang diberikan protokol?", "Internet paling tepat digambarkan sebagai…"][index] ?? check.question,
      explanation: ["Koneksi itu hardware; protokol itu kesepakatan. Keduanya dibutuhkan untuk komunikasi yang beneran.", "Jaringan yang dioperasikan independen saling tersambung lewat protokol bersama — tak seorang pun memiliki seluruhnya."][index] ?? check.explanation,
    })),
  };
}

export const whatIsANetworkMasteryConceptLabels: Record<string, string> = {
  network_structure: "Network structure", protocols: "Protocols",
};

export function whatIsANetworkReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("connection_equals_communication")) return id
    ? "Pakai metafora posnya: dua rumah sudah ada jalan antar mereka. Apa yang masih kurang supaya surat bisa sampai?"
    : "Use the postal metaphor: two houses with a road between them. What is still missing for a letter to arrive?";
  if (result.misconceptions.includes("single_owner_confusion")) return id
    ? "Cek strukturnya: kampus punya jaringannya, ISP punya punya mereka. Siapa yang menghubungkan semuanya — dan lewat apa?"
    : "Check the structure: campus runs its network, ISPs run theirs. Who connects them all — and through what?";
  return id
    ? "Jelaskan ulang dua lapisannya: koneksi itu fisik, komunikasi itu kesepakatan — dan protokol adalah kesepakatannya."
    : "Restate the two layers: connection is physical, communication is agreement — and the protocol is that agreement.";
}
