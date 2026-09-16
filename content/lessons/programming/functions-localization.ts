import { functionsActivities } from "./functions-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
export type { LessonLanguage };

export const functionsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"),
    moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what is the difference between defining a function and calling it, and what does return hand back?",
    placeholder: "def creates the function...",
    sourceCheck: "Source Mode: no AI evaluation. Use the define-vs-call model to review your explanation, then continue without AI.",
    masteryDefinition: "Definition", masteryCall: "Calls",
    masteryParameters: "Parameters & arguments", masteryReturn: "Return values",
  },
  id: {
    ...getSharedCopy("id"),
    moduleTitle: "Dasar Penyusun Program",
    prompt: "Apa bedanya mendefinisikan function dengan memanggilnya, dan apa yang dikembalikan oleh return?",
    placeholder: "def itu bikin functionnya...",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penjelasan kamu dengan model define-vs-call, lalu lanjut tanpa AI.",
    masteryDefinition: "Definisi", masteryCall: "Pemanggilan",
    masteryParameters: "Parameter & argument", masteryReturn: "Nilai kembalian",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa function ada", content: ["Kalau perhitungan atau sapaan yang sama ditulis di tiga tempat, perbaikannya juga harus di tiga tempat — dan satu tempat yang kelewat jadi bug.", "Function membungkus perilaku itu di balik satu nama: sekali definisikan, panggil di mana saja. Input masuk lewat parameter, hasil keluar lewat return."] },
  { title: "INTUITION · Bikin sekali, panggil berkali-kali", content: ["def greet(): itu MEMBUAT function-nya — dia tidak menjalankannya. Baru call greet() yang mengeksekusi isi body. Di sini body jalan dua kali, jadi Hello tampil dua kali.", "Titik dua membuka body-nya; baris yang menjorok itulah yang dipakai ulang di tiap pemanggilan."] },
  { title: "PREDICT · Apa yang jalan?", content: ["Program ini punya definisi tapi nggak ada call. Apa yang ditampilkan?"], explanation: "Mendefinisikan function hanya membuatnya. Tanpa call seperti greet(), body-nya tidak pernah jalan — nggak ada yang tampil." },
  { title: "PREDICT · result isinya apa?", content: ["Ikuti call-nya: 3 masuk ke a, 4 masuk ke b. Apa yang ditampilkan print(result)?"], explanation: "add menerima 3 dan 4, mengembalikan 3 + 4, dan call-nya menjadi value 7. result di-bind ke 7, jadi 7 tampil." },
  { title: "PREDICT · print atau return?", content: ["shout nyerahin value; print menampilkannya. Apa yang muncul?"], explanation: "shout(\"Hai\") mengembalikan \"Hai!\" dan print menampilkannya. Kalau shout cuma print tanpa return, print(shout(\"Hai\")) akan menampilkan teks lalu None." },
  { title: "TRY · Tulis baris defnya", content: ["Tulis baris def lengkap untuk function bernama tambah dengan dua parameter a dan b. Jangan lupa titik duanya."], explanation: "def tambah(a, b): menamai function, mencatat dua parameternya, dan ditutup titik dua untuk membuka body." },
  { title: "FORMALIZE · Function sebagai logika reusable", content: ["Function itu logika reusable dengan input dan output opsional. def membuatnya dengan parameter; call memberi argument dan menjalankan body; return mengakhiri call dan menyerahkan value. Call dengan jumlah argument yang nggak cocok melempar TypeError.", "Function tanpa return mengevaluasi ke None — print() menampilkan teks tapi bukan return. Variable yang dibuat di dalam body itu lokal: dia hanya ada selama call berlangsung, dan itu yang bikin pemanggilan berulang tetap aman. Function juga bisa memanggil function lain, menyusun perilaku besar dari potongan kecil yang bernama."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [functionsCopy.id.prompt] },
  { title: "CONNECT · Konsep ini nyambung ke mana?", content: ["Functions → program kamu sendiri", "Semua program besar itu kumpulan function kecil yang saling memanggil: input masuk, hasil keluar. Loop mengulang kerja; function menamainya. Dua-duanya ngegendong hampir semua program yang bakal kamu tulis.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah disimpan supaya bisa lanjut setelah reload."] },
];

export function getFunctionsActivities(language: LessonLanguage) {
  return functionsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [functionsCopy[language].prompt] } : {}),
  }));
}

export function localizeFunctionsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Function membungkus perilaku reusable di balik nama yang jelas. Statement def mendefinisikannya: def greet(): membuka function dengan titik dua dan body yang menjorok. Mendefinisikan TIDAK menjalankan body-nya — hanya call yang menjalankan.",
      "Memanggil greet() menjalankan body. Parameter adalah nama di def (def greet(name) punya satu parameter); argument adalah value asli yang diberikan saat call (greet(\"Panji\")). Jumlah argument harus cocok dengan yang def harapkan, kalau nggak Python melempar TypeError.",
      "return mengakhiri call dan menyerahkan value ke pemanggil: result = add(3, 4) meng-bind nilai yang dikembalikan ke result. Function tanpa return — atau yang selesai tanpa menyentuh return — menghasilkan None. print() hanya menampilkan teks ke layar; dia tidak menghasilkan value yang bisa dipakai pemanggil.",
      "Variable yang di-assign di dalam function itu lokal: dia hanya ada selama call berlangsung. Itulah yang bikin function andal — function yang sama bisa dipanggil berkali-kali tanpa mengganggu bagian lain program, dan satu function boleh memanggil function lain.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Bikin sekali, panggil berkali-kali", "Parameter menerima argument", "return menyerahkan value", "print bukan return"][index] ?? example.title,
      explanation: ["Body jalan sekali per call — Hello tampil dua kali. Tanpa call, nggak ada yang tampil.", "name itu parameter; \"Panji\" dan \"Arya\" argument-nya. Satu definisi, banyak variasi pemanggilan.", "add mengembalikan 7; call-nya menjadi value 7, yang di-bind ke result.", "show menampilkan 7 sebagai efek samping, tapi mengembalikan None — jadi result None. Return membuat value-nya reusable."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Blok perilaku yang reusable dan bernama, dengan input opsional dan output opsional.", "Statement yang mendefinisikan function; dia membuka body tapi tidak menjalankannya.", "Menjalankan function dengan menulis namanya plus kurung, seperti greet().", "Nama di def yang menerima input, seperti name pada def greet(name).", "Value asli yang diberikan ke function saat call, seperti \"Panji\" pada greet(\"Panji\").", "Mengakhiri call dan menyerahkan value ke pemanggil.", "Hasil evaluasi sebuah call ketika function-nya nggak punya return (atau nggak sampai ke sana).", "Variable yang di-assign di dalam function; dia hanya ada selama call itu."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Nge-def tapi nggak pernah dipanggil", "Panggil tanpa kurung", "Lupa titik dua", "Jumlah parameter dan argument nggak cocok", "Pakai print padahal butuh value", "Harap ada hasil tanpa return", "Pakai variable lokal di luar function"][index] ?? mistake.title,
      explanation: ["def greet(): itu cuma membuat function. Tanpa call seperti greet(), body-nya tidak pernah jalan dan nggak ada yang terjadi.", "greet itu object function-nya; greet() menjalankannya. Print greet akan menampilkan <function greet>, bukan menjalankannya.", "Baris def diakhiri : — titik dua membuka body yang menjorok.", "def greet(name) mengharapkan satu argument. greet() atau greet(\"A\", \"B\") melempar TypeError soal argument yang kurang atau lebih.", "print menampilkan teks tapi menyerahkan None. Kalau hasilnya mau disimpan atau dipakai lagi, function-nya butuh return.", "result = add(2, 3) yang isinya cuma print meng-bind result ke None — angkanya cuma ditampilkan, nggak dikembalikan.", "Variable yang dibuat di dalam function hanya ada selama call. Pakai namanya di luar melempar NameError."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Program ini menampilkan apa?", "name pada def greet(name): itu apa?", "result = show(3, 4) yang show-nya cuma print — result isinya apa?"][index] ?? check.question,
      explanation: ["Function-nya didefinisikan tapi tidak pernah dipanggil — def membuatnya, call menjalankannya.", "Nama di def itu parameter; \"Panji\" di tempat call adalah argument.", "Function tanpa return menyerahkan None. Angka 7 yang tampil itu efek samping, bukan value."][index] ?? check.explanation,
    })),
  };
}
