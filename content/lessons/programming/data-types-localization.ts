import { dataTypesActivities } from "./data-types-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
export type { LessonLanguage };

export const dataTypesCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"),
    moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: why are 42 and \"42\" different even though they look similar?",
    placeholder: "42 and \"42\" look the same but...",
    sourceCheck: "Source Mode: no AI evaluation. Use the type distinction model to review your explanation, then continue without AI.",
    masteryDataType: "Data type", masteryInteger: "Integer", masteryFloat: "Float",
    masteryString: "String", masteryBoolean: "Boolean", masteryTypeInspection: "Type inspection",
  },
  id: {
    ...getSharedCopy("id"),
    moduleTitle: "Dasar Penyusun Program",
    prompt: "Kenapa 42 dan \"42\" itu berbeda walaupun kelihatannya mirip?",
    placeholder: "42 dan \"42\" kelihatannya sama tapi...",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penjelasan kamu dengan model perbedaan tipe, lalu lanjut tanpa AI.",
    masteryDataType: "Tipe data", masteryInteger: "Integer", masteryFloat: "Float",
    masteryString: "String", masteryBoolean: "Boolean", masteryTypeInspection: "Inspeksi tipe",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa value punya tipe", content: ["Value itu bukan cuma \"sesuatu yang disimpen di variable.\" Jenis value-nya penting karena program memperlakukan angka, teks, dan benar/salah secara berbeda.", "42 dan \"42\" memuat karakter yang sama, tapi yang satu angka dan yang satu teks — tipenya, bukan kelihatannya, yang menentukan."] },
  { title: "INTUITION · Empat tipe dasar Python", content: ["20 → integer (int). 172.5 → floating-point (float). \"Arya\" → string (str). True → boolean (bool).", "Rangkai dengan Variables: age → 20 → int — nama menunjuk value, dan value punya tipe. Tiap tipe jawab pertanyaan berbeda: berapa, seberapa, teks apa, atau ini bener nggak?"] },
  { title: "PREDICT · Tipe 20 apa?", content: ["Tipe dari value 20 itu apa?"], explanation: "20 itu angka bulat tanpa desimal, jadi tipenya int." },
  { title: "PREDICT · String atau number?", content: ["Variable mana yang isinya string?"], explanation: "b = \"42\" pakai tanda kutip, jadi string. a = 42 tanpa kutip, jadi integer." },
  { title: "PREDICT · Mana yang boolean?", content: ["Mana dari value ini yang boolean?"], explanation: "True tanpa kutip itu boolean. \"True\" dengan kutip itu string yang kebetulan ngeja boolean. False juga boolean, tapi \"True\" bukan." },
  { title: "TRY · Identifikasi tipe 29.5", content: ["Tulis nama tipe Python (int, float, str, atau bool) untuk value 29.5."], explanation: "29.5 punya desimal, jadi tipenya float." },
  { title: "FORMALIZE · Tipe menentukan perilaku", content: ["Tipe sebuah value menentukan bagaimana Python mengartikan dan mengoperasikannya. Python dynamically typed: value punya tipe, dan sebuah nama bisa di-bind ke value dengan tipe berbeda.", "type() mengembalikan tipe dari sebuah value — cara cepat mengecek apa yang Python lihat. String seperti \"42\" itu teks, bukan angka: kutip adalah bagian dari tipenya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [dataTypesCopy.id.prompt] },
  { title: "CONNECT · Konsep ini nyambung ke mana?", content: ["Data Types → Numbers → Casting → Strings", "Berikutnya Numbers: tipe-tipe angka dapat lesson sendiri — lalu Casting, Strings, dan Booleans membangun di atas model nama → value → tipe yang sama.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah disimpan supaya bisa lanjut setelah reload."] },
];

export function getDataTypesActivities(language: LessonLanguage) {
  return dataTypesActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [dataTypesCopy[language].prompt] } : {}),
  }));
}

export function localizeDataTypesContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Tipe sebuah value menentukan bagaimana bahasa memahami dan mengoperasikan value itu. Python dynamically typed: value punya tipe, dan nama bisa di-bind ke value dengan tipe berbeda.",
      "Tipe bawaan int, float, str, dan bool masing-masing merepresentasikan integer, bilangan desimal, teks, dan nilai kebenaran. String seperti \"42\" itu teks, bukan angka: kutip membuat tipenya berbeda walaupun karakternya kelihatan sama.",
      "type() mengembalikan tipe dari sebuah value untuk inspeksi yang cepat. Untuk sekarang, membaca bentuk value — kutip, titik desimal, True atau False — sudah cukup untuk menyebut tipenya.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Empat tipe dasar", "Karakter sama, tipe berbeda", "Inspeksi tipe", "Membaca bentuknya"][index] ?? example.title,
      explanation: ["Tiap value punya tipe berbeda: integer, float, string, dan boolean.", "Dua-duanya mencetak karakter yang sama, tapi score itu int dan code itu str — output bisa terlihat identik padahal tipenya berbeda.", "type() menunjukkan tipe value yang sedang kamu proses.", "Bentuknya menyebut tipenya: angka tanpa desimal itu int, ada titik desimal berarti float, ada kutip berarti str, dan True atau False itu bool."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Kategori value yang menentukan bagaimana program mengartikannya.", "Tipe integer Python untuk angka bulat seperti 7, 42, atau -3.", "Tipe Python untuk angka dengan desimal seperti 3.14 atau -0.5.", "Tipe string Python untuk teks, ditulis dengan kutipan seperti \"hello\".", "Tipe boolean Python untuk nilai kebenaran: True atau False.", "Function bawaan yang mengembalikan tipe sebuah value."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Ketuker \"42\" dengan 42", "Menganggap True sebagai teks", "Membaca tipe dari output saja"][index] ?? mistake.title,
      explanation: ["\"42\" itu string (teks). 42 itu integer (angka). Mereka kelihatan mirip tapi nggak bisa dipakai bergantian.", "True itu boolean, bukan string. \"True\" dengan kutip itu teks yang kebetulan ngeja boolean.", "print(100) dan print(\"100\") menampilkan karakter yang sama. Tipenya bisa berbeda walaupun teks cetakannya sama — cek kutipnya di code, bukan di output."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Tipe 3.14 apa?", "Value mana yang string?", "type(True) mengembalikan apa?"][index] ?? check.question,
      explanation: ["Angka dengan desimal itu float.", "Kutip membuatnya teks, bukan angka.", "True dan False itu nilai boolean."][index] ?? check.explanation,
    })),
  };
}
