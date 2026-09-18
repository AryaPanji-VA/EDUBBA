import { setsIntroActivities } from "./sets-intro-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const setsIntroCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Sets and Relations",
    prompt: "Using A = {1, 2, 3}, explain in your own words the difference between 2 ∈ A and {2} ⊆ A.",
    placeholder: "2 is an element, while {2} is...",
    oneLine: "Your answer",
    diagram: "notation",
    codeLabel: "notation",
    sourceCheck: "Source Mode: no AI evaluation. Review membership versus subset, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Himpunan dan Relasi",
    prompt: "Jelasin pakai bahasa lu sendiri bedanya 2 ∈ A dan {2} ⊆ A, pakai contoh A = {1, 2, 3}.",
    placeholder: "2 itu elemennya, sedangkan {2} itu...",
    oneLine: "Jawaban kamu",
    diagram: "notasi",
    codeLabel: "notasi",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau keanggotaan versus himpunan bagian, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa kumpulan butuh ketepatan", content: ["Program terus-menerus bekerja dengan kumpulan: playlist, daftar kontak, himpunan mahasiswa aktif. Supaya bisa dinalar dengan tepat, “apa isi kumpulan ini” butuh definisi yang pasti.", "Set adalah bahasa matematika untuk kumpulan: database, pencarian, dan penyaringan sebenarnya semua pertanyaan keanggotaan dan himpunan bagian."] },
  { title: "INTUITION · Kumpulan dengan batas yang jelas", content: ["Set adalah kumpulan yang hanya soal keanggotaan: sebuah objek ada di dalamnya atau tidak.", "Urutan penulisan maupun pencatatan ganda tidak mengubah set. {1, 2, 3} dan {3, 1, 2, 2} adalah kumpulan yang sama."] },
  { title: "REPRESENT · ∈ dan ⊆", content: ["∈ menghubungkan elemen dengan set. ⊆ menghubungkan set dengan set — semua elemen yang pertama juga ada di yang kedua.", "Ini jenis pernyataan yang berbeda. Kebiasaan salah klasik: menulis {2} ∈ A padahal yang dimaksud 2 ∈ A atau {2} ⊆ A."] },
  { title: "PREDICT · Apakah dia anggota?", content: ["Cek pertanyaan keanggotaannya."], explanation: "2 adalah salah satu elemen yang tercantum di A, jadi 2 ∈ A bernilai benar." },
  { title: "PREDICT · Apakah dia himpunan bagian?", content: ["Cek pertanyaan subset-nya."], explanation: "Setiap elemen {1, 3} — yaitu 1 dan 3 — juga elemen A. Syarat subset terpenuhi." },
  { title: "PREDICT · Elemen atau himpunan bagian?", content: ["Hati-hati: ini pertanyaan keanggotaan tentang set {2}, bukan pertanyaan subset."], explanation: "Elemen A adalah 1, 2, dan 3. Set {2} bukan salah satu elemen itu, jadi {2} ∈ A salah. Pernyataan yang benar adalah {2} ⊆ A — atau 2 ∈ A." },
  { title: "SEE · Himpunan kosong muat di mana-mana", content: ["Himpunan kosong adalah set tanpa elemen. Dia subset dari setiap set, karena syarat subset tidak menuntut apa-apa darinya.", "Kekosongan itu soal subset. Apakah ∅ menjadi anggota suatu set adalah pertanyaan keanggotaan yang terpisah."] },
  { title: "TRY · Relasi mana yang benar?", content: ["Tulis nilai kebenaran 3 ∈ A. Diterima: true / false (atau benar / salah)."], explanation: "3 adalah elemen A, jadi 3 ∈ A bernilai benar." },
  { title: "FORMALIZE · Set, keanggotaan, himpunan bagian", content: ["Set adalah kumpulan objek yang terdefinisi dengan baik dan berbeda-beda. Set tidak berurutan dan bebas duplikat; kesamaan berarti punya anggota yang persis sama.", "x ∈ A menyatakan x adalah elemen A. B ⊆ A menyatakan setiap elemen B juga elemen A — pernyataan tentang dua set, bukan tentang satu elemen.", "Himpunan kosong ∅ tidak punya elemen dan merupakan subset dari setiap set. A = B tepat ketika A ⊆ B dan B ⊆ A.", "Definisi ini fondasi untuk relasi, fungsi, dan penalaran database di bagian berikutnya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [setsIntroCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Set → union & intersection → relasi → fungsi", "Keanggotaan dan subset adalah kosakata di balik query database, filter pencarian, dan logika Propositions: bahasa set dan bahasa proposition akan ketemu lagi nanti.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getSetsIntroActivities(language: LessonLanguage) {
  return setsIntroActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [setsIntroCopy[language].prompt] } : {}),
  }));
}

export function localizeSetsIntroContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Set adalah kumpulan objek yang terdefinisi dengan baik dan berbeda-beda, yang disebut elemen atau anggota. Set tidak berurutan dan tidak punya duplikat: {1, 2, 3} dan {3, 1, 2, 2} menunjukkan set yang sama. Keanggotaan (x ∈ A) adalah relasi paling dasar antara objek dan set.",
      "Set B adalah subset dari A (ditulis B ⊆ A) ketika setiap elemen B juga elemen A. Perhatikan bedanya tipe: 2 ∈ {1, 2, 3} menghubungkan elemen dengan set, sedangkan {2} ⊆ {1, 2, 3} menghubungkan dua set. Khususnya, {2} ∈ {1, 2, 3} salah, karena {2} bukan elemen set itu.",
      "Himpunan kosong ∅ adalah set tanpa elemen. Dia subset dari setiap set, karena tidak ada apa pun di ∅ yang bisa gagal berada di set lain. Kesamaan set berarti subset berlaku dua arah: A = B tepat ketika A ⊆ B dan B ⊆ A.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Keanggotaan dan himpunan bagian", "Urutan dan duplikat tidak penting", "Himpunan kosong"][index] ?? example.title,
      explanation: ["∈ bertanya tentang elemen; ⊆ bertanya tentang satu kumpulan utuh. Pernyataan {2} ∈ A hanya benar kalau A memuat set {2} sebagai anggotanya.", "Dua set sama ketika anggotanya persis sama — urutan penulisan dan pencatatan berulang tidak membuat set baru.", "Kekosongan itu universal: ∅ muat di dalam set apa pun karena dia tidak menuntut apa-apa. Keanggotaan adalah pertanyaan yang berbeda."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Kumpulan objek yang terdefinisi dengan baik dan berbeda-beda.", "Objek yang tergabung dalam suatu set.", "Relasi yang menyatakan sebuah objek adalah elemen dari suatu set.", "Relasi yang menyatakan setiap elemen suatu set juga elemen set yang lain.", "Set yang tidak punya elemen; subset dari setiap set."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Ketuker ∈ dengan ⊆", "Mengira urutan atau duplikat mengubah set", "Menolak subset kosong"][index] ?? mistake.title,
      explanation: ["2 ∈ {1, 2, 3} benar, tapi {2} ∈ {1, 2, 3} salah: {2} adalah set, bukan elemen, dari kumpulan itu.", "{1, 2, 3}, {3, 2, 1}, dan {1, 1, 2, 3} semuanya menggambarkan set yang sama. Yang penting cuma keanggotaan.", "∅ ⊆ {1, 2} benar untuk setiap set. Tidak ada elemen ∅ yang hilang dari {1, 2}, jadi syarat subset terpenuhi."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apakah {3} ⊆ {1, 2, 3}?", "Apakah {3} ∈ {1, 2, 3}?"][index] ?? check.question,
      explanation: ["Setiap elemen {3} — yaitu 3 — juga elemen {1, 2, 3}.", "Elemen {1, 2, 3} adalah 1, 2, dan 3. Set {3} bukan salah satunya, jadi dia bukan anggota."][index] ?? check.explanation,
    })),
  };
}

export const setsIntroMasteryConceptLabels: Record<string, string> = {
  set: "Sets", membership: "Membership", subset: "Subsets",
};

export function setsIntroReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("element_subset_confusion")) return id
    ? "Cek dua pertanyaannya ke contoh A = {1, 2, 3}: “apakah 2 salah satu isinya?” vs “apakah {2} salah satu isinya?” Apa bedanya?"
    : "Check both questions against A = {1, 2, 3}: \"is 2 one of its contents?\" vs \"is {2} one of its contents?\" What differs?";
  if (result.misconceptions.includes("subset_requires_all")) return id
    ? "Uji ulang syaratnya: {1, 3} ⊆ {1, 2, 3}? Cek satu per satu elemen {1, 3} — ada yang tidak ada di A?"
    : "Re-test the condition: is {1, 3} ⊆ {1, 2, 3}? Check each element of {1, 3} — is any of them missing from A?";
  return id
    ? "Jelaskan ulang dua jenis relasinya: elemen ke set (∈) dan set ke set (⊆), lalu uji keduanya pada A = {1, 2, 3}."
    : "Restate the two relation types: element-to-set (∈) and set-to-set (⊆), then test both against A = {1, 2, 3}.";
}
