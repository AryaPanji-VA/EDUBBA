import { propositionsActivities } from "./propositions-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
export type { LessonLanguage };

export const propositionsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Logic Foundations",
    prompt: "If p is true and q is false, explain in your own words why p ∧ q is false.",
    placeholder: "p ∧ q needs both true, but q...",
    oneLine: "Your answer (true / false)",
    diagram: "notation / truth table",
    codeLabel: "notation",
    sourceCheck: "Source Mode: no AI evaluation. Review the truth conditions of ∧ and ∨, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Logika",
    prompt: "Kalau p bernilai true dan q bernilai false, jelasin dengan kata-kata lu sendiri kenapa p ∧ q bernilai false.",
    placeholder: "p ∧ q butuh dua-duanya true, tapi q...",
    oneLine: "Jawaban kamu (true / false)",
    diagram: "notasi / tabel kebenaran",
    codeLabel: "notasi",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau kondisi kebenaran ∧ dan ∨, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa pernyataan yang tepat itu penting", content: ["Program bikin keputusan: tampilkan atau sembunyikan, izinkan atau blokir, ulangi atau berhenti. Di belakang setiap keputusan itu ada pernyataan yang bernilai benar atau salah — sebuah proposition.", "Logika propositional adalah bahasa untuk menalar pernyataan itu dengan tepat. Sebelum conditionals, filter, atau algoritma, keterampilan pertama adalah mengenali mana yang bisa dinilai benar atau salah."] },
  { title: "INTUITION · Pernyataan yang bisa dinilai", content: ["Proposition itu pernyataan yang bisa dinilai benar atau salah. Bukan perintah, bukan pertanyaan.", "“Jakarta adalah ibu kota Indonesia” bisa dinilai — hasilnya benar. “2 + 2 = 5” juga bisa dinilai — hasilnya salah. Dua-duanya proposition; proposition nggak harus benar, cukup bisa dinilai."] },
  { title: "REPRESENT · Memberi nama: p dan q", content: ["Logika memberi proposition nama pendek supaya pernyataan gabungan tetap mudah dibaca. Di sini p dan q menamai dua proposition dengan nilai kebenaran yang sudah diketahui.", "Tiga konektiva menyusun proposition gabungan: ¬ (negasi), ∧ (conjunction, dibaca “dan”), dan ∨ (disjunction, dibaca “atau”). Masing-masing punya aturan nilai yang tetap — dikenalkan langkah demi langkah di bawah."] },
  { title: "PREDICT · Mana yang proposition?", content: ["Tiga kalimat, satu proposition. Mana yang bisa dinilai benar atau salah?"], explanation: "“2 + 2 = 4” bisa dinilai (benar). “Close the door!” adalah perintah dan “Where do you live?” adalah pertanyaan — dua-duanya tidak punya nilai kebenaran, jadi bukan proposition." },
  { title: "PREDICT · Salah, tetap proposition", content: ["Proposition nggak harus benar. Apa status pernyataan ini?"], explanation: "“2 + 2 = 5” adalah pernyataan yang bisa dinilai — penilaiannya salah. Salah tidak menghapus status proposition; dia memberi truth value F." },
  { title: "SEE · Negasi membalik nilai", content: ["Negasi ¬p membalik nilai kebenaran p. Kalau p benar, ¬p salah; kalau p salah, ¬p benar.", "“Lagi nggak hujan” adalah negasi dari “Lagi hujan”. Ketika satu benar, yang lain salah — selalu tepat satu dari keduanya."] },
  { title: "TRY · Berapa nilai ¬p?", content: ["Tulis nilai kebenaran ¬p. Diterima: true / false (atau benar / salah)."], explanation: "p benar, jadi ¬p salah." },
  { title: "SEE · Tabel kebenaran ∧", content: ["Conjunction p ∧ q benar hanya kalau p dan q dua-duanya benar. Satu input benar saja tidak cukup.", "Dengan p benar dan q salah, p ∧ q pasti salah, karena q gagal memenuhi syarat dua-duanya benar. Tabel lengkapnya memuat semua kombinasi."] },
  { title: "PREDICT · Evaluasi p ∧ q", content: ["Kedua nilai kebenarannya sudah diketahui. Berapa p ∧ q?"], explanation: "p ∧ q mengharuskan dua proposition benar. q salah, jadi conjunction-nya salah — walaupun p benar." },
  { title: "SEE · Tabel kebenaran ∨", content: ["Disjunction p ∨ q benar kalau minimal satu dari p dan q benar — termasuk saat dua-duanya benar.", "Ini inclusive or, makna standar ∨ di logika propositional. “Atau” sehari-hari kadang berarti “salah satu, tapi jangan dua-duanya” — pembacaan eksklusif itu bukan makna ∨ di sini."] },
  { title: "PREDICT · Evaluasi p ∨ q", content: ["p dan q dua-duanya benar. Berapa p ∨ q?"], explanation: "p ∨ q benar kalau minimal satu proposition benar — dan di sini dua-duanya benar. Di inclusive or, dua-duanya benar tetap menghasilkan benar." },
  { title: "TRY · Berapa nilai p ∨ q?", content: ["Tulis nilai kebenaran p ∨ q. Diterima: true / false (atau benar / salah)."], explanation: "q benar, jadi minimal satu proposition benar; disjunction-nya benar." },
  { title: "FORMALIZE · Proposisi dan konektiva", content: ["Proposition adalah pernyataan deklaratif dengan nilai kebenaran yang pasti: true (T) atau false (F). Perintah, pertanyaan, dan kalimat tanpa kondisi kebenaran yang jelas bukan proposition.", "¬p benar hanya kalau p salah. p ∧ q benar hanya kalau p dan q dua-duanya benar. p ∨ q benar kalau minimal satu dari p dan q benar — inclusive or.", "Truth table memuat setiap kombinasi nilai kebenaran proposition yang terlibat beserta nilai hasil pernyataan gabungannya. Definisi ini jadi fondasi untuk implication, equivalence, dan proof di bagian berikutnya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [propositionsCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Proposition → implication (→) → equivalence (↔) → argument dan proof", "Penalaran yang sama muncul di Programming: setiap kondisi if mengevaluasi sebuah proposition. Conditionals, loops, dan filter semuanya memakai hasil boolean — nilai kebenaran yang baru lu hitung.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getPropositionsActivities(language: LessonLanguage) {
  return propositionsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [propositionsCopy[language].prompt] } : {}),
  }));
}

export function localizePropositionsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Proposition adalah kalimat deklaratif yang bernilai benar atau salah, tapi tidak keduanya. Perintah, pertanyaan, dan kalimat yang kondisi kebenarannya tidak terdefinisi baik bukan proposition. Truth value sebuah proposition adalah label T (benar) atau F (salah) yang melekat padanya.",
      "Negasi ¬p dari sebuah proposition p memiliki nilai kebenaran yang berlawanan. Conjunction p ∧ q benar hanya kalau p dan q dua-duanya benar. Disjunction p ∨ q benar kalau minimal salah satu dari p dan q benar; ini adalah inclusive or standar logika propositional, jadi kasus dua-duanya benar tetap menghasilkan T.",
      "Truth table memuat setiap kombinasi nilai kebenaran proposition yang terlibat beserta nilai hasil pernyataan gabungannya. Truth table adalah alat standar untuk mendefinisikan konektiva dan menalar proposition gabungan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Memberi nama proposition", "Tabel negasi", "Tabel conjunction", "Tabel disjunction"][index] ?? example.title,
      explanation: ["Nama pendek menjaga pernyataan gabungan tetap terbaca. Setiap proposition bernama punya nilai pasti; setiap konektiva menggabungkannya dengan aturan tetap.", "Negasi membalik nilai kebenaran p. Tepat satu dari p dan ¬p bernilai benar.", "Conjunction hanya benar di baris pertama, saat kedua proposition benar. Satu input salah cukup membuatnya salah.", "Disjunction hanya salah di baris terakhir, saat kedua proposition salah. Dua-duanya benar tetap menghasilkan T: ini inclusive or."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Kalimat deklaratif dengan nilai kebenaran yang pasti: benar atau salah.", "Label T (benar) atau F (salah) yang diberikan kepada sebuah proposition.", "Konektiva yang hasilnya benar hanya kalau proposition yang diterapkannya salah.", "Konektiva yang hasilnya benar hanya kalau kedua proposition benar.", "Konektiva yang hasilnya benar kalau minimal satu proposition benar (inclusive or).", "Tabel yang memuat setiap kombinasi nilai kebenaran beserta nilai hasil pernyataan gabungannya."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menganggap perintah atau pertanyaan sebagai proposition", "Mengira proposition harus benar", "Membaca ∨ sebagai exclusive or", "Ketuker ∧ dan ∨"][index] ?? mistake.title,
      explanation: ["“Tutup pintunya!” perintah dan “Lu tinggal di mana?” pertanyaan; tidak ada nilai kebenaran, jadi bukan proposition.", "“2 + 2 = 5” salah, tapi tetap proposition dengan truth value F. Yang penting bisa dinilai, bukan benar.", "Di logika propositional standar, p ∨ q benar bahkan ketika p dan q dua-duanya benar. Pembacaan eksklusif (jangan dua-duanya) adalah operator berbeda.", "∧ mengharuskan kedua proposition benar; ∨ cukup minimal satu. Menukar keduanya mengubah kondisi kebenaran pernyataan gabungan."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Kalimat mana yang merupakan proposition?", "Kalau p benar dan q salah, berapa p ∨ q?", "Kalau p salah, berapa ¬p?"][index] ?? check.question,
      explanation: ["Kalimat deklaratif yang bisa dinilai benar. Dua lainnya perintah dan pertanyaan, tanpa nilai kebenaran.", "Disjunction benar kalau minimal satu proposition benar; di sini p benar.", "Negasi membalik nilai kebenaran: p salah membuat ¬p benar."][index] ?? check.explanation,
    })),
  };
}
