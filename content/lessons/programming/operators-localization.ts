import { operatorsActivities } from "./operators-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
export type { LessonLanguage };

export const operatorsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what is the difference between = and ==, and why can age >= 18 be used by an if statement?",
    placeholder: "= stores a value, while ==...",
    sourceCheck: "Source Mode: no AI evaluation. Review assignment versus equality and the boolean result, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa beda = dan ==, dan apa hasil dari score > 5 kalau score bernilai 10?",
    placeholder: "= menyimpan value, sedangkan ==...",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau beda assignment dan equality serta hasil boolean-nya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Value butuh aksi", content: ["Variable menyimpan value dan data type menjelaskan jenisnya. Operator adalah simbol yang membuat value tersebut bekerja: menghitung, membandingkan, menghasilkan value baru.", "Ide yang sama mencakup semua operator yang sudah lu temui — 10 + 5 menghasilkan 15, dan score > 5 menghasilkan True. Lesson ini adalah perkenalan resminya."] },
  { title: "INTUITION · Expression menghasilkan value", content: ["Expression itu mesin kecil pembuat value. x + y menghasilkan 13; x > y menghasilkan True.", "Operator arithmetic menghitung, operator comparison bertanya True/False. Python juga punya operator untuk menggabungkan pertanyaan — itu datang nanti, saat pertanyaan punya konteks."] },
  { title: "PREDICT · Operasi mana yang duluan?", content: ["Trace expression-nya tanpa menjalankannya. Apa yang tampil?"], explanation: "Perkalian jalan sebelum penjumlahan: 3 * 4 menjadi 12, lalu 2 + 12 menjadi 14." },
  { title: "PREDICT · Hasil bagi dan sisa", content: ["Apa dua baris output-nya?"], explanation: "// menghasilkan floor-divided quotient 3; % menghasilkan sisa 1." },
  { title: "PREDICT · Hasil perbandingan", content: ["Comparison bertanya tentang value. Apa yang dicetak ini?"], explanation: "age >= 18 membandingkan dua angka dan menghasilkan boolean True. Perbandingannya — bukan operand-nya — yang menjadi value yang dicetak." },
  { title: "TRY · Biarkan operator menghitung", content: ["Mulai dari score = 10, tambahkan 5 ke score lewat expression — simpan hasil hitungannya balik — supaya print di bawah menampilkan 15. Jangan shortcut dengan score = 15."], explanation: "score = score + 5 — sisi kanan dihitung dulu (10 + 5 = 15), lalu reassignment menyimpan hasilnya balik di bawah nama yang sama. Operator yang menghitung." },
  { title: "FORMALIZE · Operator dan precedence", content: ["Expression menggabungkan operand dan operator lalu menghasilkan value. Operator arithmetic menghitung; comparison menghasilkan bool. Python juga punya operator untuk menggabungkan kondisi — and, or, dan not — yang mendapat konteksnya di lesson berikutnya.", "Python mengikuti precedence, jadi perkalian berjalan sebelum penjumlahan. Kurung membuat urutan lain menjadi eksplisit. Assignment = mengikat value ke nama; equality == membandingkan. Dua tanda itu mengerjakan hal yang berbeda."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [operatorsCopy.id.prompt] },
  { title: "CONNECT · Dari mengoperasikan data ke menerimanya", content: ["Operators → User Input → Conditionals", "Sekarang lu tahu cara program mengoperasikan data yang dipegangnya — menghitung, membandingkan, menghasilkan value baru. Berikutnya User Input: bagaimana program menerima data dari orang yang menjalankannya.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah disimpan supaya bisa lanjut setelah reload."] },
];

export function getOperatorsActivities(language: LessonLanguage) {
  return operatorsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [operatorsCopy[language].prompt] } : {}),
  }));
}

export function localizeOperatorsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Expression menggabungkan value, variable, dan operator lalu dievaluasi menjadi satu value. Operator arithmetic menghitung angka: +, -, *, /, //, %, dan **. Di Python, / selalu menghasilkan float, // melakukan floor division, dan % menghasilkan sisa.",
      "Operator comparison ==, !=, <, >, <=, dan >= membandingkan dua value lalu menghasilkan boolean True atau False. Assignment = menyimpan value dalam nama; equality == menanyakan apakah dua value sama.",
      "Operator logical menggabungkan atau membalik expression boolean. and True hanya jika kedua sisinya True; or True jika minimal satu sisi True; not membalik boolean. Hasil ini nanti menjadi kondisi untuk if.",
      "Precedence menentukan bagian expression yang dievaluasi dulu. Perkalian dan pembagian berjalan sebelum penjumlahan dan pengurangan. Kurung membuat urutan yang dimaksud eksplisit.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Arithmetic dengan variable", "Pembagian dan sisa", "Comparison menjadi bool", "Reassignment dengan hitungan", "Precedence dan kurung"][index] ?? example.title,
      explanation: ["Variable memberi value angka ke empat expression arithmetic. Pembagian dengan / menghasilkan float.", "10 // 3 memberi hasil bagi bulat 3; 10 % 3 memberi sisa 1.", "Expression ini mengajukan pertanyaan dan menghasilkan boolean True.", "Sisi kanan dihitung dulu (10 + 5 = 15), lalu hasilnya disimpan balik di bawah nama yang sama. Operator yang menghitung.", "Perkalian jalan dulu di expression pertama. Kurung sengaja mengubah urutan pada expression kedua."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Simbol atau keyword yang melakukan operasi, seperti +, >=, atau and.", "Value yang dikerjakan operator; x dan 3 adalah operand dalam x + 3.", "Gabungan value, variable, dan operator yang dievaluasi menjadi satu value.", "Operator yang menghitung angka, seperti +, *, //, atau %.", "Operator yang membandingkan value dan menghasilkan True atau False.", "Menandai bagian expression yang harus dievaluasi lebih dulu.", "Aturan yang menentukan operasi mana dalam expression yang jalan dulu.", "Value True atau False yang dihasilkan comparison dan expression logical."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Ketuker = dan ==", "Menganggap / dan // sama", "Membaca % sebagai persen", "Lupa precedence", "Mengira comparison menghasilkan teks", "Menempelkan digit berkutip tanpa sengaja", "Hardcode hasil instead of memakai operator", "Membandingkan tipe yang tidak cocok", "Mengira 10 / 2 itu int"][index] ?? mistake.title,
      explanation: ["= melakukan assignment; == membandingkan dua value. print(age = 18) invalid karena assignment bukan equality expression.", "/ melakukan pembagian biasa dan menghasilkan float. // melakukan floor division.", "Di Python, % menghasilkan sisa. number % 2 bernilai 0 untuk integer genap.", "2 + 3 * 4 adalah 14, bukan 20. Pakai kurung kalau ingin urutan lain.", "age >= 18 menghasilkan boolean True atau False, bukan string yes atau no.", "\"10\" + \"5\" menggabungkan teks menjadi \"105\". Kalau yang dimaksud menghitung, valuenya harus angka sungguhan, bukan digit berkutip.", "Menulis 15 di tempat 10 + 5 kehilangan intinya: operator membuat Python menghitung dari value yang dimilikinya.", "Python tidak bisa mengurutkan string dan integer dengan < atau >=. Tipenya harus masuk akal untuk perbandingannya.", "/ di Python menghasilkan 5.0, sebuah float, walaupun hasil matematikanya bulat."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Expression ini menghasilkan apa?", "Expression mana yang mengecek equality?", "score >= 75 menghasilkan tipe value apa?"][index] ?? check.question,
      explanation: ["Perkalian punya precedence lebih tinggi, jadi 3 * 4 berjalan sebelum ditambah 2.", "== membandingkan value; = menyimpan value dalam variable.", "Comparison expression menghasilkan True atau False, keduanya value boolean."][index] ?? check.explanation,
    })),
  };
}
