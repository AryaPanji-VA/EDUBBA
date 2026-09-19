import { whatIsProgrammingActivities } from "./what-is-programming-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const whatIsProgrammingCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Fundamentals",
    prompt: "Explain in your own words: what is programming, and why must instructions for a computer be clear and in order?",
    placeholder: "Programming is giving the computer...",
    oneLine: "Your answer",
    diagram: "instruction steps",
    codeLabel: "pseudo",
    sourceCheck: "Source Mode: no AI evaluation. Review the definition and the literal-execution model, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fundamental Pemrograman",
    prompt: "Jelasin pakai bahasa lu sendiri: apa itu programming, dan kenapa instruksi buat komputer harus jelas dan berurutan?",
    placeholder: "Programming itu cara kita...",
    oneLine: "Jawaban kamu",
    diagram: "langkah instruksi",
    codeLabel: "pseudo",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau definisi dan model eksekusi literal-nya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Programming itu sebenarnya apa", content: ["Semua aplikasi yang kamu pakai — chat, maps, game — pada intinya sama: kumpulan instruksi yang diikuti komputer untuk menyelesaikan satu tugas.", "Sebelum sentuh syntax apa pun: pahami dulu apa itu instruksi, kenapa harus terstruktur, dan kenapa komputer nggak pernah menebak maksud lu."] },
  { title: "INTUITION · Instruksi yang bisa diikuti mesin", content: ["Programming itu kasih instruksi ke komputer — tapi instruksinya harus terstruktur: jelas, berurutan, dan lengkap. “Sapa user dengan manis” itu harapan; tiga langkah bernomor itu instruksi.", "Analogi resep masak cocok alasannya: langkah, berurutan, menuju satu hasil. Bedanya, komputer mengikuti langkah itu persis — dia nggak pernah isi celah pakai akal sehat."] },
  { title: "SEE · Satu tugas, tiga langkah", content: ["Program mungil ini mengambil nama user, menyusun sapaan dari nama itu, lalu menampilkannya. Setiap baris menyatakan persis apa yang dilakukan dengan apa — nggak ada yang per ditebak.", "Kalau ditulis untuk orang, rencana yang sama cukup jadi sticky note. Kalau ditulis sebagai instruksi yang bisa dieksekusi mesin, dia jadi program. Code itu cara kita menulis instruksi itu dalam bahasa yang bisa dijalankan komputer."] },
  { title: "MENTAL MODEL · Komputer itu literal", content: ["Komputer menjalankan instruksi sesuai aturan bahasanya — persis, berurutan, setiap saat. Dia nggak bisa baca niat, dan nggak bisa memilih sendiri kalau langkahnya kabur.", "Itu bukan kelemahan mesin; itu kesepakatannya. Eksekusi yang deterministik justru alasan program yang sama berperilaku sama setiap dijalankan. Harganya: kita harus bilang persis apa yang kita mau."] },
  { title: "PREDICT · Apa yang muncul di layar?", content: ["Ikuti tiga langkahnya secara berurutan dengan nama Arya. Apa yang ditampilkan langkah 3?"], explanation: "Langkah 1 menyimpan jawaban Arya ke dalam nama. Langkah 2 menyusun teks \"Halo, \" + nama, yang menjadi \"Halo, Arya!\". Langkah 3 menampilkan teks persis itu. Komputer memakai value yang tersimpan — bukan mencetak kata nama, dan bukan protes soal syntax yang tidak pernah diberikan." },
  { title: "PREDICT · Langkah mana yang jalan?", content: ["Program juga bisa memilih langkah dengan mengecek satu aturan. Di sini, sapaan mana yang muncul?"], explanation: "Komputer mengecek aturan jam >= 18, hasilnya benar, lalu menjalankan blok itu saja. Blok else dilewati. Aturan yang tertulis dipakai secara literal — bukan semuanya dijalankan, dan bukan menebak sapaan yang lu maksud." },
  { title: "TRY · Lengkapi definisinya", content: ["Isi bagian kosongnya — satu kata, Indonesia atau Inggris. Satu kata yang sama sengaja dipakai untuk dua baris itu."], explanation: "Instruksi: programming itu kasih instruksi yang terstruktur, dan code itu cara menulis instruksi itu supaya bisa dijalankan mesin." },
  { title: "FORMALIZE · Definisi kerja", content: ["Programming adalah menetapkan sebuah tugas sebagai urutan instruksi terstruktur yang bisa dieksekusi mesin. Code adalah medianya: teks dalam bahasa pemrograman yang syntax-nya menentukan apa yang dihitung instruksi valid. Program adalah hasilnya — instruksi yang disusun untuk menyelesaikan masalah atau melakukan tugas.", "Komputer menjalankan instruksi sesuai aturan: persis, berurutan, tanpa menambah niat sendiri. Eksekusi deterministik itu fitur — instruksi yang sama mengerjakan hal yang sama setiap saat.", "Syntax bukan prasyarat untuk dihafal. Dia kosakata presisi yang lu pelajari bertahap untuk menuliskan instruksi — mulai lesson berikutnya dengan nama dan value."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [whatIsProgrammingCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Apa itu Programming → Variables → Data Types → Operators → Conditionals", "Sekarang lu tahu programming itu apa: instruksi terstruktur yang dieksekusi komputer. Selanjutnya, Variables memberi instruksi itu sesuatu untuk dikerjakan — nama untuk value. Lesson berikutnya mengubah instruksi jadi pilihan (conditionals) dan pekerjaan yang bisa dipakai ulang (functions).", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getWhatIsProgrammingActivities(language: LessonLanguage) {
  return whatIsProgrammingActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [whatIsProgrammingCopy[language].prompt] } : {}),
  }));
}

export function localizeWhatIsProgrammingContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Programming pada dasarnya kasih instruksi ke komputer. Tapi bukan instruksi sembarangan — instruksinya harus terstruktur: jelas, berurutan, dan lengkap.",
      "Kenapa harus begitu? Karena komputer nggak menebak maksud lu. Dia menjalankan persis apa yang tertulis, satu langkah demi satu langkah. Code adalah cara kita menulis instruksi itu dalam bahasa yang bisa dia jalankan.",
      "Semua program — aplikasi chat, game, kalkulator — pada intinya sama: instruksi yang disusun untuk menyelesaikan tugas atau masalah. Di lesson ini lu nggak perlu menghafal syntax Python sama sekali.",
    ],
    academicExplanation: [
      "Programming adalah praktik menetapkan sebuah tugas sebagai urutan instruksi terstruktur yang bisa dieksekusi mesin. Programmer memutuskan langkah apa yang dibutuhkan dan dalam urutan apa; komputer menjalankannya tanpa menambahkan niat sendiri.",
      "Code adalah medium untuk instruksi itu: teks dalam bahasa pemrograman yang syntax-nya menentukan apa yang dihitung instruksi valid, dan semantiknya menentukan apa yang tiap instruksi buatkan mesin. Menulis instruksi untuk komputer berbeda dari menulis catatan untuk orang, karena pembacanya tidak bisa melengkapi detail yang hilang dari konteks.",
      "Program adalah hasilnya: instruksi yang diorganisasi untuk menyelesaikan masalah atau melakukan tugas. Komputer mengikuti aturan bahasa secara persis — instruksi yang sama menghasilkan langkah yang sama setiap saat. Syntax dipelajari bertahap, sebagai cara presisi untuk menuliskan instruksi, bukan sebagai prasyarat yang dihafal duluan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Program sapaan (pseudo-instruksi)", "Satu instruksi, ditulis dalam Python", "Instruksi dengan kondisi"][index] ?? example.title,
      explanation: ["Tiga instruksi, satu urutan, satu tugas: menyapa user. Komputer menjalankannya dari atas ke bawah.", "Tiap langkah rencana menjadi satu instruksi Python. Langkah \"tampilkan sapaan\" menjadi satu baris: print meminta ditampilkan, kutip menandai teks persisnya. Lu belum perlu memahami detailnya — bentuknya yang penting dilihat.", "Program juga bisa memilih langkah berdasarkan aturan. Komputer mengecek kondisinya, lalu menjalankan blok yang sesuai — tidak lebih, tidak kurang."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Memberi instruksi yang terstruktur ke komputer untuk menyelesaikan tugas.", "Satu langkah yang bisa dijalankan komputer, dinyatakan dengan jelas dan lengkap.", "Cara kita menulis instruksi dalam bahasa pemrograman yang bisa dieksekusi.", "Kumpulan instruksi yang disusun untuk menyelesaikan masalah atau melakukan tugas.", "Aturan penulisan sebuah bahasa pemrograman; dipelajari bertahap, bukan dihafal duluan."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengira harus menghafal syntax dulu", "Menganggap komputer paham maksud", "Menulis instruksi yang ambigu", "Menilai program dari panjang kodenya"][index] ?? mistake.title,
      explanation: ["Syntax adalah cara menulis instruksi, bukan pintu masuknya. Memahami apa itu instruksi dan bagaimana komputer menjalankannya datang lebih dulu.", "Komputer tidak membaca niat. Instruksi yang tidak tertulis tidak dijalankan, sekecil apa pun kelihatannya.", "“Tampilkan sapaan yang sesuai” tidak bisa dijalankan mesin. Komputer butuh langkah yang menyatakan persis apa yang dilakukan dengan apa.", "Nilai sebuah program adalah apakah instruksinya benar dan menyelesaikan tugasnya, bukan panjang atau tingkat rumitnya."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa hubungan antara code dan instruksi?", "Bagaimana komputer menjalankan instruksi?", "Sebuah program dibuat untuk…"][index] ?? check.question,
      explanation: ["Instruksinya adalah rencananya; code adalah tulisannya dalam bahasa pemrograman yang bisa dieksekusi.", "Komputer mengikuti aturan bahasa secara literal: langkah yang sama dijalankan dengan cara yang sama setiap kali.", "Tujuan program selalu ada di luar dirinya: sebuah tugas yang ingin diselesaikan. Instruksi hanya sarannya."][index] ?? check.explanation,
    })),
  };
}

export const whatIsProgrammingMasteryConceptLabels: Record<string, string> = {
  programming_definition: "The definition", code_instructions: "Code = instructions", literal_execution: "Literal execution",
};

export function whatIsProgrammingReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("syntax_first_confusion")) return id
    ? "Balik ke program sapaan tiga langkahnya: instruksi mana yang butuh syntax Python untuk dipahami? Coba jalanin langkahnya pakai bahasa sehari-hari dulu."
    : "Back to the three-step greeting program: which instruction needs Python syntax to be understood? Walk the steps in plain language first.";
  if (result.misconceptions.includes("computer_understands_intent")) return id
    ? "Coba tes modelnya: kalau langkah 2 dihapus, apakah komputer tetap tahu nama yang mau disapa? Apa yang sebenarnya dia pegang?"
    : "Test the model: if step 2 is deleted, does the computer still know which name to greet? What does it actually hold?";
  if (result.misconceptions.includes("value_placeholder_confusion")) return id
    ? "Ikuti langkah 2 pelan-pelan: \"Halo, \" + nama. nama menyimpan Arya, jadi gabungannya jadi teks apa?"
    : "Follow step 2 slowly: \"Halo, \" + nama. nama stores Arya, so what text does the combination become?";
  if (result.misconceptions.includes("position_vs_rule_confusion")) return id
    ? "Cek aturannya, bukan posisinya: baris mana yang kondisinya dievaluasi, dan apa hasil cek 19 >= 18?"
    : "Check the rule, not the position: which line's condition gets evaluated, and what is the result of 19 >= 18?";
  if (result.misconceptions.includes("runs_everything_confusion")) return id
    ? "Program ini punya dua blok tapi satu pertanyaan: kalau keduanya dijalankan, layar menampilkan dua sapaan sekaligus. Masih masuk akal sebagai satu instruksi pilihan?"
    : "This program has two blocks but one question: if both ran, the screen would show two greetings. Does that still make sense as one choosing instruction?";
  return id
    ? "Restate definisinya: programming itu kasih instruksi apa ke siapa — dan kenapa urutannya nggak boleh diacak."
    : "Restate the definition: programming gives what kind of instructions to whom — and why the order cannot be shuffled.";
}
