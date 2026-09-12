import { variablesActivities } from "./programming/variables-activities";
import type { LessonContent } from "./types";
export type { LessonLanguage } from "./shared-copy";
import type { LessonLanguage } from "./shared-copy";
import { lessonLanguageStorageKey } from "./shared-copy";
export { lessonLanguageStorageKey };

export function localizeSourceNote(note: string, language: LessonLanguage) {
  const notes: Record<string, string> = {
    "Beginner examples of names, values, and assignment.": "Contoh awal tentang nama, value, dan assignment.",
    "University course examples using variables and expressions.": "Contoh dari materi kuliah yang memakai variable dan expression.",
    "Beginner explanations, naming rules, and practice.": "Penjelasan pengantar, aturan penamaan, dan latihan.",
    "Authoritative assignment and rebinding semantics.": "Rujukan resmi tentang semantik assignment dan rebinding.",
  };
  return language === "id" ? notes[note] ?? note : note;
}

export const lessonCopy = {
  en: {
    step: "Step", of: "of", references: "Sources / References", previous: "Previous", next: "Continue",
    check: "Check answer", reveal: "Reveal + explain", correct: "Correct.", incorrect: "Not quite.",
    unsupported: "Not one of the supported forms.", revise: "You can revise your answer and check again.",
    prediction: "Your prediction", oneLine: "One Python line", diagram: "name → value / diagram",
    copy: "COPY", copied: "COPIED ✓", finish: "Complete lesson", finished: "Completed this session",
    complete: "Lesson complete — for this session.", completeNote: "You finished the flow, not a mastery assessment. Reloading starts a fresh session.",
    gate: "Submit a response and read the feedback to continue.", checkGate: "Complete Robin Check or choose to continue without AI.",
    encouragement: "One step at a time. You don't need to memorize every term tonight.",
    notes: "Academic notes, examples & Quick Checks", academic: "Academic explanation", definition: "The formal model",
    examples: "Assignment in action", terms: "Key terms", mistakes: "Common mistakes", quickCheck: "Quick Check",
    sourceAccess: "Sources / References — available at every step", sourceSupport: "Sources supporting this lesson",
    sourceIntro: "These references support the lesson’s original synthesis; the lesson is not copied from them.",
    unknownPublisher: "Unknown publisher", beginner: "beginner", structured: "guided learning", sources: "sources",
    module: "Module", moduleTitle: "Programming Building Blocks", courses: "Courses", mode: "Lesson mode", language: "Lesson language",
    loading: "Loading lesson…", loadingNote: "The backend is assembling metadata, references, and lesson content.",
    loadError: "The lesson could not load. Please try again.", retry: "Try again",
    prompt: "Explain in your own words: what actually happens when Python executes x = 5?",
    answerLabel: "Your explanation — Indonesian or English", placeholder: "When Python runs x = 5…",
    checkIntro: "Explain your understanding, not textbook wording. AI feedback is a learning signal, not a precise measurement. Nothing here is saved to learning memory.",
    submit: "Ask Robin to check", processing: "Checking understanding…", unavailable: "Robin Check is unavailable right now. Your answer is still here. Try again or continue without AI.",
    skip: "Continue without AI evaluation", skipped: "AI evaluation skipped. No understanding signal was assigned.",
    sourceCheck: "Source Mode: no AI evaluation. Use the name → object model to review your explanation, then continue without AI.",
    strong: "Strong · core idea demonstrated", developing: "Developing · reinforce the idea", shaky: "Shaky · revisit the idea",
    followup: "One focused retry", retrySubmit: "Check revised explanation", retryDone: "You can continue now, even if the idea still needs practice. No mastery result is stored.",
    characters: "characters · stays on this page", feedbackNote: "Feedback follows the language of your answer; switching lesson language does not re-run AI.",
    feedbackLoading: "Robin lagi ngecek bagian yang ketuker…", feedbackReady: "Robin:", feedbackUnavailable: "AI feedback unavailable. The explanation above still applies.",
    followUpLabel: "Try this:", followUpNote: "Display only — not graded. Continue when ready.",
    masteryTitle: "Your understanding", masteryRefresh: "Refresh", masteryNote: "Evidence-based, not page completion. One mistake doesn't erase strong understanding; one correct answer doesn't create it.",
    masteryUnseen: "Not assessed", masteryShaky: "Shaky", masteryDeveloping: "Developing", masteryStrong: "Strong",
    masteryVariable: "Variable", masteryAssignment: "Assignment", masteryReassignment: "Reassignment",
    masteryExpression: "Expressions", masteryNameBinding: "Name binding", masteryIdentifierNaming: "Naming",
  },
  id: {
    step: "Langkah", of: "dari", references: "Sumber / Referensi", previous: "Sebelumnya", next: "Lanjut",
    check: "Cek jawaban", reveal: "Lihat hasil + penjelasan", correct: "Bener.", incorrect: "Belum pas.",
    unsupported: "Belum cocok dengan dua bentuk yang dicek di latihan ini.", revise: "Boleh ubah jawaban, lalu cek lagi.",
    prediction: "Prediksi kamu", oneLine: "Satu baris Python", diagram: "nama → value / diagram",
    copy: "SALIN", copied: "TERSALIN ✓", finish: "Selesaikan lesson", finished: "Selesai untuk sesi ini",
    complete: "Lesson selesai — untuk sesi ini.", completeNote: "Alurnya sudah selesai, bukan berarti mastery sudah dinilai. Reload akan mulai sesi baru.",
    gate: "Kirim jawaban dan baca feedback dulu sebelum lanjut.", checkGate: "Selesaikan Robin Check atau pilih lanjut tanpa AI.",
    encouragement: "Satu langkah dulu. Nggak perlu hafal semua istilah malam ini.",
    notes: "Catatan akademik, contoh & Quick Checks", academic: "Penjelasan akademik", definition: "Model yang lebih tepat",
    examples: "Lihat assignment bekerja", terms: "Istilah penting", mistakes: "Yang sering ketuker", quickCheck: "Quick Check",
    sourceAccess: "Sumber / Referensi — bisa dibuka di setiap langkah", sourceSupport: "Sumber pendukung lesson",
    sourceIntro: "Referensi ini mendukung penjelasan yang ditulis untuk lesson ini; isinya bukan salinan dari sumber tersebut.",
    unknownPublisher: "Penerbit tidak diketahui", beginner: "pemula", structured: "belajar bertahap", sources: "sumber",
    module: "Modul", moduleTitle: "Dasar Penyusun Program", courses: "Mata kuliah", mode: "Mode lesson", language: "Bahasa lesson",
    loading: "Memuat lesson…", loadingNote: "Backend lagi merakit metadata, referensi, dan isi lesson.",
    loadError: "Lesson belum bisa dimuat. Coba lagi sebentar.", retry: "Coba lagi",
    prompt: "Coba jelasin pakai bahasa lu sendiri: waktu Python menjalankan x = 5, sebenernya apa yang terjadi?",
    answerLabel: "Penjelasan kamu — boleh Indonesia atau Inggris", placeholder: "Waktu Python menjalankan x = 5…",
    checkIntro: "Pakai pemahaman kamu sendiri, nggak perlu meniru buku. Feedback AI itu petunjuk belajar, bukan ukuran yang pasti. Jawaban ini tidak disimpan ke learning memory.",
    submit: "Minta Robin cek", processing: "Lagi cek pemahaman…", unavailable: "Robin Check belum bisa dipakai. Jawaban kamu masih ada. Coba lagi atau lanjut tanpa AI.",
    skip: "Lanjut tanpa evaluasi AI", skipped: "Evaluasi AI dilewati. Tidak ada sinyal pemahaman yang diberikan.",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penjelasan dengan model nama → object, lalu lanjut tanpa AI.",
    strong: "Strong · inti konsep sudah terlihat", developing: "Developing · perlu penguatan singkat", shaky: "Shaky · konsep perlu ditinjau lagi",
    followup: "Satu percobaan terarah", retrySubmit: "Cek penjelasan revisi", retryDone: "Sekarang boleh lanjut, walaupun konsepnya masih perlu latihan. Tidak ada hasil mastery yang disimpan.",
    characters: "karakter · hanya di halaman ini", feedbackNote: "Bahasa feedback mengikuti jawaban kamu; ganti bahasa lesson tidak menjalankan AI lagi.",
    feedbackLoading: "Robin lagi ngecek bagian yang ketuker…", feedbackReady: "Robin:", feedbackUnavailable: "Feedback AI belum tersedia. Penjelasan di atas tetap berlaku.",
    followUpLabel: "Coba ini:", followUpNote: "Hanya tampilan — nggak dinilai. Lanjut aja kalau udah siap.",
    masteryTitle: "Pemahaman lu", masteryRefresh: "Segarkan", masteryNote: "Berdasarkan bukti, bukan kelar halaman. Satu salah nggak ngilangin pemahaman kuat; satu bener nggak langsung bikin kuat.",
    masteryUnseen: "Belum diuji", masteryShaky: "Masih goyang", masteryDeveloping: "Mulai masuk", masteryStrong: "Kuat",
    masteryVariable: "Variable", masteryAssignment: "Assignment", masteryReassignment: "Reassignment",
    masteryExpression: "Expressions", masteryNameBinding: "Name binding", masteryIdentifierNaming: "Penamaan",
  },
};

// Only prose changes. IDs, code, option values, and grading answers stay shared.
const indonesianActivities = [
  { title: "WHY · Kenapa value perlu nama?", content: ["Program perlu memakai hal yang punya arti: username, score, price, atau tempo lagu. Dengan nama, kita bisa memakai value itu lagi tanpa mengulang angkanya di mana-mana.", "Kalau lagunya makin cepat, program tetap bisa memakai nama tempo, sementara value yang dirujuknya berubah."] },
  { title: "INTUITION · Nama untuk sebuah value", content: ["Gampangnya, tempo itu nama yang kita kasih ke value 92 supaya program bisa pakai value itu lagi. Saat butuh tempo lagu, program tinggal memakai nama tempo."] },
  { title: "PREDICT · Apa yang akan dicetak?", content: ["Pilih output-nya dulu, baru lihat penjelasannya."], explanation: "print(tempo) membaca value yang dirujuk nama tempo: 92. Yang dicetak bukan tulisan tempo. Nama itu sudah mendapat assignment, jadi kode ini tidak memunculkan error." },
  { title: "SEE · Assignment menghubungkan nama dan value", content: ["tempo adalah nama. 92 adalah value. Baris tempo = 92 melakukan assignment: nama tempo di-bind ke object integer dengan value 92.", "Panah ini diagram hubungan, bukan kode Python. Tanda = di sini melakukan assignment, bukan mengecek apakah dua value sama."] },
  { title: "PREDICT · Ikuti assignment kedua", content: ["Baca barisnya berurutan. Waktu print berjalan, nama tempo merujuk value yang mana?"], explanation: "Assignment kedua mengikat ulang tempo ke 110. Satu pemanggilan print membaca binding yang sekarang, bukan riwayat value dan bukan dua value sekaligus." },
  { title: "TRY · Ubah jumlah pendengar", content: ["Tulis satu baris Python yang mengubah listeners menjadi 150. Kode tidak dijalankan; latihan ini hanya mengecek dua bentuk jawaban."], explanation: "listeners = 150 langsung mengikat nama itu ke 150. listeners = listeners + 30 membaca 120, menambah 30, lalu mengikat ulang listeners ke hasilnya." },
  { title: "FORMALIZE · Nama di-bind ke object", content: ["Identifier adalah nama yang valid di dalam kode. Assignment mengevaluasi expression di sebelah kanan, lalu mengikat object hasilnya ke nama di sebelah kiri. Object punya value dan type; nama membuat program bisa merujuknya.", "Reassignment mengubah binding itu. Operasi ini tidak dengan sendirinya mengubah object sebelumnya. Analogi kotak cuma pengantar: di Python, model nama → object binding lebih tepat."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [lessonCopy.id.prompt] },
  { title: "CONNECT · Konsep ini nyambung ke mana?", content: ["Variables → expressions → conditionals → loops → functions", "Expression memakai value lewat nama. Condition menentukan pilihan, loop bisa memperbarui value, dan function mengatur pekerjaan. Name binding akan muncul lagi saat belajar function scope.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban dan posisi langkah hanya ada di sesi ini, lalu reset saat reload."] },
];

export function getVariablesActivities(language: LessonLanguage) {
  return variablesActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [lessonCopy[language].prompt] } : {}),
    optionLabels: language === "id" ? { "92 and 110": "92 dan 110" } : undefined,
  }));
}

export function localizeVariablesContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Variable adalah identifier yang melalui binding dapat dipakai untuk merujuk suatu value. Assignment mengevaluasi expression di kanan, lalu mengikat object hasilnya ke target nama di kiri.",
      "Saat identifier yang sama mendapat assignment lagi, Python mengikat ulang nama itu ke object baru. Ini disebut reassignment. Nama bukan wadah fisik; analogi kotak hanya model awal, bukan gambaran lengkap semantik Python.",
      "Python memakai dynamic typing: value memiliki type, sedangkan nama dapat diikat ulang ke value dengan type berbeda. Nama yang jelas membantu pembaca memahami maksud program.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Assignment pertama", "Reassignment", "Variable di dalam expression", "Nama yang mudah dibaca"][index] ?? example.title,
      explanation: ["Nama cups_of_coffee di-bind ke value 2.", "Assignment kedua mengikat ulang score, jadi nama itu sekarang merujuk value yang baru.", "Expression membaca dua variable, mengalikan value-nya, lalu mengikat hasilnya ke total.", "Nama dengan snake_case yang deskriptif membantu kita mengenali maksud value-nya."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Referensi bernama yang dipakai program untuk merujuk value.", "Data yang dipakai program, misalnya 42, True, atau \"Arya\".", "Operasi yang mengikat target nama ke hasil sebuah expression.", "Nama valid pilihan programmer untuk mengenali sesuatu dalam kode.", "Assignment baru untuk nama yang sebelumnya sudah memiliki binding."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Ketuker = dan ==", "Identifier tidak valid", "Membaca nama sebelum assignment", "Nama yang maksudnya tidak jelas"][index] ?? mistake.title,
      explanation: ["Di Python, = melakukan assignment. Operator == membandingkan kesamaan dua value.", "Nama tidak boleh dimulai dengan angka, berisi spasi atau tanda hubung, atau memakai keyword Python seperti class.", "Nama yang belum di-bind tidak bisa dibaca. Pada contoh sederhana ini, Python akan memunculkan NameError.", "Nama x boleh untuk rumus kecil, tetapi nama deskriptif lebih mudah dipahami dalam program yang lebih besar."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa output program ini?", "Mana identifier Python yang valid dan mudah dibaca?", "Operator mana yang membandingkan kesamaan dua value di Python?"][index] ?? check.question,
      explanation: ["Python membaca value lama 1, menambah 2, lalu mengikat ulang level ke hasilnya, yaitu 3.", "Nama ini diawali huruf, hanya memakai huruf dan underscore, serta bukan keyword Python.", "== mengecek apakah dua value sama. Satu tanda = melakukan assignment."][index] ?? check.explanation,
    })),
  };
}
