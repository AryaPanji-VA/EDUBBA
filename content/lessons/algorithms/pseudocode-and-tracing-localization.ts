import { pseudocodeAndTracingActivities } from "./pseudocode-and-tracing-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const pseudocodeAndTracingCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Algorithmic Thinking",
    prompt: "Explain in your own words why trace tables are useful — and what the rules are for keeping a trace honest.",
    placeholder: "A trace records what the steps actually do, so...",
    oneLine: "Your answer",
    diagram: "pseudocode",
    codeLabel: "pseudocode",
    sourceCheck: "Source Mode: no AI evaluation. Review the trace-table rules, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Berpikir Algoritmik",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa tracing pakai tabel itu berguna — dan apa aturan mainnya supaya trace-nya jujur.",
    placeholder: "Trace itu mencatat apa yang langkahnya beneran lakukan, jadi...",
    oneLine: "Jawaban kamu",
    diagram: "pseudocode",
    codeLabel: "pseudocode",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau aturan tabel trace, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Mikir dulu sebelum ngetik", content: ["Syntax error itu bug termurah; logic error itu termahal. Pseudocode dan tracing menyerang yang mahal sebelum satu baris kode beneran ada.", "Ini dua keterampilan paling diremehkan di programming: menulis rencananya dengan presisi, dan mengecek rencananya dengan tangan."] },
  { title: "INTUITION · Rencana untuk manusia, cek dengan tangan", content: ["Pseudocode bikin lu bisa menyatakan prosedur dengan presisi tanpa melawan syntax bahasa: urutan, kondisi, update — tidak lebih.", "Tracing mengeksekusi prosedur itu dengan tangan pada input konkret, mencatat tiap variabel di tiap langkah — kayak jadi komputernya, tapi lebih lambat dan lebih paham."] },
  { title: "SEE · Sebuah rencana dan trace-nya", content: ["Pseudocodenya menyatakan prosedurnya; tabel trace mengeksekusinya pada [3, 7, 5], satu baris per langkah, menulis hanya apa yang dikatakan langkahnya.", "Saat loop selesai, tabelnya memegang jawaban aktual algoritma untuk input ini: 7. Kalau kita mengharapkan yang lain, baris-baris tengahnya menunjukkan persis ke mana harus lihat."] },
  { title: "PREDICT · Trace satu update", content: ["Berapa nilai best setelah langkah ini dieksekusi?"], explanation: "Kondisi 7 > 3 bernilai benar, jadi update-nya jalan: best menjadi 7. Trace mencatat apa yang dikatakan langkahnya, bukan maksud yang lain." },
  { title: "PREDICT · Trace update yang ditolak", content: ["Berapa nilai best setelah langkah ini dieksekusi?"], explanation: "5 > 7 bernilai salah, jadi update yang dijaga itu tidak jalan. Trace juga harus mencatat ketidak-berubahannya: begitulah bug off-by-one dan batas ketahuan." },
  { title: "PREDICT · Baris terakhir", content: ["Trace seluruh prosedurnya. Apa yang dilaporkannya?"], explanation: "Baris demi baris: best 4 → 2 gagal → 9 update → 6 gagal. Nilai akhir tabel trace adalah 9 — item terbesar, sesuai perilaku aktual prosedurnya." },
  { title: "TRY · Laporkan trace-nya", content: ["Trace pakai tangan, lalu tulis nilai akhir best. Angka tunggal yang diharapkan."], explanation: "best 3 → 7 update → 5 gagal. Nilai akhir: 7." },
  { title: "FORMALIZE · Pseudocode dan tracing", content: ["Pseudocode adalah notasi informal yang menjaga presisi sambil menghapus syntax: pernyataan dieksekusi berurutan, indentasi mengelompokkan blok, dan kata kendali membawa makna alaminya. Prosedurnya bisa direview sebelum pilihan implementasi dibuat.", "Tracing adalah eksekusi manual pada input konkret: tabel nilai variabel, satu baris per langkah yang dieksekusi, mengikuti langkah tertulis secara ketat alih-alih perilaku yang dimaksudkan.", "Ketidaksesuaian antara trace dan ekspektasi melokalisasi cacat. Kebiasaan men-trace algoritma pendek dengan tangan membangun model eksekusi yang dibutuhkan untuk menalar kode sebelum menjalankannya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [pseudocodeAndTracingCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Pseudocode & tracing → intuisi efisiensi → algoritma beneran di semester berikutnya", "Dua alat ini tinggal sama lu: tiap sesi debugging itu trace, tiap diskusi desain itu pseudocode. Lesson berikutnya menambah rasa pertama soal biaya.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getPseudocodeAndTracingActivities(language: LessonLanguage) {
  return pseudocodeAndTracingActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [pseudocodeAndTracingCopy[language].prompt] } : {}),
  }));
}

export function localizePseudocodeAndTracingContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Pseudocode adalah notasi informal untuk algoritma yang menjaga presisi sambil menghapus syntax bahasa. Aturannya minimal: pernyataan dieksekusi berurutan, indentasi mengelompokkan blok, dan kata kendali (if/then, for each, while) membawa makna alaminya. Karena tidak ada yang perlu dikompilasi, pseudocode memungkinkan prosedurnya sendiri direview sebelum detail implementasi dipilih.",
      "Tracing adalah eksekusi manual sebuah algoritma pada input konkret. Yang men-trace memelihara tabel nilai setiap variabel, memperbarui satu baris per langkah yang dieksekusi, dengan ketat mengikuti langkah tertulis alih-alih perilaku yang dimaksudkan. Ketidaksesuaian antara trace dan ekspektasi melokalisasi cacat: trace-nya salah membaca langkah, atau langkahnya sendiri yang salah.",
      "Tracing juga fondasi debugging: sebuah program itu klaim, dan trace pada input yang gagal adalah bukti yang menunjukkan persis di mana klaimnya patah. Kebiasaan men-trace algoritma pendek dengan tangan membangun model eksekusi yang dibutuhkan untuk menalar kode sebelum menjalankannya.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Pseudocode: cari yang terbesar", "Tabel trace pada [3, 7, 5]"][index] ?? example.title,
      explanation: ["Tanpa syntax, presisi penuh: urutan pernyataan, pengelompokan blok dengan indentasi, dan update eksplisit. Ini prosedur yang sama yang akan dinyatakan bahasa apa pun.", "Satu baris per langkah yang dieksekusi, nilai hanya dari instruksi tertulisnya. Baris terakhir adalah jawaban aktual algoritma untuk input ini."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Notasi informal tapi presisi untuk algoritma, bebas syntax bahasa pemrograman.", "Eksekusi langkah-demi-langkah manual sebuah algoritma pada input konkret, mencatat nilai variabel.", "Tabel nilai variabel yang dipelihara selama trace, satu baris per langkah yang dieksekusi.", "Model mental bagaimana pernyataan dieksekusi berurutan dan memperbarui state."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menulis pseudocode kayak prosa", "Men-trace yang seharusnya terjadi", "Melewati baris"][index] ?? mistake.title,
      explanation: ["“Terus urus sisanya” itu harapan, bukan langkah. Pseudocode menghapus syntax, bukan presisi: tiap langkah tetap harus menyatakan persis apa yang terjadi.", "Trace mencatat apa yang dikatakan langkahnya, bukan yang lu maksudkan. Mengisi jawaban yang diharapkan menggagalkan seluruh tujuan trace.", "Melompat ke nilai akhir menyembunyikan persis langkah tempat hal-hal jadi salah. Trace itu berharga justru di baris-baris tengahnya."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Trace: best mulai di 3, lalu item=7 datang dengan langkah “if item > best, best ← item”. Berapa best sekarang?", "Apa bedanya pseudocode dengan prosa?"][index] ?? check.question,
      explanation: ["7 > 3 benar, jadi update-nya jalan dan best menjadi 7 — persis seperti kata langkah tertulisnya, terlepas dari maksud lain apa pun.", "Pseudocode menghapus syntax, bukan presisi: pernyataan punya urutan, kondisi eksplisit, dan update menyebut persis apa yang berubah."][index] ?? check.explanation,
    })),
  };
}

export const pseudocodeAndTracingMasteryConceptLabels: Record<string, string> = {
  pseudocode: "Pseudocode", tracing: "Tracing",
};

export function pseudocodeAndTracingReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("trace_condition_failed")) return id
    ? "Uji satu baris: best = 7, item = 5, langkahnya dijaga if. Baris tabelnya diisi apa?"
    : "Test one row: best = 7, item = 5, guarded by an if. What fills the table row?";
  if (result.misconceptions.includes("trace_stops_early")) return id
    ? "Trace ulang [4, 2, 9, 6] sampai selesai — berapa baris tabelnya, dan apa isi baris terakhir?"
    : "Re-trace [4, 2, 9, 6] to the end — how many rows, and what is in the last one?";
  return id
    ? "Jelaskan ulang aturan kejujurannya: tulis yang langkahnya bilang, bukan yang kita maukan — lalu kenapa itu penting."
    : "Restate the honesty rule: write what the step says, not what we want — and why that matters.";
}
