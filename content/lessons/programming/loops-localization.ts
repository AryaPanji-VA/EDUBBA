import { loopsActivities } from "./loops-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
export type { LessonLanguage };

export const loopsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"),
    moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what does Python do for each pass of for i in range(5), and what makes a while loop stop?",
    placeholder: "range(5) gives i the values...",
    sourceCheck: "Source Mode: no AI evaluation. Use the loop-state model to review your explanation, then continue without AI.",
    masteryLoopIteration: "Loop iteration", masteryRangeBoundaries: "Range boundaries",
    masteryWhileCondition: "While condition", masteryCounterAccumulator: "Counter & accumulator",
  },
  id: {
    ...getSharedCopy("id"),
    moduleTitle: "Dasar Penyusun Program",
    prompt: "Apa yang Python lakukan di tiap putaran for i in range(5), dan apa yang bikin while berhenti?",
    placeholder: "range(5) ngasih i nilai...",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penjelasan kamu dengan model loop state, lalu lanjut tanpa AI.",
    masteryLoopIteration: "Iterasi loop", masteryRangeBoundaries: "Batas range",
    masteryWhileCondition: "Kondisi while", masteryCounterAccumulator: "Counter & akumulator",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa pengulangan ada", content: ["Print \"Halo\" lima kali bisa dengan lima baris print. Print lima ribu kali? Nulis satu-satu nggak mungkin, dan satu perubahan berarti edit di semua baris.", "Pengulangan itu kerjaannya program, bukan jarimu. Loop bilang: jalanin blok ini berulang-ulang, sementara sesuatu yang mencatat progresnya."] },
  { title: "INTUITION · for dengan range", content: ["for i in range(5) artinya: lima kali, bind i ke angka berikutnya lalu jalanin blok yang menjorok. i jalan lewat 0, 1, 2, 3, 4 — dia nggak pernah jadi 5.", "Print yang menjorok itu isi loop. Baris pertama yang nggak menjorok jalan sekali, setelah loop selesai."] },
  { title: "PREDICT · range(3) menampilkan apa?", content: ["Pilih output sebelum lihat penjelasannya."], explanation: "range(3) mulai dari 0 dan berhenti sebelum 3, jadi i mengambil 0, 1, 2 — tiga putaran, tiga print." },
  { title: "PREDICT · while sampai mana?", content: ["Ikuti count di tiap putaran. Angka apa saja yang tampil?"], explanation: "count tampil sebagai 1, 2, 3. Ketika count jadi 4, kondisi 4 <= 3 itu False dan loop selesai." },
  { title: "PREDICT · Totalnya berapa?", content: ["total menampung sesuatu sepanjang loop. Apa yang tampil?"], explanation: "range(1, 6) menghasilkan 1, 2, 3, 4, 5. total mengumpulkan 1 + 2 + 3 + 4 + 5 = 15, dan print(total) jalan sekali setelah loop." },
  { title: "TRY · Tulis kondisi whilenya", content: ["Tulis baris while lengkap yang terus mengulang selama count paling banyak 5. Jangan lupa titik duanya."], explanation: "while count <= 5: menanyakan pertanyaan itu di tiap putaran. Isi bloknya harus akhirnya mendorong count melewati 5, kalau nggak loopnya nggak pernah selesai." },
  { title: "FORMALIZE · Loop state", content: ["Setiap loop hidup di state-nya. for loop me-bind loop variable ke nilai berikutnya dari sebuah sequence di tiap iterasi; range(start, stop) menghasilkan integer dari start sampai sebelum stop — range(5) menghasilkan lima value: 0 sampai 4.", "while loop mengulang selama kondisinya True. Kondisinya membaca loop state — counter, accumulator — dan isi blok harus meng-update state itu, kalau nggak kondisinya nggak akan pernah False. Counter menghitung iterasi; accumulator menampung hasil. Keduanya diinisialisasi sebelum loop dan di-update di dalamnya. Kalau jumlah pengulangannya sudah jelas, for dengan range() lebih sederhana; while cocok untuk pengulangan yang ujungnya tergantung data."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [loopsCopy.id.prompt] },
  { title: "CONNECT · Konsep ini nyambung ke mana?", content: ["Loops → functions", "Loop mengulang kerja; functions nanti membungkus kerja di balik sebuah nama supaya bisa dipakai di mana saja. Loop state — counter dan accumulator — bakal terasa pas sebagai input dan hasil function.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah disimpan supaya bisa lanjut setelah reload."] },
];

export function getLoopsActivities(language: LessonLanguage) {
  return loopsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [loopsCopy[language].prompt] } : {}),
  }));
}

export function localizeLoopsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Loop mengulang sebuah blok kode. for loop melakukan iterasi atas sebuah sequence: untuk tiap value yang dihasilkan sequence, loop variable di-bind ke value itu dan blok menjoroknya jalan. range(5) menghasilkan integer 0, 1, 2, 3, 4 — dia mulai dari 0 dan berhenti SEBELUM nilai akhir, jadi dia menghasilkan tepat 5 angka tapi tidak pernah 5 sendirinya.",
      "range() menerima satu sampai tiga argumen: range(stop), range(start, stop), atau range(start, stop, step). range(1, 6) menghasilkan 1, 2, 3, 4, 5 — nilai stop selalu tidak termasuk. Batas setengah-terbuka ini adalah sumber kesalahan off-by-one yang paling sering.",
      "while loop mengulang selama kondisinya True. Sesuatu di dalam blok harus akhirnya membuat kondisi itu False — biasanya dengan meng-update counter — kalau tidak, loop tidak pernah berhenti (infinite loop).",
      "Counter dan accumulator adalah loop state. Counter menghitung iterasi (count = count + 1); accumulator mengumpulkan hasil lintas iterasi (total = total + number). Keduanya diinisialisasi sebelum loop dan di-update di dalamnya. Me-reset accumulator di dalam loop menghapus semua yang sudah terkumpul.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["for untuk jumlah yang jelas", "range dengan nilai awal", "while dengan kondisi", "Accumulator menampung hasil"][index] ?? example.title,
      explanation: ["i mengambil 0, 1, 2, 3, 4 — satu per iterasi. range(5) tidak pernah memuat 5.", "Mulai dari 1 dan berhenti sebelum 6: tampil 1, 2, 3, 4, 5. Nilai stop tidak termasuk.", "Tiap putaran menampilkan count lalu menaikkannya. Ketika count jadi 6, kondisinya False dan loop selesai.", "total mengumpulkan 1 + 2 + 3 + 4 + 5 lintas iterasi dan menampilkan 15 setelah loop selesai."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Konstruksi yang mengulang blok kode beberapa kali.", "Loop yang melakukan iterasi atas sebuah sequence, menjalankan isinya sekali per value.", "Loop yang mengulang selama kondisinya True.", "Menghasilkan deret integer; nilai stop tidak termasuk. range(5) menghasilkan 0 sampai 4.", "Satu kali jalan melewati isi loop.", "Nama yang menerima value saat ini di tiap iterasi for, seperti i pada for i in range(5).", "Variable yang menghitung iterasi, di-update di dalam loop.", "Variable yang menampung hasil yang berjalan lintas iterasi, seperti sebuah jumlah.", "Loop yang kondisinya tidak pernah jadi False — biasanya karena tidak ada yang meng-update loop state."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Lupa meng-update counter while", "Mengira range(5) memuat 5", "Batas range salah", "Menjorok nggak konsisten", "Me-reset accumulator di dalam loop", "Ngcampur jumlah putaran dengan nilai loop variable", "Pakai while padahal for lebih pas"][index] ?? mistake.title,
      explanation: ["while count <= 5: tanpa count = count + 1 di dalamnya tidak pernah mengubah kondisi, jadi loop jalan selamanya.", "range(5) menghasilkan 0, 1, 2, 3, 4 — berhenti sebelum nilai stop. Pakai range(1, 6) untuk dapat 1 sampai 5.", "range(1, 5) menghasilkan 1 sampai 4, bukan 5. Off-by-one kelihatan sebagai angka pertama atau terakhir yang hilang.", "Isi loop adalah baris yang menjorok di bawah for/while. Print yang tidak menjorok jalan sekali, setelah loop.", "total = 0 di dalam loop menghapus total yang berjalan di tiap putaran. Inisialisasi sebelum loop, update di dalamnya.", "for i in range(5) jalan 5 kali, tapi i bernilai 0 sampai 4 selama putaran itu — jumlah iterasi bukan nilai yang i ambil.", "Kalau jumlah pengulangan sudah tahu, for dengan range() meng-update loop variable untukmu. while untuk pengulangan yang ujungnya tergantung data."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Ini menampilkan apa?", "Loop ini jalan berapa kali?", "Program ini kurang apa?"][index] ?? check.question,
      explanation: ["range(3) mulai dari 0 dan berhenti sebelum 3, jadi i mengambil 0, 1, 2.", "count jadi 2, 3, 4, 5 — setelah update keempat, kondisi 5 <= 4 itu False. Empat iterasi.", "Tanpa count = count + 1 di dalam loop, kondisinya tetap True selamanya — infinite loop."][index] ?? check.explanation,
    })),
  };
}
