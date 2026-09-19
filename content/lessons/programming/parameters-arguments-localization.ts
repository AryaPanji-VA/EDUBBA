import { parametersArgumentsActivities } from "./parameters-arguments-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const parametersArgumentsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what is the difference between a parameter and an argument — and how is the argument's value used inside the body?",
    placeholder: "A parameter is..., an argument is..., and inside the body...",
    oneLine: "Three Python lines",
    diagram: "argument → parameter → body",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the parameter–argument distinction and the flow, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa beda parameter dan argument — dan bagaimana value dari argument dipakai di dalam body?",
    placeholder: "Parameter itu..., argument itu..., dan di dalam body...",
    oneLine: "Tiga baris Python",
    diagram: "argument → parameter → body",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau beda parameter–argument dan alurnya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Satu function, banyak behavior", content: ["def greet(): dengan print(\"Hello\", \"Arya\") di dalamnya memang jalan — tapi dia cuma bisa menyapa Arya selamanya. Mau menyapa Bima, berarti harus nulis function kedua yang hampir identik.", "Parameter mengubah itu: def mendeklarasikan sebuah slot, dan setiap panggilan mengisinya dengan value-nya sendiri. Satu definisi, banyak behavior — tuas pertama untuk reuse."] },
  { title: "INTUITION · Slot-nya dan yang mengisinya", content: ["def greet(name): mendeklarasikan slot bernama name di dalam function. Print di dalam body memakai name — tapi saat definisi, slot itu belum berisi apa-apa.", "Panggilan yang mengisinya: greet(\"Arya\") mengirim \"Arya\" masuk, dan body berjalan dengan name menampung \"Arya\". Perjalanannya selalu argument → parameter → body."] },
  { title: "SEE · Dua kata, dua tempat", content: ["Parameter tinggal di definisi: name di dalam def greet(name):. Itu sebuah nama — label yang dirujuk body.", "Argument tinggal di panggilan: \"Arya\" di dalam greet(\"Arya\"). Itu sebuah value — apa yang benar-benar berangkat ke dalam function. Kurung yang sama, peran yang beda."] },
  { title: "PREDICT · Trace panggilannya", content: ["Dua panggilan, satu definisi. Apa yang program print, berurutan?"], explanation: "Setiap panggilan mengisi name dengan argument-nya sendiri: \"Arya\" dulu, lalu \"Bima\". Satu definisi, dua behavior." },
  { title: "PREDICT · Dua parameter", content: ["Dua parameter, dua argument. Apa yang ditampilkan print?"], explanation: "Argument mengisi parameter berdasarkan posisi: \"Arya\" mendarat di name, 20 mendarat di age. Urutan penulisan di panggilan yang menentukan." },
  { title: "SPOT · Panggilan tanpa isi", content: ["Definisinya minta satu value. Panggilan ini nggak memberi apa-apa. Apa yang terjadi?"], explanation: "greet() menjumpai def satu parameter dengan nol argument — name tidak punya apa pun untuk ditampung, dan Python melempar TypeError sebelum body berjalan." },
  { title: "TRY · Tulis sendiri", content: ["Tulis function yang menerima satu nama dan menyapanya: sebuah def dengan satu parameter, body yang print-nya memakai parameter itu, dan satu panggilan yang mengirim nama sebagai argument.", "Body-nya harus benar-benar memakai parameter — print(\"Hello\", \"Arya\") di dalam function mengabaikannya dan meng-hardcode output."], explanation: "def greet(name): dengan print(\"Hello\", name) di body, lalu greet(\"Arya\") — argument mengisi parameter, dan body memakainya." },
  { title: "FORMALIZE · argument → parameter → body", content: ["Parameter adalah nama di definisi; argument adalah value di panggilan. Di setiap panggilan, argument mengisi parameter, dan body berjalan memakai value itu — satu arah aliran: argument → parameter → body.", "Dengan beberapa parameter, argument mengisi kiri ke kanan: introduce(\"Arya\", 20) memberi name \"Arya\" dan age 20, sesuai urutan tulisan. Jumlahnya juga harus cocok — greet() pada def satu parameter gagal, karena name tidak menerima apa-apa.", "Ini value yang masuk. Lesson berikutnya, Return Values, adalah jalan keluarnya: apa yang function kembalikan setelah berjalan — untuk sekarang, semua yang function ketahui datang sebagai argument."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [parametersArgumentsCopy.id.prompt] },
  { title: "CONNECT · Dari menerima ke mengembalikan", content: ["Parameters & Arguments → Return Values", "Function sekarang bisa menerima value: satu definisi, banyak panggilan, setiap argument mengisi parameternya. Berikutnya Return Values: separuh lainnya dari kesepakatan — bagaimana function mengembalikan hasil ke code yang memanggilnya.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getParametersArgumentsActivities(language: LessonLanguage) {
  return parametersArgumentsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [parametersArgumentsCopy[language].prompt] } : {}),
  }));
}

export function localizeParametersArgumentsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Function dari lesson lalu punya kelemahan diam-diam: sekali isinya print(\"Hello\", \"Arya\"), dia cuma bisa menyapa Arya selamanya. Mau menyapa orang lain, berarti harus nulis function baru — padahal polanya sama persis.",
      "Parameter menutup celah itu: sebuah slot bernama di dalam def, misalnya def greet(name):. Saat function dipanggil, argument — value yang ditulis di dalam kurung panggilan, misalnya greet(\"Arya\") — mengisi slot itu.",
      "Jadi satu definisi cukup: greet(\"Arya\") menyapa Arya, greet(\"Bima\") menyapa Bima. Argument-nya yang berubah, behavior ikut berubah — function-nya tetap satu.",
    ],
    academicExplanation: [
      "Parameter adalah nama yang ditulis di dalam def — greet(name) mendeklarasikan slot bernama name yang hanya ada di dalam function. Argument adalah value yang diberikan di panggilan — greet(\"Arya\") memberi \"Arya\". Dua kata ini menunjuk hal yang berbeda: parameter adalah label di definisi; argument adalah value di panggilan.",
      "Alirannya satu arah: argument → parameter → body. Di panggilan, value argument mengisi parameter, dan setiap pemakaian nama itu di dalam body bekerja dengan value yang dikirim — print(\"Hello\", name) menampilkan apa pun yang diberikan.",
      "Def dengan beberapa parameter menerima beberapa argument, dan mengisinya kiri ke kanan: introduce(\"Arya\", 20) memberi name value \"Arya\" dan age value 20, sesuai urutan tulisan. Jumlahnya juga harus cocok — panggilan tanpa argument membuat parameter tidak menampung apa-apa.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Parameter adalah slot di dalam definisi", "Satu definisi, argument yang berbeda", "Dua parameter, diisi kiri ke kanan", "Apa yang salah: panggilan tanpa argument"][index] ?? example.title,
      explanation: ["name adalah parameter — nama yang dideklarasikan di dalam def. Body memakainya seperti variable, tapi dia belum berisi apa-apa; value datang saat function dipanggil.", "\"Arya\" dan \"Bima\" adalah argument — value yang diberikan di setiap panggilan. Setiap panggilan mengisi parameter yang sama dengan value yang berbeda, jadi satu definisi menghasilkan behavior yang berbeda.", "Argument mengisi parameter berdasarkan posisi: \"Arya\" menuju name, 20 menuju age. Urutan penulisan di panggilan menentukan value mana mendarat di mana.", "Def-nya berjanji satu value; greet() tidak memberi apa-apa. Tanpa sesuatu untuk mengisi name, panggilan gagal — jumlah argument harus cocok dengan parameter."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Nama di dalam def — greet(name) mendeklarasikan slot name, yang dipakai di dalam body.", "Value yang diberikan di panggilan — greet(\"Arya\") mengirim \"Arya\" ke dalam parameter.", "name(...) menjalankan function; value yang ditulis di dalam kurung mengisi parameter.", "Baris-baris menjorok di bawah def; mereka berjalan memakai value yang dikirim panggilan.", "Satu definisi melayani banyak panggilan — argument berbeda, behavior berbeda.", "Apa yang dibawa argument ke dalam body — \"Arya\", 20, apa pun yang dipakai function."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Hardcode di dalam body", "Jumlah argument tidak cocok", "Menukar kedua kata", "Memakai parameter di luar function", "Kehilangan parameter saat menulis ulang def"][index] ?? mistake.title,
      explanation: ["print(\"Hello\", \"Arya\") di dalam function mengabaikan name. Parameter ada untuk menerima value dari panggilan — body harus memakainya.", "greet() pada def satu parameter tidak memberi apa pun untuk name. Panggilan harus menyediakan satu argument per parameter.", "Parameter adalah nama di definisi; argument adalah value di panggilan. greet(name) mendeklarasikan, greet(\"Arya\") memberi.", "name hanya ada selama body berjalan. Di luar function, nama itu tidak terdefinisi — slot-nya lahir dan mati bersama setiap panggilan.", "def greet(): dengan print(name) di body membuat body memegang nama yang tidak pernah dideklarasikan definisinya. Baris def dan body harus sepakat."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Di def greet(name):, apa itu name?", "Di greet(\"Arya\"), apa itu \"Arya\"?", "introduce(name, age) dipanggil dengan introduce(20, \"Arya\"). Apa yang terjadi?"][index] ?? check.question,
      explanation: ["Nama di baris def adalah parameter: slot yang dirujuk body, diisi hanya saat function dipanggil.", "Value yang ditulis di kurung panggilan adalah argument; dia berangkat ke parameter saat panggilan berjalan.", "Argument mengisi parameter kiri ke kanan, berdasarkan posisi: 20 mendarat di name, \"Arya\" mendarat di age. Python tidak menebak makna."][index] ?? check.explanation,
    })),
  };
}

export const parametersArgumentsMasteryConceptLabels: Record<string, string> = {
  parameters_arguments: "Parameters & arguments", argument_flow: "Argument → parameter flow", multiple_parameters: "Multiple parameters",
};

export function parametersArgumentsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("parameter_argument_confusion")) return id
    ? "Pisahkan tempatnya: mana yang nama di dalam def, dan mana yang value di dalam kurung panggilan?"
    : "Separate the places: which one is the name inside the def, and which one is the value inside the call's parentheses?";
  if (result.misconceptions.includes("hardcoded_output_confusion")) return id
    ? "Cek body-nya: dia memakai parameter dari def, atau meng-hardcode teksnya sendiri dan mengabaikan value dari panggilan?"
    : "Check the body: does it use the parameter from the def, or hardcode its own text and ignore the call's value?";
  if (result.misconceptions.includes("argument_count_mismatch")) return id
    ? "Hitung keduanya: berapa parameter di def, dan berapa argument di panggilan — apakah jumlahnya cocok?"
    : "Count both sides: how many parameters does the def declare, and how many arguments does the call supply — do the counts match?";
  if (result.misconceptions.includes("parameter_outside_confusion")) return id
    ? "Cek tempat hidupnya: kapan name ada, dan apa yang terjadi kepadanya setelah body selesai berjalan?"
    : "Check where it lives: when does name exist, and what happens to it after the body finishes running?";
  return id
    ? "Restate alurnya: argument → parameter → body. Value apa yang dikirim panggilan, dan di mana body memakainya?"
    : "Restate the flow: argument → parameter → body. What value does the call send, and where does the body use it?";
}
