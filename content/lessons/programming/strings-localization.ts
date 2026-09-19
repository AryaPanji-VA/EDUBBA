import { stringsActivities } from "./strings-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const stringsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what makes a value a string, and why does name[1] on \"Arya\" give \"r\"?",
    placeholder: "A string is text in quotes, and index 1...",
    oneLine: "One Python line",
    diagram: "\"Arya\" → A r y a → 0 1 2 3",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the string anatomy, indexes, and joining, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa yang membuat sebuah value menjadi string, dan kenapa name[1] pada \"Arya\" hasilnya \"r\"?",
    placeholder: "String itu teks berkutip, dan index 1...",
    oneLine: "Satu baris Python",
    diagram: "\"Arya\" → A r y a → 0 1 2 3",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau anatomi string, index, dan penggabungannya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Teks di mana-mana", content: ["Nama, sapaan, pesan, label — program menyimpan dan membentuk teks terus-menerus. Data Types sudah menyebut tipenya: str.", "Sekarang lihat ke dalamnya: string adalah urutan character dengan posisi, bisa digabung, dan panjangnya bisa diukur."] },
  { title: "INTUITION · Di dalam \"Arya\"", content: ["Kutip membuat teks di antaranya menjadi satu string: empat character, berurutan, dalam satu value.", "Tiap character punya index — posisinya. Dan Python menghitung dari 0: character pertama ada di index 0, bukan 1."] },
  { title: "SEE · Simpan, cetak, kutip", content: ["String tinggal di variable seperti value lain. Kutip dua dan kutip satu sama-sama membuat string — \"Hello\" dan 'Hello' adalah teks yang sama.", "Tanpa kutip, itu bukan teks: name adalah variable yang menampung string, sedangkan \"name\" adalah kata empat huruf."] },
  { title: "MENTAL MODEL · Character dan hitungannya", content: ["Rantainya bertambah: nama → value → character. len() adalah built-in tool — seperti print() dan type() — yang melaporkan berapa character yang string itu tampung.", "Index mulai dari 0, jadi index terakhir dari \"Arya\" adalah 3 — satu kurangnya dari panjang 4. len() menghitung; dia tidak meng-index."] },
  { title: "CONTRAST · + di angka vs + di string", content: ["Simbol yang sama, jenis value berbeda, hasil berbeda: angka menghitung dengan +, string menggabungkan dengan +.", "Itulah kenapa kutipnya penting banget. \"10\" dan \"5\" adalah character — menggabungkannya menghasilkan teks \"105\", bukan angka 15."] },
  { title: "PREDICT · Character yang mana?", content: ["Indexing mengambil satu character. Apa yang dicetak?"], explanation: "word[0] masuk ke dalam string dan mengembalikan satu character: \"P\". Index 0 adalah posisi pertama — Python tidak mulai menghitung dari 1." },
  { title: "PREDICT · index 1 pada \"Arya\"", content: ["Checkpoint klasik. Apa yang muncul?"], explanation: "Index menghitung dari 0: name[0] adalah \"A\" dan name[1] adalah \"r\". Satu character dicetak dengan senang hati, sama seperti string utuh." },
  { title: "PREDICT · Berapa panjangnya?", content: ["len() melaporkan panjang string. Apa yang muncul?"], explanation: "len() menghitung character: P, y, t, h, o, n — enam. Dia menghitung, bukan meng-index: index terakhir string ini adalah 5." },
  { title: "TRY · Gabung sapaannya", content: ["Tulis satu baris print yang menggabungkan first, satu spasi, dan name dengan + — supaya output-nya menjadi Hello Arya."], explanation: "print(first + \" \" + name) — + menyatukan string dari ujung ke ujung, dan \" \" adalah string satu character berisi spasi di antara keduanya." },
  { title: "FORMALIZE · String: ter-index dan tergabung", content: ["String adalah urutan character yang ditulis dalam kutip — kutip dua atau kutip satu. Tiap character punya index yang dihitung dari 0, dan len() melaporkan berapa character yang string itu tampung.", "Tanda + menyatukan string dari ujung ke ujung. Jenis value yang menentukan arti +: angka menghitung, string menggabungkan — \"10\" + \"5\" adalah teks \"105\".", "Semua tipe value dasar Module 02 sekarang lu kenal: int, float, str, bool — dengan angka yang menghitung, casting yang mengonversi, dan string yang meng-index serta menggabungkan. Satu tipe value tersisa: Booleans."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [stringsCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Strings → Booleans → Operators", "Teks sekarang punya struktur: character, index, panjang, dan penggabungan. Satu tipe value menutup Module 02 — Booleans, value True dan False.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getStringsActivities(language: LessonLanguage) {
  return stringsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [stringsCopy[language].prompt] } : {}),
  }));
}

export function localizeStringsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Nama, sapaan, pesan — program penuh teks, dan tipe teks itu string. Lesson ini melihat ke dalamnya: string adalah urutan character, dan tiap character punya posisi.",
      "Kutiplah yang membuat teks menjadi string: \"Arya\" adalah string berisi empat character. Kutip dua atau kutip satu sama-sama bekerja — \"Hello\" dan 'Hello' adalah string yang sama.",
      "Dan string punya dua kemampuan praktis: + menyatukannya (\"Hello\" + \" \" + \"Arya\"), dan tiap character bisa dijangkau lewat index-nya — mulai dari 0, bukan 1.",
    ],
    academicExplanation: [
      "String adalah urutan character. Kutip — kutip dua atau kutip satu — menandai di mana string dimulai dan berakhir, menjadikan character di antaranya satu value str: \"Arya\" adalah character A, r, y, a dalam urutan itu.",
      "Tiap character punya index: posisinya dalam urutan, dihitung dari 0. Di \"Arya\", index 0 adalah \"A\", index 1 adalah \"r\". Built-in function len() mengembalikan berapa character yang string itu tampung — len(\"Arya\") adalah 4.",
      "String digabung dengan +, tanda yang sama dengan yang dipakai angka untuk menghitung. Tipe value yang menentukan apa yang dilakukan +: 10 + 5 menghitung 15, sedangkan \"10\" + \"5\" merekatkan character menjadi \"105\". Simbol sama, tipe berbeda, hasil berbeda.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Anatomi string", "Concatenation menyatukan string", "+ yang sama, tipe berbeda"][index] ?? example.title,
      explanation: ["Kutip membuat \"Arya\" menjadi string empat character. Tiap character punya index — posisinya, dihitung dari 0.", "+ merekatkan string dari ujung ke ujung. \" \" di tengah adalah string satu character berisi spasi antara dua kata itu.", "Simbolnya sama; tipe valuenya yang bukan. Angka menghitung dengan +, string menggabungkan dengan + — dan \"105\" itu teks, bukan angka."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Tipe teks: urutan character yang ditulis dalam kutip.", "Satu simbol di dalam string — huruf, spasi, digit, apa pun.", "Posisi sebuah character dalam string, dihitung dari 0.", "Menyatukan string dari ujung ke ujung dengan +.", "Built-in tool yang melaporkan berapa character yang string itu tampung."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menghitung index dari 1", "Ketuker variable dengan string-nya", "Mengira digit berkutip itu angka", "Mengira len() mulai dari 0"][index] ?? mistake.title,
      explanation: ["Character pertama ada di index 0. Di \"Arya\", name[1] adalah \"r\" — character kedua, bukan yang pertama.", "name adalah variable; \"name\" dalam kutip adalah kata empat huruf. Kutip yang menentukan lu maksud variable atau teksnya.", "\"10\" adalah string dua character, bukan angka. \"10\" + \"5\" menyatukannya menjadi \"105\" — tidak ada perhitungan yang terjadi.", "Index mulai dari 0, tapi len() menghitung character: \"Arya\" punya 4 character, dan index terakhirnya 3."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa yang dikembalikan len(\"Arya\")?", "Apa hasil dari \"Arya\"[0]?", "Apa yang ditampilkan print(\"10\" + \"5\")?"][index] ?? check.question,
      explanation: ["len() menghitung character: A, r, y, a — ada empat.", "Index 0 adalah character pertama — \"A\", bukan \"r\".", "Kedua value itu string, jadi + menggabungkannya: teks \"105\". Hanya angka tanpa kutip yang menghitung."][index] ?? check.explanation,
    })),
  };
}

export const stringsMasteryConceptLabels: Record<string, string> = {
  string_value: "Strings as values", string_concatenation: "Joining strings", string_indexing: "Indexing from 0",
};

export function stringsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("zero_index_confusion")) return id
    ? "Tulis indexnya di bawah tiap huruf \"Arya\": A dapat 0. Kalau A dapat 0, angka berapa yang dapat r?"
    : "Write the index under each letter of \"Arya\": A gets 0. If A gets 0, which number does r get?";
  if (result.misconceptions.includes("variable_vs_string_confusion")) return id
    ? "Bedakan dua halnya: mana variable-nya dan mana string-nya? Apa yang dilakukan [1] pada isi string, dan apa yang ditampilkan hasilnya?"
    : "Separate the two: which one is the variable and which is the string? What does [1] reach into, and what gets printed?";
  if (result.misconceptions.includes("quoted_number_confusion")) return id
    ? "Lihat kutipnya: \"10\" dan 5 — mana yang angka dan mana yang teks? Apa yang dilakukan + pada dua teks?"
    : "Look at the quotes: \"10\" and 5 — which one is a number and which is text? What does + do to two texts?";
  if (result.misconceptions.includes("string_plus_numeric_plus_confusion")) return id
    ? "Tipe value yang menentukan hasil +: angka menghitung, string menggabung. \"10\" dan \"5\" itu tipenya apa, jadi hasilnya apa?"
    : "The values' types decide what + does: numbers calculate, strings glue. What types are \"10\" and \"5\", and so what is the result?";
  return id
    ? "Restate rantainya: kutip → string → character dengan index dari 0. Apa yang diberikan [0], [1], dan len()?"
    : "Restate the chain: quotes → string → characters with indexes from 0. What do [0], [1], and len() each give you?";
}
