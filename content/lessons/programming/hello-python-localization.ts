import { helloPythonActivities } from "./hello-python-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const helloPythonCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Fundamentals",
    prompt: "Explain in your own words: what is Python, and how does one line of code like print(\"Halo, dunia!\") become output on the screen?",
    placeholder: "Python is a language, and when the line runs...",
    oneLine: "One Python line",
    diagram: "code → read → executed → output",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the pipeline from code to output, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fundamental Pemrograman",
    prompt: "Jelasin pakai bahasa lu sendiri: apa itu Python, dan bagaimana satu baris code seperti print(\"Halo, dunia!\") bisa jadi output di layar?",
    placeholder: "Python itu bahasa, dan waktu barisnya dijalankan...",
    oneLine: "Satu baris Python",
    diagram: "code → dibaca → dijalankan → output",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau alur code sampai output, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa Python duluan?", content: ["Lesson sebelumnya: programming itu kasih instruksi terstruktur ke komputer. Pertanyaannya sekarang, instruksi itu ditulis pakai bahasa apa? Di sinilah pilihan pertama lu sebagai programmer: bahasanya.", "Kenapa Python? Aturan tulisnya sedikit dan dekat dengan bahasa manusia. Langkah awal lu jadi fokus ke cara berpikir yang jelas, bukan ke menghafal aturan."] },
  { title: "INTUITION · Bahasa dengan aturan kecil", content: ["Python adalah sebuah programming language: kumpulan aturan untuk menulis instruksi yang bisa dieksekusi mesin. Satu baris ini adalah satu instruksi Python yang utuh.", "Komputer nggak ngerti bahasa manusia — dia butuh aturan yang presisi. Python bikin aturan itu sekecil mungkin, jadi satu baris teks yang jelas sudah cukup buat bikin sesuatu terjadi."] },
  { title: "SEE · Program Python pertama", content: ["print() adalah cara meminta Python menampilkan sesuatu. Teks yang mau ditulis di antara tanda kutip. Jalankan barisnya, dan Halo, dunia! muncul sebagai output.", "Itu program lengkapnya. Satu baris, satu instruksi, satu hasil yang kelihatan. (Detail print() — apa lagi yang bisa ditampilkan, cara kerja kutipnya — punya lesson sendiri berikutnya. Sekarang cukup kenali bentuknya.)"] },
  { title: "MENTAL MODEL · Dari code ke output", content: ["Pipeline ini adalah mental model untuk semua program Python, sebesar apa pun: Python membaca instruksinya, komputer menjalankannya, lalu output muncul.", "Code dan output itu dua hal berbeda. Code adalah yang lu tulis; output adalah yang muncul waktu dijalankan. Ketuker keduanya itu kebingungan beginner paling umum — pipeline ini menjaga keduanya terpisah."] },
  { title: "PREDICT · Apa yang terjadi saat dijalankan?", content: ["Lu tulis baris ini lalu jalankan. Apa yang terjadi?"], explanation: "print() adalah instruksi untuk menampilkan. Python membaca barisnya, komputer menjalankannya, dan teks di antara kutip muncul sebagai output. Code bukan yang ditampilkan — code adalah yang dijalankan." },
  { title: "PREDICT · Dua instruksi, berurutan", content: ["Dua instruksi, satu program. Apa yang muncul di layar?"], explanation: "Python membaca program dari atas ke bawah dan menjalankan satu instruksi pada satu waktu, sesuai urutan tulisannya. Urutan baris = urutan output — tukar barisnya, output ikut kebalik." },
  { title: "TRY · Tulis baris pertama lu", content: ["Tulis satu baris Python yang menampilkan teks Halo, dunia!. Ikuti bentuk yang lu lihat di SEE — teksnya di antara kutip, di dalam kurung."], explanation: "print(\"Halo, dunia!\") — instruksinya print, kurung membawa apa yang ditampilkan, dan kutip menandai teks persisnya. Kutip satu atau dua sama-sama valid." },
  { title: "FORMALIZE · Python, program, dan output", content: ["Python adalah programming language: aturan untuk menulis instruksi yang bisa dieksekusi mesin. Program adalah teks yang ditulis dengan aturan itu. Menjalankan program berarti sebuah Python interpreter membacanya dari atas ke bawah dan mengeksekusi tiap instruksi saat dibaca; apa pun yang muncul itulah output.", "print() adalah instruksi untuk menampilkan sesuatu sebagai output. Lu sudah lihat bentuknya — detail apa saja yang bisa ditampilkan datang di lesson berikutnya.", "Python dipelajari dengan menulis dan menjalankan instruksi kecil, bukan dengan menghafal. Pipeline code → dibaca → dijalankan → output adalah model yang dipakai ulang di semua lesson selanjutnya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [helloPythonCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Kenalan dengan Python → print() & Output → Variables → Data Types", "Sekarang lu tahu Python sebagai bahasanya dan alur dari code ke output. Lesson berikutnya membedah satu instruksi yang barusan lu kenal: print() dan output — apa saja yang bisa ditampilkan dan bagaimana instruksinya disusun.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getHelloPythonActivities(language: LessonLanguage) {
  return helloPythonActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [helloPythonCopy[language].prompt] } : {}),
  }));
}

export function localizeHelloPythonContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Lesson sebelumnya: programming itu memberi instruksi ke komputer. Pertanyaannya, instruksi ditulis pakai bahasa apa? Jawaban lesson ini: Python.",
      "Python adalah sebuah programming language — bahasa dengan aturan tulis yang sederhana dan dekat dengan bahasa manusia. Karena itu Python cocok jadi bahasa pertama: fokus lu ada di cara berpikir, bukan di menghafal aturan.",
      "Dan inilah program Python pertama lu: print(\"Halo, dunia!\") — satu baris, satu instruksi, yang meminta Python menampilkan teks Halo, dunia! ke layar. Jalankan, dan output-nya muncul.",
    ],
    academicExplanation: [
      "Python adalah programming language: kumpulan aturan untuk menulis instruksi yang bisa dieksekusi komputer. Syntax-nya sengaja dibuat kecil dan dekat dengan bahasa biasa — karena itu instruksi pertama yang lengkap cukup satu baris.",
      "Program Python adalah teks. Menjalankannya berarti sebuah Python interpreter membaca berkasnya dari atas ke bawah dan mengeksekusi tiap instruksi saat dibaca. Apa pun yang muncul karena instruksinya — di layar, di berkas, di mana pun — itulah output program.",
      "print() adalah instruksi Python untuk menampilkan sebuah value sebagai output. Lesson ini memperkenalkannya sebagai cara meminta Python menampilkan sesuatu; lesson berikutnya membedah apa saja yang bisa ditampilkan dan bagaimana instruksinya disusun.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Program Python pertama", "Output muncul sesuai urutan baca", "Instruksi yang sama, teks berbeda"][index] ?? example.title,
      explanation: ["Satu baris, satu instruksi. Menjalankannya menampilkan Halo, dunia! sebagai output — teks di antara kutip yang ditampilkan, bukan barisnya sendiri.", "Python membaca program dari atas ke bawah dan menjalankan satu instruksi pada satu waktu. Urutan baris = urutan output.", "Bentuknya tetap print(...) — hanya teks di dalamnya yang berubah, dan output ikut berubah. Instruksinya polanya; teksnya detailnya."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Sebuah programming language untuk menulis instruksi yang bisa dieksekusi komputer.", "Teks yang ditulis dalam sebuah bahasa pemrograman — kumpulan instruksi yang bisa dijalankan komputer.", "Satu langkah yang bisa dibaca dan dieksekusi Python.", "Apa pun yang muncul saat program dijalankan.", "Instruksi Python untuk menampilkan sesuatu sebagai output."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengira Python adalah aplikasi yang diklik", "Menganggap urutan baris tidak penting", "Ketuker code dengan output", "Mencoba menghafal Python duluan"][index] ?? mistake.title,
      explanation: ["Python adalah bahasanya. Tool yang membaca dan menjalankan code (interpreter) itu terpisah: lu menulis instruksinya, dia yang mengeksekusinya.", "Python membaca dari atas ke bawah, satu instruksi pada satu waktu. Tukar dua baris, output ikut kebalik.", "Code adalah yang lu tulis; output adalah yang muncul saat dijalankan. print(\"Halo, dunia!\") adalah instruksinya — Halo, dunia! adalah output-nya.", "Python dipelajari dengan menulis dan menjalankan instruksi kecil, bukan dengan menghafal. Satu baris yang jalan mengajarkan lebih banyak daripada satu halaman yang dihafal."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Python itu apa?", "Bagaimana Python menjalankan program?", "Apa output dari print(\"Halo, dunia!\")?"][index] ?? check.question,
      explanation: ["Python adalah bahasanya; instruksi yang lu tulis dengannya adalah program, dan menjalankan programnya menghasilkan output.", "Satu instruksi pada satu waktu, sesuai urutan tulisannya — makanya urutan baris dan urutan output itu sama.", "print() menampilkan teks di antara kutip. Baris code adalah instruksinya; teks yang tampil adalah output-nya."][index] ?? check.explanation,
    })),
  };
}

export const helloPythonMasteryConceptLabels: Record<string, string> = {
  python_as_language: "Python as a language", code_to_output: "Code → output", instruction_execution: "Execution order",
};

export function helloPythonReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("language_program_confusion")) return id
    ? "Pisahkan dua halnya: Python itu bahasanya atau tool-nya? Siapa yang membaca code, dan siapa yang menjalankannya?"
    : "Separate the two: is Python the language or the tool? Who reads the code, and who runs it?";
  if (result.misconceptions.includes("prints_code_text_confusion")) return id
    ? "Bedakan dua hal di layar: mana yang lu tulis (code) dan mana yang muncul saat dijalankan (output)? print(...) itu instruksi atau tampilan?"
    : "Distinguish what you write (code) from what appears when it runs (output). Is print(...) the instruction or the display?";
  if (result.misconceptions.includes("output_stored_confusion")) return id
    ? "Kalau print() cuma menyimpan, layar bakal nampilin apa? Coba sebut ulang tugas print() versi lu."
    : "If print() only stored the text, what would the screen show? Restate print()'s job in your own words.";
  if (result.misconceptions.includes("order_irrelevant_confusion")) return id
    ? "Coba tukar dua barisnya di kepala. Output-nya ikut kebalik nggak? Apa kesimpulannya soal cara Python membaca program?"
    : "Swap the two lines in your head. Does the output swap too? What does that say about how Python reads a program?";
  return id
    ? "Restate alurnya: code → dibaca → dijalankan → output. Di titik mana print() bekerja, dan apa persisnya yang muncul di layar?"
    : "Restate the pipeline: code → read → executed → output. Where does print() act, and what exactly appears on screen?";
}
