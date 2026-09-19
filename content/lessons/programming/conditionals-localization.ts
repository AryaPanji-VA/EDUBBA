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
  { title: "PREDICT · elif nyangkut di mana?", content: ["Python ngecek kondisi dari atas ke bawah. Print mana yang jalan untuk score 85?"], explanation: "85 >= 90 itu False, jadi Python pindah ke elif. 85 >= 80 itu True, jadi B tampil. Semua setelah cabang True yang pertama dilewati — urutan cabang menentukan pemenangnya." },
  { title: "PREDICT · Hasil perbandingannya apa?", content: ["Perbandingan itu expression — dia menghasilkan value. Boolean apa yang muncul?"], explanation: "17 >= 18 itu False karena 17 lebih kecil. 17 != 18 itu True karena nilainya beda. Tiap perbandingan menghasilkan satu boolean." },
  { title: "TRY · Tulis cabangnya", content: ["Tulis dua baris: baris if yang nanya apakah score sekurangnya 70, dan print(\"Pass\") yang menjorok di bawahnya. print-nya cuma boleh jalan di dalam cabang — print tanpa syarat berarti nggak ada keputusan sama sekali."], explanation: "if score >= 70: itu nanya pertanyaan dan ditutup titik dua; print(\"Pass\") yang menjorok itu isi cabangnya. Tanpa if, print-nya jalan tiap kali dan nggak ada keputusan yang terjadi. Pakai == cuma buat cek kesamaan; >= mencakup 70 dan semuanya di atasnya." },
  { title: "FORMALIZE · Alur keputusan di Python", content: ["Conditional mengevaluasi boolean expression dan menjalankan blok menjorok yang cocok. if ngecek satu kondisi; elif nambahin kondisi berikutnya yang dicek cuma kalau semua kondisi sebelumnya False; else itu cadangan tanpa kondisi.", "Operator perbandingan (==, !=, <, >, <=, >=) menghasilkan boolean yang menggerakkan keputusan ini. Bedakan dengan = yang mengisi nilai. Tepat satu cabang yang jalan: kondisi True yang pertama — atau else kalau tidak ada yang True. Menjorok mendefinisikan baris mana yang masuk cabang mana."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [conditionalsCopy.id.prompt] },
  { title: "CONNECT · Konsep ini nyambung ke mana?", content: ["Conditionals → For Loops (Module 04 · Repetition)", "Percabangan menentukan apakah kode jalan dan cabang mana yang jalan — sekali per alur program. Lanjut ke Repetition: ide kondisi yang sama, tapi kode yang jalan berulang-ulang sampai tugasnya selesai.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah disimpan supaya bisa lanjut setelah reload."] },
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
      "Titik dua setelah kondisi membuka bloknya, dan baris-baris yang menjorok di bawahnya jadi isi statement itu. Python pakai indentation (4 spasi secara konvensi) alih-alih kurung kurawal; lupa titik dua atau lupa menjorok — atau nggak konsisten — mengubah baris mana yang jadi bagian cabang mana.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu pertanyaan, satu jalur", "Satu pertanyaan, dua jalur", "elif ngecek berurutan", "Perbandingan menghasilkan boolean", "Input harus dikonversi dulu"][index] ?? example.title,
      explanation: ["80 >= 70 itu True, jadi print yang menjorok jalan. Kalau kondisinya False, satu blok itu dilewati dan nggak ada yang tampil.", "age >= 18 untuk 20 itu True, jadi blok if jalan. Blok else cuma nunggu jawaban False — cuma satu dari dua jalur yang pernah jalan.", "Python ngecek dari atas: 85 >= 90 False, 85 >= 80 True, jadi B tampil. Cabang True yang pertama menang, sisanya dilewati.", "Tiap perbandingan itu expression yang nilainya True atau False.", "input() mengembalikan string. int() mengubahnya jadi angka supaya perbandingan dengan 18 valid — lalu kondisinya yang milih cabangnya."][index] ?? example.explanation,
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
