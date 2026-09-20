import { dictionariesActivities } from "./dictionaries-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const dictionariesCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: how do a list and a dictionary differ in the way they store values — and how does student[\"name\"] retrieve its value?",
    placeholder: "A list stores values by..., a dictionary stores values by...",
    oneLine: "Two Python lines",
    diagram: "list: position → value · dict: key → value",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the key → value model and the retrieval by key, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa beda cara list dan dictionary menyimpan value — dan bagaimana cara mengambil value dari student[\"name\"]?",
    placeholder: "List nyimpen value pakai..., dictionary nyimpen value pakai...",
    oneLine: "Dua baris Python",
    diagram: "list: posisi → value · dict: key → value",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau model key → value dan pengambilan value pakai key, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Value dengan label, bukan posisi", content: ["List dari lesson lalu menyimpan satu kumpulan berurutan: minta pakai posisi — names[0] — dan dapat apa pun yang ada di situ. Tapi banyak data bukan soal posisi. Seorang student punya name dan score, dan tiap label punya arti.", "Dictionary menyimpan tiap value di bawah sebuah key yang bermakna. student = {\"name\": \"Arya\", \"score\": 90} menjawab \"apa nama-nya?\" dan \"berapa score-nya?\" — tanya pakai arti, bukan menghitung."] },
  { title: "INTUITION · Tempelkan value ke key-nya", content: ["Dictionary literal ditulis {key: value, key: value}: tiap pasangan menempelkan satu value ke satu key, dan seluruh mapping-nya hidup dalam satu variable.", "Pengambilan membalik arahnya: student[\"name\"] menyerahkan key \"name\" ke dictionary dan mendapat value \"Arya\" balik. Kurung sikunya terlihat familiar — bedanya ada di isi di dalamnya: sebuah key, bukan posisi."] },
  { title: "MENTAL MODEL · key → value", content: ["Satu benang kontras dari Lists, lalu lesson ini berdiri sendiri: list adalah satu kumpulan berurutan yang dialamat pakai posisi angka; dictionary adalah satu kumpulan yang dialamat pakai key.", "Model mentalnya key → value. Key itu alamatnya, value itu yang disimpan di sana — dan alamatnya adalah arti yang lu pilih, seperti \"name\", bukan angka yang dihitung."] },
  { title: "PREDICT · Baca satu value", content: ["Dictionary-nya memuat dua pasangan key-value. Apa yang ditampilkan print(student[\"score\"])?"], explanation: "Kurung sikunya membawa key \"score\", dan dictionary mengembalikan value yang disimpan di bawahnya: 90. Nggak perlu menghitung — key-nya adalah seluruh alamatnya." },
  { title: "PREDICT · Ubah satu key", content: ["Literal-nya menyimpan 90, lalu satu assignment berjalan. Apa yang ditampilkan print(student[\"score\"]) sekarang?"], explanation: "Menulis ke key yang sudah ada mengganti value-nya: score sekarang 95. Sintaks yang sama juga menambah key yang belum ada — satu bentuk, dua tugas." },
  { title: "SPOT · Alamat mana yang cocok?", content: ["Dua kumpulan, dua jenis alamat. Baris mana yang memakai gaya akses yang cocok dengan kumpulannya?"], explanation: "List adalah satu kumpulan berurutan yang dialamat pakai posisi: names[0] artinya \"yang pertama\". Dictionary dialamat pakai key: student[\"name\"] artinya \"nama-nya\". Menukar kedua gaya itu gagal dua arah." },
  { title: "TRY · Simpan pakai key, baca pakai key", content: ["Tulis dua baris: bikin dictionary bernama student dengan minimal satu pasangan key-value (misalnya \"name\": \"Arya\"), lalu print salah satu value-nya pakai key — student[\"key\"]. Variable terpisah seperti name = \"Arya\" nggak dihitung: value-nya harus hidup di dalam dictionary, di bawah key."], explanation: "student = {\"name\": \"Arya\", \"score\": 90} — literal-nya menyimpan tiap value di bawah key-nya, dan print(student[\"name\"]) mengambilnya pakai arti, bukan posisi." },
  { title: "FORMALIZE · Kumpulan key → value", content: ["Dictionary adalah kumpulan pasangan key → value: {\"name\": \"Arya\", \"score\": 90} menyimpan tiap value di bawah key string yang bermakna, dan seluruh mapping-nya hidup dalam satu variable.", "Untuk data berlabel, key yang bermakna mengalahkan posisi angka: names[0] bilang \"yang pertama\", student[\"name\"] bilang \"nama-nya\". Sintaks kurung siku yang sama juga menulis — student[\"score\"] = 95 mengubah value di bawah key yang sudah ada, atau menambah key baru.", "Berikutnya Tuples: kalau dictionary melabeli value yang bisa berubah, tuple mengelompokkan beberapa value tetap yang memang satu kesatuan — dan nggak pernah berubah."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [dictionariesCopy.id.prompt] },
  { title: "CONNECT · Dari melabel ke mengelompokkan", content: ["Dictionaries → Tuples", "Dictionary melabeli tiap value dengan key: tanya pakai arti, dapat value-nya balik, ubah pas dia berubah. Berikutnya Tuples: mengelompokkan beberapa value tetap yang memang satu kesatuan dan nggak pernah berubah — kebalikan dari key dictionary yang luwes.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getDictionariesActivities(language: LessonLanguage) {
  return dictionariesActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [dictionariesCopy[language].prompt] } : {}),
  }));
}

export function localizeDictionariesContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Lesson lalu, list nyimpen satu kumpulan value dalam satu urutan: diambil pakai posisi, names[0]. Tapi banyak data bukan soal posisi — nama, nilai, umur. Tiap label punya arti. Dictionary nyimpen value pakai key yang bermakna.",
      "student = {\"name\": \"Arya\", \"score\": 90} bikin dictionary: tiap pasangan key: value nempel satu value ke satu key. student[\"name\"] ngambil value-nya pakai key-nya — bukan posisi.",
      "student[\"score\"] = 95 memakai kurung siku yang sama untuk mengubah value di sebuah key — atau menambah key baru kalau belum ada. Bedanya sama list ada di cara akses: list pakai posisi, dictionary pakai arti.",
    ],
    academicExplanation: [
      "Dictionary adalah kumpulan yang menyimpan value di bawah key yang bermakna, bukan posisi angka. Kalau list menjawab \"apa yang ada di posisi 0?\", dictionary menjawab \"apa yang disimpan di bawah key ini?\".",
      "Literal {\"name\": \"Arya\", \"score\": 90} membangun mapping key → value: tiap pasangan menempelkan satu value ke satu key, dan seluruh mapping-nya hidup dalam satu variable. student[\"name\"] mengambil pakai key — kurung sikunya membawa key, dan expression-nya mengevaluasi ke value yang disimpan di bawahnya.",
      "Sintaks kurung siku yang sama juga menulis: student[\"score\"] = 95 mengganti value di bawah key yang sudah ada, atau menambah key-nya kalau belum ada. Lesson ini menjaga gambaran pemula — key string, satu dictionary datar, pengambilan pakai key.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Dictionary inti", "Ambil pakai key", "Ubah satu key", "List vs dictionary"][index] ?? example.title,
      explanation: ["Literal-nya menyimpan dua pasangan key-value dalam satu variable. student[\"name\"] meminta key \"name\" dan dictionary menyerahkan \"Arya\" balik.", "Tiap pengambilan membawa key yang berbeda ke dalam kurung siku, jadi tiap print menampilkan value yang disimpan di bawah key itu. Key-nya adalah seluruh alamat — nggak ada menghitung.", "Sebelumnya: score 90. Sesudahnya: student[\"score\"] = 95 mengganti value di bawah \"score\". Sintaks yang sama juga menambah key yang belum ada di dictionary — satu bentuk, dua tugas.", "List adalah satu kumpulan berurutan yang dialamat pakai posisi angka: names[0] artinya \"yang pertama\". Dictionary dialamat pakai arti: student[\"name\"] artinya \"nama-nya\". Kurung siku sama, jenis alamatnya beda."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Kumpulan yang menyimpan value di bawah key yang bermakna, bukan posisi angka.", "Alamat yang bermakna untuk satu value — di sini, string seperti \"name\" atau \"score\".", "Data yang disimpan di bawah sebuah key; yang dictionary serahkan balik saat ditanya.", "Satu entri \"key\": value di dalam literal — unit pembangun sebuah dictionary.", "Membaca value balik dengan key di dalam kurung siku: student[\"name\"].", "Menulis dengan sintaks kurung siku yang sama: student[\"score\"] = 95 mengganti value di bawah key yang sudah ada, atau menambah key baru."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Memakai posisi di dictionary — atau key di list", "Lupa kutip di key string", "Mengambil key yang nggak ada di dictionary", "Mengira key adalah posisi berurutan", "Bikin dictionary palsu dari variable terpisah"][index] ?? mistake.title,
      explanation: ["student[0] mencari posisi 0 di kumpulan yang punya key, bukan posisi; names[\"Arya\"] mencari key di kumpulan yang punya posisi. Tiap kumpulan hanya menjawab jenis alamatnya sendiri.", "student[name] mencari variable bernama name; student[\"name\"] mencari key \"name\". Tanpa kutip, Python membaca kata itu sebagai variable — bukan key yang lu maksud.", "student[\"grade\"] gagal kalau literal-nya hanya menyimpan \"name\" dan \"score\". Dictionary hanya bisa mengembalikan key yang benar-benar disimpan — selain itu nggak keluar.", "\"score\" bukan \"item kedua\". Key-nya adalah seluruh alamat: yang penting arti yang lu tulis, bukan di mana pasangannya kebetulan berada di antara kurung kurawal.", "name = \"Arya\" dan score = 90 adalah dua kotak terpisah — nggak ada key, nggak ada pengelompokan. Hanya {\"name\": \"Arya\", \"score\": 90} yang menyimpan value-nya di bawah key dalam satu kumpulan."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["student = {\"name\": \"Arya\", \"score\": 90}. Apa yang diberikan student[\"score\"]?", "Setelah student[\"score\"] = 95, apa yang diberikan student[\"score\"]?", "Akses mana yang cocok untuk dictionary?"][index] ?? check.question,
      explanation: ["Kurung sikunya membawa key \"score\"; dictionary mengembalikan value yang disimpan di bawahnya — 90.", "Sintaks kurung siku yang sama yang menyimpan juga mengubah: menulis ke key yang sudah ada mengganti value-nya.", "Dictionary dialamat pakai key. Posisi itu milik list, dan dictionary nggak dipanggil seperti function."][index] ?? check.explanation,
    })),
  };
}

export const dictionariesMasteryConceptLabels: Record<string, string> = {
  key_value_model: "Key → value model", key_retrieval: "Retrieve by key", dict_update: "Update a key",
};

export function dictionariesReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("position_on_dict_confusion")) return id
    ? "Cek alamatnya: list dijawab pakai posisi angka, dictionary dijawab pakai key — student[0] nyari apa, student[\"name\"] nyari apa?"
    : "Check the address: a list is answered by numeric position, a dictionary by key — what does student[0] ask for, and what does student[\"name\"] ask for?";
  if (result.misconceptions.includes("unquoted_key_confusion")) return id
    ? "Bandingin student[name] dengan student[\"name\"]: mana yang membaca variable, dan mana yang membaca key-nya?"
    : "Compare student[name] with student[\"name\"]: which one reads a variable, and which one reads the key?";
  if (result.misconceptions.includes("missing_key_confusion")) return id
    ? "Liat literal-nya lagi: key apa saja yang benar-benar disimpan, dan apa yang terjadi kalau lu minta key yang nggak disimpan?"
    : "Look at the literal again: which keys were actually stored, and what happens if you ask for a key that was never stored?";
  if (result.misconceptions.includes("separate_variables_confusion")) return id
    ? "Bandingin name = \"Arya\" dan score = 90 dengan student = {\"name\": \"Arya\", \"score\": 90}: mana yang benar-benar menyimpan value di bawah key?"
    : "Compare name = \"Arya\" and score = 90 with student = {\"name\": \"Arya\", \"score\": 90}: which one actually stores values under keys?";
  return id
    ? "Restate modelnya: key → value. Key apa yang lu simpan, dan bagaimana student[\"key\"] mengembalikan value-nya balik?"
    : "Restate the model: key → value. Which key did you store, and how does student[\"key\"] hand the value back?";
}
