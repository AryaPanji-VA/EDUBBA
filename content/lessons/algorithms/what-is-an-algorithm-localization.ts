import { whatIsAnAlgorithmActivities } from "./what-is-an-algorithm-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const whatIsAnAlgorithmCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Algorithmic Thinking",
    prompt: "Explain in your own words the difference between an algorithm and a program — and name two properties that make a sequence of steps worthy of the name algorithm.",
    placeholder: "An algorithm is the procedure, a program is...",
    oneLine: "Your answer",
    diagram: "pseudocode",
    codeLabel: "pseudocode",
    sourceCheck: "Source Mode: no AI evaluation. Review the definition and properties, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Berpikir Algoritmik",
    prompt: "Jelasin pakai bahasa lu sendiri bedanya algoritma dan program — dan sebutkan dua syarat yang bikin urutan langkah layak disebut algoritma.",
    placeholder: "Algoritma itu prosedurnya, program itu...",
    oneLine: "Jawaban kamu",
    diagram: "pseudocode",
    codeLabel: "pseudocode",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau definisi dan syaratnya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Ilmu tentang prosedur", content: ["Computer science bukan cuma soal mesin; dia soal prosedur yang menyelesaikan masalah — langkah apa, urutan apa, menuju hasil apa.", "Sebelum menulis kode: belajar melihat prosedur dengan cukup jernih sampai mesin bisa mengikutinya tanpa bertanya ke lu."] },
  { title: "INTUITION · Resep tanpa pertimbangan manusia", content: ["Algoritma itu resep dengan pertimbangannya dihapus: input terdefinisi, langkah yang menyebut persis apa yang dilakukan, dan output yang pasti.", "Begitu satu langkah butuh interpretasi manusia — “sampai matang”, “secukupnya” — prosedurnya belum menjadi algoritma."] },
  { title: "REPRESENT · Satu prosedur, dua notasi", content: ["Algoritmanya adalah prosedurnya sendiri. Program adalah satu penulisannya dalam bahasa yang bisa dieksekusi.", "Rencana yang sama bisa ditulis sebagai pseudocode untuk manusia atau Python untuk komputer — menerjemahkannya tidak mengubah apa yang dilakukannya."] },
  { title: "PREDICT · Apakah ini algoritma?", content: ["Sebuah prosedur memuat langkah ini. Apakah layak jadi langkah algoritma?"], explanation: "“Kelihatan pas” tidak punya arti mekanis: dua orang akan berhenti di momen berbeda. Langkah algoritma harus menyatakan persis apa yang dilakukan dengan apa." },
  { title: "PREDICT · Harus berakhir?", content: ["Apakah termination penting untuk menyebut sesuatu algoritma?"], explanation: "Algoritma harus selesai untuk setiap input valid dan menghasilkan outputnya. Langkah jelas yang tak pernah berakhir menggambarkan proses, bukan algoritma." },
  { title: "TRY · Hitung syaratnya", content: ["Lengkapi daftarnya dengan sifat yang hilang. Satu kata (Inggris atau Indonesia)."], explanation: "Termination: urutannya harus selesai untuk setiap input valid. Tanpa itu, prosedurnya tidak pernah menyerahkan outputnya." },
  { title: "FORMALIZE · Apa itu algoritma", content: ["Algoritma adalah urutan langkah terdefinisi yang bersifat hingga dan tidak ambigu, yang mengubah input terdefinisi menjadi output terdefinisi. Setiap langkah harus bisa dieksekusi dengan informasi yang tersedia, tidak butuh penilaian eksternal, dan urutannya harus berakhir untuk setiap input valid.", "Definisinya independen dari bahasa: algoritmanya adalah prosedurnya; program adalah satu penulisannya. Prosedur yang sama bertahan melewati penerjemahan antarbahasa.", "Kebenaran (correctness) — output yang benar untuk setiap input valid — adalah sifat utamanya. Efisiensi itu terpisah: algoritma bisa benar tapi lambat tak praktis, atau cepat tapi salah."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [whatIsAnAlgorithmCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Apa itu algoritma → pseudocode & tracing → intuisi efisiensi", "Lesson berikutnya memberi prosedurnya sebuah notasi (pseudocode) dan alat debugging (tracing dengan tangan), lalu rasa pertama untuk efisiensi.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getWhatIsAnAlgorithmActivities(language: LessonLanguage) {
  return whatIsAnAlgorithmActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [whatIsAnAlgorithmCopy[language].prompt] } : {}),
  }));
}

export function localizeWhatIsAnAlgorithmContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Algoritma adalah urutan langkah terdefinisi yang hingga dan tidak ambigu, yang mengubah input terdefinisi menjadi output terdefinisi. Setiap langkah harus dapat dieksekusi dengan informasi yang tersedia pada titik itu, tidak memerlukan penilaian eksternal, dan urutannya harus berakhir untuk setiap input valid.",
      "Definisi ini tidak bergantung pada bahasa: algoritma adalah prosedurnya sendiri, sedangkan program adalah satu pen expression prosedur itu dalam bahasa pemrograman. Algoritma yang sama bisa diimplementasikan dalam Python, pseudocode untuk manusia, atau rangkaian perangkat keras.",
      "Kebenaran adalah sifat utama algoritma: untuk setiap input valid, ia harus menghasilkan output yang benar dan berakhir. Efisiensi — bagaimana jumlah kerja tumbuh dengan ukuran input — adalah sifat kedua yang terpisah. Algoritma bisa benar tapi lambat tak praktis, atau cepat tapi salah; hanya kegagalan pertama yang tak terlihat tanpa pemeriksaan cermat.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Resep ambigu vs algoritma terdefinisi", "Satu algoritma, dua bahasa"][index] ?? example.title,
      explanation: ["“Sampai matang” butuh pertimbangan manusia. Durasi dan pengaturan yang tetap tidak meninggalkan ruang interpretasi — itulah ketiadaan ambigu yang dibutuhkan algoritma.", "Prosedurnya adalah algoritmanya. Pseudocode dan Python adalah dua notasi dari langkah yang sama."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Urutan langkah terdefinisi yang hingga dan tidak ambigu, mengubah input menjadi output.", "Data terdefinisi yang diterima algoritma dan hasil terdefinisi yang dihasilkannya.", "Sifat bahwa urutan langkah selesai untuk setiap input valid.", "Sifat bahwa outputnya benar untuk setiap input valid.", "Algoritma yang dinyatakan dalam bahasa yang bisa dieksekusi komputer."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Ketuker algoritma dengan program", "Menerima langkah yang ambigu", "Mengabaikan terminasi"][index] ?? mistake.title,
      explanation: ["Program adalah satu penulisan algoritma. Algoritmanya adalah prosedurnya — rencana yang bertahan melewati penerjemahan antarbahasa.", "“Proses datanya sesuai kebutuhan” tidak bisa dieksekusi secara mekanis. Setiap langkah harus menyatakan persis apa yang dilakukan dengan apa.", "Loop tanpa akhir yang tak pernah menghasilkan apa pun bukan algoritma, secanggih apa pun langkahnya."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Sifat apa yang membedakan algoritma dari rencana yang kabur?", "Sebuah resep bilang “masak sampai kelihatan pas.” Sebagai langkah algoritma, ini…"][index] ?? check.question,
      explanation: ["Input terdefinisi, langkah tidak ambigu, output yang pasti — dan harus selesai. Bahasa dan kecepatan itu perhatian yang terpisah.", "“Kelihatan pas” tidak bisa dieksekusi secara mekanis; langkah harus menyatakan persis apa yang dilakukan dengan apa."][index] ?? check.explanation,
    })),
  };
}

export const whatIsAnAlgorithmMasteryConceptLabels: Record<string, string> = {
  algorithm_definition: "The definition", algorithm_properties: "Defining properties",
};

export function whatIsAnAlgorithmReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("ambiguity_confusion")) return id
    ? "Ambil langkah “masak sampai kelihatan pas” dan tulis ulang tanpa penilaian manusia. Apa yang harus ditambahkan?"
    : "Take \"cook until it looks right\" and rewrite it without human judgment. What must be added?";
  if (result.misconceptions.includes("termination_confusion")) return id
    ? "Cek contoh loop-nya: apa yang dipegang sebagai output kalau langkahnya tak pernah selesai? Bisa itu disebut hasil?"
    : "Check the loop example: what is there to hold as output if the steps never finish? Can that be called a result?";
  return id
    ? "Jelaskan ulang: algoritma itu prosedurnya, program itu salah satu tulisannya — lalu sebut dua syaratnya."
    : "Restate: the algorithm is the procedure, a program is one writing of it — then name the two properties.";
}
