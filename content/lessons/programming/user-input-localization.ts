import { userInputActivities } from "./user-input-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const userInputCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what does the program receive after input(\"Age: \") is filled with 20 — and how does it become a number?",
    placeholder: "The program receives..., and to make it a number...",
    oneLine: "Two Python lines",
    diagram: "input() → string → int() → number",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the string result and the two-step conversion, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa yang diterima program setelah input(\"Age: \") diisi 20 — dan bagaimana cara mengubahnya jadi angka?",
    placeholder: "Program menerima..., dan untuk mengubahnya jadi angka...",
    oneLine: "Dua baris Python",
    diagram: "input() → string → int() → angka",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau hasil string-nya dan konversi dua langkah, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Data dari orang yang menjalankannya", content: ["Semua value sejauh ini ditulis langsung di dalam code. Program sungguhan bertanya: siapa nama lu? berapa umur lu? — dan bekerja dengan jawabannya.", "input() adalah cara program menerima data saat berjalan. Dengan itu, program yang sama bekerja untuk semua user, bukan satu value hardcoded."] },
  { title: "INTUITION · Tanya, tunggu, terima", content: ["input() menampilkan prompt, berhenti, dan menunggu user mengetik lalu menekan Enter. Yang diketik menjadi value string, disimpan di variable.", "Perjalanannya lengkap: prompt muncul → user mengetik → string datang → variable menampung → program lanjut."] },
  { title: "SEE · Prompt itu pesan", content: ["String di dalam input() adalah prompt — pesan singkat yang bilang ke user apa yang harus diketik. Itu panduan untuk manusia, bukan data.", "Arahnya penting: input() menarik data masuk dari user; print() mendorong data keluar ke layar. Keduanya adalah dua ujung percakapan program."] },
  { title: "MENTAL MODEL · Masuk, lalu keluar", content: ["input() dan print() adalah tools cermin. Satu menerima; yang lain menampilkan.", "Dan tipenya selalu str: apa pun yang diketik user — digit termasuk — datang sebagai character. Satu fakta ini yang menggerakkan semua isi lesson ini."] },
  { title: "PREDICT · Type apa yang datang?", content: ["User mengetik 20 — digit sungguhan. Apa yang ditunjukkan type(age)?"], explanation: "input() menghasilkan string, titik. Mengetik 20 mengisi age dengan dua character \"20\" — value yang sama dengan string dari lesson Data Types." },
  { title: "INPUT + CASTING · Dua langkah, lalu compact", content: ["Casting dari module lalu adalah bagian yang hilang. Langkah satu: input() menerima \"20\" sebagai teks. Langkah dua: int(age_text) mengubahnya menjadi angka 20.", "Setelah pipeline two-step-nya jelas, Python mengizinkan bentuk compact — age = int(input(\"Age: \")) — dengan konversi membungkus input. Hasil sama, satu baris."] },
  { title: "PREDICT · Bentuk compact", content: ["Bentuk compact menerima sekaligus mengonversi dalam satu baris. User mengetik 7. Apa yang ditampilkan print?"], explanation: "int(input(...)) menerima \"7\" dan langsung mengubahnya menjadi angka 7, jadi age * 2 adalah aritmetika sungguhan: 14. Tanpa konversi, menggabungkan teks akan menghasilkan \"77\"." },
  { title: "SPOT · Value mana yang angka?", content: ["Dua value, dan keduanya terlihat seperti 20 di layar. Variable mana yang menampung angka?"], explanation: "Keduanya string: a ditulis dengan kutip, dan b menerima apa pun yang diketik — sebagai teks. Digit yang diketik tidak pernah mengonversi dirinya sendiri; hanya int() eksplisit yang melakukannya." },
  { title: "TRY · Tanya, lalu tampilkan", content: ["Tulis dua baris: minta nama user dengan sebuah prompt dan simpan di name, lalu print name. Datanya harus datang dari input() — bukan dari value yang ditulis tangan."], explanation: "name = input(\"Name: \") — input() menerima teks yang diketik sebagai string, variable menampungnya, dan print menampilkannya balik." },
  { title: "FORMALIZE · Ujung penerimaan", content: ["input() adalah built-in tool untuk menerima data: argumennya adalah prompt yang ditampilkan ke user, dan hasilnya selalu string — bahkan untuk digit yang diketik.", "Pola two-step membuat pipeline-nya eksplisit: terima teksnya, lalu konversi secara sengaja dengan int() atau float() dari Casting. Bentuk compact int(input(...)) melakukan keduanya dalam satu baris begitu urutannya terasa natural.", "Percakapan program sekarang lengkap dua arah: input() menerima data, program mengolahnya, dan print() menampilkan hasilnya. Berikutnya Conditionals: bagaimana program memutuskan apa yang dilakukan dengan data yang diterimanya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [userInputCopy.id.prompt] },
  { title: "CONNECT · Dari menerima ke memutuskan", content: ["User Input → Conditionals", "Program sekarang bisa menerima data, mengonversinya, menghitung, dan menampilkan hasil. Berikutnya Conditionals: memakai data itu untuk memutuskan apa yang program lakukan — value boolean dari Module 02 akhirnya mendapat tugasnya.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getUserInputActivities(language: LessonLanguage) {
  return userInputActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [userInputCopy[language].prompt] } : {}),
  }));
}

export function localizeUserInputContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Setiap program sejauh ini memakai value yang ditulis langsung di dalam code. User input membuka pintu sebaliknya: program meminta value dari orang yang menjalankannya, saat program berjalan.",
      "input() adalah built-in tool untuk itu: dia menampilkan pesan singkat, menunggu user mengetik, dan menghasilkan value berupa string — selalu string, apa pun yang diketik.",
      "Karena hasilnya string, angka yang diketik user juga datang sebagai teks: mengetik 20 memberi \"20\". Untuk memperlakukannya sebagai angka, konversi eksplisit dari Casting dipakai: int(age_text).",
    ],
    academicExplanation: [
      "input() adalah built-in function yang menerima data dari orang yang menjalankan program. Argumennya adalah prompt — pesan singkat yang ditampilkan ke user — dan hasilnya selalu string berisi apa pun yang diketik.",
      "Hasil string-nya disimpan seperti value lain: name = input(\"Name: \") menunjuk nama ke character yang diketik. Karena mengetik digit menghasilkan character, input seperti 20 datang sebagai \"20\", dan int(age_text) dari lesson Casting adalah cara program mengubahnya secara sengaja menjadi angka 20.",
      "input() dan print() adalah dua arah yang berlawanan dari pipeline yang sama: input() membawa data masuk ke program dari user, print() mengirim data keluar ke layar. Program kini bisa menerima data, mengolahnya, dan menampilkan hasil.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Input dasar", "Input selalu datang sebagai string", "Konversi dua langkah, lalu bentuk compact"][index] ?? example.title,
      explanation: ["Prompt \"Name: \" muncul, user mengetik Arya, dan variable name menampung string \"Arya\". print lalu menampilkannya balik.", "Walaupun user mengetik digit, input() menghasilkan string \"20\". Tipenya mengikuti tool-nya, bukan bentuk karakternya.", "Dua langkah dulu: input() memberi \"20\", lalu int() dari Casting mengubahnya menjadi angka 20. Setelah pipeline itu jelas, bentuk compact menyarangkan panggiatnya — hasil sama, satu baris."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Built-in tool yang menerima data yang diketik user dan menghasilkan string.", "Pesan di dalam input() yang memberi tahu user apa yang harus diketik.", "input() membawa data masuk ke program; print() mengirim data keluar ke layar.", "input() selalu menghasilkan string, walaupun user mengetik digit.", "Menampung input dulu, lalu mengonversinya secara eksplisit: age_text = input(...), age = int(age_text)."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengira digit yang diketik menjadi angka", "Ketuker input dan print", "Hardcode instead of bertanya", "Mengonversi sebelum menampung"][index] ?? mistake.title,
      explanation: ["Mengetik 20 memberi string \"20\". Tanpa int() value itu tetap teks — digitnya tidak mengonversi diri sendiri.", "input() menarik data masuk dari user; print() mendorong data keluar ke layar. Keduanya menunjuk arah yang berlawanan.", "name = \"Arya\" mengabaikan orang di depan keyboard. name = input(\"Name: \") itulah yang benar-benar menerima value-nya.", "Hasil input() harus ditampung dulu (atau langsung dimasukkan ke int()). Urutan two-step — input, lalu konversi — menjaga pipeline tetap terbaca."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["age = input(\"Age: \") dan user mengetik 20. Apa yang ditampung age?", "Untuk apa teks di dalam input(\"Name: \")?", "Baris mana yang benar-benar menerima data dari user?"][index] ?? check.question,
      explanation: ["input() selalu menghasilkan string — digitnya datang sebagai character.", "Argumen string itu adalah prompt: panduan untuk orang yang mengetik, bukan data.", "input() adalah arah yang menarik data masuk; print() mengirim data keluar."][index] ?? check.explanation,
    })),
  };
}

export const userInputMasteryConceptLabels: Record<string, string> = {
  user_input: "Receiving input", input_returns_string: "Input is a string", input_conversion: "Input + casting",
};

export function userInputReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("input_is_number_confusion")) return id
    ? "Cek tool-nya, bukan isinya: apa yang selalu dihasilkan input(), apa pun yang diketik user?"
    : "Check the tool, not the content: what does input() always produce, no matter what the user types?";
  if (result.misconceptions.includes("input_vs_output_confusion")) return id
    ? "Bedakan arahnya: mana yang menarik data masuk dari user, dan mana yang mengirim data keluar ke layar?"
    : "Separate the directions: which one pulls data in from the user, and which sends data out to the screen?";
  if (result.misconceptions.includes("hardcoded_value_confusion")) return id
    ? "Bandingin name = \"Arya\" dengan name = input(\"Name: \"): mana yang benar-benar menerima jawaban user?"
    : "Compare name = \"Arya\" with name = input(\"Name: \"): which one actually receives the user's answer?";
  if (result.misconceptions.includes("conversion_order_confusion")) return id
    ? "Ikuti urutan two-step-nya: apa yang dipegang age_text setelah input, dan apa yang dilakukan int() terhadapnya?"
    : "Follow the two-step order: what does age_text hold after the input, and what does int() do to it?";
  return id
    ? "Restate jalurnya: input() → string → int() → angka. Di titik mana \"20\" masih teks, dan di titik mana dia sudah jadi angka?"
    : "Restate the pipeline: input() → string → int() → number. At which point is \"20\" still text, and at which point is it a number?";
}
