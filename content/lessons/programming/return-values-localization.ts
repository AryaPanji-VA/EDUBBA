import { returnValuesActivities } from "./return-values-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const returnValuesCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what is the difference between print and return inside a function — and where does the returned value go?",
    placeholder: "print is..., while return...",
    oneLine: "Four lines of Python",
    diagram: "parameter → work → return → caller",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the difference between print and return, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa bedanya print dan return di dalam function — dan ke mana value hasil return pergi?",
    placeholder: "print itu..., sedangkan return...",
    oneLine: "Empat baris Python",
    diagram: "parameter → kerja → return → caller",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau bedanya print dan return, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Value yang kembali", content: ["double(5) bisa melakukan kerjanya — tapi sejauh ini function cuma bisa menampilkan sesuatu di layar, nggak bisa menyerahkan hasilnya balik ke program.", "return menutup lingkarannya: function menghitung sebuah value dan mengirimnya balik, jadi caller bisa menampungnya dan memakainya nanti. Itu yang bikin function jadi penyusun yang reusable, bukan sekadar tampilan sekali pakai."] },
  { title: "INTUITION · Masuk, kerja, kembali", content: ["Perjalanannya: value masuk lewat parameter → body bekerja dengannya → return mengirim hasilnya balik → caller menerimanya ke dalam sebuah variable.", "return number * 2 adalah langkah pengiriman: expression-nya dihitung dulu, lalu value jadinya bepergian ke yang memanggil function. result = double(5) menampungnya."] },
  { title: "SEE · print vs return", content: ["Dua function, keduanya \"bilang\" Hello — tapi cuma satu yang ngasih apa pun ke program. greet() menampilkan Hello dan nggak me-return apa pun; panggilannya nggak menyisakan value.", "get_greeting() nggak menampilkan apa-apa dengan dirinya sendiri. return \"Hello\" menyerahkan string itu ke caller, jadi message bisa menampungnya dan program bisa terus bekerja dengannya. print untuk manusia; return untuk program."] },
  { title: "PREDICT · Apa yang mendarat di result?", content: ["Trace perlahan: double(5) menjalankan body, return mengirim sebuah value balik, dan assignment menampungnya. Apa yang ditampilkan print?"], explanation: "double(5) menghitung 5 * 2 dan return menyerahkan 10 ke tempat pemanggilan. Assignment menampungnya di result, dan print menampilkan 10." },
  { title: "PREDICT · Dipakai langsung", content: ["Kali ini tanpa variable — panggilannya duduk di dalam penjumlahan. Apa yang ditampilkan print?"], explanation: "double(3) menjadi 6 tepat di tempatnya berdiri — panggilannya adalah sebuah value. Penjumlahan melihat 6 + 1, jadi print menampilkan 7." },
  { title: "PREDICT · Jalan nggak baris terakhirnya?", content: ["limited(4) dipanggil, dan body-nya punya print di bawah return. Baris itu jalan nggak?"], explanation: "return adalah pintu keluar: limited(4) menyerahkan 8 dan langsung berakhir. Baris print(\"done\") di bawahnya nggak pernah dieksekusi." },
  { title: "TRY · Return, lalu pakai", content: ["Definisikan function triple dengan satu parameter yang me-return number * 3 — value-nya harus keluar lewat return, bukan lewat print di dalam body. Lalu panggil triple(4) dan simpan hasil return-nya di result sebelum di-print, atau langsung print panggilannya."], explanation: "def triple(number): return number * 3 — body menghitung dan me-return value-nya; lalu result = triple(4) menampungnya (atau print(triple(4)) memakainya langsung). print di dalam body cuma menampilkan, nggak mengirim." },
  { title: "FORMALIZE · Sistem pengiriman", content: ["return mengirim sebuah value balik dari function ke caller-nya: input masuk lewat parameter, body mengerjakannya, dan return menyerahkan hasil jadinya ke baris yang memanggil function.", "Value hasil return adalah value biasa: tampung (result = double(5)), pakai di dalam expression yang lebih besar (print(double(5) + 1)), atau teruskan. Sampai di return, function berakhir — baris di bawahnya di dalam body nggak pernah jalan. Dan print bukan return: print menampilkan untuk manusia, return mengirim ke program.", "Function yang nggak pernah return nggak ngasih apa pun buat dipakai caller — kerjanya mati di dalam body. Berikutnya Scope Basics: di mana nama-nama di dalam function tinggal, dan kenapa caller butuh variable sendiri untuk menampung hasilnya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [returnValuesCopy.id.prompt] },
  { title: "CONNECT · Dari return ke penamaan", content: ["Return Values → Scope Basics", "Function sekarang bisa menerima value lewat parameter, mengolahnya, dan menyerahkan hasilnya balik — dan caller menampung hasil itu di variable miliknya sendiri. Berikutnya Scope Basics: kenapa parameter dan variable si caller itu nama yang terpisah dengan masa hidup masing-masing.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getReturnValuesActivities(language: LessonLanguage) {
  return returnValuesActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [returnValuesCopy[language].prompt] } : {}),
  }));
}

export function localizeReturnValuesContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Function sejauh ini bisa menerima value lewat parameter dan menjalankan body-nya. Satu bagian masih kurang: bagaimana hasil kerja function sampai ke baris yang memanggilnya? Di situlah return masuk.",
      "print dan return itu beda jauh. print menampilkan value ke layar — programnya sendiri nggak dapat apa-apa. return menyerahkan value balik ke program: return number * 2 mengirim hasil hitungan ke baris yang memanggil function-nya.",
      "Alurnya gini: value masuk lewat parameter → function bekerja → return mengirim hasilnya balik → caller menerimanya. result = double(5) menampung 10 di result, dan dari situ value bisa dipakai lagi kapan saja.",
    ],
    academicExplanation: [
      "return adalah statement yang mengirim sebuah value balik dari function ke caller-nya. Saat Python sampai di return number * 2, expression-nya dihitung dan diserahkan ke tempat pemanggilan: double(5) adalah expression yang nilainya 10.",
      "Value hasil return berlaku seperti value lain. Dia bisa ditampung (result = double(5)), dipakai langsung di dalam expression yang lebih besar (print(double(5) + 1)), atau diteruskan ke panggilan lain. Sampai di return, function juga langsung berakhir — baris apa pun di bawahnya di dalam body nggak pernah jalan.",
      "print dan return menyelesaikan masalah yang beda: print menampilkan value untuk manusia yang menatap layar; return mengirim value ke programnya sendiri. Function tanpa return nggak ngasih apa pun buat dipakai caller.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Return lalu tampung", "print bukan return", "Pakai hasil return-nya langsung", "Eksekusi berhenti di return"][index] ?? example.title,
      explanation: ["double(5) menjalankan body, menghitung 5 * 2, dan return menyerahkan 10 balik ke panggilannya. Assignment menampungnya: result sekarang berisi 10, dan print menampilkannya.", "greet() menampilkan Hello di layar, tapi programnya sendiri nggak menerima apa pun. get_greeting() nggak menampilkan apa-apa — dia menyerahkan string-nya balik, jadi message bisa menampungnya dan memakainya nanti.", "Panggilannya sendiri adalah sebuah value: double(5) menjadi 10 tepat di tempatnya berdiri, jadi penjumlahan melihat 10 + 1. Menampung dulu itu opsional kalau value-nya langsung dipakai.", "return adalah pintu keluarnya: function menyerahkan 8 dan langsung berakhir. print di bawahnya nggak pernah jalan — di dalam body, nggak ada yang dieksekusi setelah return."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Statement yang menyerahkan sebuah value balik dari function ke tempat dia dipanggil.", "Value yang dikirim function balik lewat return — hasil dari pemanggilannya.", "Baris yang memanggil function; dia menerima apa pun yang di-return function.", "Value yang dihasilkan panggilan, ditampung seperti result = double(5) yang berisi 10.", "print menampilkan value ke layar; return menyerahkan value balik ke program. Dua tugas yang beda.", "Tampung value hasil return di sebuah variable supaya bisa dipakai nanti: result = double(5)."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Print instead of return", "Memanggil tanpa menampung atau memakai hasil return-nya", "Nulis kode setelah return dan mengharapkan dia jalan", "Hardcode hasil akhirnya di luar function", "Mengira return menampilkan sesuatu di layar"][index] ?? mistake.title,
      explanation: ["def double(number): print(number * 2) menampilkan 10 di layar tapi nggak ngasih apa pun ke program. return number * 2 itulah yang menyerahkan value-nya balik.", "double(5) sendirian menghitung 10 lalu membuangnya. Value hasil return harus ditampung atau dipakai — kalau nggak, panggilannya mengerjakan sesuatu sia-sia.", "Eksekusi berhenti di return. Baris apa pun di bawahnya di dalam body nggak pernah jalan.", "result = 10 melewati function sepenuhnya. Function-nya yang harus menghitung dan me-return value-nya; caller cuma menerimanya.", "return itu diam. Nggak ada yang muncul sampai print — atau tampilan lain — menampilkan value hasil return-nya."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Program ini menampilkan apa?", "Apa bedanya print dan return di dalam function?", "Program ini menampilkan apa?"][index] ?? check.question,
      explanation: ["double(5) me-return 10; assignment menampungnya di result, dan print menampilkan value yang sudah ditampung.", "print untuk manusia yang menonton; return untuk program. Hanya return yang ngasih caller value untuk ditampung dan dipakai.", "return mengakhiri function seketika: limited(4) menyerahkan 8, dan baris print(\"done\") di bawahnya nggak pernah dieksekusi."][index] ?? check.explanation,
    })),
  };
}

export const returnValuesMasteryConceptLabels: Record<string, string> = {
  return_values: "Return values", return_vs_print: "print vs return", return_flow: "Return flow",
};

export function returnValuesReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("print_not_return")) return id
    ? "Bedakan dua panahnya: apa yang print() lakukan dengan value, dan apa yang return lakukan dengannya?"
    : "Separate the two arrows: what does print() do with a value, and what does return do with it?";
  if (result.misconceptions.includes("returns_expression_text")) return id
    ? "Ikuti hitungannya: apa hasil number * 2 sebelum return mengirimkannya balik?"
    : "Follow the arithmetic: what does number * 2 evaluate to before return sends it back?";
  if (result.misconceptions.includes("result_unused")) return id
    ? "Value-nya sudah sampai — sekarang dia di mana? Baris mana yang menampung atau memakai hasil return-nya?"
    : "The value arrived — now where is it? Which line stores or uses the returned value?";
  if (result.misconceptions.includes("hardcoded_result")) return id
    ? "Cek siapa yang menghitung: apakah function yang me-return hasilnya, atau angkanya ditulis manual di luar?"
    : "Check who computes: does the function return the result, or was the number written by hand outside it?";
  if (result.misconceptions.includes("value_passed_unchanged")) return id
    ? "Parameter menerima 5 — tapi apa yang function lakukan dengannya sebelum return?"
    : "The parameter receives 5 — but what does the function do with it before return?";
  if (result.misconceptions.includes("code_after_return_runs")) return id
    ? "return adalah pintu keluar: apa yang terjadi pada baris-baris di bawahnya di dalam body?"
    : "return is the exit: what happens to the lines below it inside the body?";
  return id
    ? "Restate jalurnya: parameter → kerja → return → caller. Di titik mana value-nya dihitung, dan di titik mana dia diterima?"
    : "Restate the pipeline: parameter → work → return → caller. At which point is the value computed, and at which point is it received?";
}
