import { booleansActivities } from "./booleans-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const booleansCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what is the difference between True and \"True\", and where can a True value come from?",
    placeholder: "True is the boolean value, while \"True\"...",
    oneLine: "Two Python lines",
    diagram: "is_online → True → bool",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the two boolean literals and the comparison results, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa beda True dan \"True\", dan dari mana value True bisa berasal?",
    placeholder: "True itu value boolean-nya, sedangkan \"True\"...",
    oneLine: "Dua baris Python",
    diagram: "is_online → True → bool",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau dua literal boolean dan hasil perbandingannya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Dua keadaan, satu tipe", content: ["Program mengingat keadaan: online atau offline, login atau belum, akses diberikan atau ditolak. Semuanya situasi ya/tidak.", "Tipe boolean menampung tepat itu: dua value, True dan False. Ini tipe value dasar terakhir di Module 02."] },
  { title: "INTUITION · Hanya dua value", content: ["bool punya tepat dua value: True dan False. Keduanya diawali huruf besar — ejaannya adalah bagian dari tipenya.", "Variable yang menampung boolean mendeskripsikan sebuah keadaan, dan namanya biasanya menyebut keadaan itu: is_online, is_logged_in, has_access."] },
  { title: "SEE · Boolean di variable", content: ["Rantai yang sama tetap berlaku: is_online → True → bool. Variable menunjuk value, dan value punya tipenya.", "type(True) mengonfirmasinya — dan perhatikan apa yang Python tampilkan di sekeliling namanya: bagian bool itulah yang penting."] },
  { title: "MENTAL MODEL · Nama yang terbaca sebagai keadaan", content: ["Nama boolean sering diawali is atau has — is_ready, has_access — karena value mendeskripsikan keadaan, dan nama bertanya tentang keadaan yang dijawab value itu.", "Rantainya sama dengan semua value sejauh ini: variable → value → tipe. Hanya valuenya yang istimewa: ada tepat dua."] },
  { title: "CONTRAST · True dan \"True\"", content: ["Kutip mengubah apa pun menjadi teks: \"True\" adalah string yang mengeja kata itu. Kapitalisasi juga penting — true huruf kecil bukan value Python sama sekali.", "Literal boolean-nya persis True dan False. Selebihnya — \"True\", \"False\", true, false — adalah string atau ejaan yang tidak dikenali."] },
  { title: "PREDICT · Apa yang muncul?", content: ["Boolean di dalam variable, dicetak. Apa yang muncul di layar?"], explanation: "print menampilkan value yang tersimpan persis seperti adanya: boolean False, tanpa kutip. Mencetak tidak pernah mengubah value menjadi teks berkutip." },
  { title: "PREDICT · Hasil perbandingan", content: ["Perbandingan bertanya tentang value. Apa yang dicetak ini?"], explanation: "score > 5 membandingkan dua angka dan menghasilkan boolean True. Hasil perbandingan itulah yang dicetak — jawaban sebuah pertanyaan juga data." },
  { title: "PREDICT · = atau ==?", content: ["Satu tanda sama dengan meng-assign, dua tanda membandingkan. Apa yang dicetak ini?"], explanation: "Satu = meng-assign value ke nama; == membandingkan dua value dan menghasilkan boolean. age == 20 bertanya \"apakah age 20?\" — dan jawabannya True." },
  { title: "PREDICT · type dari \"False\"", content: ["Value-nya berkutip. Apa yang ditunjukkan inspeksinya?"], explanation: "Kutip selalu menang: \"False\" adalah string lima character, bukan boolean. Hanya False tanpa kutip — huruf F besar — yang menjadi value bool." },
  { title: "TRY · Tampung keadaan di variable", content: ["Tulis assignment yang memasukkan boolean True ke is_online, supaya print di bawahnya menampilkan True. Perhatikan ejaannya — dan jangan beri kutip."], explanation: "is_online = True — literal boolean dengan huruf T besar, disimpan di variable yang namanya terbaca sebagai keadaan. Dengan kutip, \"True\" justru menjadi string." },
  { title: "FORMALIZE · Tipe dua value", content: ["bool adalah tipe data dengan tepat dua value: True dan False. Keduanya diawali huruf besar — ejaan huruf kecil tidak dikenali — dan kutip mengubahnya menjadi string: \"True\" itu str, bukan bool.", "Nama variable untuk boolean sering terbaca sebagai keadaan: is_online, has_access, is_ready. Value menjawab keadaan yang namanya deskripsikan.", "Perbandingan menghasilkan boolean: > dan < menanyakan mana yang lebih besar, == menanyakan apakah dua value sama, dan hasilnya selalu True atau False. Ingat pemisahan tandanya: = meng-assign, == membandingkan. Perangkat operator lengkap mendapat lesson sendiri di module berikutnya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [booleansCopy.id.prompt] },
  { title: "CONNECT · Module 02 selesai", content: ["Booleans → Module 03: Program Logic (Operators)", "Module 02 menjawab pertanyaan besar: data apa yang dipegang program? Lu sekarang tahu value, variable, empat tipe dasar, casting, dan perilaku teks serta angka. Module 03 mulai menjawab yang berikutnya: apa yang bisa program lakukan dengan data itu? Lesson pertamanya, Operators, melihat perhitungan dan perbandingan secara lengkap — termasuk tanda-tanda yang barusan lu temui.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getBooleansActivities(language: LessonLanguage) {
  return booleansActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [booleansCopy[language].prompt] } : {}),
  }));
}

export function localizeBooleansContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Program mengingat keadaan: online atau offline, login atau belum, akses diberikan atau ditolak. Tipe boolean merepresentasikan tepat keadaan-keadaan itu — dia hanya punya dua value, True dan False.",
      "Ejaannya penting: True dan False diawali huruf besar. Menulis true atau false bukan boolean, dan memberi kutip — \"True\" — mengubahnya menjadi teks.",
      "Boolean juga punya sumber alami: membandingkan value. 5 > 3 bertanya apakah lima lebih besar dari tiga, dan jawabannya adalah boolean True. Perbandingan adalah pertanyaan, dan jawabannya True atau False.",
    ],
    academicExplanation: [
      "bool adalah tipe data dengan tepat dua value: True dan False. Keduanya ditulis dengan huruf pertama kapital — true atau false huruf kecil bukan boolean — dan kutip mengubahnya menjadi string: \"True\" adalah str, bukan bool.",
      "Variable menampung boolean seperti value lain, dan namanya sering terbaca sebagai keadaan yang dideskripsikan: is_online, is_logged_in, has_access. Rantainya tetap sama: is_online → True → bool.",
      "Perbandingan menghasilkan boolean. Expression 5 > 3 membandingkan dua angka dan menghasilkan True; 5 == 2 menghasilkan False. Perhatikan dua tandanya: satu = meng-assign value ke nama, sedangkan == membandingkan dua value dan menghasilkan True atau False.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Boolean sebagai keadaan", "True vs \"True\"", "Perbandingan menghasilkan boolean"][index] ?? example.title,
      explanation: ["Tiap variable menampung salah satu dari dua value boolean. Namanya terbaca sebagai keadaan yang dideskripsikan — kebiasaan penamaan yang membantu untuk variable boolean.", "Kapitalisasi dan kutip sama-sama penting: True adalah value boolean-nya; \"True\" adalah teks yang mengejanya; true huruf kecil tidak dikenali Python sama sekali.", "Perbandingan bertanya tentang value, dan hasilnya boolean. Perhatikan bedanya: age = 20 meng-assign; age == 20 membandingkan."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Tipe data dengan tepat dua value: True dan False.", "Bentuk tulisan sebuah boolean: True atau False, dengan huruf pertama kapital.", "Keadaan yang diingat program — online, login, punya akses — sering ditampung di variable boolean.", "Pertanyaan tentang dua value, seperti > atau ==, yang menghasilkan hasil boolean.", "= meng-assign value ke nama; == membandingkan dua value dan menghasilkan True atau False."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Memberi kutip pada boolean", "Menulis true huruf kecil", "Memakai = saat bermaksud ==", "Melupakan hasil perbandingan sebagai value"][index] ?? mistake.title,
      explanation: ["\"True\" adalah string yang mengeja kata itu — bukan value boolean. Hanya True tanpa kutip yang merupakan bool.", "Python membaca ejaan secara persis: literal boolean-nya adalah True dan False dengan huruf pertama kapital.", "= meng-assign value ke nama. == membandingkan dua value dan menghasilkan boolean. Keduanya mirip dan mengerjakan hal yang berbeda.", "score > 5 menghasilkan boolean True atau False — sebuah value yang bisa dicetak dan disimpan, sama seperti angka atau teks."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Berapa banyak value yang dimiliki tipe boolean?", "Apa tipe dari \"False\"?", "age = 20. Apa yang ditampilkan print(age == 20)?"][index] ?? check.question,
      explanation: ["bool adalah tipe dua value: setiap boolean adalah True atau False.", "Kutip mengubah apa pun menjadi teks. Hanya False tanpa kutip yang menjadi value boolean.", "== membandingkan age dengan 20 dan menghasilkan boolean True. Satu = akan meng-assign saja."][index] ?? check.explanation,
    })),
  };
}

export const booleansMasteryConceptLabels: Record<string, string> = {
  boolean_value: "Booleans as values", boolean_literal: "True / False literals", boolean_result: "Comparison results",
};

export function booleansReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("quoted_boolean_confusion")) return id
    ? "Bandingin True dan \"True\": mana yang value boolean dan mana yang teks? Apa yang membuat bedanya?"
    : "Compare True and \"True\": which one is the boolean value and which is text? What creates the difference?";
  if (result.misconceptions.includes("lowercase_boolean_confusion")) return id
    ? "Python membaca ejaan secara persis. Huruf mana yang kapital di literal boolean-nya?"
    : "Python reads spellings exactly. Which letter is capitalized in the boolean literals?";
  if (result.misconceptions.includes("assignment_comparison_confusion")) return id
    ? "Hitung tanda sama dengan-nya: satu = meng-assign, dua == membandingkan. Baris mana yang melakukan yang mana?"
    : "Count the equals signs: one = assigns, two == compare. Which line does which?";
  if (result.misconceptions.includes("boolean_as_text_confusion")) return id
    ? "Perbandingan adalah pertanyaan, dan jawabannya adalah value yang dicetak: True atau False. Apa pertanyaan yang ditanya score > 5, dan apa jawabannya?"
    : "A comparison is a question, and its answer is the printed value: True or False. What question does score > 5 ask, and what is the answer?";
  return id
    ? "Restate rantainya: is_online → True → bool. Dari dua value mana yang menandai keadaan offline, dan bagaimana tulisannya?"
    : "Restate the chain: is_online → True → bool. Which of the two values marks the offline state, and how is it written?";
}
