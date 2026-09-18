import { whatIsDesignThinkingActivities } from "./what-is-design-thinking-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const whatIsDesignThinkingCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Design Thinking Foundations",
    prompt: "Explain in your own words why design thinking is called human-centered and iterative — and how the two connect.",
    placeholder: "It starts from the people, and it loops because...",
    oneLine: "Your answer",
    diagram: "diagram / scenario",
    codeLabel: "scenario",
    sourceCheck: "Source Mode: no AI evaluation. Review the loop and the human-centered starting point, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Design Thinking",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa design thinking disebut human-centered dan iteratif — dan kenapa dua sifat itu nyambung.",
    placeholder: "Mulainya dari orangnya, dan berputar karena...",
    oneLine: "Jawaban kamu",
    diagram: "diagram / skenario",
    codeLabel: "skenario",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau loop dan titik mulai human-centered-nya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Masalah yang nggak bisa dihitung", content: ["Ada masalah yang jawabannya tinggal dihitung, dan ada masalah yang jawabannya harus dirancang. “Bikin mahasiswa beneran baca dokumentasi” tidak punya rumus — jawabannya harus ditemukan lewat orang.", "Design thinking adalah cara kerja yang disiplin untuk masalah jenis kedua, tanpa menebak-nebak."] },
  { title: "INTUITION · Dua kata yang membawa semuanya", content: ["Human-centered: titik mulainya orang yang mengalami masalah — apa yang mereka lakukan, rasakan, dan butuhkan — bukan solusi yang kebetulan kita suka.", "Iteratif: kita berputar. Pahami → definisikan → ide → purwarupa kasar → uji → pahami lagi, tiap putaran lebih tajam."] },
  { title: "REPRESENT · Loop, bukan pipeline", content: ["Lima tahap yang biasa diajarkan — empathize, define, ideate, prototype, test — adalah mode kerja.", "Ini bukan jalan satu arah. Hasil uji sering menunjukkan pembingkaian masalahnya yang salah, dan tim kembali ke empathize atau define — putaran itu justru intinya, bukan kegagalan."] },
  { title: "PREDICT · Sekali jalan lalu rilis?", content: ["Apakah design thinking itu urutan linear yang dijalankan tepat sekali?"], explanation: "Tahap-tahapnya adalah mode kerja. Uji yang mematahkan bingkai masalah adalah hasil normal dan berharga: kembali dengan pemahaman lebih tajam, bukan merilis hal yang salah dengan rapi." },
  { title: "SEE · Bingkai salah yang ditemukan murah", content: ["Tim mengira mahasiswa mengabaikan dokumentasi. Lima wawancara singkat kemudian, masalah aslinya muncul: kotak pencariannya rusak.", "Artefak termurah yang diuji di sini adalah bingkai masalahnya sendiri. Menemukan bingkai yang salah sebelum membangun adalah seluruh argumen ekonominya design thinking."] },
  { title: "PREDICT · Kerjanya mulai dari mana?", content: ["Tim memulai proyek memperbaiki registrasi mata kuliah. Design thinking bilang mulai dari mana?"], explanation: "Human-centered berarti langkah pertama adalah kerja empati: apa yang mahasiswa beneran lakukan, rasakan, dan butuhkan saat registrasi — sebelum bicara solusi." },
  { title: "TRY · Sebut titik mulainya", content: ["Lengkapi kalimatnya. Diterima: orang / pengguna / user / manusia."], explanation: "Human-centered: orang yang mengalami masalah adalah titik mulanya, bukan teknologinya dan bukan selera designer." },
  { title: "FORMALIZE · Apa itu design thinking", content: ["Design thinking adalah pendekatan penyelesaian masalah yang human-centered dan iteratif, cocok untuk masalah yang syaratnya belum jelas atau baru diketahui lewat kontak dengan orang yang terdampak.", "Tahap-tahapnya — empathize, define, ideate, prototype, test — adalah mode kerja dalam satu loop, bukan urutan wajib. Tim bergantian antara eksplorasi divergen dan penyimpulan konvergen.", "Ekonominya: menukar biaya salah yang mahal (membangun produk yang salah dengan rapi) dengan biaya salah yang murah (artefak kasar diuji ke orang beneran)."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [whatIsDesignThinkingCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Design thinking → empathy → problem definition → ideation → prototyping & testing", "Lesson berikutnya masuk lebih dalam ke tiap mode: pertama empathy dan problem definition, lalu ideation, prototyping, dan testing.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getWhatIsDesignThinkingActivities(language: LessonLanguage) {
  return whatIsDesignThinkingActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [whatIsDesignThinkingCopy[language].prompt] } : {}),
  }));
}

export function localizeWhatIsDesignThinkingContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Design thinking adalah pendekatan penyelesaian masalah yang human-centered dan iteratif, sangat cocok untuk masalah yang syaratnya belum jelas, diperebutkan, atau baru diketahui lewat keterlibatan dengan orang yang terdampak. Alih-alih langsung mengarah ke satu solusi, pendekatan ini bergantian antara eksplorasi divergen (empathize, ideate) dan penyimpulan konvergen (define, prototype, test).",
      "Tahap yang biasa diajarkan — empathize, define, ideate, prototype, test — menggambarkan mode kerja, bukan urutan wajib. Tim kembali ke tahap sebelumnya ketika hasil uji menunjukkan bahwa bingkai masalahnya, bukan cuma solusinya, yang keliru.",
      "Pendekatan ini menukar biaya salah di akhir (membangun produk yang salah dengan bagus) dengan biaya salah di awal secara murah (menguji artefak kasar ke orang beneran). Efektivitasnya bergantung pada kontak sungguhan dengan pengguna dan kejujuran membaca hasil uji.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Loop, bukan pipeline", "Bingkai salah yang ditemukan murah"][index] ?? example.title,
      explanation: ["Panah-panahnya menggambarkan siklus: hasil uji rutin mengirim tim kembali untuk membingkai ulang masalah atau memperluas ide, bukan cuma memoles yang sekarang.", "Artefak pertama yang diuji di sini adalah bingkai masalahnya sendiri. Design thinking memperlakukan bingkai sebagai sesuatu yang divalidasi, bukan diasumsikan."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Pendekatan penyelesaian masalah yang human-centered dan iteratif untuk masalah yang jawabannya harus dirancang, bukan dihitung.", "Mulai dari orang yang mengalami masalah — konteks, perilaku, dan kebutuhan mereka — bukan dari solusi favorit.", "Bekerja dalam putaran yang kembali ke tahap sebelumnya dengan pemahaman lebih tajam, bukan sekali jalan.", "Bergantian antara memperluas pilihan dan mempersempitnya."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menganggap tahapnya pipeline satu arah", "Mulai dari solusi", "Melewatkan kontak dengan orang beneran"][index] ?? mistake.title,
      explanation: ["Menjalankan empathize→test tepat sekali lalu rilis itu meleset poinnya: hasil uji sering menunjukkan bingkai masalahnya salah, dan itu mengirimmu kembali, bukan maju.", "“Yuk bikin aplikasi” sebelum paham orang dan masalahnya adalah kegagalan klasik yang justru dicegah pendekatan ini.", "Mengganti riset pengguna dengan selera sendiri bikin prosesnya cuma teater: kelihatannya design thinking tapi tidak belajar apa-apa."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa yang bikin design thinking \"human-centered\"?", "Hasil uji menunjukkan bingkai masalahnya salah. Menurut design thinking harus apa?"][index] ?? check.question,
      explanation: ["Titik mulanya konteks, perilaku, dan kebutuhan pengguna — bukan solusi favorit atau teknologi terbaru.", "Tahap-tahapnya adalah mode kerja dalam loop; hasil uji rutin mengirim tim kembali ke bingkai masalah."][index] ?? check.explanation,
    })),
  };
}

export const whatIsDesignThinkingMasteryConceptLabels: Record<string, string> = {
  design_process: "The process", human_centered: "Human-centered",
};

export function whatIsDesignThinkingReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("linear_pipeline_confusion")) return id
    ? "Bayangkan hasil uji purwarupa membongkar bingkai masalahnya. Ke tahap mana tim harus kembali — dan kenapa itu bukan mundur?"
    : "Imagine a prototype test invalidating the problem frame. Which stage does the team return to — and why is that not a setback?";
  if (result.misconceptions.includes("solution_first_confusion")) return id
    ? "Cek urutan pertamanya: sebelum bicara fitur, apa yang harus dipahami dulu — dan dari siapa?"
    : "Check the first move: before any feature talk, what must be understood first — and from whom?";
  return id
    ? "Jelaskan ulang dua sifatnya — human-centered dan iteratif — lalu hubungkan: kenapa berputar lebih murah kalau mulainya dari orang?"
    : "Restate the two properties — human-centered and iterative — then connect them: why is looping cheaper when you start from people?";
}
