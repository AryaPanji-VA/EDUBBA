import { listsActivities } from "./lists-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const listsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what does it mean that a list's index starts at 0 — and what happens after names[1] = \"Dina\" runs?",
    placeholder: "Index 0 means..., and after names[1] = \"Dina\" runs...",
    oneLine: "Two Python lines",
    diagram: "names[0] → \"Arya\" · index starts at 0",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the zero-based indexing and the in-place mutation, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa artinya list punya index mulai dari 0 — dan apa yang terjadi setelah names[1] = \"Dina\" dijalankan?",
    placeholder: "Index 0 artinya..., dan setelah names[1] = \"Dina\" dijalankan...",
    oneLine: "Dua baris Python",
    diagram: "names[0] → \"Arya\" · index mulai dari 0",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau index yang mulai dari 0 dan penggantian item di tempat, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Satu variable, banyak value", content: ["Semua variable sejauh ini menampung tepat satu value. Nyebut tiga siswa sekelas dan pola itu jebol: name1 = \"Arya\", name2 = \"Bima\", name3 = \"Citra\" — tiga variable lepas, tanpa urutan di antara mereka, dan satu siswa baru berarti mengarang satu nama variable lagi.", "List adalah solusinya: SATU variable yang menampung koleksi value berurutan. Tulis koleksinya sekali, simpan di satu tempat, dan program bisa membaca posisi mana pun, menghitungnya, dan mengubahnya."] },
  { title: "INTUITION · Kurung siku membangun koleksinya", content: ["Kurung siku adalah list literal: value dipisah koma, disimpan dalam satu variable. names menampung ketiga nama sekaligus — bukan tiga variable, satu koleksi.", "names[0] menyelam ke dalam koleksi dan mengambil value di posisi 0. Angka di dalam kurung siku itu adalah index — alamat satu element di dalam list."] },
  { title: "SEE · Posisi ke-1 tinggal di index 0", content: ["List menjaga urutan: \"Arya\" value pertama, \"Bima\" kedua, \"Citra\" ketiga. Tapi index — angka yang dipakai untuk membaca — mulai dari 0: posisi ke-1 itu index 0, posisi ke-2 itu index 1, posisi ke-3 itu index 2.", "Jadi list tiga element punya index 0, 1, 2 — index terakhir selalu satu kurang dari jumlahnya. Meminta names[3] melampaui element terakhir: tidak ada apa-apa di sana, dan Python melaporkan IndexError."] },
  { title: "PREDICT · Baca posisi kedua", content: ["names menampung tiga value berurutan. Apa yang diberikan names[1]?"], explanation: "Zero-based: posisi ke-1 (value pertama) itu index 0, jadi index 1 adalah value kedua — \"Bima\". Menghitung posisi dan menghitung index selalu selisih satu." },
  { title: "PREDICT · Setelah assignment", content: ["List yang sama, satu assignment lewat index. Apa yang ditampilkan print sekarang?"], explanation: "List itu mutable: names[1] = \"Dina\" mengganti element di index 1 di dalam list yang sama. Variable tetap menampung satu koleksi — tapi item keduanya sekarang \"Dina\", dan index yang sama membaca value barunya." },
  { title: "PREDICT · Hitung elementnya", content: ["len() menghitung apa yang ada di dalam list. Apa yang ditampilkan print?"], explanation: "len() menghitung element: 3. Index tertinggi cuma 2 — satu kurang dari jumlahnya, karena hitungannya mulai dari 0 — tapi len() tidak pernah memakai index; dia menghitung item." },
  { title: "TRY · Bangun list-nya, baca satu item", content: ["Tulis dua baris: buat list bernama names berisi tiga nama dalam satu list literal, lalu print salah satu item-nya by index. Satu variable, satu koleksi — tiga variable terpisah tidak dihitung, dan print hardcoded tanpa list juga tidak."], explanation: "names = [\"Arya\", \"Bima\", \"Citra\"] lalu print(names[0]) — literalnya menyimpan ketiga value dalam satu variable berurutan, dan index membacakan satu element dari sana." },
  { title: "FORMALIZE · Koleksi yang berurutan", content: ["List adalah satu koleksi value berurutan dalam satu variable, dibangun dengan list literal: names = [\"Arya\", \"Bima\", \"Citra\"]. Tiap value di dalamnya adalah element, dan element duduk di posisi numerik.", "Posisi itu adalah index, dihitung dari nol: names[0] element pertama, dan index terakhir selalu satu kurang dari len(names). Jumlahnya dan index tertinggi selisih tepat satu — off-by-one itulah bentuk permanen dari zero-based indexing.", "List itu mutable: names[1] = \"Dina\" mengganti element di index itu di tempat, dan index yang sama setelahnya membaca \"Dina\". Dan kalau sebuah posisi kurang bermakna untuk mengalamatkan sebuah value — misalnya lookup by nama, bukan by nomor kursi — sebuah key lebih pas: di situlah Dictionaries melanjutkan."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [listsCopy.id.prompt] },
  { title: "CONNECT · Dari posisi ke key", content: ["Lists → Dictionaries", "List mengalamati item-nya by posisi numerik: names[1] artinya \"slot kedua\", peduli atau tidak slot itu bermakna. Berikutnya Dictionaries: mengalamati value by key yang bermakna — \"Bima\" disimpan di bawah key \"student_2\" — kalau posisi saja kurang ekspresif.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getListsActivities(language: LessonLanguage) {
  return listsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [listsCopy[language].prompt] } : {}),
  }));
}

export function localizeListsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Sejauh ini satu variable cuma menampung satu value. List membuka pintu sebaliknya: satu variable bisa menampung banyak value sekaligus, dalam satu urutan yang rapi.",
      "names = [\"Arya\", \"Bima\", \"Citra\"] adalah satu variable berisi tiga nama. Tiap value punya posisi — dan posisi itu dihitung mulai dari 0: names[0] memberi \"Arya\", names[1] memberi \"Bima\". Jadi posisi ke-1 itu ada di index 0.",
      "List juga bisa berubah: names[1] = \"Dina\" mengganti isinya di tempat. Dan len(names) menghitung isinya — tiga value, hasilnya 3.",
    ],
    academicExplanation: [
      "List adalah satu koleksi value berurutan yang disimpan dalam satu variable. Bentuk literalnya memakai kurung siku: names = [\"Arya\", \"Bima\", \"Citra\"] menunjuk satu variable, names, ke koleksi yang menampung tiga string dalam urutan yang terdefinisi.",
      "Tiap value di dalam list adalah element, dan tiap element duduk di sebuah index — posisi numerik yang dihitung dari nol. names[0] membaca \"Arya\", names[1] membaca \"Bima\": posisi pertama itu index 0, jadi index terakhir dari list tiga element adalah 2, selalu satu kurang dari len(names) yang menghitung element-nya. Mengalamati index melampaui posisi terakhir tidak punya element untuk diberikan, dan Python melaporkan IndexError.",
      "List itu mutable: assignment lewat index, names[1] = \"Dina\", mengganti element di posisi itu di dalam objek list yang sama — variable tetap menunjuk satu koleksi yang isinya berubah. Ketika for loop menyusuri list (for name in names:), dia mengunjungi element-element itu dalam urutan yang sama yang didefinisikan index-indexnya.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu variable, banyak value", "Membaca by index — zero-based", "Item bisa berubah — mutable", "len() menghitung, for menyusuri value-nya"][index] ?? example.title,
      explanation: ["Kurung siku membangun list literal: tiga string value, dipisah koma, disimpan dalam satu variable names. Satu variable, satu koleksi berurutan.", "Index di dalam kurung siku memilih satu element. Hitungannya mulai dari 0: posisi pertama itu index 0, kedua index 1, ketiga index 2. Index terakhir selalu satu kurang dari jumlah element.", "Sebelum assignment, index 1 menampung \"Bima\". names[1] = \"Dina\" mengganti element itu di dalam list yang sama — setelahnya, index yang sama membaca \"Dina\". List itu mutable: item-nya bisa berubah.", "len(names) menghitung element: 3. Dan for name in names: — susuran yang sama dari lesson For Loops — mengunjungi tiap element sesuai urutan list, satu per iterasi."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Satu koleksi value berurutan dalam satu variable, ditulis dengan kurung siku: [\"Arya\", \"Bima\", \"Citra\"].", "Posisi numerik sebuah element di dalam list, ditulis dalam kurung siku: names[0] membaca element pertama.", "Hitungan index mulai dari 0: posisi pertama itu index 0, jadi index terakhir selalu satu kurang dari jumlah element.", "Satu value di dalam list. \"Arya\", \"Bima\", dan \"Citra\" adalah tiga element milik names.", "Item list bisa berubah di tempat: names[1] = \"Dina\" mengganti element di index 1 di dalam list yang sama.", "Built-in tool yang menghitung element sebuah list: len(names) memberi 3 untuk list tiga element."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menghitung posisi dari satu", "Melampaui index terakhir", "Mengira item-nya ter-print satu per satu", "Kehilangan kutip pada item string", "Tiga variable instead of satu list"][index] ?? mistake.title,
      explanation: ["names[1] adalah item KEDUA — \"Bima\", bukan \"Arya\". Item pertama itu names[0], karena hitungan index mulai dari 0.", "List tiga element punya index 0, 1, 2. names[3] meminta posisi yang tidak ada, dan Python melaporkan IndexError.", "print(names) menampilkan list utuhnya — [\"Arya\", \"Bima\", \"Citra\"] — dalam satu baris. Untuk menampilkan satu item, index dia: print(names[0]).", "names = [Arya, Bima, Citra] membuat Python mencari tiga variable. Element string butuh kutip: [\"Arya\", \"Bima\", \"Citra\"].", "name1 = \"Arya\", name2 = \"Bima\", name3 = \"Citra\" adalah tiga value lepas tanpa urutan dan tanpa cara menyusurinya. Satu list menyatukan mereka — berurutan, terhitung. Persis itu tugasnya list ada."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["names = [\"Arya\", \"Bima\", \"Citra\"]. Apa yang diberikan names[0]?", "Setelah names[1] = \"Dina\" dijalankan di atas [\"Arya\", \"Bima\", \"Citra\"], apa yang diberikan names[1]?", "Apa yang dikembalikan len(names) untuk [\"Arya\", \"Bima\", \"Citra\"]?"][index] ?? check.question,
      explanation: ["Index 0 adalah posisi pertama — hitungan zero-based membuat element pertama dibaca dengan names[0].", "Assignment itu mengganti element di index 1 di tempat — list itu mutable, jadi index yang sama sekarang membaca \"Dina\".", "len() menghitung element-nya: tiga value di dalam list, jadi 3 — walaupun index tertingginya cuma 2."][index] ?? check.explanation,
    })),
  };
}

export const listsMasteryConceptLabels: Record<string, string> = {
  list_literal: "One list, many values", zero_based_index: "Zero-based index", list_mutation: "Changing items",
};

export function listsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("one_based_index")) return id
    ? "Pisahkan dua hitungan: posisi ke-1 itu index berapa, dan posisi ke-2 itu index berapa?"
    : "Separate the two counts: which index is position 1, and which index is position 2?";
  if (result.misconceptions.includes("index_out_of_range")) return id
    ? "Cocokkan index dengan jumlahnya: list len(names) = 3 punya index apa saja — dan names[3] minta element ke berapa?"
    : "Match the indexes to the count: which indexes does a list of len(names) = 3 have — and which element does names[3] ask for?";
  if (result.misconceptions.includes("immutable_list_confusion")) return id
    ? "Ikuti assignment-nya: sebelum names[1] = \"Dina\", apa yang dipegang index 1 — dan sesudahnya, apa yang dibaca index yang sama?"
    : "Follow the assignment: before names[1] = \"Dina\", what does index 1 hold — and after it, what does the same index read?";
  if (result.misconceptions.includes("separate_variables_confusion")) return id
    ? "Bandingkan name1, name2, name3 dengan satu names = [...]: mana yang punya urutan dan bisa dihitung len()?"
    : "Compare name1, name2, name3 with one names = [...]: which one has an order and can be counted with len()?";
  return id
    ? "Restate modelnya: satu list, index mulai dari 0, item bisa diganti di tempat, len() menghitung isinya. Di titik mana model itu masih goyang?"
    : "Restate the model: one list, indexes start at 0, items change in place, len() counts them. At which point is that model still shaky?";
}
