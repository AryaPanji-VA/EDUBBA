import { numbersActivities } from "./numbers-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const numbersCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what is the difference between 5 and 5.0 in Python, and what does Python display when print(10 + 5) runs?",
    placeholder: "5 is int, 5.0 is float, and print(10 + 5)...",
    oneLine: "One Python line",
    diagram: "name → number → int / float → calculation",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review int vs float and the basic calculations, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa beda 5 dan 5.0 di Python, dan apa yang Python tampilkan kalau dijalankan print(10 + 5)?",
    placeholder: "5 itu int, 5.0 itu float, dan print(10 + 5)...",
    oneLine: "Satu baris Python",
    diagram: "nama → angka → int / float → hitungan",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau int vs float dan hitungan dasarnya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Angka di mana-mana", content: ["Score, suhu, harga, detik — program penuh angka, dan Data Types sudah menyebut dua jenisnya: int dan float.", "Sekarang lihat lebih dekat: bagaimana Python membedakannya, bagaimana mereka tinggal di variable, dan hasil akhirnya — angka adalah value yang dihitung program."] },
  { title: "INTUITION · Bulat dan desimal", content: ["Angka bulat — positif, nol, atau negatif — itu int. Titik desimal membuat value-nya float. -4 adalah angka biasa: tanda minus cuma bilang di bawah nol.", "Bentuknya yang memutuskan: digit tanpa titik desimal → int; ada titik desimal → float."] },
  { title: "SEE · Angka di dalam variable", content: ["Angka tinggal di variable seperti value lain: nama menunjuk angkanya, dan angkanya punya tipe — score → 100 → int, temperature → 36.5 → float.", "Nggak ada yang baru soal assignment. Yang baru adalah apa yang bisa dilakukan value ini selanjutnya."] },
  { title: "CONTRAST · 5 dan 5.0", content: ["Buat manusia, lima dan lima-koma-nol terbaca sama. Python nggak setuju: 5 disimpan sebagai int, 5.0 sebagai float — titik desimalnya yang mengubah tipenya, bukan besarnya.", "type() menunjukkannya (dengan sedikit hiasan di sekeliling namanya). Membaca bentuknya — ada titik desimal atau nggak? — sudah cukup tanpa menjalankan apa pun."] },
  { title: "MENTAL MODEL · Angka bisa dihitung", content: ["Ini hasilnya: value numerik bisa dihitung. +, -, *, / menggabungkan angka jadi angka baru — 10 + 5 menjadi 15, dan assignment menyimpannya seperti value lain.", "Rantainya lengkap: nama → angka → int atau float → hitungan. Python menghitung dulu, baru menyimpan atau menampilkan hasilnya."] },
  { title: "PREDICT · Apa yang dicetak?", content: ["Reassignment dengan hitungan. Apa yang muncul di layar?"], explanation: "Sisi kanan dihitung dulu: score + 5 membaca 10 yang sekarang dan menghasilkan 15. Reassignment lalu menyimpan 15 balik di bawah nama yang sama. Python mencetak hasilnya — bukan teks perhitungannya." },
  { title: "PREDICT · int atau float?", content: ["Apa type dari value 5.0?"], explanation: "Kuantitasnya sama dengan 5 buat manusia, tapi bentuk tulisannya yang menentukan tipe: titik desimal membuat 5.0 jadi float. Python tidak menyederhanakannya balik jadi int." },
  { title: "TRY · Biarkan Python menghitung", content: ["Tulis satu baris yang menampilkan hasil 10 + 5 — biarkan Python menghitungnya, jangan ketik jawabannya."], explanation: "print(10 + 5) — Python menghitung 10 + 5 dulu dan menampilkan 15. Spasi di sekitar + itu opsional." },
  { title: "FORMALIZE · Dua tipe angka, satu hitungan", content: ["Angka bulat itu int (10, 0, -4); titik desimal membuat value jadi float (3.14, -2.5). 5 dan 5.0 menyebut kuantitas yang sama buat manusia tapi berbeda tipe di Python — bentuk tulisannya yang memutuskan.", "Variable menampung angka seperti value lain: nama → value → tipe. Empat hitungan dasar +, -, *, / mengubah angka menjadi angka baru, dan reassignment bisa menyimpan hasil hitungan balik: score = score + 5.", "Angka negatif itu angka biasa, dan digit berkutip bukan angka — \"5\" itu teks. Angka sekarang punya tipe dan hitungan; lesson berikutnya melihat perpindahan value antar tipe."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [numbersCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Numbers → Casting → Strings → Booleans", "Sekarang lu bisa menyimpan dan menghitung angka. Berikutnya Casting: mengubah value dari satu tipe ke tipe lain — kenapa \"42\" dan 42 kadang perlu bertukar tempat.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getNumbersActivities(language: LessonLanguage) {
  return numbersActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [numbersCopy[language].prompt] } : {}),
  }));
}

export function localizeNumbersContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Data Types sudah memperkenalkan dua tipe angka; lesson ini melihatnya lebih dekat. Angka adalah value yang dihitung program — score, suhu, harga — dan Python memisahkan dua jenisnya: int untuk bulat, float untuk desimal.",
      "Bentuk value memberi tahu tipenya: 10, 0, dan -4 ditulis sebagai int; 3.14, 0.5, dan -2.5 sebagai float. Bahkan -4 adalah angka biasa — tanda minus tidak membuatnya hilang dari dunia numerik.",
      "Dan hasilnya: angka bisa dihitung. 10 + 5, 10 - 5, 10 * 2, 10 / 2 — Python menghitung hasilnya, dan hasilnya sendiri adalah angka.",
    ],
    academicExplanation: [
      "Python merepresentasikan angka bulat sebagai int (10, 0, -4) dan angka dengan titik desimal sebagai float (3.14, 0.5, -2.5). Bentuk tulisannya menentukan tipenya: 5 dan 5.0 menyebut kuantitas yang sama buat manusia, tapi Python menyimpan satu sebagai int dan yang lain sebagai float.",
      "Variable menampung value numerik seperti value lain: nama menunjuk angkanya, dan angkanya punya tipe — nama → value → tipe. Reassignment bisa menyimpan angka hasil hitungan baru di bawah nama yang sudah ada.",
      "Angka mendukung perhitungan. Empat operasi dasar — +, -, *, / — menggabungkan value numerik menjadi value numerik baru: 10 + 5 adalah 15, dan menyimpan hasilnya ke dalam variable bekerja persis seperti assignment lain.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Bulat dan desimal", "5 dan 5.0 adalah tipe berbeda", "Angka di variable, lalu dihitung"][index] ?? example.title,
      explanation: ["Bentuknya menyebut tipenya: angka bulat (positif, nol, atau negatif) itu int; titik desimal membuat value-nya float.", "Buat manusia keduanya terbaca lima, tapi Python menyimpan 5 sebagai int dan 5.0 sebagai float. Kuantitas sama, representasi berbeda. (Python mencetak detail tambahan di sekeliling namanya — bagian int / float itu yang penting.)", "Variable menampung value numerik seperti value lain. Empat hitungan dasar — +, -, *, / — mengubah angka menjadi angka baru, dan assignment menyimpannya di bawah sebuah nama."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Tipe untuk angka bulat: 10, 0, -4.", "Tipe untuk angka yang ditulis dengan titik desimal: 3.14, 0.5, -2.5.", "Menggabungkan value numerik dengan +, -, *, / menjadi angka baru.", "Menyimpan angka hasil hitungan balik di bawah nama yang sudah ada: score = score + 5."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menyebut 5.0 sebagai int", "Menganggap angka negatif bukan angka", "Menaruh kutip di angka", "Mengira teks hitungannya yang dicetak"][index] ?? mistake.title,
      explanation: ["Value-nya terbaca lima, tapi titik desimal membuatnya float. 5 dan 5.0 adalah tipe berbeda di Python.", "-4 adalah int yang sah. Tanda minus cuma bilang value-nya di bawah nol.", "\"5\" berkutip, jadi itu string berisi karakter — bukan angka. Hanya 5 tanpa kutip yang int.", "print(10 + 5) tidak menampilkan \"10 + 5\". Python menghitung dulu dan menampilkan hasilnya: 15."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa type dari 5.0?", "Apa yang ditampilkan print(10 * 2)?", "Apa type dari -4?"][index] ?? check.question,
      explanation: ["Titik desimal membuatnya float, walaupun value-nya terbaca lima.", "Python menghitung dulu: 10 * 2 adalah 20, dan hasil itulah yang dicetak.", "-4 adalah angka bulat — negatif, tapi tetap int."][index] ?? check.explanation,
    })),
  };
}

export const numbersMasteryConceptLabels: Record<string, string> = {
  numeric_values: "Numbers as values", integer_float: "int vs float", basic_calculation: "Basic calculation",
};

export function numbersReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("float_as_int_confusion")) return id
    ? "Bandingin bentuk tulisannya: 5 dan 5.0. Bagian mana yang membuat Python menyimpannya sebagai tipe berbeda?"
    : "Compare the two written forms: 5 and 5.0. Which part makes Python store them as different types?";
  if (result.misconceptions.includes("negative_not_numeric_confusion")) return id
    ? "Cek -4: apakah dia bulat? Apakah dia angka? Apa sebenarnya arti tanda minusnya?"
    : "Check -4: is it whole? Is it a number? What does the minus sign actually say?";
  if (result.misconceptions.includes("quoted_number_confusion")) return id
    ? "Bandingin 5 dan \"5\": mana yang angka, mana yang teks? Apa yang bikin bedanya?"
    : "Compare 5 and \"5\": which one is a number, which one is text? What makes the difference?";
  if (result.misconceptions.includes("calculation_result_confusion")) return id
    ? "Jalankan barisnya di kepala: score + 5 dibaca dulu pakai nilai sekarang, lalu hasilnya disimpan balik. Berapa hasilnya?"
    : "Run the line in your head: score + 5 is read with the current value first, then the result is stored back. What is the result?";
  return id
    ? "Restate rantainya: nama → angka → int atau float → hitungan. Di titik mana 5 dan 5.0 berpisah jalannya?"
    : "Restate the chain: name → number → int or float → calculation. At which point do 5 and 5.0 take different paths?";
}
