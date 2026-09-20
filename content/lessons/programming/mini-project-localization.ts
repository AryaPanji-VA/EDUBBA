import { miniProjectActivities } from "./mini-project-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const miniProjectCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Putting It Together",
    prompt: "Tell it in your own words: how does your Student Score Checker combine input, casting, try/except, and conditionals — from the inputs to the printed result?",
    placeholder: "First the program asks..., then it converts..., decides..., and prints...",
    oneLine: "Your own working program",
    diagram: "inputs → conversion → decision → output · plus a safety net",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Rebuild the five checkpoints from memory and confirm the program's behavior before continuing.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Menyatukan Semuanya",
    prompt: "Ceritakan pakai bahasa lu sendiri: bagaimana Student Score Checker lu nggabungin input, casting, try/except, dan conditional — dari input sampai hasil tercetak?",
    placeholder: "Pertama program nanya..., terus ngubah..., milih..., dan nyetak...",
    oneLine: "Program kecil buatan lu sendiri",
    diagram: "input → konversi → keputusan → output · plus jaring pengaman",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Rakit ulang lima checkpoint-nya dari ingatan dan mastiin perilaku programnya sebelum lanjut.",
  },
};

const indonesianActivities = [
  { title: "PROJECT · Student Score Checker", content: ["Di sini nggak ada materi baru — sekarang giliran lu yang bikin. Student Score Checker nanya nama sama nilai, safely ngubah nilainya jadi angka, milih Pass atau Try Again di angka 70, terus nyetak hasilnya bareng nama. Semua yang dibutuhin udah ada di toolbox: variable, string, casting, input, conditional, try/except.", "Lu bakal rakit dia lewat lima checkpoint: 1 Inputs, 2 Conversion, 3 Decision, 4 Output, 5 Error handling. Satu checkpoint = satu potongan kecil — selesaikan satu, cek, lanjut."] },
  { title: "TARGET · Program jadinya", content: ["Ini program utuhnya, ditunjukin sekali sebagai target. Baca dari atas ke bawah, lu bisa nempo checkpoint tiap blok: dua input, konversi yang dijaga, keputusan, output, fallback.", "Spasi dan nama variable boleh beda — yang dihitung itu perilakunya: beneran baca input, beneran konversi dengan jaga-jaga, beneran milih di 70, beneran cetak hasilnya bareng nama."] },
  { title: "CHECKPOINT 1 · Minta input-nya", content: ["Tulis dua baris: satu input() buat nama siswa yang disimpan ke variable, satu input() buat nilai yang disimpan ke variable yang beda. Nilainya masih teks di titik ini — kasih nama kayak score_text biar checkpoint berikutnya masuk akal."], explanation: "name = input(\"Student name: \")\nscore_text = input(\"Score: \") — dua input, dua variable beda; nilainya masih teks buat sekarang." },
  { title: "CHECKPOINT 2 · Ubah nilainya dengan aman", content: ["Tulis blok try dengan konversi di dalamnya: try: sendirian di satu baris, terus baris menjorok yang ngubah score_text jadi angka pakai int(). Konversi itu langkah berisiko — blok inilah tempat jaring pengaman nyambung di Checkpoint 5."], explanation: "try:\n    score = int(score_text) — konversi-nya di dalam try, siap dijaga sama except ValueError." },
  { title: "CHECKPOINT 3 · Milih Pass atau Try Again", content: ["Tulis keputusannya: if score >= 70: ngasih result nilai \"Pass\", else: ngasih result nilai \"Try Again\". Simpan pilihannya ke result — checkpoint output bakal nyetak. Hati-hati sama threshold-nya: 70 sendiri harus lolos, jadi perbandingannya >=."], explanation: "if score >= 70:\n    result = \"Pass\"\nelse:\n    result = \"Try Again\" — threshold milih sekali dan nyimpen pilihannya." },
  { title: "CHECKPOINT 4 · Cetak hasil bareng nama", content: ["Tulis satu baris print yang nampilin nama siswa sama hasilnya sekaligus: print(name, result). print pakai koma nyambungin dua value pakai spasi, jadi Bima sama Pass jadi: Bima Pass."], explanation: "print(name, result) — nama dan hasil kecetak bareng di satu baris, dipisah spasi." },
  { title: "CHECKPOINT 5 · Tangkap nilai yang ngaco", content: ["Lengkapi jaring pengamannya: except ValueError: dengan print() menjorok yang nampilin pesan yang jelas, kayak \"Score must be a number\". Sebutin nama error yang diharapkan — except: polos bakal nyembunyiin kesalahan lain juga."], explanation: "except ValueError:\n    print(\"Score must be a number\") — kegagalan yang diharapkan dapet pesan yang jelas, bukan crash." },
  { title: "PREDICT · Apa yang kecetak buat Bima?", content: ["Input namanya \"Bima\" dan nilainya \"84\". Apa yang program cetak?"], explanation: "\"84\" berhasil diubah jadi 84, 84 >= 70 itu True, dan print(name, result) nyetak: Bima Pass." },
  { title: "FORMALIZE · Lu udah bikin program", content: ["Lima checkpoint, satu program: dua input ke variable, int() di dalam try, if score >= 70 milih hasilnya, print(name, result) nampilin, dan except ValueError nangkep nilai ngaco. Dirakit potong demi potong, project-nya cuma konsep-konsep yang udah lu kenal.", "Nggak ada yang baru dibutuhin — nggak ada function, nggak ada collection, nggak ada import. Variable, string, casting, input, conditional, sama try/except cukup buat bikin sesuatu yang beneran jalan, dan validasinya ngejar perilaku, bukan satu source string yang persis.", "Itu inti sebuah project: konsep berhenti jadi topik lesson dan mulai jadi alat yang lu gabungin sendiri."] },
  { title: "ROBIN CHECK · Ceritakan balik", content: [miniProjectCopy.id.prompt] },
  { title: "CONNECT · Program kelar, course hampir kelar", content: ["Mini Project → Course Review / Final Practice", "Program lu jalan karena lu nggabungin apa yang lu pelajari — dan tinggal satu lesson. Course Review / Final Practice narik balik satu course: enam keluarga konsep, beberapa trace, dan final challenge buat mastiin fondasinya kuat.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getMiniProjectActivities(language: LessonLanguage) {
  return miniProjectActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [miniProjectCopy[language].prompt] } : {}),
  }));
}

export function localizeMiniProjectContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Udah nggak ada materi baru di sini — sekarang giliran lu yang bikin. Project-nya: STUDENT SCORE CHECKER, program kecil yang nanya nama sama nilai, terus ngatain Pass atau Try Again. Semua bagian-nya udah pernah lu pelajari satu-satu.",
      "Project-nya dipecah jadi lima checkpoint: 1 Inputs, 2 Conversion, 3 Decision, 4 Output, 5 Error handling. Satu checkpoint = satu potongan program. Benerin potongan kecil jauh lebih gampang daripada nulis semua sekaligus.",
      "Nggak ada function, nggak ada trik baru. Yang lu butuhin cuma variable, string, casting, input, conditional, sama try/except — dan ini bukti kalau konsep-konsep itu udah cukup buat bikin program yang beneran jalan.",
    ],
    academicExplanation: [
      "Mini project adalah program kecil yang dirakit dari konsep yang udah lu punya. Student Score Checker nanya nama siswa dan nilai, safely ngubah nilai jadi angka, milih Pass atau Try Again di threshold 70, dan nyetak hasilnya bareng nama — plus pesan yang jelas kalau nilainya bukan angka.",
      "Project-nya dibangun lewat lima checkpoint: Inputs (dua baris input()), Conversion (int() di dalam try), Decision (if score >= 70 milih \"Pass\", selain itu \"Try Again\"), Output (print(name, result)), dan Error handling (except ValueError nyetak pesan yang jelas). Tiap checkpoint satu potongan kecil yang bisa diuji — dan potongan-potongannya nyambung jadi program utuh.",
      "Validasi buat project ini sifatnya semantik, bukan kosmetik: wording, spasi, dan nama variable boleh beda, tapi program-nya harus beneran baca input, beneran konversi dengan jaga-jaga, beneran milih pakai threshold, dan beneran nyetak hasilnya bareng nama. Solusi yang cuma nyetak string tetap tanpa baca input bukan program yang jalan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Checkpoint 1 — Inputs", "Checkpoint 2 — Konversi yang dijaga", "Checkpoint 3 & 4 — Keputusan dan output", "Checkpoint 5 — Error handling"][index] ?? example.title,
      explanation: ["Dua input, dua variable: name nyimpen teks buat nanti, score_text nyimpen nilai mentah. input() selalu balikin string — makanya ada checkpoint konversi.", "int(score_text) itu baris berisiko: jalan buat \"84\" dan gagal buat \"abc\". Naruhnya di dalam try yang bikin blok except bisa njaga di Checkpoint 5.", "Threshold milih sekali, hasilnya disimpen, dan print(name, result) nampilin nama dan hasil di satu baris — print pakai koma nyambunginnya pakai spasi.", "Pas teks nilai nggak bisa diubah, ValueError kejadian dan fallback nyetak pesan yang jelas, bukan program yang crash di tengah jalan."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Mini project-nya: program CLI kecil yang ngecek nilai dan nyetak hasilnya bareng nama siswa.", "Satu potongan project — inputs, conversion, decision, output, atau error handling — yang dibangun dan dicek sendirian.", "int(score_text) di dalam try, jadi konversi yang gagal ditangani, bukan bikin crash.", "Nilai yang dipake keputusan buat bandingin: score >= 70 artinya Pass, di bawahnya artinya Try Again.", "Program dinilai dari yang beneran dia lakuin — baca, konversi, milih, cetak — bukan nyocokin satu source string.", "Pas konversi gagal, program nyetak pesan yang nolong, bukan crash atau hasil palsu."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Hardcode output-nya", "Konversi tanpa jaga-jaga", "Nama ilang dari output", "Threshold-nya salah", "Nangke pakai except polos"][index] ?? mistake.title,
      explanation: ["print(\"Bima Pass\") tanpa input dan tanpa keputusan bukan program — dia selalu nampilin hal yang sama apa pun yang diketik. Hasilnya harus datang dari input dan threshold.", "score = int(score_text) di luar try bikin seluruh program crash pas ketemu \"abc\". Konversi taruhnya di dalam try biar except bisa nangkep kegagalannya.", "print(result) ngilangin siswanya. print(name, result) nampilin dua-duanya — hasil itu punya orang.", "score > 70 nolak nilai tepat 70. Yang diminta score >= 70 — 70 sendiri lolos.", "except ValueError: nyebutin satu kegagalan yang diharapkan. except: polos juga nyembunyiin kesalahan beneran kayak nama variable yang typo."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["input(\"Score: \") ngasih apa buat teks 84 yang diketik?", "score = 70. Apa yang keputusan yang diminta cetak?", "User ngetik \"abc\" sebagai nilai. Apa yang program jadinya lakuin?"][index] ?? check.question,
      explanation: ["input() selalu balikin string, dan itu persis alasan nilainya butuh int(score_text) sebelum perbandingan >= 70.", "70 >= 70 itu True, jadi cabang if jalan dan result jadi \"Pass\".", "int(\"abc\") narik ValueError, blok except nangkep, dan fallback nyetak pesan yang jelas, bukan crash."][index] ?? check.explanation,
    })),
  };
}

export const miniProjectMasteryConceptLabels: Record<string, string> = {
  project_inputs: "Project inputs", safe_conversion: "Safe conversion", decision_output: "Decision and output",
};

export function miniProjectReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("hardcoded_output")) return id
    ? "Coba jalankan program lu di kepala dengan input beda: kalau hasil cetakannya nggak pernah berubah, bagian mana yang nggak baca input sama keputusan?"
    : "Run your program in your head with a different input: if the printed result never changes, which part never reads the inputs and the decision?";
  if (result.misconceptions.includes("conversion_skipped")) return id
    ? "Di mana letak baris int(score_text) sekarang — dan apa yang terjadi kalau \"abc\" diketik tanpa try yang njaga?"
    : "Where does the int(score_text) line sit now — and what happens when \"abc\" is typed without a try guarding it?";
  if (result.misconceptions.includes("missing_result_line")) return id
    ? "Kembalikan ke requirement-nya: output harus nunjukin apa — dan variable mana yang belum kecetak?"
    : "Go back to the requirement: what exactly must the output show — and which variable never reached the print?";
  if (result.misconceptions.includes("bare_except_confusion")) return id
    ? "except: polos nangkep apa aja — error mana yang sebenarnya diharapkan di program ini, dan bagaimana cara nyebutin dia?"
    : "A bare except: catches everything — which error is actually expected here, and how do you name it?";
  return id
    ? "Ceritakan ulang alurnya: dari dua input, konversi yang dijaga, keputusan di 70, sampai hasil kecetak bareng nama — checkpoint mana yang masih terasa goyah?"
    : "Retell the flow: two inputs, the guarded conversion, the decision at 70, and the result printed with the name — which checkpoint still feels shaky?";
}
