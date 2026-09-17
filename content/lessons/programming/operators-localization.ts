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
    prompt: "Apa beda = dan ==, lalu kenapa age >= 18 bisa dipakai oleh if?",
    placeholder: "= menyimpan value, sedangkan ==...",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau beda assignment dan equality serta hasil boolean-nya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Value butuh aksi", content: ["Variable menyimpan value dan data type menjelaskan jenisnya. Operator membuat program bisa menghitung value itu dan mengajukan pertanyaan tentangnya.", "Perbandingan seperti age >= 18 menghasilkan True atau False. Conditionals nanti memakai hasil boolean itu untuk memilih apa yang terjadi."] },
  { title: "INTUITION · Expression menghasilkan value", content: ["Expression itu mesin kecil pembuat value. x + y menghasilkan 13; x > y menghasilkan True.", "Operator arithmetic menghitung, operator comparison bertanya True/False, dan operator logical menggabungkan pertanyaan itu."] },
  { title: "PREDICT · Operasi mana yang duluan?", content: ["Trace expression-nya tanpa menjalankannya. Apa yang tampil?"], explanation: "Perkalian jalan sebelum penjumlahan: 3 * 4 menjadi 12, lalu 2 + 12 menjadi 14." },
  { title: "PREDICT · Hasil bagi dan sisa", content: ["Apa dua baris output-nya?"], explanation: "// menghasilkan floor-divided quotient 3; % menghasilkan sisa 1." },
  { title: "PREDICT · Gabungkan dua pertanyaan", content: ["Evaluasi setiap comparison, lalu gabungkan dengan and. Apa yang tampil?"], explanation: "85 >= 75 dan 85 <= 100 sama-sama True, jadi True and True menghasilkan True." },
  { title: "TRY · Tulis comparison-nya", content: ["Tulis satu expression Python yang True saat score minimal 70 dan maksimal 100. Pakai score, dua comparison, dan and."], explanation: "score >= 70 and score <= 100 menanyakan kedua batas dan mengharuskan keduanya True." },
  { title: "FORMALIZE · Operator dan precedence", content: ["Expression menggabungkan operand dan operator lalu menghasilkan value. Operator arithmetic menghitung; comparison menghasilkan bool; and, or, dan not menggabungkan atau membalik expression boolean.", "Python mengikuti precedence, jadi perkalian berjalan sebelum penjumlahan. Kurung membuat urutan lain menjadi eksplisit. Assignment = mengikat value ke nama; equality == membandingkan. Bedanya penting sebelum menulis if."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [operatorsCopy.id.prompt] },
  { title: "CONNECT · Dari expression ke keputusan", content: ["Operators → Conditionals", "Variable menyimpan value. Data type menjelaskannya. Operator menghitung dan membandingkannya. Conditionals memakai hasil True atau False untuk memutuskan code mana yang jalan.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah disimpan supaya bisa lanjut setelah reload."] },
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
      title: ["Arithmetic dengan variable", "Pembagian dan sisa", "Comparison menjadi bool", "Gabungkan comparison", "Precedence dan kurung"][index] ?? example.title,
      explanation: ["Variable memberi value angka ke empat expression arithmetic. Pembagian dengan / menghasilkan float.", "10 // 3 memberi hasil bagi bulat 3; 10 % 3 memberi sisa 1.", "Expression ini mengajukan pertanyaan dan menghasilkan boolean True.", "Kedua comparison True, jadi expression yang digabung dengan and menghasilkan True.", "Perkalian jalan dulu di expression pertama. Kurung sengaja mengubah urutan pada expression kedua."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Simbol atau keyword yang melakukan operasi, seperti +, >=, atau and.", "Value yang dikerjakan operator; x dan 3 adalah operand dalam x + 3.", "Gabungan value, variable, dan operator yang dievaluasi menjadi satu value.", "Operator yang menghitung angka, seperti +, *, //, atau %.", "Operator yang membandingkan value dan menghasilkan True atau False.", "and, or, atau not; dipakai untuk menggabungkan atau membalik expression boolean.", "Aturan yang menentukan operasi mana dalam expression yang jalan dulu.", "Value True atau False yang dihasilkan comparison dan expression logical."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Ketuker = dan ==", "Menganggap / dan // sama", "Membaca % sebagai persen", "Lupa precedence", "Mengira comparison menghasilkan teks", "Ketuker and dan or", "Salah pakai not", "Membandingkan tipe yang tidak cocok", "Mengira 10 / 2 itu int"][index] ?? mistake.title,
      explanation: ["= melakukan assignment; == membandingkan dua value. print(age = 18) invalid karena assignment bukan equality expression.", "/ melakukan pembagian biasa dan menghasilkan float. // melakukan floor division.", "Di Python, % menghasilkan sisa. number % 2 bernilai 0 untuk integer genap.", "2 + 3 * 4 adalah 14, bukan 20. Pakai kurung kalau ingin urutan lain.", "age >= 18 menghasilkan boolean True atau False, bukan string yes atau no.", "and mengharuskan kedua sisi True. or cukup minimal satu sisi True.", "not membalik satu expression boolean. Baca not age >= 18 sebagai kebalikan dari age >= 18.", "Python tidak bisa mengurutkan string dan integer dengan < atau >=. Konversi input sebelum comparison angka.", "/ di Python menghasilkan 5.0, sebuah float, walaupun hasil matematikanya bulat."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Expression ini menghasilkan apa?", "Expression mana yang mengecek equality?", "score >= 75 menghasilkan tipe value apa?"][index] ?? check.question,
      explanation: ["Perkalian punya precedence lebih tinggi, jadi 3 * 4 berjalan sebelum ditambah 2.", "== membandingkan value; = menyimpan value dalam variable.", "Comparison expression menghasilkan True atau False, keduanya value boolean."][index] ?? check.explanation,
    })),
  };
}
