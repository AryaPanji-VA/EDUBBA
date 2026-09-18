import { implicationActivities } from "./implication-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const implicationCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Logic Foundations",
    prompt: "Explain in your own words: why is p → q false only when p is true and q is false?",
    placeholder: "The promise is broken only when...",
    oneLine: "Your answer",
    diagram: "notation / truth table",
    codeLabel: "notation",
    sourceCheck: "Source Mode: no AI evaluation. Review the truth conditions of → and ↔, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Logika",
    prompt: "Jelasin pakai bahasa lu sendiri: kenapa p → q cuma bernilai false ketika p benar tapi q salah?",
    placeholder: "Janjinya dilanggar hanya ketika...",
    oneLine: "Jawaban kamu",
    diagram: "notasi / tabel kebenaran",
    codeLabel: "notasi",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau kondisi kebenaran → dan ↔, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa implication itu penting", content: ["Setiap aturan di program berbentuk implication: kalau skor mencapai ambang, lulus; kalau input kosong, tampilkan peringatan.", "Implication adalah bentuk logika dari aturan, kondisi, dan janji. Sebelum conditionals terasa cepat, kondisi kebenaran → harus tepat."] },
  { title: "INTUITION · Janji dengan satu cara dilanggar", content: ["Baca p → q sebagai janji: kalau p terjadi, maka q menyusul.", "Janji itu cuma punya satu cara dilanggar: p terjadi, tapi q tidak. Kalau p tidak pernah terjadi, janji tetap terpenuhi apa pun yang terjadi — di logika itu dihitung benar."] },
  { title: "REPRESENT · Bentuk p → q", content: ["p adalah antecedent — pemicunya. q adalah consequent — yang dijanjikan.", "Panah itu tidak bilang p menyebabkan q, dan tidak bilang apa-apa tentang q saat p salah. Dia hanya melarang satu kombinasi: p benar dengan q salah."] },
  { title: "PREDICT · Janji yang dilanggar", content: ["Kedua nilai kebenarannya sudah diketahui. Berapa p → q?"], explanation: "Pemicunya terjadi (p benar) tapi janjinya tidak ditepati (q salah). Itu satu-satunya kombinasi yang membuat implication bernilai salah." },
  { title: "SEE · Tabel kebenaran → dan ↔", content: ["Tabel implication punya tepat satu F: baris saat p benar dan q salah. Setiap baris dengan p salah bernilai benar (vacuous truth).", "Tabel equivalence benar hanya di baris yang nilainya sama: (T, T) dan (F, F). Saat p dan q berbeda, ↔ bernilai salah."] },
  { title: "PREDICT · Janji di hari cerah", content: ["Lagi nggak hujan, tapi payung tetap dibawa. Berapa p → q?"], explanation: "Pemicunya tidak pernah terjadi, jadi janjinya tidak pernah berisiko. Implication dengan antecedent salah bernilai benar — vacuously true — apa pun q." },
  { title: "PREDICT · Apakah janjinya bisa dibalik?", content: ["Misal p → q benar. Bagaimana dengan konversnya, q → p?"], explanation: "“Kalau hujan gue bawa payung” tidak menjanjikan “Kalau gue bawa payung, berarti hujan”. Konvers punya kondisi kebenarannya sendiri; implication dan konversnya tidak ekuivalen." },
  { title: "FORMALIZE · Implication dan equivalence", content: ["p → q salah tepat ketika p benar dan q salah; selain itu benar, termasuk semua kasus p salah (vacuous truth). Implication melarang kombinasi (T, F) tanpa mengklaim sebab-akibat.", "Konvers dari p → q adalah q → p, dan keduanya tidak ekuivalen secara logika.", "p ↔ q benar tepat ketika p dan q bernilai sama; dia menyatakan dua arah sekaligus.", "Definisi ini memperluas konektiva dari lesson Propositions dan menyiapkan aturan penalaran untuk bagian berikutnya."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [implicationCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Konektiva → tabel kebenaran gabungan → bentuk argumen → proof", "Implication adalah bentuk dari setiap if di conditionals Programming, dan tulang punggung penalaran matematika: definisi, teorema, dan proof disusun dari → dan ↔.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getImplicationActivities(language: LessonLanguage) {
  return implicationActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [implicationCopy[language].prompt] } : {}),
  }));
}

export function localizeImplicationContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Implication p → q (jika p maka q) bernilai salah tepat ketika p benar dan q salah, dan benar di semua kasus lain. Khususnya, implication dengan antecedent salah bernilai benar berapa pun q; ini disebut vacuous truth. Implication tidak menyatakan bahwa p menyebabkan q — dia hanya melarang kombinasi (T, F).",
      "Konvers dari p → q adalah q → p. Sebuah implication dan konversnya tidak ekuivalen secara logika: q → p bisa salah saat p → q benar. Menukar arah implication adalah kesalahan penalaran klasik.",
      "Biconditional p ↔ q (p jika dan hanya jika q) bernilai benar tepat ketika p dan q punya nilai kebenaran yang sama. Dia menyatakan p → q dan q → p sekaligus, membuat kedua proposition bisa saling menggantikan nilainya.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu-satunya baris salah dari →", "Equivalence butuh nilai yang sama", "Implication bukan konversnya"][index] ?? example.title,
      explanation: ["Baca p → q sebagai janji: dilanggar hanya kalau p terjadi dan q tidak. p yang salah tidak pernah melanggar janji.", "p ↔ q benar di baris yang sama (T,T dan F,F) dan salah setiap p dan q tidak sepakat.", "Dua proposition yang sama membuat p → q salah dan q → p benar: arah itu penting, dan keduanya tidak bisa saling menggantikan."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Proposition gabungan yang salah tepat ketika antecedent benar dan consequent salah.", "Proposition sebelum (p) dan sesudah (q) tanda panah pada p → q.", "Kebenaran implication yang antecedent-nya salah, berapa pun consequent-nya.", "Pernyataan q → p, yang tidak ekuivalen secara logika dengan p → q.", "Proposition gabungan yang benar tepat ketika kedua sisi punya nilai kebenaran sama."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Membaca → sebagai sebab-akibat", "Menolak vacuous truth", "Menukar implication dengan konversnya"][index] ?? mistake.title,
      explanation: ["p → q tidak mengklaim p menyebabkan q; dia hanya melarang kombinasi p benar dengan q salah.", "“Kalau 2 + 2 = 5 maka Jakarta di Prancis” bernilai benar dalam logika, karena antecedent-nya salah. Aneh tapi konsisten — janjinya tidak pernah terpicu.", "“Kalau hujan, gue bawa payung” tidak berarti “Kalau gue bawa payung, berarti hujan”. Dua arah itu punya kondisi kebenaran berbeda."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Kalau p salah dan q benar, berapa p → q?", "Kapan p → q bernilai salah?"][index] ?? check.question,
      explanation: ["Satu-satunya kasus salah adalah p benar dan q salah. Dengan p salah, implication bernilai benar secara vacuous.", "Kombinasi terlarang itu sendiri yang melanggar janji; baris lain dari tabel kebenaran semuanya benar."][index] ?? check.explanation,
    })),
  };
}

export const implicationMasteryConceptLabels: Record<string, string> = {
  implication: "Implication", equivalence: "Equivalence",
};

export function implicationReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("false_case_missed")) return id
    ? "Uji ulang barisnya satu per satu: p benar, lalu q salah. Kombinasi mana yang melanggar janji p → q?"
    : "Re-test the rows one by one: p true, then q false. Which combination breaks the promise of p → q?";
  if (result.misconceptions.includes("converse_confusion")) return id
    ? "Balik kalimatnya: “kalau hujan, bawa payung” vs “kalau bawa payung, hujan”. Apakah dua janji itu sama?"
    : "Flip the sentence: \"if it rains, take an umbrella\" vs \"if you take an umbrella, it rains\". Are those two promises the same?";
  return id
    ? "Jelaskan ulang satu-satunya cara janji p → q dilanggar, lalu cek baris (T, F)."
    : "Restate the single way the promise p → q is broken, then check the (T, F) row.";
}
