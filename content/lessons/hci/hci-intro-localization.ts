import { hciIntroActivities } from "./hci-intro-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const hciIntroCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "HCI Foundations",
    prompt: "Explain in your own words why usability is a property of the interaction, not a fixed trait of the user — with an example if you can.",
    placeholder: "The same person with two different apps...",
    oneLine: "Your answer",
    diagram: "scenario",
    codeLabel: "scenario",
    sourceCheck: "Source Mode: no AI evaluation. Review the interaction model of usability, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi HCI",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa usability itu sifat dari interaksi, bukan sifat tetap penggunanya — pakai contoh kalau bisa.",
    placeholder: "Orang yang sama dengan dua aplikasi berbeda...",
    oneLine: "Jawaban kamu",
    diagram: "skenario",
    codeLabel: "skenario",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau model interaksi dari usability, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa belajar interaksinya", content: ["Software menang atau kalah di titik kontak: saat seseorang coba menyelesaikan sesuatu. Semua yang di hulunya — arsitektur, data, fitur — tak terlihat saat momen itu gagal.", "HCI adalah disiplin yang mempelajari momen itu, supaya antarmuka bisa bekerja bersama kemampuan manusia, bukan melawannya."] },
  { title: "INTUITION · Antarmuka yang bikin lu pintar", content: ["Kemampuan memakai software itu bukan sifat tetap seseorang — dia dihasilkan oleh kerjasama antara manusia dan antarmuka.", "Antarmuka yang baik bikin orang biasa jadi efektif. Yang buruk bikin orang yang cakap merasa bodoh — dan hampir semua orang menyimpulkan “ini gue yang bego”."] },
  { title: "REPRESENT · Di mana kesulitan sebenarnya berada", content: ["Orangnya, tujuannya, dan waktunya identik. Satu desain bikin tugasnya remeh; desain lain mengubahnya jadi tes menghafal.", "Ini langkah inti HCI: letakkan kesulitan di interaksinya, bukan di orangnya. Dari situ dia bisa diperbaiki."] },
  { title: "PREDICT · Siapa yang salah?", content: ["Empat puluh persen pengguna menekan Cancel di layar yang sama, lalu pergi. HCI bilang apa?"], explanation: "Satu-satunya elemen yang sama dari semua pengguna itu adalah layarnya. Tingkat kegagalan 40% di satu langkah itu sinyal desain, bukan watak audiensnya." },
  { title: "SEE · Recoverable by design", content: ["Kesalahan manusia itu pasti — atensi melenceng, ingatan kelebihan beban, tangan salah ketuk. Pertanyaan desainnya: apa yang terjadi setelah itu.", "Antarmuka yang recoverable menjaga kesalahan kecil tetap kecil: undo, folder sampah, konfirmasi hanya untuk aksi yang benar-benar merusak."] },
  { title: "PREDICT · Desain mana yang lebih usable?", content: ["Dua-duanya menghapus. Mana yang memperlakukan penggunanya lebih baik?"], explanation: "Kesalahan adalah bagian normal dari pemakaian. B menjaga salah ketukan tetap bisa ditarik balik dengan biaya hampir nol; A mengubah satu telapak jadi kehilangan data permanen." },
  { title: "TRY · Sebut subjek kajiannya", content: ["Lengkapi kalimatnya. Satu kata yang diharapkan. (Inggris atau Indonesia.)"], explanation: "Subjek HCI adalah interaksi — pertukaran dua arah — bukan manusia saja atau mesin saja. Makanya usability juga hidup di desainnya." },
  { title: "FORMALIZE · Apa itu HCI", content: ["Human-Computer Interaction adalah kajian dan praktik merancang interaksi antara orang dan sistem komputasional, supaya sistem bisa dipakai secara efektif, efisien, dan memuaskan.", "Sisi manusianya menarik dari psikologi: persepsi, memori kerja yang terbatas, atensi yang selektif, dan error sebagai properti normal dari kognisi.", "Prinsip sentralnya: usability adalah sifat interaksi, bukan sifat tetap pengguna. Kesalahan yang berulang di tempat yang sama adalah bukti desain. Antarmuka yang menghormati batas manusia — status terlihat, aksi terprediksi, undo — bikin pengguna biasa jadi efektif."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [hciIntroCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["HCI intro → affordances & feedback → interface evaluation", "Lesson berikutnya memperbesar cara antarmuka berkomunikasi: apa yang dijanjikan sebuah kontrol (affordance) dan bagaimana sistem menjawab (feedback) — lalu bagaimana mengevaluasi satu antarmuka utuh.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getHciIntroActivities(language: LessonLanguage) {
  return hciIntroActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [hciIntroCopy[language].prompt] } : {}),
  }));
}

export function localizeHciIntroContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Human-Computer Interaction adalah kajian dan praktik merancang antarmuka supaya orang bisa memakai sistem komputasional secara efektif, efisien, dan memuaskan. Subjeknya adalah interaksi — pertukaran dua arah antara manusia dan sistem — bukan manusia semata atau mesin semata.",
      "HCI menarik dari psikologi untuk sisi manusianya: persepsi (apa yang pengguna perhatikan), memori (apa yang bisa mereka pegang, sedikit sekali), atensi (selektif dan mudah dibajak hal yang salah), dan error (properti normal dari kognisi manusia, bukan kegagalan moral pengguna).",
      "Prinsip sentral yang mengikuti: usability adalah sifat interaksi, bukan sifat tetap pengguna. Ketika banyak pengguna membuat kesalahan yang sama di tempat yang sama, buktinya menunjuk ke desain. Antarmuka yang menghormati batas manusia — status terlihat, aksi terprediksi, undo — membuat pengguna rata-rata jadi efektif.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Antarmuka adalah bagian dari tugas", "Error yang bisa dipulihkan mengalahkan error yang dihukum"][index] ?? example.title,
      explanation: ["Orang yang sama, tujuan yang sama, menit yang sama: satu antarmuka bikin tugasnya remeh, yang lain mengubahnya jadi tes menghafal. Kesulitan hidup di interaksinya.", "Kesalahan manusia itu pasti; pertanyaan desainnya adalah apa yang terjadi setelahnya. Jalur pemulihan menjaga kesalahan kecil tetap kecil."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Kajian dan desain interaksi antara orang dan sistem komputasional.", "Sejauh mana sebuah sistem bisa dipakai mencapai tujuan secara efektif, efisien, dan memuaskan.", "Pertukaran dua arah antara manusia dan sistem — tempat usability sesungguhnya hidup.", "Properti normal dari kognisi manusia; sinyal untuk desain, bukan tuduhan kepada pengguna."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menyalahkan pengguna", "Mendesain untuk diri sendiri", "Mengira familiar sama dengan mudah dipelajari"][index] ?? mistake.title,
      explanation: ["“Pengguna terus salah tekan tombolnya” itu temuan desain. Saat banyak orang salah di tempat yang sama, antarmukanya adalah faktor bersamanya.", "Designer tahu sejarah dan maksud antarmukanya; pengguna menemukanya mentah-mentah. Kemudahan lu sendiri memakai desain lu bukan bukti tentang pengguna.", "“Udah biasa” itu soal kebiasaan, bukan kejelasan. Pola baru yang cocok dengan tugasnya bisa mengalahkan pola lama yang melawannya."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Banyak pengguna membuat kesalahan yang sama di layar yang sama. Menurut HCI ini menunjukkan apa?", "Apa arti “recoverable” bagi sebuah antarmuka?"][index] ?? check.question,
      explanation: ["Kesalahan yang sama berulang di tempat yang sama menunjuk ke satu elemen yang dimiliki semua pengguna itu: antarmukanya.", "Recoverability mengasumsikan error itu normal dan menjadikannya murah: undo, folder sampah, konfirmasi untuk aksi destruktif."][index] ?? check.explanation,
    })),
  };
}

export const hciIntroMasteryConceptLabels: Record<string, string> = {
  interaction: "Interaction", usability: "Usability",
};

export function hciIntroReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("blame_the_user")) return id
    ? "Uji argumen faktor bersamanya: 40 orang gagal di langkah yang sama. Apa satu-satunya hal yang mereka semua pegang?"
    : "Test the common-factor argument: 40 people fail at the same step. What is the one thing all of them share?";
  if (result.misconceptions.includes("minimalism_over_recovery")) return id
    ? "Bandingkan dua desain hapus: yang instan tanpa undo vs yang masuk sampah. Setelah salah ketukan, mana yang lebih murah diperbaiki?"
    : "Compare two delete designs: instant with no undo vs trash with restore. After a mis-tap, which one is cheaper to fix?";
  return id
    ? "Jelaskan ulang idenya dengan contoh sendiri: orang yang sama, dua antarmuka berbeda — di mana letak kesulitannya?"
    : "Restate the idea with your own example: same person, two different interfaces — where does the difficulty live?";
}
