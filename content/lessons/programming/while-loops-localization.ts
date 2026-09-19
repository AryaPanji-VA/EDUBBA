import { whileLoopsActivities } from "./while-loops-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const whileLoopsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what makes a while loop stop — and what are the three pieces a loop needs to run correctly?",
    placeholder: "A while loop stops when..., and the three pieces are...",
    oneLine: "A while loop, start to stop",
    diagram: "condition → True → body → update → check again",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the check-first model and the three pieces, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa yang bikin sebuah while loop berhenti — dan apa tiga bagian yang harus ada biar loop-nya jalan dengan benar?",
    placeholder: "While loop-nya berhenti karena..., dan tiga bagiannya adalah...",
    oneLine: "Satu while loop, dari mulai sampai berhenti",
    diagram: "kondisi → True → body → update → cek lagi",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau model cek-dulu dan tiga bagian loop-nya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Ngulang tanpa nyalin sendiri", content: ["Print 1, 2, 3 secara manual itu tiga baris print. Print 1 sampai 100 secara manual itu seratus — dan begitu lu ganti pikiran, lu harus edit semua barisnya.", "While loop nulis kerjanya sekali dan ngasih kondisi yang menentukan berapa kali dia jalan. Program mengulang body selama kondisinya masih True — pengulangan jadi data dan logika, bukan salinan."] },
  { title: "INTUITION · Cek, jalan, update, ulangi", content: ["While loop itu sebuah siklus: kondisi dicek → True → body jalan sekali → state di-update → balik ke pengecekan. Loop-nya cuma terus muter selama pengecekannya masih jawab True.", "Di contoh, count mulai dari 1. Setiap putaran menampilkan count sekarang lalu menaikkannya satu langkah — sampai pengecekan 4 <= 3 akhirnya jawab False dan loop-nya berhenti. Output: 1, 2, 3."] },
  { title: "MENTAL MODEL · Tiga bagian", content: ["Setiap while loop yang bekerja punya tiga bagian yang sama. Starting state ngasih kondisi sesuatu untuk dicek di putaran pertama. Kondisi dicek ulang sebelum setiap putaran. Update, di dalam body, nggerakkan state ke arah pengecekan yang jadi False.", "Update adalah bagian yang paling sering dilupain pemula — dan dia bagian yang bikin loop-nya berhenti. Nggak ada update, nggak ada perubahan; nggak ada perubahan, nggak ada False; nggak ada False, nggak ada berhenti."] },
  { title: "PREDICT · Sampai mana dia ngitung?", content: ["Trace setiap putaran, termasuk pengecekan terakhir. Apa yang program ini print?"], explanation: "Pengecekan dengan count = 1, 2, 3 semuanya True — tiga putaran print 1, 2, 3. Setelah putaran ketiga, update bikin count = 4, dan pengecekan terakhir 4 <= 3 itu False: loop-nya berhenti dan 4 nggak pernah ke-print." },
  { title: "PREDICT · Ceknya duluan", content: ["count mulai di luar batas. While ngecek kondisinya sebelum putaran pertama — jadi apa yang terjadi?"], explanation: "Pengecekan pertama adalah 10 <= 3, yang langsung False. Body-nya dilewati — nol putaran — dan program lanjut ke kode setelah loop, jadi done ke-print. While loop bisa jalan nol kali." },
  { title: "SPOT · Mana yang nggak berhenti?", content: ["Dua program, hampir identik. Satu berhenti sendiri; satu lagi nggak pernah. Program mana yang nggak berhenti — dan kenapa?"], explanation: "Program B nggak punya update. count tetap 1 selamanya, jadi setiap pengecekan adalah 1 <= 3 → True: loop-nya print 1 terus-menerus. Di A, update nggerakkan count ke arah 4, tempat 4 <= 3 itu False dan loop-nya berhenti. Update itulah yang mengakhiri while loop." },
  { title: "TRY · Bikin dia ngitung, lalu berhenti", content: ["Mulai dari count = 1. Tambahkan while loop yang print count selama count <= 3, dengan update di dalam body biar loop-nya benar-benar berhenti.", "Checker-nya mau bentuk yang asli: baris while count <= 3:, print(count) yang menjorok, dan update yang menjorok — count = count + 1 (count += 1 juga boleh). Tiga print yang ditulis manual nggak akan lolos: pengulangannya harus datang dari loop-nya."], explanation: "count = 1, while count <= 3:, print(count) yang menjorok, count = count + 1 yang menjorok. Starting state memulai hitungan, kondisi mengizinkan putarannya, dan update di dalam body nggerakkan count ke 4 — tempat 4 <= 3 itu False dan loop-nya berhenti." },
  { title: "FORMALIZE · Mesin pemberhenti", content: ["While loop mengulang selama kondisinya masih True. Tiga bagian bikin itu presisi: starting state (diinisialisasi sebelum loop) ngasih kondisi value pertamanya; kondisi dicek sebelum setiap putaran; update (di dalam body) mengubah state biar pengecekannya akhirnya jadi False.", "Modelnya cek-dulu: cek → True → body → update → cek lagi → ... → False → berhenti. Putaran tempat kondisi akhirnya gagal nggak menjalankan body sama sekali — setelah print 3, update bikin count = 4, pengecekan 4 <= 3 itu False, dan loop selesai dengan output 1, 2, 3.", "Kontras: for loop (nanti, dengan range()) mengulang di atas item yang diketahui; while loop mengulang selama sebuah kondisi masih True. Kalau jumlah pengembaliannya sudah diketahui dan bisa dihitung, range() yang ambil alih; kalau berhentinya tergantung kondisi, while adalah tool-nya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [whileLoopsCopy.id.prompt] },
  { title: "CONNECT · Dari kondisi ke pola", content: ["While Loops → Range & Loop Patterns", "While loop mengulang selama kondisinya tetap True — starting state, cek, update. Tapi pas lu persis tahu mau berapa kali pengulangannya, nulis mesin start-dan-update secara manual itu kerjaan ekstra. Berikutnya Range & Loop Patterns: range() menghasilkan deret angka bulat yang bersih untuk for loop, jadi pengulangan yang diketahui dan bisa dihitung dapat bentuk yang lebih rapi.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getWhileLoopsActivities(language: LessonLanguage) {
  return whileLoopsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [whileLoopsCopy[language].prompt] } : {}),
  }));
}

export function localizeWhileLoopsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Di lesson Conditionals, if itu nanya sekali: kalau True, bloknya jalan sekali. While loop nanyanya terus: selama kondisinya masih True, blok yang menjorok jalan lagi dan lagi. Itulah cara program ngulang pekerjaan tanpa copy-paste baris yang sama.",
      "Alurnya gini: kondisi dicek → kalau True, body jalan sekali → state di-update → kondisi dicek lagi → begitu terus — sampai suatu saat ceknya False, dan loop-nya berhenti. Contoh paling klasik: hitung dari 1 sampai 3 — count = 1, while count <= 3, print(count), terus count = count + 1.",
      "Biar loop-nya berhenti, ada tiga bagian yang wajib ada: starting state yang disiapin sebelum loop, kondisi yang dicek setiap putaran, dan update di dalam body yang nggerakkan state ke arah False. Kalau updatenya lupa ditulis, kondisinya nggak pernah berubah — loop-nya muter terus tanpa berhenti. Itu namanya infinite loop.",
    ],
    academicExplanation: [
      "While loop mengulang body yang menjorok selama kondisinya masih True. Python mengevaluasi kondisi sebelum setiap putaran: True menjalankan body sekali dan mengembalikan kontrol ke pengecekan; False melewati body dan eksekusi lanjut ke kode setelah loop. Karena pengecekannya duluan, while loop bisa jalan nol kali kalau kondisinya False dari awal.",
      "Contoh intinya di-trace begini: count = 1; cek 1 <= 3 → True, print 1, update count jadi 2; cek 2 <= 3 → True, print 2, update jadi 3; cek 3 <= 3 → True, print 3, update jadi 4; cek terakhir 4 <= 3 → False, body-nya dilewati dan loop selesai. Output: 1, 2, 3 — pengecekan yang gagal nggak menjalankan body.",
      "Setiap while loop yang bekerja punya tiga bagian: starting state — variable yang jadi sandaran kondisi, diinisialisasi sebelum loop; kondisi — dicek sebelum setiap putaran; dan update — di dalam body, mengubah state biar kondisinya akhirnya jadi False. Update itulah yang bikin loop berhenti: tanpa dia, kondisinya nggak pernah berubah dan loop jalan tanpa henti (infinite loop).",
      "Kontras: for loop (nanti, dengan range()) mengulang di atas item yang diketahui; while loop mengulang selama kondisi masih True. Pakai while saat jumlah pengulangan dikendalikan oleh kondisi, bukan sudah diketahui di depan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["While loop inti", "Trace kondisi, putaran demi putaran", "Target yang beda: terus menggandakan", "Apa yang salah: update yang hilang"][index] ?? example.title,
      explanation: ["Putaran 1: 1 <= 3 itu True, jadi body print 1 dan update menggerakkan count ke 2. Putaran 2: 2 <= 3 itu True → print 2, count jadi 3. Putaran 3: 3 <= 3 itu True → print 3, count jadi 4. Cek terakhir: 4 <= 3 itu False, jadi body dilewati dan loop berhenti. Nggak ada yang ke-print untuk 4 — output-nya persis 1, 2, 3.", "Setiap putaran dimulai dengan pengecekan. Update terjadi di dalam body, setelah print — jadi value yang baru aja ke-print nggak pernah jadi value yang gagal di cek. Cek terakhir dengan count = 4 gagal, dan putaran itu nggak menjalankan body.", "Starting state-nya adalah value = 1 dan steps = 0. Setiap putaran menggandakan value dan menghitung satu langkah: 2, 4, 8, 16, 32, 64, 128. Pas value = 128, pengecekan 128 < 100 itu False, jadi loop berhenti setelah 7 putaran dan print 7. Tiga bagian yang sama — start, kondisi, update — cuma targetnya beda dari penghitung biasa.", "Contoh peringatan — jangan dijalankan. Kondisinya dicek, True, body print 1 — lalu pengecekan terjadi lagi dengan count = 1 yang sama. Nggak ada apa pun di dalam body yang menggerakkan count ke arah 4, jadi kondisinya nggak akan pernah jadi False. Update itulah bagian yang mengakhiri loop; lupa dia, loop-nya jalan tanpa henti."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Blok yang mengulang selama kondisinya masih True — Python ngecek kondisinya sebelum setiap putaran.", "Boolean expression yang dicek sebelum setiap putaran; True menjalankan body, False mengakhiri loop.", "Baris di dalam body yang mengubah state loop dan menggerakkan kondisi ke arah False.", "Variable yang jadi sandaran kondisi, diinisialisasi sebelum loop dimulai.", "Loop yang kondisinya nggak pernah jadi False — biasanya karena update-nya hilang — jadi nggak pernah berhenti.", "Satu putaran penuh loop: cek kondisinya, jalankan body sekali."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Lupa update", "Nulis update di luar body", "Kondisi yang nggak pernah jadi False", "Mengira body minimal jalan sekali", "Off-by-one di sekitar pengecekan terakhir"][index] ?? mistake.title,
      explanation: ["Tanpa count = count + 1 di dalam body, state nggak pernah berubah, kondisinya tetap True, dan loop jalan selamanya. Update itulah yang menggerakkan loop ke arah berhentinya.", "count = count + 1 harus menjorok di bawah while, di dalam body. Kalau nggak menjorok, dia cuma jalan sekali setelah loop selesai — body mengulang dengan state yang nggak pernah berubah: infinite loop.", "total = total + 3 melompat dari 9 langsung ke 12, jadi total != 10 itu True selamanya. Update bisa menggerakkan state tapi tetap meleset dari value berhenti yang pas — trace value-nya buat memastikan kondisinya bisa jadi False.", "while ngecek DULUAN. Kalau kondisinya False sebelum putaran pertama — count = 10, while count <= 3 — body jalan nol kali dan program lanjut ke kode setelah loop.", "Loop berhenti di pengecekan pertama yang gagal: setelah print 3, count jadi 4 dan 4 <= 3 itu False — jadi 4 nggak pernah ke-print. Ngeharp satu putaran ekstra (atau kurang satu) datang dari melewatkan pengecekan terakhir yang gagal di dalam trace."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Berapa kali body ini jalan?", "Apa yang di-print ini?", "Kenapa loop ini nggak pernah berhenti?"][index] ?? check.question,
      explanation: ["Pengecekan dengan count = 1, 2, 3, 4, 5 semuanya True — lima putaran. Pengecekan berikutnya, 6 <= 5, itu False, jadi loop berhenti sebelum putaran keenam.", "3 > 0, 2 > 0, 1 > 0 semuanya True — tiga putaran print 3, 2, 1. Lalu 0 > 0 itu False, jadi loop berhenti sebelum print 0.", "Update menggerakkan total, tapi 3 sekaligus — dia melompat dari 9 ke 12 dan nggak pernah sama dengan 10. Kondisinya nggak akan pernah jadi False, jadi loop jalan tanpa henti."][index] ?? check.explanation,
    })),
  };
}

export const whileLoopsMasteryConceptLabels: Record<string, string> = {
  while_condition: "Condition checked every pass", while_update: "Update toward False", while_structure: "Loop structure (three pieces)",
};

export function whileLoopsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("missing_counter_update")) return id
    ? "Cari baris yang mengubah state di dalam body: apa yang terjadi ke count setiap putaran, dan ke mana dia menuju?"
    : "Find the line that changes the state inside the body: what happens to count on every pass, and where is it heading?";
  if (result.misconceptions.includes("condition_never_false")) return id
    ? "Trace tiap pengecekan: pada count berapa kondisinya jadi False — dan apa yang dijalankan body di putaran itu?"
    : "Trace every check: at which count does the condition become False — and what does the body run on that pass?";
  if (result.misconceptions.includes("update_outside_body")) return id
    ? "Lihat lekukan barisnya: baris mana saja yang termasuk body while, dan apa yang terjadi kalau updatenya keluar dari situ?"
    : "Look at the indentation: which lines belong to the while body, and what happens if the update falls outside it?";
  if (result.misconceptions.includes("body_runs_at_least_once")) return id
    ? "Ingat urutannya: while ngecek dulu sebelum putaran pertama. Apa yang terjadi ke body kalau pengecekan pertama sudah False?"
    : "Remember the order: while checks FIRST, before the first pass. What happens to the body if the very first check is already False?";
  if (result.misconceptions.includes("hardcoded_repetition")) return id
    ? "Bandingin tiga print yang ditulis manual dengan satu while loop: mana yang bisa berhenti sendiri karena kondisinya, dan mana yang cuma salinan?"
    : "Compare three handwritten prints with one while loop: which one stops itself through a condition, and which one is just copies?";
  return id
    ? "Restate siklusnya: cek → True → body → update → cek lagi → ... → False → berhenti. Di titik mana loop lu berhenti?"
    : "Restate the cycle: check → True → body → update → check again → ... → False → stop. At which point does your loop stop?";
}
