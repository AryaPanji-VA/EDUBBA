import { empathyAndDefineActivities } from "./empathy-and-define-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const empathyAndDefineCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Design Thinking Foundations",
    prompt: "Explain in your own words the difference between observation and assumption in empathy work — and why a good problem definition does not mention a solution.",
    placeholder: "Observations are recorded behavior, while assumptions...",
    oneLine: "Your answer",
    diagram: "evidence / scenario",
    codeLabel: "scenario",
    sourceCheck: "Source Mode: no AI evaluation. Review evidence versus interpretation and the POV structure, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Design Thinking",
    prompt: "Jelasin pakai bahasa lu sendiri bedanya observasi dan asumsi di kerja empathy — dan kenapa problem definition yang bagus nggak menyebut solusi.",
    placeholder: "Observasi itu perilaku yang terekam, sedangkan asumsi...",
    oneLine: "Jawaban kamu",
    diagram: "bukti / skenario",
    codeLabel: "skenario",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau bukti versus interpretasi dan struktur POV, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa empathy sebelum ide", content: ["Fitur yang dibangun di atas tebakan belum dicek tentang orang gagal secara diam-diam: nggak ada yang crash, nggak ada yang pakai. Kerja empathy adalah cara tebakan itu dicek ke kenyataan.", "Momen termurah untuk salah soal pengguna adalah sebelum apa pun dibangun."] },
  { title: "INTUITION · Kerja detektif, bukan dukun", content: ["Empathy artinya mengumpulkan bukti langsung: perilaku, kutipan, dan konteks dari situasi nyata.", "Penjelasan di balik buktinya itu interpretasi. Tim yang bagus menjaga bukti dan interpretasi tetap terpisah, karena interpretasi bisa salah."] },
  { title: "REPRESENT · Observasi vs asumsi", content: ["Observasi adalah fakta terekam tentang perilaku. Asumsi adalah cerita yang menjelaskannya.", "“Sari bingung” adalah satu cerita yang mungkin. Sampai dicek, itu hipotesis untuk diverifikasi — bukan fondasi untuk membangun."] },
  { title: "PREDICT · Mana yang observasi?", content: ["Satu dari kalimat ini adalah bukti terekam. Yang mana?"], explanation: "A mencatat apa yang terlihat di layar. B mengklaim keadaan emosi di dalam — itu interpretasi dari A, berguna sebagai hipotesis tapi bukan bukti." },
  { title: "SEE · Dari bukti ke pernyataan POV", content: ["Tahap Define memadatkan temuan empathy menjadi point of view: pengguna spesifik, kebutuhan, dan insight yang menjelaskannya.", "Perhatikan apa yang tidak ada di POV: solusi. “Butuh info perubahan kelas tepat waktu” membuka kemungkinan aplikasi, SMS, papan pengumuman, atau apa pun."] },
  { title: "PREDICT · Problem statement mana yang lebih kuat?", content: ["Dua kandidat problem statement. Mana yang beneran bisa memandu tim desain?"], explanation: "B menyebut siapa butuh apa dan kenapa, jadi ide bisa lahir dan disaring dengannya. A adalah harapan, bukan definisi: tanpa pengguna, tanpa kebutuhan, tanpa insight yang bisa diuji." },
  { title: "TRY · Labeli kalimatnya", content: ["Kata “probably” menandai tebakan soal keadaan batin. Kalimat ini observasi atau asumsi? Jawab: observasi / asumsi."], explanation: "Dia menebak pemahaman — keadaan batin — jadi dia asumsi (hipotesis untuk diverifikasi), bukan perilaku terekam." },
  { title: "FORMALIZE · Empathize dan Define", content: ["Empathy mengumpulkan bukti langsung tentang perilaku, kata, dan perasaan pengguna dalam konteksnya. Observasi adalah bukti terekamnya; asumsi adalah interpretasi di atasnya — dipisah supaya interpretasi tetap bisa dicek.", "Metodenya antara lain wawancara kontekstual, observasi langsung, dan think-aloud. Nilainya ada pada kontak dengan perilaku nyata, yang sering bertolak belakang dengan apa yang pengguna katakan dan apa yang designer asumsikan.", "Define memadatkan riset menjadi POV: [pengguna] butuh [kebutuhan] karena [insight]. POV yang kuat berpijak pada bukti, menyebut kebutuhan bukan solusi, dan cukup spesifik untuk membangkitkan sekaligus menyaring ide."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [empathyAndDefineCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Empathy & Define → Ideation → Prototyping & Testing", "POV yang tajam jadi bahan bakar tahap berikutnya: membangkitkan banyak ide yang menjawab kebutuhan itu, lalu memilih mana yang dijadikan prototype.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getEmpathyAndDefineActivities(language: LessonLanguage) {
  return empathyAndDefineActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [empathyAndDefineCopy[language].prompt] } : {}),
  }));
}

export function localizeEmpathyAndDefineContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Empathy dalam riset desain berarti mengumpulkan bukti langsung tentang perilaku, kata, dan perasaan pengguna dalam konteksnya. Observasi adalah bukti terekamnya; asumsi (atau inferensi) adalah interpretasi yang ditumpuk di atasnya. Praktik yang sehat menjaga keduanya tetap terpisah secara eksplisit, karena interpretasi harus tetap terbuka untuk direvisi terhadap bukti.",
      "Metode empathy yang umum meliputi wawancara kontekstual, observasi langsung, dan sesi think-aloud. Nilainya berasal dari kontak dengan perilaku nyata: apa yang orang lakukan sering bertolak belakang dengan apa yang mereka katakan akan mereka lakukan, dan keduanya berbeda dari apa yang designer asumsikan mereka butuhkan.",
      "Tahap Define mengonsolidasikan riset menjadi problem statement, biasanya berupa point of view (POV): [pengguna spesifik] butuh [kebutuhan] karena [insight]. POV yang terbentuk baik berpijak pada bukti teramati, menyebut kebutuhan alih-alih solusi, dan cukup spesifik untuk membangkitkan dan menyaring ide.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Observasi vs asumsi", "Pernyataan POV"][index] ?? example.title,
      explanation: ["Observasinya adalah bukti terekam. Asumsinya adalah satu interpretasi — berguna sebagai hipotesis, berbahaya sebagai fakta.", "Pengguna, kebutuhan, dan insight berpijak pada yang teramati. Dia menyebut kebutuhan — kesadaran tepat waktu atas perubahan — bukan solusi seperti “aplikasi notifikasi”."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Memahami pengalaman nyata pengguna lewat bukti langsung tentang perilaku, kata, dan perasaan mereka.", "Fakta terekam tentang apa yang pengguna lakukan atau katakan, tanpa interpretasi.", "Interpretasi yang menjelaskan sebuah observasi; berguna sebagai hipotesis, tidak boleh diperlakukan sebagai fakta.", "Problem statement berbentuk [pengguna] butuh [kebutuhan] karena [insight]."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menulis asumsi sebagai observasi", "Mendefinisikan masalah sebagai solusi", "Problem statement yang kabur"][index] ?? mistake.title,
      explanation: ["“User bingung” itu inferensi. Catat apa yang terjadi (“user membaca ulang label tiga kali, lalu pergi”) dan simpan interpretasinya terpisah.", "“Mahasiswa butuh aplikasi push-notification” memasukkan jawaban ke dalam masalah. Kebutuhannya kesadaran tepat waktu; aplikasi hanya satu kandidat jawaban.", "“Bikin aplikasi kampus lebih baik” tidak bisa membangkitkan atau menyaring ide. POV menyebut pengguna, kebutuhan, dan insight yang spesifik."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Kalimat mana yang merupakan observasi?", "Bagian mana dari POV yang menyebut kebutuhan pengguna?"][index] ?? check.question,
      explanation: ["Itu mencatat perilaku yang terlihat. Kalimat kedua menginterpretasikan keadaan batin — itu asumsi, bukan observasi.", "Struktur POV adalah [pengguna] butuh [kebutuhan] karena [insight] — kebutuhan ada di segmen tengah, dinyatakan tanpa solusi."][index] ?? check.explanation,
    })),
  };
}

export const empathyAndDefineMasteryConceptLabels: Record<string, string> = {
  empathy: "Empathy", problem_definition: "Problem definition",
};

export function empathyAndDefineReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("observation_assumption_confusion")) return id
    ? "Ambil kalimat “Budi mengulik pesan error tiga kali lalu pergi”. Mana buktinya, mana ceritanya? Tulis dua versinya."
    : "Take \"Budi re-read the error three times, then left.\" Which part is evidence, which is story? Write both versions.";
  if (result.misconceptions.includes("vague_problem_confusion")) return id
    ? "Coba ubah “aplikasi kampus harus lebih baik” jadi POV: siapa penggunanya, butuh apa, dan kenapa — tanpa menyebut satu solusi pun."
    : "Turn \"the campus app should be better\" into a POV: which user, needs what, and why — without naming any solution.";
  return id
    ? "Jelaskan ulang dua hasil kerjanya: bukti vs interpretasi di empathy, dan POV tanpa solusi di define."
    : "Restate the two outputs: evidence vs interpretation in empathy, and a solution-free POV in define.";
}
