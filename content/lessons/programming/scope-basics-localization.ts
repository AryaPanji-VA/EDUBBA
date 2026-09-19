import { scopeBasicsActivities } from "./scope-basics-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const scopeBasicsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: why can't a variable created inside a function be used outside — and what happens to the local names after the function finishes?",
    placeholder: "A variable made inside lives in the function's own area..., and after the call...",
    oneLine: "One local area per call",
    diagram: "outside: global · inside the function: local",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the two working areas and the local lifetime, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: kenapa variable yang dibuat di dalam function nggak bisa dipakai di luar — dan apa yang terjadi pada local names setelah function-nya selesai?",
    placeholder: "Variable yang dibuat di dalam hidup di area function sendiri..., dan setelah call selesai...",
    oneLine: "Satu area local per call",
    diagram: "luar: global · dalam function: local",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau dua area kerjanya dan umur local names, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Variable itu milik siapa?", content: ["Sejauh ini setiap function bekerja dengan parameter-nya sendiri dan memberi nilai balik lewat return. Tapi ada pertanyaan yang lebih diam-diam di baliknya: variable yang dibuat di dalam function itu sebenarnya hidup di mana?", "Jawabannya: setiap call function dapat area kerjanya sendiri. Variable yang dibuat di dalam body itu milik call itu — bukan milik program di sekitarnya. Tahu ini dari awal mencegah error function yang paling sering terjadi."] },
  { title: "INTUITION · Setiap call punya mejanya sendiri", content: ["Anggap setiap call adalah sebuah meja. Saat greet() jalan, Python menyiapkan meja kosong khusus untuk call itu — dan message = \"Hello\" menaruh message di meja itu, bukan di meja program.", "name ditulis di luar, jadi dia menetap di meja program dari awal sampai akhir. Dua area, nggak ada campur-campur: call pakai mejanya sendiri, program tetap pakai mejanya sendiri."] },
  { title: "MENTAL MODEL · Dua area kerja", content: ["Area luar menampung global names — variable yang dimiliki program itu sendiri, seperti name = \"Arya\". Nama-nama ini ada selama program berjalan.", "Di dalamnya, setiap call function membuka kotak kecil local names miliknya sendiri — assignment yang dibuat di body, plus parameter-parameter. Kotak ini cuma ada selama call itu berjalan."] },
  { title: "PREDICT · Hello dulu, lalu apa?", content: ["Dua variable, dua area. greet() jalan dulu, lalu print(name) jalan di luar. Apa yang program ini tampilkan?"], explanation: "greet() menampilkan message local miliknya sendiri → Hello. Lalu print(name) menampilkan variable di luar → Arya. Setiap print membaca dari areanya masing-masing; nggak ada yang menimpa apa pun." },
  { title: "PREDICT · Local di luar function", content: ["message dibuat di dalam body. Baris terakhir mencoba print dia di luar function. Apa yang terjadi?"], explanation: "Print di dalamnya jalan selama call-nya berjalan. Setelah make_message() selesai, area kerja local-nya sudah nggak ada — jadi print(message) di luar melempar NameError. Variable local nggak otomatis bisa dipakai di luar." },
  { title: "PREDICT · Parameter setelah call", content: ["nama menerima \"Arya\" saat call dimulai dan diprint di dalam body. Lalu program mencoba print nama di luar. Apa yang terjadi?"], explanation: "Parameter berperilaku seperti local name: dia dibuat di area kerja call, bisa dipakai di body, dan hilang begitu call-nya selesai. Di luar, nama itu memang nggak pernah dibuat — jadi NameError." },
  { title: "TRY · Bikin di dalam, print di dalam, panggil", content: ["Tulis function show yang membuat variable local message = \"Halo\" di dalam body-nya dan print message dari dalam body — dua barisnya di-indent — lalu panggil show() dengan satu baris di luar function.", "Assignment-nya dan print-nya harus sama-sama hidup di dalam body. Baris call-nya tetap di luar, tanpa indent."], explanation: "def show():\n    message = \"Halo\"\n    print(message)\n\nshow() — assignment-nya dan print-nya di-indent di dalam body, jadi message itu local milik call-nya; baris call tetap di luar." },
  { title: "FORMALIZE · Dua area kerja", content: ["Setiap call function mendapat area kerja local-nya sendiri. Nama yang dibuat di dalam body — assignment maupun parameter — adalah local names: mereka ada di area itu, selama call itu berjalan.", "Nama yang dibuat di luar function mana pun itu milik program; kata umumnya global. Default yang aman: assignment di dalam function membuat local name — dia nggak mengubah variable di luar yang namanya sama.", "Saat call selesai, area local-nya menutup dan nama-namanya hilang; call berikutnya membuka area baru. Berikutnya Module 06 · Collections: lists — menyimpan banyak value bersama di bawah satu nama, dan scope-lah yang menjaga nama-nama setiap function nggak saling bertabrakan."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [scopeBasicsCopy.id.prompt] },
  { title: "CONNECT · Dari nama ke koleksi", content: ["Scope Basics → Module 06 · Collections → Lists", "Setiap function sekarang menyimpan nama-namanya di area kerja local-nya sendiri, jadi message milik satu function nggak pernah nabrak punya function lain. Berikutnya Lists: cara menyimpan banyak value bersama di bawah satu nama, supaya program bisa mengolah satu koleksi utuh — bukan satu variable satu waktu.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getScopeBasicsActivities(language: LessonLanguage) {
  return scopeBasicsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [scopeBasicsCopy[language].prompt] } : {}),
  }));
}

export function localizeScopeBasicsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Setiap function punya meja kerja sendiri. Setiap kali function dipanggil, Python menyiapkan area kerja kosong untuk call itu — dan semua variable yang dibuat di dalam body hidup di meja itu, bukan di meja program.",
      "Jadi ada dua tempat: variable yang dibuat di luar function itu milik program (kata umumnya: global), sedangkan variable yang dibuat di dalam body itu local — milik function itu saja, hidup di area kerja call-nya.",
      "Kesalahpahaman paling umum: mengira variable local bisa langsung dipakai di luar. Nggak bisa — area kerja local cuma ada selama call berjalan. Setelah call selesai, local names-nya hilang, dan manggil nama itu di luar bakal error.",
    ],
    academicExplanation: [
      "Setiap call function mendapat area kerja local-nya sendiri. Saat greet() berjalan, assignment message = \"Hello\" membuat nama message di area call itu; dia cuma ada selama call berlangsung dan hilang saat call selesai.",
      "Nama yang dibuat di level teratas program — seperti name = \"Arya\" — itu milik program itu sendiri; kata umumnya global. Parameter juga berperilaku seperti local names: setiap parameter hidup di area kerja call, menerima nilainya saat call dimulai, dan lenyap saat call berakhir.",
      "Default yang aman: assignment di dalam function membuat local name. Dia nggak menjangkau ke luar dan nggak mengubah variable program yang namanya sama. Memakai local name setelah call-nya selesai melempar NameError, karena area kerja tempat dia hidup sudah nggak ada.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Dua area, dua variable", "Variable local nggak tersedia di luar", "Parameter berperilaku seperti local names", "Nama sama, dua area yang mandiri"][index] ?? example.title,
      explanation: ["message dibuat di dalam area kerja local greet saat call berjalan. name dibuat di luar, jadi dia milik program — print(name) jalan di mana saja karena nama di luar itu ada selama program berjalan.", "message cuma ada di dalam area local call-nya. Selama make_message() berjalan, print di dalamnya jalan. Setelah call selesai, areanya sudah hilang — jadi memakai message di luar melempar NameError.", "nama hidup di area kerja call: dia menerima nilainya saat call dimulai dan bisa dipakai di dalam body. Saat call berakhir, nama itu hilang — dia nggak pernah jadi nama di luar.", "Assignment di dalam membuat x local milik area call-nya sendiri — dia nggak mengubah x di luar. Dua area kerja, dua nama terpisah yang kebetulan dieja sama."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Variable yang dibuat di dalam body function — dia milik area kerja local call itu.", "Nama yang dibuat di luar function mana pun — dia milik program itu sendiri dan ada selama program berjalan.", "Area tempat sebuah nama ada dan bisa dipakai: di dalam function (local) atau di luar di program.", "Menjalankan sebuah function — call-lah yang membuka area kerja local dan mengisi parameter-parameter.", "Ruang privat yang didapat setiap call function, tempat local names dan parameter-nya hidup selama call berjalan.", "Local names cuma ada selama call berjalan — saat call selesai, mereka hilang."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Memakai variable local di luar function-nya", "Mengira variable local bertahan setelah call", "Mengira assignment di dalam function mengubah variable di luar", "Ketuker parameter dengan nama global", "Mengira local name bisa dipakai function lain"][index] ?? mistake.title,
      explanation: ["message yang dibuat di dalam greet cuma ada selama call-nya. Memakainya di luar melempar NameError — area kerja local-nya sudah nggak ada.", "Local names hidup di area kerja call; saat call berakhir, area itu dan nama-namanya lenyap. Memanggil function-nya lagi memulai area yang baru.", "Assignment di dalam membuat local names — itu default yang aman. Variable di luar yang namanya sama mempertahankan value-nya sendiri, nggak tersentuh.", "Parameter diisi per call dan berperilaku seperti local name di dalam body. Dia bukan variable yang berlaku di seluruh program dan nggak ada setelah call selesai.", "Setiap call mendapat area kerjanya sendiri. Sebuah function nggak bisa melihat local names milik function lain — cuma miliknya sendiri."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["message = \"Hello\" ditulis di dalam def greet():. message hidup di mana?", "Setelah greet() selesai, apa yang terjadi pada message?", "Parameter nama di greet_person(nama) berperilaku seperti..."][index] ?? check.question,
      explanation: ["Assignment di dalam body membuat local name di area kerja call itu.", "Area kerja local menutup saat call selesai; nama-namanya hilang bersamanya.", "Parameter menerima nilainya per call dan hidup di area local call itu — hilang saat call berakhir."][index] ?? check.explanation,
    })),
  };
}

export const scopeBasicsMasteryConceptLabels: Record<string, string> = {
  local_scope: "Local names", global_scope: "Outside names (global)", parameter_local: "Parameters are local",
};

export function scopeBasicsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("local_available_outside")) return id
    ? "Di area mana message hidup — dan apa yang tersisa dari area itu setelah make_message() selesai?"
    : "Which area does message live in — and what is left of that area after make_message() finishes?";
  if (result.misconceptions.includes("local_survives_call")) return id
    ? "Coba panggil function-nya dua kali: apakah local names dari call pertama masih ada di call kedua?"
    : "Try calling the function twice: do the local names from the first call still exist in the second?";
  if (result.misconceptions.includes("assignment_is_global")) return id
    ? "Saat body menjalankan message = \"Hello\", nama itu dibuat di area kerja siapa — milik call-nya, atau milik program di luar?"
    : "When the body runs message = \"Hello\", whose working area does that name go into — the call's own, or the outside program's?";
  if (result.misconceptions.includes("parameter_is_global")) return id
    ? "Kapan parameter masuk ke area kerja call, dan kapan dia hilang darinya?"
    : "When does the parameter enter the call's working area, and when does it leave it for good?";
  return id
    ? "Restate dua areanya: luar menampung global names, setiap call punya kotak local names-nya sendiri. Di area mana tiap nama dibuat, dan sampai kapan dia hidup?"
    : "Restate the two areas: outside holds global names, each call opens its own box of local names. Where is each name created, and how long does it live?";
}
