import { conditionalsActivities } from "./conditionals-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
export type { LessonLanguage };

export const conditionalsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"),
    moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: when does Python run the if block, when the elif, and when the else?",
    placeholder: "Python checks the condition first...",
    sourceCheck: "Source Mode: no AI evaluation. Use the decision-flow model to review your explanation, then continue without AI.",
    masteryConditionalFlow: "Conditional flow", masteryComparison: "Comparisons",
    masteryBranchSelection: "Branch selection", masteryInputConversion: "Input conversion",
  },
  id: {
    ...getSharedCopy("id"),
    moduleTitle: "Dasar Penyusun Program",
    prompt: "Kenapa Python menjalankan blok if, elif, dan else di waktu yang berbeda?",
    placeholder: "Python ngecek kondisinya dulu...",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penjelasan kamu dengan model alur keputusan, lalu lanjut tanpa AI.",
    masteryConditionalFlow: "Alur kondisional", masteryComparison: "Perbandingan",
    masteryBranchSelection: "Pemilihan cabang", masteryInputConversion: "Konversi input",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa program harus milih", content: ["Program yang selalu ngerjain hal yang sama cuma sebatas naskah. Program beneran biasanya milih: kalau password cocok, izinkan masuk; kalau keranjang kosong, tampilin halaman lain.", "Cara milihnya selalu sama — bikin pertanyaan yang jawabannya True atau False, terus jalanin blok yang cocok."] },
  { title: "INTUITION · if, else, dan blok di bawahnya", content: ["if age >= 18: itu nanya: apakah nilai di age sekurangnya 18? Untuk 20 jawabannya True, jadi baris yang menjorok di bawah if jalan. Blok else cuma nunggu kalau jawabannya False.", "Titik dua nutup pertanyaannya. Menjoroknya itulah yang bikin baris-baris itu jadi isi cabangnya."] },
  { title: "PREDICT · Baris mana yang tampil?", content: ["Pilih output sebelum lihat penjelasannya."], explanation: "82 >= 75 itu True, jadi blok if jalan dan menampilkan Lulus. Blok else dilewati — cuma satu cabang yang pernah jalan." },
  { title: "PREDICT · elif nyangkut di mana?", content: ["Python ngecek kondisi dari atas ke bawah. Print mana yang jalan untuk score 78?"], explanation: "78 >= 90 itu False, jadi Python pindah ke elif. 78 >= 75 itu True, jadi B tampil. Sisanya setelah cabang True yang pertama dilewati." },
  { title: "PREDICT · Hasil perbandingannya apa?", content: ["Perbandingan itu expression — dia menghasilkan value. Boolean apa yang muncul?"], explanation: "17 >= 18 itu False karena 17 lebih kecil. 17 != 18 itu True karena nilainya beda. Tiap perbandingan menghasilkan satu boolean." },
  { title: "TRY · Tulis baris kondisinya", content: ["Tulis baris if lengkap yang jalan ketika score sekurangnya 75. Jangan lupa titik duanya."], explanation: "if score >= 75: itu nanya pertanyaan dan ditutup titik dua untuk membuka blok. Pakai == cuma buat cek kesamaan; >= mencakup 75 dan semuanya di atasnya." },
  { title: "FORMALIZE · Alur keputusan di Python", content: ["Conditional mengevaluasi boolean expression dan menjalankan blok menjorok yang cocok. if ngecek satu kondisi; elif nambahin kondisi berikutnya yang dicek cuma kalau semua kondisi sebelumnya False; else itu cadangan tanpa kondisi.", "Operator perbandingan (==, !=, <, >, <=, >=) menghasilkan boolean yang menggerakkan keputusan ini. Bedakan dengan = yang mengisi nilai. Tepat satu cabang yang jalan: kondisi True yang pertama — atau else kalau tidak ada yang True. Menjorok mendefinisikan baris mana yang masuk cabang mana."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [conditionalsCopy.id.prompt] },
  { title: "CONNECT · Konsep ini nyambung ke mana?", content: ["Conditionals → operators → loops → functions", "Percabangan menentukan apa yang terjadi sekali. Loops nanti pakai ide kondisi yang sama untuk mengulang kerja, dan functions bakal merapikan keduanya di balik sebuah nama.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah disimpan supaya bisa lanjut setelah reload."] },
];

export function getConditionalsActivities(language: LessonLanguage) {
  return conditionalsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [conditionalsCopy[language].prompt] } : {}),
  }));
}

export function localizeConditionalsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Conditional mengontrol alur keputusan: Python mengevaluasi boolean expression — perbandingan yang bernilai True atau False — dan menjalankan blok menjorok hanya ketika hasilnya True.",
      "Operator perbandingan menghasilkan boolean: == (sama), != (tidak sama), < (kurang), > (lebih), <= (kurang atau sama), >= (lebih atau sama). Ingat, == itu bertanya, sedangkan = mengisi nilai; keduanya operator yang berbeda.",
      "if mengecek satu kondisi. elif menambahkan kondisi lain yang dicek hanya ketika semua kondisi sebelumnya False, berurutan dari atas ke bawah. else tidak punya kondisi dan jalan hanya ketika semuanya sebelumnya False. Tepat satu cabang dari rantai if/elif/else yang jalan — kondisi True yang pertama menang, sisanya dilewati.",
      "Blok yang menjorok adalah isi statement di atasnya. Python pakai indentation (4 spasi secara konvensi) alih-alih kurung kurawal; lupa menjorok, atau menjoroknya nggak konsisten, mengubah baris mana yang jadi bagian cabang mana.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu pertanyaan, dua jalur", "elif ngecek berurutan", "Perbandingan menghasilkan boolean", "Input harus dikonversi dulu"][index] ?? example.title,
      explanation: ["age >= 18 untuk 20 itu True, jadi blok if jalan. Blok else dilewati.", "Python ngecek dari atas: 78 >= 90 False, 78 >= 75 True, jadi B tampil. else nggak pernah kejar.", "Tiap perbandingan itu expression yang nilainya True atau False.", "input() mengembalikan string. int() mengubahnya jadi angka supaya perbandingan dengan 18 valid."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Expression yang Python evaluasi jadi True atau False untuk memilih blok yang jalan.", "Menjalankan blok menjoroknya hanya ketika kondisinya True.", "\"Else if\" — ngecek kondisi lain, tapi cuma kalau semua kondisi sebelumnya False.", "Cabang cadangan tanpa kondisi; jalan hanya ketika semua sebelumnya False.", "Expression yang nilainya True atau False, biasanya dibangun dari operator perbandingan.", "Operator yang membandingkan dua value dan menghasilkan boolean: ==, !=, <, >, <=, >=.", "Spasi di awal baris yang menandai baris mana yang masuk blok if/elif/else."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Pakai = padahal maksudnya ==", "Lupa titik dua", "Menjorok nggak konsisten", "Ngebandingin teks input dengan angka", "If tumpang-tindih padahal elif lebih cocok", "Salah baca cabang mana yang jalan"][index] ?? mistake.title,
      explanation: ["= itu mengisi nilai; == itu nanya apakah dua value sama. if age = 18: itu SyntaxError — kondisi harus berupa pertanyaan.", "Tiap baris if, elif, dan else diakhiri :. Titik dua membuka blok menjorok di bawahnya.", "Baris dalam satu blok harus menjorok dengan jumlah yang sama. Nggak konsisten bikin IndentationError atau baris nempel ke cabang yang salah.", "input() mengembalikan string. \"19\" >= 18 bukan perbandingan yang kamu maksud — konversi dulu pakai int(input(...)).", "Dua if terpisah sama-sama dicek, jadi dua blok bisa jalan. Dalam if/elif/else tepat satu cabang jalan — pakai elif kalau pilihannya saling eksklusif.", "Python ngecek kondisi dari atas ke bawah dan jalan di cabang True yang pertama. else nggak jalan kalau ada kondisi sebelumnya yang sudah True."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Ini menampilkan apa?", "Operator mana yang ngecek \"tidak sama\"?", "age = input(\"Umur: \") lalu if age >= 18: — apa yang salah?"][index] ?? check.question,
      explanation: ["20 >= 18 itu True, jadi blok if jalan dan else dilewati.", "!= nanya apakah dua value beda. == nanya apakah sama.", "input() menghasilkan teks. String nggak bisa dibandingkan dengan angka 18 seperti itu — bungkus pakai int()."][index] ?? check.explanation,
    })),
  };
}
