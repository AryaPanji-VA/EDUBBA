import { rangeLoopPatternsActivities } from "./range-loop-patterns-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const rangeLoopPatternsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what values does range(1, 4) produce — and why is the stop value 4 not included?",
    placeholder: "range(1, 4) produces..., and 4 is not included because...",
    oneLine: "Two Python lines",
    diagram: "range(start, stop, step) → start … stop-1",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the generated sequence and the excluded stop, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: range(1, 4) menghasilkan angka apa saja — dan kenapa angka 4-nya nggak ikut?",
    placeholder: "range(1, 4) menghasilkan..., dan 4 nggak ikut karena...",
    oneLine: "Dua baris Python",
    diagram: "range(start, stop, step) → start … stop-1",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau deret yang dihasilkan dan stop yang nggak ikut, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Pengulangan tanpa ngetik value-nya", content: ["Sampai sekarang, biar for loop jalan tiga kali lu ngetik value-nya manual: for i in [0, 1, 2]. Untuk tiga value sih oke — tapi untuk seratus, ngetik list-nya justru kerjaan yang mau lu hindarin.", "While Loops nunjukin jalan manual: bikin counter, cek, update, cek lagi. Kalau jumlah pengulangannya udah jelas dan bisa dihitung, Python punya bentuk yang lebih bersih: range() menghasilkan deret angkanya, dan for tinggal jalan di atasnya."] },
  { title: "INTUITION · range() bikin deretnya, for jalanin", content: ["range(3) menghasilkan angka 0, 1, 2 — sebuah deret. For loop lalu ngelakuin hal yang sama kayak biasa: ikat loop variable i ke value berikutnya, jalanin body yang menjorok sekali per value. Tiga value, tiga iterasi.", "Baca range(start, stop, step) sebagai aturan deretnya: mulai di start, berhenti sebelum stop, geser sebesar step. Kalau cuma satu argumen, start-nya default 0 dan step-nya default 1 — jadi range(3) itu 0, 1, 2, dan angka 3 sendiri nggak pernah ikut."] },
  { title: "PREDICT · range(3) ngasilin apa?", content: ["range(3) menghasilkan deretnya, dan body print i sekali per value. Apa output lengkapnya?"], explanation: "range(3) mulai dari 0 secara default dan berhenti sebelum 3: deretnya 0, 1, 2. Tiga value, tiga print — angka stop itu garis batas, bukan anggota deret." },
  { title: "PREDICT · Mulai dari 1", content: ["Sekarang dua argumen: start 1, stop 4. Loop-nya print apa aja?"], explanation: "Argumen start mindahin awalnya ke 1; stop 4 tetap nggak ikut. Deretnya 1, 2, 3 — tepat stop − start = 3 value." },
  { title: "PREDICT · Melompat dua-dua", content: ["Tiga argumen: start 2, stop 7, step 2. Telusuri manual — i dapet value apa aja?"], explanation: "Step 2 melangkah dari 2: 2, terus 4, terus 6. Langkah berikutnya bakal nyelewitin stop — dan 7 sendiri nggak pernah ikut, karena stop selalu dikecualikan apa pun step-nya." },
  { title: "PATTERNS · Dua bentuk sehari-hari", content: ["Pola satu — ulang N kali: range(3) menghasilkan tiga value, jadi body jalan tiga kali. Loop variable i tetap dapet tiap angka, tapi body boleh nggak peduli angkanya; tugas deretnya di sini cuma jumlah.", "Pola dua — hitung dari start sampai tepat sebelum stop: \"angka 1 sampai 5\" itu range(1, 6), bukan range(1, 5). Ucapin stop-nya sebagai \"berhenti sebelum\" dan off-by-one-nya hilang: argumen stop selalu satu di atas value terakhir yang lu mau.", "Ngetrace manual itu kebiasaan ngecek: tulis start-nya, tambah step sampai nyampe atau nyelewitin stop, dan coret stop-nya kalau kepisah — dia emang nggak pernah bagian dari deret."] },
  { title: "TRY · Hitung pakai range", content: ["Tulis sebuah for loop yang pakai range() untuk print angka 1 sampai 5, satu per baris. Jangan print(1), print(2), ... yang diketik manual — deretnya harus datang dari range()."], explanation: "for i in range(1, 6): print(i) — mulai dari 1, berhenti tepat sebelum 6, jadi deretnya 1, 2, 3, 4, 5, dicetak satu per iterasi sama body yang menjorok." },
  { title: "FORMALIZE · Aturan deretnya", content: ["range(start, stop, step) adalah aturan yang menghasilkan deret integer: mulai di start, berhenti sebelum stop, geser sebesar step. Satu argumen: start-nya 0 dan step-nya 1. Dua argumen: step-nya tetap 1. Angka stop selalu dikecualikan — apa pun step-nya.", "Jumlah iterasinya keliatan langsung di argumennya: range(start, stop) dengan step positif jalan tepat stop − start kali. range(1, 6) itu lima iterasi; range(4) itu empat. Ngitung value-nya manual — start, start + step, dst — harus dapet angka yang sama.", "range() berguna pas value-nya deret angka yang sebenarnya bakal lu ketik manual. List yang udah ada tetap diiterasi langsung, kayak di For Loops: for name in [...]. Berikutnya Module 05 · Reusable Code: bungkus kerjaan supaya bisa dinamain sekali dan dipakai di mana-mana — Functions."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [rangeLoopPatternsCopy.id.prompt] },
  { title: "CONNECT · Dari deret ke kode yang bisa dipakai ulang", content: ["Range & Loop Patterns → Module 05 · Reusable Code → Functions", "Pengulangan sekarang terkendali: range() menghasilkan deret integer dan for jalanin body sekali per value — kerjaan yang jumlahnya jelas, tanpa mesin counter yang diketik manual. Module 05 · Reusable Code ngambil langkah berikutnya: membungkus kerjaan supaya bisa dinamain sekali dan dipakai di mana-mana — Functions. Belum ada syntax baru; ini cuma serah terima.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getRangeLoopPatternsActivities(language: LessonLanguage) {
  return rangeLoopPatternsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [rangeLoopPatternsCopy[language].prompt] } : {}),
  }));
}

export function localizeRangeLoopPatternsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Sampai pelajaran ini, kalau mau for loop jalan tiga kali, lu nulis list-nya tangan: [0, 1, 2]. range() adalah built-in tool yang menghasilkan deretan angka integer secara otomatis — jadi lu nggak perlu nulis angkanya satu-satu.",
      "Bentuk lengkapnya range(start, stop, step). Mental model inti: range(3) menghasilkan 0, 1, 2 — mulai dari 0 secara default, dan angka stop-nya tidak ikut. Stop itu garis finis, bukan anggota deret.",
      "range() cuma menghasilkan deret — dia nggak print apa-apa sendiri. Pasangkan dengan for: for i in range(3): terus print(i) yang menjorok, dan deret 0, 1, 2 dicetak satu per satu.",
    ],
    academicExplanation: [
      "range() adalah built-in yang menghasilkan deret integer, dirancang untuk ngisi for loop. Satu argumen: range(3) menghasilkan 0, 1, 2 — mulai dari 0 secara default dan ngitung sampai tepat sebelum angka stop.",
      "Bentuk lengkapnya range(start, stop, step): deret mulai di start, berhenti tepat sebelum stop, dan geser sebesar step tiap iterasi. range(1, 4) menghasilkan 1, 2, 3; range(2, 7, 2) menghasilkan 2, 4, 6. Angka stop selalu dikecualikan, apa pun step-nya.",
      "Karena deretnya udah pasti dari awal, range() juga bikin jumlah iterasi eksplisit: range(start, stop) dengan step positif jalan tepat stop − start kali. for i in range(3): mengikat i ke 0, lalu 1, lalu 2 — tiga iterasi, satu per value yang dihasilkan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["range(3) — ngitung dari nol", "range(1, 4) — mulai dari mana aja", "range(2, 7, 2) — melompat", "Penghitung menit yang realistis"][index] ?? example.title,
      explanation: ["range(3) menghasilkan 0, 1, 2. Loop mengikat i ke tiap value secara berurutan, jadi body jalan tepat tiga kali. Angka stop 3 nggak pernah bagian dari deret.", "Dua argumen: start 1, stop 4. Deretnya 1, 2, 3 — mulai di start dan berhenti tepat sebelum stop. Jumlah iterasinya stop − start: 3.", "Tiga argumen: start 2, stop 7, step 2. Deretnya melangkah sebesar 2 — 2, 4, 6 — dan tetap berhenti sebelum 7. Stop-nya dikecualikan walaupun value-nya mendarat pas di dekatnya.", "Ngitung menit 1 sampai 3 butuh range(1, 4): mulai dari 1, berhenti tepat sebelum 4. Loop variable minute yang jelas bikin body-nya gampang dibaca — Menit 1, Menit 2, Menit 3."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Built-in tool yang menghasilkan deret integer untuk for loop: range(start, stop, step).", "Value pertama deret. Satu argumen: start default-nya 0. Dua atau tiga argumen: start adalah argumen pertama.", "Batas tempat deret berhenti sebelum dia. Angka stop selalu dikecualikan dari deret.", "Seberapa jauh deret geser tiap iterasi. Default-nya 1; range(2, 7, 2) geser 2 sekali langkah.", "Angka-angka berurutan yang dihasilkan range() — 0, 1, 2 dari range(3) — yang dijalanin for loop, satu value per iterasi.", "Berapa kali body jalan: jumlah value di deretnya. Untuk range(start, stop) dengan step positif itu stop − start."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengira range(5) ikut memuat 5", "Lupa start default-nya 0", "Off-by-one waktu nerjemahin \"hitung dari 1 sampai 5\"", "Salah baca step", "Nulis body tanpa indentasi", "Pakai range padahal list-nya udah ada"][index] ?? mistake.title,
      explanation: ["range(5) menghasilkan 0, 1, 2, 3, 4. Angka stop itu garis batas, bukan anggota: deretnya berhenti tepat sebelum dia.", "range(3) mulai dari 0, bukan 1. Buat ngitung 1, 2, 3 lu harus minta range(1, 4) — ngitung mulai dari 1 butuh argumen start yang ditulis.", "\"Dari 1 sampai 5\" artinya 1, 2, 3, 4, 5 — lima value — jadi stop-nya harus satu di atas value terakhir: range(1, 6). Nulis range(1, 5) diam-dian buang si 5.", "range(2, 7, 2) menghasilkan 2, 4, 6 — langkah sebesar 2 mulai dari 2, dan 7 tetap nggak ikut. Step nggak pernah narik angka stop masuk deret.", "for i in range(3): mulaiin sebuah blok, jadi body-nya harus menjorok di bawahnya. Print yang sejajar bukan bagian dari loop — baris yang menjorok itulah yang diulang.", "for name in [\"Arya\", \"Bima\"] udah jalan di list-nya langsung. range() itu tool buat bikin deret angka yang sebenarnya bakal lu ketik manual — nggak nambah apa-apa buat list yang bisa lu tulis."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["range(1, 4) menghasilkan apa?", "Berapa banyak angka yang dihasilkan range(4)?", "Loop ini print apa?"][index] ?? check.question,
      explanation: ["Mulai dari 1 dan berhenti tepat sebelum 4 — angka stop-nya dikecualikan.", "range(4) menghasilkan 0, 1, 2, 3 — empat angka, jadi body jalan empat kali.", "Step 2 mendarat di 2, 4, 6 — dan stop 7 tetap dikecualikan, apa pun step-nya."][index] ?? check.explanation,
    })),
  };
}

export const rangeLoopPatternsMasteryConceptLabels: Record<string, string> = {
  range_sequence: "Generating the sequence", range_boundaries: "Start & excluded stop", range_step: "Stepping",
};

export function rangeLoopPatternsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("range_one_based")) return id
    ? "Cek angka pertamanya: range() mulai dari angka berapa kalau start-nya nggak ditulis?"
    : "Check the first number: what does range() start at when no start argument is written?";
  if (result.misconceptions.includes("range_inclusive_end")) return id
    ? "Ingat garis finisnya: stop itu batas, bukan anggota — range(1, 4) berhenti sebelum 4. Angka terakhir deretnya apa?"
    : "Remember the finish line: stop is a boundary, not a member — range(1, 4) stops before 4. What is the last value of the sequence?";
  if (result.misconceptions.includes("boundary_off_by_one")) return id
    ? "Balikin kalimatnya ke angka: \"1 sampai 5\" itu lima angka — start-nya berapa, dan stop-nya harus berapa biar 5-nya ikut?"
    : "Turn the sentence back into numbers: \"1 through 5\" is five numbers — what is the start, and what must the stop be so the 5 itself is included?";
  if (result.misconceptions.includes("step_confusion")) return id
    ? "Jalanin pelan-pelan: mulai dari mana, tiap langkah nambah berapa, dan kapan berhenti — angka stop pernah muncul di deret nggak?"
    : "Walk it slowly: where does it start, how much does each step add, and when does it stop — does the stop value ever appear in the sequence?";
  if (result.misconceptions.includes("hardcoded_repetition")) return id
    ? "Bandingin print(1), print(2), print(3)... dengan for i in range(...): mana yang bikin deretnya otomatis?"
    : "Compare print(1), print(2), print(3)... with for i in range(...): which one makes the sequence automatic?";
  if (result.misconceptions.includes("prints_last_value")) return id
    ? "Jangan berhenti di angka terakhir: tulis semua value yang range() hasilkan satu per satu, baru lihat loop print yang mana aja."
    : "Do not stop at the last number: write out every value range() produces, one by one, then see which ones the loop prints.";
  return id
    ? "Restate deretnya: range(start, stop, step) → start … stop-1. Tulis value-nya satu per satu, lalu cek mana yang ikut dan yang nggak."
    : "Restate the sequence: range(start, stop, step) → start … stop-1. Write the values out one by one, then check which are included and which are not.";
}
