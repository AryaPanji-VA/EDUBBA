import { loopsActivities } from "./loops-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
export type { LessonLanguage };

export const loopsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"),
    moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what does Python do when it runs for name in [\"Arya\", \"Bima\", \"Citra\"] — and what does the indented block do?",
    placeholder: "Python takes each value from the list, binds it to name, and then...",
    oneLine: "One for line, one indented body",
    diagram: "for name in [list] → each value → body",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Use the for-loop model to review your explanation, then continue without AI.",
    masteryLoopIteration: "Loop iteration", masteryRangeBoundaries: "Range boundaries",
    masteryWhileCondition: "While condition", masteryCounterAccumulator: "Counter & accumulator",
  },
  id: {
    ...getSharedCopy("id"),
    moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa yang Python lakukan ketika menjalankan for name in [\"Arya\", \"Bima\", \"Citra\"] — dan apa yang dilakukan blok yang menjorok di bawahnya?",
    placeholder: "Python ambil tiap value dari list, taruh di name, lalu...",
    oneLine: "Satu baris for, satu blok menjorok",
    diagram: "for name in [list] → tiap value → body",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penjelasan kamu dengan model for loop, lalu lanjut tanpa AI.",
    masteryLoopIteration: "Iterasi loop", masteryRangeBoundaries: "Batas range",
    masteryWhileCondition: "Kondisi while", masteryCounterAccumulator: "Counter & akumulator",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa pengulangan ada", content: ["Print \"Halo\" lima kali bisa dengan lima baris print. Tapi nyapa tiap nama di daftar kelas — Arya, Bima, Citra, dan tiga puluh lagi — nulis satu print per nama itu nggak mungkin, dan satu perubahan berarti edit di semua baris.", "Pengulangan itu kerjaannya program, bukan jarimu. for loop bilang: untuk tiap value di sequence ini, jalanin blok yang menjorok ini lagi dengan value itu."] },
  { title: "INTUITION · for di atas sebuah list", content: ["for name in [\"Arya\", \"Bima\", \"Citra\"]: artinya: untuk tiap value di list, bind name ke value itu lalu jalanin blok yang menjorok. Iterasi 1: name = \"Arya\". Iterasi 2: \"Bima\". Iterasi 3: \"Citra\".", "Print yang menjorok itu loop body. Semua yang menjorok diulang sekali per value; baris pertama yang nggak menjorok jalan sekali, setelah loop selesai."] },
  { title: "PREDICT · for loop ini menampilkan apa?", content: ["Ikuti loop variable di tiap iterasi. Apa yang tampil?"], explanation: "List-nya punya tiga value, jadi body jalan tiga kali: number = 2, lalu 4, lalu 6. Satu print per value, sesuai urutan list." },
  { title: "PREDICT · Seluruh body ikut diulang", content: ["Kedua print yang menjorok itu satu loop body. Apa output lengkapnya?"], explanation: "Seluruh body diulang per iterasi: iterasi 1 menampilkan Hi lalu !, iterasi 2 menampilkan Hey lalu !. Empat baris, karena body jalan dua kali." },
  { title: "PREDICT · Berapa iterasi?", content: ["Hitung putarannya, bukan hurufnya. Berapa kali print yang menjorok itu jalan?"], explanation: "for loop menjalankan satu iterasi per value di sequence-nya. Tiga value berarti tiga iterasi — panjang nama-namanya nggak ada hubungannya." },
  { title: "TRY · Tulis for loopnya", content: ["Tulis for loop yang melakukan iterasi atas names dan menampilkan tiap nama pakai loop variable-nya. Harus loop sungguhan — deretan print(\"Arya\") / print(\"Bima\") / print(\"Citra\") nggak dihitung."], explanation: "for name in names: me-bind name ke tiap value di list sesuai urutan, dan print(name) yang menjorok diulang sekali per value — tiga iterasi, tiga print." },
  { title: "FORMALIZE · Model for", content: ["for me-bind loop variable ke tiap value dari sequence, sesuai urutan. Satu value berarti satu iterasi: loop atas [\"Arya\", \"Bima\", \"Citra\"] jalan tepat tiga kali, dan di putaran ke-n loop variable memegang value ke-n. Loop tidak mengubah sequence-nya, dan jumlah iterasi sama dengan jumlah value.", "Blok yang menjorok di bawah baris for itu loop body, dan seluruh body diulang per iterasi — dua print yang menjorok berarti dua baris output per iterasi. Baris pertama yang tidak menjorok setelah body bukan bagian dari loop; dia jalan tepat sekali, setelah iterasi terakhir selesai. Setelah loop, loop variable cukup memegang value terakhir yang pernah di-bind ke dia."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [loopsCopy.id.prompt] },
  { title: "CONNECT · Konsep ini nyambung ke mana?", content: ["For Loops → While Loops", "for mengulang untuk item yang sudah jelas: dia jalan lewat sequence yang bisa lu tulis, satu iterasi per value. While Loops akan mengulang selama sebuah kondisi tetap True — buat saat lu nggak bisa daftarin value-nya di depan.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah disimpan supaya bisa lanjut setelah reload."] },
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
    intuitiveExplanation: [
      "Coba lihat ini: for name in [\"Arya\", \"Bima\", \"Citra\"]: lalu print(name) yang menjorok ke bawah. Python ambil value pertama dari list — \"Arya\" — taruh di name, jalanin print. Terus giliran \"Bima\", terus \"Citra\". Tiga kali print, tapi kamu cuma nulis barisnya sekali.",
      "name itu loop variable: dia ganti value di tiap putaran — tiap putaran itu namanya iterasi. Python nggak nebak-nebak; dia jalan sesuai urutan value di list-nya, dari depan sampai habis.",
      "Blok yang menjorok di bawah for itu loop body — badan loopnya. Semua baris yang menjorok ikut diulang di tiap iterasi. Jadi kalau ada kerjaan sama yang harus dilakuin untuk banyak data, satu for sudah cukup.",
    ],
    academicExplanation: [
      "for loop mengulang sebuah blok kode di atas sekumpulan value. Pernyataan for name in [\"Arya\", \"Bima\", \"Citra\"]: melakukan iterasi atas list-nya: di tiap iterasi, Python me-bind loop variable name ke value berikutnya sesuai urutan lalu menjalankan blok menjoroknya sekali. Tiga value di list berarti tepat tiga iterasi: name = \"Arya\", lalu \"Bima\", lalu \"Citra\".",
      "Blok yang menjorok di bawah baris for itu loop body, dan seluruh body diulang per iterasi. Dengan for word in [\"Hi\", \"Hey\"]: diikuti dua print yang menjorok, tiap iterasi menampilkan word saat itu lalu \"!\" — jadi \"!\" tampil dua kali, sekali per iterasi. Baris pertama yang tidak menjorok setelah body bukan bagian dari loop; dia jalan tepat sekali, setelah loop selesai.",
      "Setelah loop berakhir, loop variable tetap memegang value terakhir yang pernah di-bind — tapi pengulangannya sudah selesai. Menulis loop variable lagi setelah loop tidak melanjutkan iterasi; kode yang tidak menjorok jalan sekali.",
      "for itu untuk mengulang di atas item yang sudah jelas — list yang bisa lu tulis. Kalau pengulangannya harus lanjut selama sebuah kondisi masih True, itu tugas while loop yang dibahas di lesson berikutnya.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["for jalan lewat sebuah list", "Angka bekerja dengan cara yang sama", "Body boleh beberapa baris", "Setelah loop jalan sekali"][index] ?? example.title,
      explanation: ["Iterasi 1 me-bind name ke \"Arya\", iterasi 2 ke \"Bima\", iterasi 3 ke \"Citra\". Tiga value, tiga print.", "Loop variable mengambil tiap value sesuai urutan: 2, lalu 4, lalu 6. Tipe value-nya tidak mengubah modelnya.", "Kedua print yang menjorok itu body, jadi keduanya diulang per iterasi: Hi, !, Hey, ! — \"!\" tampil dua kali.", "print(name) menjorok, jadi dia diulang. print(\"Selesai\") tidak menjorok, jadi dia jalan sekali setelah loop berakhir."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Konstruksi yang mengulang blok kode beberapa kali.", "Loop yang melakukan iterasi atas sebuah sequence, menjalankan isinya sekali per value.", "Satu kali jalan melewati isi loop — satu value dari sequence.", "Nama yang menerima value saat ini di tiap iterasi, seperti name pada for name in [\"Arya\", \"Bima\", \"Citra\"].", "Blok yang menjorok di bawah baris for. Seluruh body diulang di tiap iterasi.", "Spasi di awal baris. Indentation-lah yang menandai baris mana yang termasuk loop body."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Hardcoded prints alih-alih loop", "Lupa titik dua", "Body nggak menjorok — atau cuma sebagian", "Ngira loop variable masih berguna setelah loop", "Salah pakai ulang nama loop variable"][index] ?? mistake.title,
      explanation: ["print(\"Arya\") lalu print(\"Bima\") lalu print(\"Citra\") itu mengulang kerja dengan tangan. for loop melakukannya dalam satu body: bind loop variable ke tiap value dan print variable-nya, bukan teksnya.", "for name in [\"Arya\", \"Bima\"] membuka sebuah blok, jadi barisnya harus diakhiri titik dua. Tanpa itu, Python kasih SyntaxError sebelum body-nya jalan.", "Semua yang menjorok di bawah baris for itu body dan ikut diulang; baris yang kehilangan indentation jalan sekali setelah loop. Kalau cuma satu dari dua print yang menjorok, cuma itu yang berulang.", "Setelah iterasi terakhir, name cuma memegang value terakhir (\"Citra\"). Pengulangannya sudah selesai — kode yang tidak menjorok setelah loop jalan sekali dan nggak bisa menelusuri value-value itu lagi.", "Nge-assign loop variable di dalam body tidak mengubah sequence-nya: di iterasi berikutnya Python tetap me-bind dia ke value berikutnya. Dan pakai ulang nama yang sama untuk data lain berarti for loop akan menimpanya di putaran pertamanya."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Ini menampilkan apa?", "List-nya dua value dan body-nya dua print. Apa outputnya?", "Berapa kali print yang menjorok itu jalan?"][index] ?? check.question,
      explanation: ["Dua value di list, dua iterasi: color = \"red\", lalu \"green\". Satu print per value.", "Seluruh body diulang per iterasi: 5 lalu -, lalu 10 lalu -. Dua value × dua print = empat baris.", "Satu iterasi per value di sequence: tiga value, tiga iterasi, tiga print."][index] ?? check.explanation,
    })),
  };
}
