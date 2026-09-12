// Shared lesson types and UI strings.
// Lesson-specific copy (prompts, concept labels, module titles) lives in each lesson's own localization file.

export type LessonLanguage = "id" | "en";
export const lessonLanguageStorageKey = "robin.lessonLanguage";
export const sharedCopy = {
  step: "Step", of: "of", references: "Sources / References", previous: "Previous", next: "Continue",
  check: "Check answer", reveal: "Reveal + explain", correct: "Correct.", incorrect: "Not quite.",
  unsupported: "Not one of the supported forms.", revise: "You can revise your answer and check again.",
  prediction: "Your prediction", oneLine: "One Python line", diagram: "name → value / diagram",
  copy: "COPY", copied: "COPIED ✓", finish: "Complete lesson", finished: "Completed this session",
  complete: "Lesson complete — for this session.", completeNote: "You finished the flow, not a mastery assessment. Reloading starts a fresh session.",
  gate: "Submit a response and read the feedback to continue.", checkGate: "Complete Robin Check or choose to continue without AI.",
  encouragement: "One step at a time. You don't need to memorize every term tonight.",
  notes: "Academic notes, examples & Quick Checks", academic: "Academic explanation", definition: "The formal model",
  examples: "Examples", terms: "Key terms", mistakes: "Common mistakes", quickCheck: "Quick Check",
  sourceAccess: "Sources / References — available at every step", sourceSupport: "Sources supporting this lesson",
  sourceIntro: "These references support the lesson's original synthesis; the lesson is not copied from them.",
  unknownPublisher: "Unknown publisher", beginner: "beginner", structured: "guided learning", sources: "sources",
  module: "Module", courses: "Courses", mode: "Lesson mode", language: "Lesson language",
  loading: "Loading lesson…", loadingNote: "The backend is assembling metadata, references, and lesson content.",
  loadError: "The lesson could not load. Please try again.", retry: "Try again",
  answerLabel: "Your explanation — Indonesian or English",
  checkIntro: "Explain your understanding, not textbook wording. AI feedback is a learning signal, not a precise measurement. Nothing here is saved to learning memory.",
  submit: "Ask Robin to check", processing: "Checking understanding…", unavailable: "Robin Check is unavailable right now. Your answer is still here. Try again or continue without AI.",
  skip: "Continue without AI evaluation", skipped: "AI evaluation skipped. No understanding signal was assigned.",
  sourceCheck: "Source Mode: no AI evaluation. Review your explanation, then continue without AI.",
  strong: "Strong · core idea demonstrated", developing: "Developing · reinforce the idea", shaky: "Shaky · revisit the idea",
  followup: "One focused retry", retrySubmit: "Check revised explanation", retryDone: "You can continue now, even if the idea still needs practice. No mastery result is stored.",
  characters: "characters · stays on this page", feedbackNote: "Feedback follows the language of your answer; switching lesson language does not re-run AI.",
  feedbackLoading: "Robin lagi ngecek bagian yang ketuker…", feedbackReady: "Robin:", feedbackUnavailable: "AI feedback unavailable. The explanation above still applies.",
  followUpLabel: "Try this:", followUpNote: "Display only — not graded. Continue when ready.",
  masteryTitle: "Your understanding", masteryRefresh: "Refresh", masteryNote: "Evidence-based, not page completion. One mistake doesn't erase strong understanding; one correct answer doesn't create it.",
  masteryUnseen: "Not assessed", masteryShaky: "Shaky", masteryDeveloping: "Developing", masteryStrong: "Strong",
} as const;

export const sharedCopyId: Record<string, string> = {
  step: "Langkah", of: "dari", references: "Sumber / Referensi", previous: "Sebelumnya", next: "Lanjut",
  check: "Cek jawaban", reveal: "Lihat hasil + penjelasan", correct: "Bener.", incorrect: "Belum pas.",
  unsupported: "Belum cocok dengan bentuk yang dicek di latihan ini.", revise: "Boleh ubah jawaban, lalu cek lagi.",
  prediction: "Prediksi kamu", oneLine: "Satu baris Python", diagram: "nama → value / diagram",
  copy: "SALIN", copied: "TERSALIN ✓", finish: "Selesaikan lesson", finished: "Selesai untuk sesi ini",
  complete: "Lesson selesai — untuk sesi ini.", completeNote: "Alurnya sudah selesai, bukan berarti mastery sudah dinilai. Reload akan mulai sesi baru.",
  gate: "Kirim jawaban dan baca feedback dulu sebelum lanjut.", checkGate: "Selesaikan Robin Check atau pilih lanjut tanpa AI.",
  encouragement: "Satu langkah dulu. Nggak perlu hafal semua istilah malam ini.",
  notes: "Catatan akademik, contoh & Quick Checks", academic: "Penjelasan akademik", definition: "Model yang lebih tepat",
  examples: "Lihat contoh", terms: "Istilah penting", mistakes: "Yang sering ketuker", quickCheck: "Quick Check",
  sourceAccess: "Sumber / Referensi — bisa dibuka di setiap langkah", sourceSupport: "Sumber pendukung lesson",
  sourceIntro: "Referensi ini mendukung penjelasan yang ditulis untuk lesson ini; isinya bukan salinan dari sumber tersebut.",
  unknownPublisher: "Penerbit tidak diketahui", beginner: "pemula", structured: "belajar bertahap", sources: "sumber",
  module: "Modul", courses: "Mata kuliah", mode: "Mode lesson", language: "Bahasa lesson",
  loading: "Memuat lesson…", loadingNote: "Backend lagi merakit metadata, referensi, dan isi lesson.",
  loadError: "Lesson belum bisa dimuat. Coba lagi sebentar.", retry: "Coba lagi",
  answerLabel: "Penjelasan kamu — boleh Indonesia atau Inggris",
  checkIntro: "Pakai pemahaman kamu sendiri, nggak perlu meniru buku. Feedback AI itu petunjuk belajar, bukan ukuran yang pasti. Jawaban ini tidak disimpan ke learning memory.",
  submit: "Minta Robin cek", processing: "Lagi cek pemahaman…", unavailable: "Robin Check belum bisa dipakai. Jawaban kamu masih ada. Coba lagi atau lanjut tanpa AI.",
  skip: "Lanjut tanpa evaluasi AI", skipped: "Evaluasi AI dilewati. Tidak ada sinyal pemahaman yang diberikan.",
  sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penjelasan kamu, lalu lanjut tanpa AI.",
  strong: "Strong · inti konsep sudah terlihat", developing: "Developing · perlu penguatan singkat", shaky: "Shaky · konsep perlu ditinjau lagi",
  followup: "Satu percobaan terarah", retrySubmit: "Cek penjelasan revisi", retryDone: "Sekarang boleh lanjut, walau pun konsepnya masih perlu latihan. Tidak ada hasil mastery yang disimpan.",
  characters: "karakter · hanya di halaman ini", feedbackNote: "Bahasa feedback mengikuti jawaban kamu; ganti bahasa lesson tidak menjalankan AI lagi.",
  feedbackLoading: "Robin lagi ngecek bagian yang ketuker…", feedbackReady: "Robin:", feedbackUnavailable: "Feedback AI belum tersedia. Penjelasan di atas tetap berlaku.",
  followUpLabel: "Coba ini:", followUpNote: "Hanya tampilan — nggak dinilai. Lanjut aja kalau udah siap.",
  masteryTitle: "Pemahaman lu", masteryRefresh: "Segarkan", masteryNote: "Berdasarkan bukti, bukan kelar halaman. Satu salah nggak ngilangin pemahaman kuat; satu bener nggak langsung bikin kuat.",
  masteryUnseen: "Belum diuji", masteryShaky: "Masih goyang", masteryDeveloping: "Mulai masuk", masteryStrong: "Kuat",
};

export function getSharedCopy(language: LessonLanguage): Record<string, string> {
  return language === "id" ? sharedCopyId : sharedCopy as Record<string, string>;
}
