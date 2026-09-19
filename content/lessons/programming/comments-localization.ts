import { commentsActivities } from "./comments-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const commentsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Fundamentals",
    prompt: "Explain in your own words: what is a comment, and why does Python not run it?",
    placeholder: "A comment is a note for humans, and Python...",
    oneLine: "One Python line",
    diagram: "code → skip comment → run → output",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the comment rules and the pipeline, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fundamental Pemrograman",
    prompt: "Jelasin pakai bahasa lu sendiri: apa itu comment, dan kenapa Python tidak menjalankannya?",
    placeholder: "Comment itu catatan buat manusia, dan Python...",
    oneLine: "Satu baris Python",
    diagram: "code → lewati comment → jalan → output",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau aturan comment dan pipeline-nya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Code dibaca dua kali", content: ["Code dibaca dua kali: Python menjalankannya, dan manusia mencoba memahaminya — termasuk lu sendiri, tiga minggu dari sekarang.", "Comment adalah catatan di dalam file code yang ditulis untuk pembaca manusia. Kebiasaan kecil, dampaknya besar: code bilang apa yang terjadi, comment bilang kenapa."] },
  { title: "INTUITION · Python melewati catatannya", content: ["Tanda # menandai sisa baris itu sebagai catatan. Python melewatinya sepenuhnya — catatan tidak punya efek apa pun pada program.", "Pipeline-nya bertambah satu langkah: Python membaca code, melewati comment, menjalankan instruksi, lalu menghasilkan output."] },
  { title: "SEE · Code, comment, dan output", content: ["Tiga hal berbeda di satu layar. Baris 1 adalah comment — buat manusia. Baris 2 adalah code — yang dijalankan Python. Yang muncul di bawah adalah output — hasil yang kelihatan.", "Keduanya bukan jenis teks yang sama. Comment tidak pernah jalan, instruksi menghasilkan output, dan hanya output itulah yang dilihat pemakai program."] },
  { title: "MENTAL MODEL · Pipeline dengan comment", content: ["Comment ikut tinggal di dalam file code tapi tidak ikut dalam program. Instruksinya saja yang menghasilkan output.", "Makanya menambah atau menghapus comment tidak pernah mengubah apa yang dilakukan program — yang berubah hanya pemahaman pembaca manusianya."] },
  { title: "PREDICT · Apa yang dicetak?", content: ["Baris pertama adalah comment; baris kedua adalah instruksi. Apa yang muncul di layar?"], explanation: "Python melewati baris yang di-comment sepenuhnya — walaupun bentuknya seperti code — dan hanya menjalankan instruksi kedua. Catatan tidak pernah dicetak dan tidak pernah menghentikan program." },
  { title: "PREDICT · Catatan di baris yang sama", content: ["Instruksi dan catatannya berbagi satu baris. Apa yang muncul di layar?"], explanation: "Hanya bagian sebelum # yang dijalankan. Comment setelah code di baris yang sama tidak pernah mengubah output." },
  { title: "SPOT · Mana yang mana?", content: ["Dua baris dari sebuah file code. Pernyataan mana yang benar?"], explanation: "Tanda # di awal baris 1 menjadikan seluruh barisnya catatan. Baris 2 diawali print — itulah instruksinya. Python menjalankan instruksinya dan melewati catatannya." },
  { title: "TRY · Tulis catatanmu sendiri", content: ["Tulis satu baris comment dengan teks: menyapa pengguna. Ingat apa yang menandai sebuah baris sebagai catatan."], explanation: "# menyapa pengguna — tanda hash menjadikan baris itu catatan untuk manusia, yang dilewati Python." },
  { title: "FORMALIZE · Apa itu comment", content: ["Comment adalah catatan di source code untuk pembaca manusia. Tanda hash # mengawalinya; semua teks setelah # di baris itu diabaikan saat program dijalankan. Comment bisa berdiri di baris sendiri atau setelah instruksi di baris yang sama.", "Comment yang baik itu pendek dan menambah makna: ia menjelaskan maksud — kenapa baris itu ada — bukan mengulang apa yang sudah ditunjukkan code-nya.", "Pipeline lengkapnya: Python membaca code, melewati comment, menjalankan instruksi, menghasilkan output. Lesson berikutnya menutup Module 01 dengan apa yang terjadi kalau code tidak sesuai aturan: Understanding Errors."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [commentsCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Comments → Understanding Errors", "Sekarang lu bisa menulis instruksi, menampilkan output, dan meninggalkan catatan buat manusia. Satu skill beginner terakhir di Module 01: apa yang terjadi — dan apa yang Python bilang — kalau code tidak sesuai aturan.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getCommentsActivities(language: LessonLanguage) {
  return commentsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [commentsCopy[language].prompt] } : {}),
  }));
}

export function localizeCommentsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Code dibaca dua kali: Python menjalankannya, dan manusia mencoba memahaminya. Comment adalah catatan di dalam file code yang ditulis untuk pembaca manusia — baris pendek yang menjelaskan apa yang code lakukan dan kenapa.",
      "Comment diawali tanda hash #. Semua teks setelah # di baris itu adalah catatan, dan Python mengabaikannya sepenuhnya saat program dijalankan. Instruksinya tetap bekerja; catatannya cuma ikut serta.",
      "Jadi gambaran lengkap satu program kecil begini: Python membaca code, melewati comment, menjalankan instruksi, dan menghasilkan output. Tiga hal berbeda di satu layar: code, comment, output.",
    ],
    academicExplanation: [
      "Comment adalah catatan di source code yang ditujukan untuk pembaca manusia. Tanda hash # mengawali sebuah comment, dan sisa baris itu diabaikan ketika program dieksekusi. Comment tidak berpengaruh apa pun pada perilaku program maupun output-nya.",
      "Sebuah comment bisa berada di baris sendiri di atas code yang dijelaskannya, atau di baris yang sama setelah sebuah instruksi. Dalam kedua bentuk itu, hanya bagian sebelum # yang dijalankan; catatannya dilewati.",
      "Comment yang berguna menambah konteks yang tidak bisa diucapkan code itu sendiri — maksud di balik sebuah instruksi — bukan mengulang apa yang sudah terlihat. Pendek dan membantu mengalahkan panjang dan jelas-sendiri.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Comment di baris sendiri", "Comment di baris yang sama", "Catatan yang membantu vs yang mengulang"][index] ?? example.title,
      explanation: ["Baris 1 adalah comment — catatan untuk manusia, diabaikan Python. Baris 2 adalah code — instruksi yang dijalankan. Yang muncul adalah output: hanya yang ditampilkan instruksinya.", "Comment juga bisa mengikuti code di baris yang sama. Hanya bagian sebelum # yang dijalankan; catatan setelahnya dilewati. Output-nya tidak berubah.", "Catatan pertama mengulang yang sudah ditunjukkan code. Catatan kedua menjelaskan maksudnya — kenapa baris itu ada. Comment yang baik pendek dan menambah makna, bukan gema."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Catatan di source code untuk pembaca manusia; diabaikan saat program dijalankan.", "Tanda yang mengawali sebuah comment; semua teks setelahnya di baris itu adalah catatan.", "Comment yang ditulis di baris yang sama, setelah sebuah instruksi.", "Tujuan di balik sebuah instruksi — hal yang dijelaskan comment yang baik."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengira comment ikut dijalankan", "Menulis catatan yang mengulang code", "Lupa tanda hash", "Menulis esai di dalam code"][index] ?? mistake.title,
      explanation: ["Python melewati comment sepenuhnya. Comment tidak pernah menghasilkan output dan tidak pernah mengubah apa yang dilakukan instruksi.", "# print Hello tidak menambah apa pun — code-nya sudah bilang begitu. Jelaskan maksudnya: untuk siapa, dan kenapa baris itu ada.", "Tanpa #, sebuah catatan dibaca sebagai code — bentuk yang tidak dikenali Python. Setiap catatan diawali #.", "Comment itu catatan, bukan paragraf. Satu baris pendek yang menangkap maksud itu membantu; tembok teks juga dilewati manusia."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa itu comment?", "Apa yang Python lakukan dengan comment?", "print(\"Hello!\") # menampilkan sapaan — apa yang muncul?"][index] ?? check.question,
      explanation: ["Comment menjelaskan code ke manusia; Python melewatinya saat program dijalankan.", "Semua teks setelah # di baris itu dilewati Python. Output hanya berasal dari instruksi.", "Hanya bagian sebelum # yang dijalankan. Comment setelah code di baris yang sama tidak pernah mengubah output."][index] ?? check.explanation,
    })),
  };
}

export const commentsMasteryConceptLabels: Record<string, string> = {
  comment_purpose: "Why comments", comment_syntax: "The # marker", code_comment_output: "Code vs comment vs output",
};

export function commentsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("comments_executed_confusion")) return id
    ? "Lagi baris yang di-comment itu: Python membacanya lalu apa? Coba jalankan programnya di kepala, baris demi baris."
    : "Back to the commented line: Python reads it, and then what? Run the program in your head, line by line.";
  if (result.misconceptions.includes("comments_displayed_confusion")) return id
    ? "Pisahkan dua bagian barisnya: apa yang ada sebelum #, dan apa yang ada setelahnya? Mana yang dijalankan, mana yang dilewati?"
    : "Split the line in two: what comes before the #, and what comes after? Which part runs, and which is skipped?";
  if (result.misconceptions.includes("comment_stops_program_confusion")) return id
    ? "Comment itu catatan, bukan rem. Apa yang Python temukan di baris berikutnya setelah melewati sebuah comment?"
    : "A comment is a note, not a brake. What does Python find on the next line after skipping a comment?";
  if (result.misconceptions.includes("comment_syntax_confusion")) return id
    ? "Cek tanda awalannya: baris mana yang diawali #, dan apa artinya di Python?"
    : "Check the starting marks: which line begins with #, and what does that mean in Python?";
  return id
    ? "Restate pipeline-nya: code → lewati comment → jalan → output. Di titik mana comment keluar dari cerita, dan apa yang menyisanya?"
    : "Restate the pipeline: code → skip comment → run → output. Where do comments drop out of the story, and what remains?";
}
