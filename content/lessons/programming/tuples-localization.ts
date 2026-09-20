import { tuplesActivities } from "./tuples-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const tuplesCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what is the difference between a tuple and a list — and why does Python refuse point[0] = 99?",
    placeholder: "A tuple is like..., and Python refuses the change because...",
    oneLine: "Two Python lines",
    diagram: "tuple: (10, 20) · fixed items, indexed",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the list-vs-tuple contrast and the refused assignment, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa beda tuple dan list — dan kenapa point[0] = 99 ditolak Python?",
    placeholder: "Tuple itu kaya..., dan Python nolak perubahannya karena...",
    oneLine: "Dua baris Python",
    diagram: "tuple: (10, 20) · item fixed, ada index",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau kontras list-vs-tuple dan assignment yang ditolak, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Value yang saling terkait", content: ["List bisa berubah; dictionary memetakan key ke value. Tapi ada data yang justru tidak boleh berubah: koordinat (10, 20) ya koordinat — dua valuenya saling terkait, berurutan, selamanya.", "Tuple adalah collection untuk tugas itu: satu kelompok berurutan yang ditulis dengan kurung biasa, yang itemnya tidak dimaksudkan untuk diubah. Item fixed bukan keterbatasan — itu perlindungannya."] },
  { title: "INTUITION · Kurung biasa membangun kelompok", content: ["Kurung biasa adalah tuple literal: value dipisah koma, disimpan dalam satu variable. point menampung kedua value sekaligus sebagai satu kelompok — sebuah koordinat, bukan dua angka lepas.", "Membacanya persis seperti list: point[0] masuk dan mengambil value di posisi 0 — 10. Zero-based, kurung siku, sama dengan Lists. Tidak ada yang baru di sisi membaca."] },
  { title: "SEE · Satu jalan, satu ditolak", content: ["Bentuk statement sama, hasilnya berlawanan. List itu mutable: colors[0] = \"green\" mengganti item di tempat, dan index yang sama setelahnya membaca \"green\".", "Tuple itu fixed: point[0] = 99 tidak valid — Python menolak perubahan itu alih-alih mengganti itemnya. Kurung biasa sudah menjanjikan item fixed, dan Python menepati janjinya. Sederhananya: Python bilang tidak."] },
  { title: "PREDICT · Baca tuple-nya", content: ["Sebuah tuple, lalu satu pembacaan by index. Apa yang ditampilkan print?"], explanation: "Indexing-nya bekerja seperti list: zero-based, kurung siku. point[0] membaca item pertama — 10. Yang beda dari list cuma mutability-nya; urutan dan indexing tidak." },
  { title: "PREDICT · Baris mana yang ditolak?", content: ["Dua collection, dua assignment ke item. Baris mana yang ditolak Python?"], explanation: "List itu mutable: colors[0] = \"green\" mengganti item di tempat. Item tuple fixed: Python menolak point[0] = 99. Sintaks sama, collection berbeda, hasil berlawanan." },
  { title: "SPOT · Collection mana yang cocok?", content: ["Dua data, dua jenis collection. Mana yang cocok dengan TUPLE?"], explanation: "Koordinat adalah kelompok fixed: valuenya saling terkait dan tidak boleh berubah — tuple. To-do list tumbuh dan berubah — list. Kurung berbeda, janji berbeda." },
  { title: "TRY · Bangun tuple, baca satu item", content: ["Tulis dua baris: buat tuple bernama point yang menampung koordinat (10, 20) dalam sebuah tuple literal, lalu print salah satu item-nya by index. Kurung biasa untuk tuple, kurung siku untuk baca — list literal tidak dihitung, dan print tanpa tuple juga tidak."], explanation: "point = (10, 20) lalu print(point[0]) — kurung biasa membangun kelompok fixed-nya, dan index membaca satu item darinya. Python akan menolak point[0] = 99, tapi membaca selalu boleh." },
  { title: "FORMALIZE · Collection yang fixed", content: ["Tuple adalah collection berurutan yang ditulis dengan tuple literal — kurung biasa: point = (10, 20). Dia ordered dan di-index persis seperti list: point[0] membaca item pertama, point[1] item kedua, dihitung dari 0.", "Bedanya, assignment ke item ditolak: point[0] = 99 tidak valid, karena item tuple fixed. Penolakan itu justru fiturnya — value yang tidak boleh berubah, seperti koordinat, jadi mustahil berubah karena kecelakaan.", "Memilih sekarang jadi keputusan desain: kelompok fixed yang saling terkait → tuple; collection yang tumbuh dan berubah → list. Berikutnya Sets: collection yang urutannya tidak penting dan hanya keunikan yang berarti."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [tuplesCopy.id.prompt] },
  { title: "CONNECT · Dari fixed ke unik", content: ["Tuples → Sets", "Tuple mengunci beberapa value dalam urutan: koordinat yang harus tetap koordinat. Berikutnya Sets: collection yang dibuat untuk banyak value yang hanya soal keunikan — tanpa urutan untuk di-index, tanpa duplikat yang dipertahankan.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getTuplesActivities(language: LessonLanguage) {
  return tuplesActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [tuplesCopy[language].prompt] } : {}),
  }));
}

export function localizeTuplesContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "List dan dictionary sudah lu kuasai: list itu kumpulan berurutan yang isinya bisa diubah, dictionary itu pasangan key → value. Tuple melengkapi keluarganya: dia juga kumpulan berurutan, tapi isinya justru tidak dimaksudkan untuk diubah.",
      "point = (10, 20) adalah satu tuple: dua value yang ditulis dalam kurung biasa dan memang seharusnya bersama — sebuah koordinat. Membacanya persis seperti list: point[0] memberi 10, posisi pertama tetap di index 0.",
      "Bedanya satu dan itu penting: colors = [\"red\", \"blue\"] boleh diganti (colors[0] = \"green\" sah), tapi point[0] = 99 ditolak Python. Item tuple fixed — dan justru itu gunanya: value yang tidak boleh berubah jadi tidak bisa berubah.",
    ],
    academicExplanation: [
      "Tuple adalah collection berurutan yang ditulis dengan tuple literal — kurung biasa berisi value yang dipisah koma: point = (10, 20). Satu variable menampung kedua value sebagai satu kelompok yang saling terkait: sebuah koordinat.",
      "Tuple ordered dan di-index persis seperti list: point[0] membaca item pertama (10), point[1] item kedua (20), penghitungan tetap mulai dari 0. Membaca tuple tidak butuh apa pun yang baru — semua aturan indexing dari Lists berlaku apa adanya.",
      "Bedanya ada di mutability. Item list bisa berubah di tempat: colors[0] = \"green\" sah. Item tuple fixed: point[0] = 99 tidak valid — Python menolak perubahan itu. Penolakan itu justru fiturnya: ketika sekumpulan value tidak boleh bergeser atau berubah, tuple membuat perubahannya mustahil, bukan sekadar dilarang.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Tuple literal — pasangan yang fixed", "List vs tuple — satu jalan, satu ditolak", "Membaca kedua item — indexing seperti list", "Mana yang cocok?"][index] ?? example.title,
      explanation: ["Kurung biasa membangun tuple literal: dua value, dipisah koma, disimpan dalam satu variable. point menampung sebuah koordinat — dua value yang saling terkait sebagai satu kelompok.", "Bentuk statement sama, hasilnya berlawanan. List menerima assignment ke item — itemnya bisa berubah. Tuple menolaknya — itemnya fixed, dan justru itu yang dijanjikan kurung biasa.", "Indexing-nya bekerja seperti list: zero-based, kurung siku. point[0] membaca item pertama, point[1] item kedua. Membaca tuple tidak butuh apa pun yang baru dari Lists.", "Koordinat adalah kelompok fixed: valuenya saling terkait dan tidak boleh berubah — tuple. To-do list tumbuh dan berubah seiring waktu — list. Pilih collection yang perilakunya cocok dengan umur datanya."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Collection berurutan yang itemnya tidak dimaksudkan untuk diubah: point = (10, 20) adalah satu tuple berisi pasangan fixed.", "Bentuk kurung biasa yang membangun tuple: (10, 20) — value dipisah koma di dalam parentheses.", "Tuple menjaga valuenya dalam urutan yang jelas, dan indexing membacanya dalam urutan itu — point[0] selalu item pertama.", "Item tuple tidak bisa berubah di tempat: point[0] = 99 ditolak Python. Item fixed adalah fiturnya, bukan keterbatasannya.", "Posisi angka yang dipakai untuk membaca satu item: point[0] membaca yang pertama, point[1] yang kedua — zero-based, sama seperti list.", "Keputusan list-vs-tuple: item list bisa berubah (colors[0] = \"green\" sah); item tuple fixed (point[0] = 99 error)."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Assign ke item tuple dan mengira itu jalan", "Ketuker ( ) dan [ ]", "Mengira tuple tidak berurutan", "Coba menambah item ke tuple", "Lupa kenapa data fixed itu berguna"][index] ?? mistake.title,
      explanation: ["point[0] = 99 terlihat seperti assignment list colors[0] = \"green\" — tapi item tuple fixed. Python menolak perubahan itu alih-alih mengganti itemnya.", "Kurungnya punya arti berbeda: (10, 20) membangun tuple yang itemnya fixed; [10, 20] membangun list yang itemnya bisa berubah. Ditukar, perilakunya ikut tertukar.", "Tuple itu ordered, persis seperti list: point[0] item pertama, point[1] item kedua, dihitung dari 0. Yang beda cuma mutability-nya — bukan urutannya.", "Tuple adalah kelompok fixed: tidak ada append, tidak ada pertumbuhan. Kalau collection-nya harus bertambah — to-do list, scoreboard — dia dari awal memang list.", "Item fixed melindungi value yang tidak boleh berubah: origin (0, 0) tetap (0, 0). Dengan list yang mutable, satu assignment yang salah bisa diam-diam merusak value yang seharusnya permanen."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["point = (10, 20). Apa yang diberikan point[0]?", "colors = [\"red\", \"blue\"] dan point = (10, 20). Baris mana yang ditolak Python?", "Data mana yang cocok dengan tuple?"][index] ?? check.question,
      explanation: ["Tuple ordered dan di-index seperti list: index 0 adalah item pertama, jadi point[0] membaca 10.", "Item list bisa berubah, jadi colors[0] = \"green\" sah. Item tuple fixed — Python menolak point[0] = 99.", "Value fixed yang saling terkait dan tidak boleh berubah cocok dengan tuple. Collection yang tumbuh dan berubah cocok dengan list."][index] ?? check.explanation,
    })),
  };
}

export const tuplesMasteryConceptLabels: Record<string, string> = {
  tuple_literal: "Tuple literal", tuple_indexing: "Reading by index", tuple_immutable: "Fixed items",
};

export function tuplesReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("tuple_item_assignment")) return id
    ? "Bandingin dua assignment-nya: apa yang terjadi pada colors[0] = \"green\", dan apa yang Python lakukan dengan point[0] = 99?"
    : "Compare the two assignments: what happens to colors[0] = \"green\", and what does Python do with point[0] = 99?";
  if (result.misconceptions.includes("tuple_unordered_confusion")) return id
    ? "Cek urutannya: item pertama tuple point = (10, 20) ada di index berapa — dan apa yang diberikan point[1]?"
    : "Check the order: which index holds the first item of point = (10, 20) — and what does point[1] give?";
  if (result.misconceptions.includes("tuple_list_syntax_confusion")) return id
    ? "Perhatikan kurungnya: apa janji di balik (10, 20), dan apa janji di balik [10, 20]?"
    : "Look at the brackets: what does (10, 20) promise, and what does [10, 20] promise?";
  if (result.misconceptions.includes("tuple_growable_confusion")) return id
    ? "Uji pertumbuhannya: apa yang terjadi kalau coba menambah item ke tuple — dan collection jenis apa yang memang dibuat untuk tumbuh?"
    : "Test the growth: what happens if you try to add an item to a tuple — and which collection type is built to grow?";
  return id
    ? "Restate kontrasnya: colors = [\"red\", \"blue\"] vs point = (10, 20). Mana yang itemnya boleh berubah, mana yang fixed — dan kenapa fixed itu justru berguna?"
    : "Restate the contrast: colors = [\"red\", \"blue\"] vs point = (10, 20). Which one's items can change, which is fixed — and why is fixed actually useful?";
}
