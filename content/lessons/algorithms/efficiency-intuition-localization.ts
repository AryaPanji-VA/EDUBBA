import { efficiencyIntuitionActivities } from "./efficiency-intuition-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const efficiencyIntuitionCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Algorithmic Thinking",
    prompt: "Explain in your own words why \"how many seconds\" is a poor efficiency measure — and what should be counted instead, using linear vs binary search as the example.",
    placeholder: "Seconds depend on the machine, but growth rate...",
    oneLine: "Your answer",
    diagram: "pseudocode",
    codeLabel: "pseudocode",
    sourceCheck: "Source Mode: no AI evaluation. Review growth-rate reasoning, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Berpikir Algoritmik",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa “berapa detik” itu ukuran efisiensi yang buruk — dan apa yang sebaiknya dihitung, pakai contoh linear vs binary search.",
    placeholder: "Detik itu tergantung mesinnya, tapi growth rate...",
    oneLine: "Jawaban kamu",
    diagram: "pseudocode",
    codeLabel: "pseudocode",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penalaran growth rate, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Benar belum tentu terpakai", content: ["Dua algoritma bisa sama-sama benar dan tetap berbeda faktor sejuta pada input yang sama. Correctness menentukan apakah jawabannya ada; efficiency menentukan apakah jawabannya tiba sebelum lu lulus.", "Keterampilannya dimulai sebagai intuisi: merasakan kapan kerja tumbuh lambat dan kapan meledak."] },
  { title: "INTUITION · Hitung sentuhannya, lihat pertumbuhannya", content: ["Efisiensi itu bukan soal kecepatan laptop lu — tapi bagaimana jumlah kerja tumbuh saat inputnya tumbuh.", "Kebiasaan menghitung pertama: berapa kali algoritma menyentuh tiap item input? Sekali per item itu baseline yang waras; tiap item melawan tiap item biasanya artinya ada masalah."] },
  { title: "SEE · Dua cara mencari nama", content: ["Linear search jalan halaman demi halaman: pasti, tapi kerjanya tumbuh dengan tebalnya buku.", "Binary search membuka tengah dan membuang setengah setiap kali: kerjanya tumbuh dengan jumlah pembagian-dua — sekitar 10 untuk seribu halaman, sekitar 20 untuk sejuta item."] },
  { title: "PREDICT · Yang kita ukur apa?", content: ["Apa yang sebenarnya dibandingkan analisis efisiensi antar algoritma?"], explanation: "Detik tergantung mesin dan bebannya. Growth rate — operasi sebagai fungsi dari n — adalah properti yang bertahan melewati hardware apa pun." },
  { title: "PREDICT · Kekuatan membagi dua", content: ["Kira-kira berapa comparison yang dibutuhkan binary search?"], explanation: "Tiap comparison membuang setengah rentang: log₂(1.000.000) ≈ 20. Pertumbuhan logaritmik itulah alasan strategi membagi-dua skala dengan begitu baik." },
  { title: "PREDICT · Syaratnya binary search", content: ["Rekan kerja menerapkan binary search ke data yang tidak terurut karena “lebih cepat”. Hasilnya?"], explanation: "Membagi-dua hanya bekerja kalau setengahnya bisa dibuang dengan yakin — dan jaminannya datang dari keterurutan. Lewati syaratnya dan jawabannya tak bisa dipercaya." },
  { title: "TRY · Sebut pertumbuhannya", content: ["Sebut growth rate itu dalam satu kata (Inggris atau Indonesia)."], explanation: "Menyentuh tiap item sekali itu pertumbuhan linear — kerja sebanding n, baseline yang waras untuk banyak masalah." },
  { title: "FORMALIZE · Intuisi efisiensi", content: ["Analisis efisiensi mempelajari bagaimana kerja algoritma tumbuh dengan ukuran input, independen dari hardware: growth rate operasi dasar sebagai fungsi dari n.", "Linear search mengerjakan kerja sebanding n; binary search — pada data terurut — mengerjakan kerja sebanding log₂ n. Untuk sejuta item itu kira-kira sejuta lawan kira-kira dua puluh.", "Dua aturan praktis: hitung berapa kali tiap item disentuh (sekali per item itu baseline bagus; tiap-item-lawan-tiap-item sering bisa diperbaiki), dan perhatikan kapan struktur tambahan seperti keterurutan bisa ditukar dengan kecepatan."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [efficiencyIntuitionCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Intuisi efisiensi → analisis formal (Big-O) → membandingkan algoritma di semester berikutnya", "Intuisinya jadi alat formal nanti: notasi asimtotik, relasi rekurensi, dan proof. Kebiasaan menghitung yang lu bangun sekarang itulah yang diformalkan alat-alat itu.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getEfficiencyIntuitionActivities(language: LessonLanguage) {
  return efficiencyIntuitionActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [efficiencyIntuitionCopy[language].prompt] } : {}),
  }));
}

export function localizeEfficiencyIntuitionContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Analisis efisiensi mempelajari bagaimana penggunaan sumber daya algoritma tumbuh dengan ukuran input, dinyatakan independen dari hardware. Ukuran standarnya adalah growth rate jumlah operasi dasar sebagai fungsi ukuran input n: pertumbuhan linear mengerjakan kerja sebanding n, sementara pertumbuhan logaritmik mengerjakan kerja sebanding log n.",
      "Kontras antara linear search dan binary search menggambarkan taruhannya. Linear search memeriksa item satu per satu, membutuhkan hingga n comparison untuk n item. Binary search, yang mensyaratkan data terurut, membagi-dua sisa rentang tiap comparison, membutuhkan sekitar log₂ n comparison — untuk sejuta item, kira-kira 20 alih-alih sejuta.",
      "Dua aturan praktis menambatkan intuisi pemula. Pertama, hitung berapa kali tiap item input disentuh: sekali per item adalah baseline yang wajar untuk banyak masalah, dan perilaku kuadratik — menyentuh tiap item untuk tiap item — sering bisa diperbaiki. Kedua, kenali kapan struktur tambahan (seperti keterurutan) bisa ditukar dengan kecepatan: binary search membeli kerja logaritmik dengan harga memelihara urutan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Dua cara mencari nama", "Pertumbuhan sekilas"][index] ?? example.title,
      explanation: ["Kedua prosedurnya benar. Biayanya berbeda dua orde besaran pada input yang sama — itulah yang dimaksud intuisi efisiensi.", "Growth rate, bukan waktu jam: bagaimana kerjanya menskalakan saat n tumbuh? Properti itu bertahan melewati upgrade hardware apa pun."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Bagaimana kerja algoritma tumbuh saat ukuran input tumbuh, independen dari hardware.", "Hubungan antara ukuran input dan jumlah operasi — mis. linear, logaritmik.", "Kerja sebanding ukuran input: menyentuh tiap item kira-kira sekali.", "Kerja sebanding log n: membagi-dua masalahnya berulang kali.", "Pencarian pada data terurut dengan membagi-dua sisa rentang tiap langkah."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengukur kecepatan dalam detik", "Mengira hardware cepat memperbaiki algoritma jelek", "Mengabaikan syarat metode cepat"][index] ?? mistake.title,
      explanation: ["Waktu jam tergantung mesin dan bebannya. Growth rate — langkah sebagai fungsi dari n — adalah properti yang bertahan.", "Algoritma kuadratik pada sejuta item putus asa di laptop mana pun; algoritma yang lebih baik bikin instan. Hardware mengalikan konstanta; growth rate yang menentukan hasilnya.", "Binary search butuh data terurut. Memakainya pada data tak terurut bukan cepat — itu sekadar salah."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa yang diukur analisis efisiensi?", "Untuk sejuta item terurut, binary search butuh kira-kira berapa comparison?"][index] ?? check.question,
      explanation: ["Growth rate — operasi sebagai fungsi dari n — adalah properti yang tak bergantung hardware itu yang penting.", "Membagi sejuta berulang kali: log₂(1.000.000) ≈ 20. Itulah kekuatan pertumbuhan logaritmik."][index] ?? check.explanation,
    })),
  };
}

export const efficiencyIntuitionMasteryConceptLabels: Record<string, string> = {
  growth_rate: "Growth rate", search_strategies: "Search strategies",
};

export function efficiencyIntuitionReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("seconds_confusion")) return id
    ? "Uji argumennya: laptop baru 3× lebih cepat, data 1000× lebih banyak. Manakah yang menentukan apakah lu selesai malam ini?"
    : "Test the argument: a laptop 3× faster, data 1000× larger. Which decides whether you finish tonight?";
  if (result.misconceptions.includes("linear_assumption")) return id
    ? "Hitung ulang pembagiannya: sejuta item dibagi dua berulang — berapa kali sampai tersisa satu?"
    : "Recount the halving: a million items repeatedly halved — how many times until one remains?";
  if (result.misconceptions.includes("precondition_ignored")) return id
    ? "Cek syaratnya: apa yang membuat “buang setengah” jadi aman di binary search — dan apa yang hilang tanpa keterurutan?"
    : "Check the precondition: what makes \"discard half\" safe in binary search — and what is lost without sortedness?";
  return id
    ? "Jelaskan ulang: kenapa growth rate yang dihitung, bukan detik — lalu tunjukkan bedanya dengan linear vs binary."
    : "Restate: why growth rate is counted, not seconds — then show it with linear vs binary.";
}
