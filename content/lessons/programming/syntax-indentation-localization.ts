import { syntaxIndentationActivities } from "./syntax-indentation-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const syntaxIndentationCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Fundamentals",
    prompt: "Explain in your own words: what is syntax in Python, and why is indentation not just decoration?",
    placeholder: "Syntax is the writing rules, and indentation...",
    oneLine: "One Python line",
    diagram: "print / ( ) / \" \"",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the writing rules and the meaning of indentation, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fundamental Pemrograman",
    prompt: "Jelasin pakai bahasa lu sendiri: apa itu syntax di Python, dan kenapa indentation nggak boleh dianggap cuma dekorasi?",
    placeholder: "Syntax itu aturan nulisnya, dan indentation...",
    oneLine: "Satu baris Python",
    diagram: "print / ( ) / \" \"",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau aturan penulisan dan arti indentation, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Python membaca persis", content: ["Code adalah teks yang dibaca mesin, dan mesin membacanya persis — huruf demi huruf, spasi demi spasi. Cara lu menulis dan menyusun instruksi menentukan apakah Python bisa membacanya.", "Lesson ini tentang aturan menulis yang selama ini lu pakai tanpa sadar: bentuk print(\"Hello!\"), ejaannya, dan spasi di awal baris."] },
  { title: "INTUITION · Syntax = aturan menulis", content: ["Bahasa manusia punya ejaan dan tanda baca; Python punya syntax — aturan tentang bagaimana instruksi ditulis. Jumlahnya nggak banyak, tapi ketat.", "Kabar baiknya: lu sebenarnya sudah nulis syntax yang benar. print(\"Hello!\") mengikuti semua aturan yang lu butuhkan hari ini."] },
  { title: "SEE · Tiga bagian satu instruksi", content: ["print adalah nama instruksinya — selalu huruf kecil. Kurung ( ) membawa yang mau ditampilkan. Kutip \" \" menandai teks persisnya.", "Itu seluruh anatominya. Pertahankan tiga bagian ini dalam bentuk yang sama, dan Python selalu bisa membaca baris lu."] },
  { title: "PREDICT · print atau Print?", content: ["Seorang teman menulis baris di atas dengan huruf P besar. Apakah instruksinya sama dengan print(\"Hello!\")?"], explanation: "Python itu case-sensitive: ejaan adalah bagian dari nama. Instruksi yang lu kenal adalah print huruf kecil — Print dengan P besar itu ejaan lain, bukan instruksi yang sama." },
  { title: "INTUITION · Indentation = spasi di awal baris", content: ["Indentation adalah whitespace di awal baris. Di tulisan biasa itu cuma kerapian — tapi di Python ia punya arti: baris-baris yang menjorok sama dianggap satu kelompok.", "Preview idenya: dua baris yang menjorok di atas terbaca sebagai satu kelompok di bawah Menu, sementara baris rata kiri berdiri sendiri. Buat sekarang, aturannya simpel — tulis setiap print rata kiri, tanpa spasi di awal."] },
  { title: "SPOT · Mana yang bentuknya benar?", content: ["Dua versi instruksi yang sama. Versi mana yang mengikuti bentuk penulisan yang sudah lu kenal?"], explanation: "Untuk instruksi yang lu kenal, bentuknya: tiap print di barisnya sendiri, mulai rata kiri. Indentation di Python itu bermakna — spasi ekstra di awal baris mengubah bentuk code-nya, jadi jangan ditambah sekadar biar kelihatan cantik." },
  { title: "TRY · Tulis dengan bentuk yang benar", content: ["Tulis satu baris Python yang menampilkan teks Halo, dunia! — print huruf kecil, kurung, kutip di sekeliling teks persisnya, mulai rata kiri."], explanation: "print(\"Halo, dunia!\") — nama dalam huruf kecil, kurung membawa teksnya, kutip menandai teks persisnya, dan barisnya mulai rata kiri tanpa spasi di awal." },
  { title: "FORMALIZE · Aturan menulis sejauh ini", content: ["Syntax adalah kumpulan aturan menulis instruksi Python. Bentuk yang lu kenal: print huruf kecil, kurung membawa yang ditampilkan, kutip menandai teks persisnya, satu instruksi per baris, mulai rata kiri.", "Python itu case-sensitive — print dan Print adalah ejaan yang berbeda, dan cuma satu yang jadi instruksi lu. Indentation — spasi di awal baris — punya arti di Python: ia menandai baris-baris yang sekelompok. Itu sebabnya indentation nggak pernah sekadar dekorasi.", "Sekarang lu punya bentuk penulisan lengkap untuk semua materi module ini sejauh ini. Apa yang terjadi kalau code nggak sesuai aturan — dan bagaimana Python memberi tahu — dapat lesson sendiri sebentar lagi: Understanding Errors."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [syntaxIndentationCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Syntax & Indentation → Comments → Understanding Errors", "Sekarang lu bisa menulis instruksi dalam bentuk yang Python harapkan. Lesson berikutnya: Comments — catatan untuk manusia yang tinggal di dalam file code lu. Setelah itu: apa yang terjadi kalau code nggak sesuai aturan.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getSyntaxIndentationActivities(language: LessonLanguage) {
  return syntaxIndentationActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [syntaxIndentationCopy[language].prompt] } : {}),
  }));
}

export function localizeSyntaxIndentationContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Python membaca code lu persis seperti yang ditulis — huruf demi huruf, spasi demi spasi. Syntax adalah kumpulan aturan menulis instruksi supaya Python bisa membacanya.",
      "Lu sudah mengenal satu instruksi lengkap: print(\"Hello!\"). Bentuknya adalah syntax yang lu butuhkan sekarang: print huruf kecil, kurung membawa yang ditampilkan, kutip menandai teks persisnya.",
      "Python juga peduli pada susunan baris. Spasi di awal baris disebut indentation — dan di Python ia bukan dekorasi. Spasi itu membantu Python melihat baris mana saja yang sekelompok.",
    ],
    academicExplanation: [
      "Syntax adalah kumpulan aturan yang menentukan bagaimana instruksi harus ditulis agar Python bisa membacanya. Bahasa ini membaca nama secara case-sensitive: print dan Print adalah ejaan berbeda, dan hanya bentuk huruf kecil yang menjadi instruksi yang lu kenal.",
      "Sebuah instruksi print punya tiga bagian yang terlihat: nama print, kurung yang membawa apa yang ditampilkan, dan tanda kutip yang menandai teks persisnya. Menulis ketiganya dalam bentuk yang diharapkan itulah yang membuat baris tersebut terbaca oleh Python.",
      "Indentation adalah whitespace di awal baris. Di Python ia signifikan: baris-baris yang menjorok dengan jumlah sama dibaca sebagai satu kelompok. Untuk instruksi yang lu kenal sejauh ini, konvensinya sederhana — mulai setiap baris print rata kiri, tanpa spasi di awal.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Bentuk satu instruksi", "Ejaan penting: print vs Print", "Indentation mengubah bentuk"][index] ?? example.title,
      explanation: ["print — nama instruksinya, huruf kecil. ( ) — membawa yang ditampilkan. \" \" — menandai teks persisnya. Tiga bagian, satu instruksi utuh.", "Python membaca nama persis seperti ejaannya. Hanya print huruf kecil yang menjadi instruksi yang lu kenal — Print dengan P besar adalah ejaan lain yang tidak dikenali.", "Kiri: setiap instruksi mulai rata kiri — bentuk yang lu kenal. Kanan: spasi di awal baris mengubah cara baris dibaca, karena di Python indentation bermakna. Buat sekarang, tulis setiap print rata kiri."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Aturan tentang bagaimana instruksi Python harus ditulis.", "Ejaan huruf besar dan kecil diperlakukan sebagai nama yang berbeda.", "Spasi di awal baris; di Python ia membawa arti.", "Sekelompok baris yang sekelompok; di Python, indentation yang menunjukkan pengelompokannya."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menulis Print alih-alih print", "Menganggap indentation dekorasi", "Mengira Python mengabaikan spasi", "Mencampur gaya indentation"][index] ?? mistake.title,
      explanation: ["Python membaca ejaan secara persis. Instruksi yang lu kenal adalah print huruf kecil — Print dengan P besar itu nama lain.", "Di Python, spasi di awal baris membantu menentukan struktur. Indentation adalah bagian dari cara code dibaca, bukan pilihan gaya.", "Python membaca code lu spasi demi spasi. Spasi ekstra di awal baris mengubah bentuk code.", "Baris yang sekelompok harus menjorok konsisten. Kebiasaan bersih buat sekarang: tulis setiap baris print rata kiri."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa itu syntax?", "Apakah print dan Print sama di Python?", "Apa fungsi indentation di Python?"][index] ?? check.question,
      explanation: ["Syntax adalah aturan penulisan bahasanya — bentuk yang membuat instruksi terbaca oleh Python.", "Python itu case-sensitive: ejaan adalah bagian dari nama. Hanya print huruf kecil yang menjadi instruksi yang lu kenal.", "Di Python, indentation itu signifikan: ia menunjukkan pengelompokan. Buat sekarang, tulis setiap print rata kiri."][index] ?? check.explanation,
    })),
  };
}

export const syntaxIndentationMasteryConceptLabels: Record<string, string> = {
  syntax_rules: "Syntax rules", case_sensitivity: "Case-sensitive", indentation_meaning: "Meaningful indentation",
};

export function syntaxIndentationReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("case_insensitive_confusion")) return id
    ? "Bandingin dua ejaannya di layar: print dan Print. Mana yang jadi instruksi yang lu kenal, dan apa artinya kalau ejaannya beda?"
    : "Compare the two spellings on screen: print and Print. Which one is the instruction you know, and what does a different spelling mean?";
  if (result.misconceptions.includes("indentation_decorative_confusion")) return id
    ? "Lihat dua baris yang menjorok di contoh Menu: apa yang Python lihat dari menjoroknya itu — gaya tulisan atau pengelompokan?"
    : "Look at the two indented lines in the Menu example: what does the indenting tell Python — writing style, or grouping?";
  if (result.misconceptions.includes("whitespace_ignored_confusion")) return id
    ? "Python membaca code spasi demi spasi. Apa yang berubah kalau satu baris print tiba-tiba menjorok di awalnya?"
    : "Python reads code space by space. What changes when a print line suddenly starts with extra spaces?";
  return id
    ? "Restate bentuknya: sebut tiga bagian print(\"Hello!\") dan satu aturan soal awal baris."
    : "Restate the shape: name the three parts of print(\"Hello!\") and the one rule about the start of a line.";
}
