import { distributedBasicsActivities } from "./distributed-basics-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const distributedBasicsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Parallel and Distributed Foundations",
    prompt: "Explain in your own words why a distributed system survives one machine dying — and what price it pays for that.",
    placeholder: "No single point of failure, but...",
    oneLine: "Your answer",
    diagram: "scenario",
    codeLabel: "scenario",
    sourceCheck: "Source Mode: no AI evaluation. Review the distribution model and partial failure, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Paralel dan Terdistribusi",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa sistem terdistribusi lebih tahan mati-matian satu mesin — dan apa harga yang harus dibayarnya.",
    placeholder: "Tidak ada satu titik kegagalan, tapi...",
    oneLine: "Jawaban kamu",
    diagram: "skenario",
    codeLabel: "skenario",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau model distribusi dan kegagalan parsial, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa sistem tersebar antar mesin", content: ["Google, WhatsApp, dan LMS kampus bukan satu komputer — mereka ribuan, bekerja sama sebagai satu. Distribusi adalah cara sistem menskalakan melewati satu mesin dan bertahan dari kematiannya.", "Lesson ini membangun kosakatanya: apa yang berubah, apa yang dibeli, dan apa harganya."] },
  { title: "INTUITION · Tim yang WFH", content: ["Sistem terdistribusi itu beberapa komputer independen yang dialami pengguna sebagai satu sistem — kayak tim remote yang entah bagaimana mengirim satu produk.", "Mereka tidak berbagi memori dan tidak berbagi jam. Koordinasi hanya lewat pesan — dan pesan bisa lambat, hilang, atau sampai dua kali."] },
  { title: "SEE · Yang mati, dan yang bertahan", content: ["Di satu mesin, kegagalannya total: crash menghentikan semuanya. Di sistem terdistribusi, kegagalannya parsial: beberapa komponen mati, yang lain hidup — dan itu kasus normalnya.", "Setiap desain terdistribusi menjawab pertanyaan yang sama: saat satu bagian gagal, sisanya melemah dengan cara apa?"] },
  { title: "PREDICT · Gimana koordinasinya?", content: ["Apa satu-satunya mekanisme yang bisa mereka pakai untuk koordinasi?"], explanation: "Tidak ada memori bersama, tidak ada jam bersama: pesan adalah satu-satunya saluran koordinasi. Latensi, kehilangan, dan duplikasinya adalah bagian dari perilaku sistem." },
  { title: "PREDICT · Satu dari lima mati", content: ["Situasi ini disebut apa?"], explanation: "Beberapa komponen mati, yang lain melayani: kegagalan parsial adalah kondisi khas sistem terdistribusi, dan menahannya itulah tujuan desain fault tolerance." },
  { title: "PREDICT · Harga distribusinya", content: ["Apa yang terlewat dari penalaran ini?"], explanation: "Distribusi membeli skala dan ketahanan, dan membayarnya dengan koordinasi. Tanpa kerja independen untuk dibagi, versi terdistribusinya bisa lebih lambat dari satu mesin bagus." },
  { title: "TRY · Sebut propertinya", content: ["Sebut properti itu (Inggris atau Indonesia). Satu kata."], explanation: "Fault tolerance: desainnya tetap beroperasi, mungkin dengan kapasitas berkurang, saat beberapa komponen mati." },
  { title: "FORMALIZE · Dasar-dasar terdistribusi", content: ["Sistem terdistribusi adalah kumpulan komputer independen yang tampak bagi penggunanya sebagai satu sistem koheren. Mesin-mesinnya tidak berbagi memori dan jam; mereka berkoordinasi secara eksklusif dengan saluran pesan lewat jaringan.", "Motivasinya performa (kerja dibagi antar mesin) dan fault tolerance (tidak ada satu titik kegagalan bila replikasi didesain masuk). Harganya: pesan punya latensi dan bisa hilang, terurut ulang, atau terduplikasi; jam-jamnya melenceng; mesin crash dan pulih secara independen.", "Dua konsekuensi mendefinisikan bidangnya: kegagalan jadi parsial (beberapa komponen mati sementara yang lain jalan — kasus normal yang harus ditahan sistem), dan state bersama jadi masalah koordinasi (memperbarui data yang sama dari beberapa mesin butuh kesepakatan)."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [distributedBasicsCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Distributed basics → replikasi & konsistensi → protokol kesepakatan di semester berikutnya", "Semester berikutnya memformalkan bagian sulitnya: bagaimana replika sepakat, apa arti jaminan konsistensi, dan hasil-hasil ketidakmungkinan yang terkenal. Kosakat yang lu bangun di sini tiket masuknya.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getDistributedBasicsActivities(language: LessonLanguage) {
  return distributedBasicsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [distributedBasicsCopy[language].prompt] } : {}),
  }));
}

export function localizeDistributedBasicsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Sistem terdistribusi adalah kumpulan komputer independen yang tampak bagi penggunanya sebagai satu sistem koheren. Mesin-mesin itu tidak berbagi memori atau jam; mereka berkoordinasi secara eksklusif dengan mengirimkan pesan lewat jaringan.",
      "Motivasinya adalah performa (kerja dibagi ke banyak mesin) dan toleransi kegagalan (tidak ada satu titik kegagalan, bila replikasi didesain masuk). Biayanya muncul dari distribusinya sendiri: pesan mengalami latensi, bisa hilang, terurut ulang, atau terduplikasi; mesin bisa crash dan pulih kapan saja; dan tidak ada satu sumber kebenaran untuk “sekarang” — jam di mesin berbeda saling melenceng.",
      "Dua konsekuensi mendefinisikan bidang ini. Pertama, kegagalan menjadi parsial: pada satu mesin, crash menghentikan segalanya; pada sistem terdistribusi, satu komponen gagal sementara yang lain lanjut adalah kasus normal, dan sistem harus mendeteksi serta menahannya. Kedua, state bersama menjadi masalah koordinasi: memperbarui data yang sama dari beberapa mesin membutuhkan protokol kesepakatan — itulah kenapa state tereplikasi dan konsistensi adalah topik sentral disiplin ini.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Terpusat vs terdistribusi, secara visual", "Kegagalan parsial"][index] ?? example.title,
      explanation: ["Distribusi membeli ketahanan dan skala, dan membayar dengan koordinasi: pesan-pesan antar mesin menjadi bagian dari perilaku sistem — dan mode kegagalannya.", "Kegagalan parsial adalah masalah terdistribusi yang paling khas: sistemnya tidak sepenuhnya hidup juga tidak sepenuhnya mati, dan tiap desain harus memutuskan bagaimana tiap bagiannya melemah."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Komputer-komputer independen yang berkoordinasi lewat pesan, tampak sebagai satu sistem.", "Satu-satunya cara komponen terdistribusi berkomunikasi; tunduk pada latensi, kehilangan, duplikasi.", "Beberapa komponen gagal sementara yang lain lanjut — mode kegagalan normal sistem terdistribusi.", "Komponen yang kematiannya menghentikan seluruh sistem; yang bisa dihilangkan distribusi.", "Kemampuan tetap beroperasi, mungkin melemah, saat komponen gagal."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menganggap jaringan itu andal", "Percaya semua mesin berbagi satu jam", "Menganggap terdistribusi otomatis lebih cepat"][index] ?? mistake.title,
      explanation: ["Pesan hilang, telat, dan terduplikasi. Desain yang hanya jalan kalau semua pesan sampai adalah desain yang akan gagal di jaringan beneran.", "Jam mesin melenceng. “Simpan jam 10:00” di dua mesin bisa berarti momen berbeda. Mengurutkan kejadian lintas mesin butuh protokol, bukan timestamp saja.", "Distribusi menambah biaya koordinasi. Tanpa kerja independen untuk dibagi, versi terdistribusinya bisa lebih lambat dari satu mesin bagus."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa mekanisme komunikasi yang mendefinisikan sistem terdistribusi?", "Satu dari lima server crash; sisanya tetap melayani. Ini disebut…"][index] ?? check.question,
      explanation: ["Tidak ada memori bersama, tidak ada jam bersama — pesan adalah satu-satunya saluran koordinasi, dan ketidaksempurnaannya membentuk setiap desain.", "Beberapa komponen mati, beberapa hidup: sistem terdistribusi didesain di sekitar penahanan situasi ini persis."][index] ?? check.explanation,
    })),
  };
}

export const distributedBasicsMasteryConceptLabels: Record<string, string> = {
  distribution_model: "The model", failure_handling: "Failure handling",
};

export function distributedBasicsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("shared_memory_confusion")) return id
    ? "Cek dua mesin di sistem itu: apa yang mereka beneran bagi — memori? jam? atau cuma pesan yang saling dikirim?"
    : "Check two machines in that system: what do they actually share — memory? a clock? or only messages they send each other?";
  if (result.misconceptions.includes("free_speedup_confusion")) return id
    ? "Buat tagihan koordinasinya: 20 mesin berarti berapa pesan per detik — dan apa yang terjadi kalau satu telat?"
    : "Draft the coordination bill: 20 machines means how many messages per second — and what happens when one is late?";
  return id
    ? "Jelaskan ulang: distribusi menghilangkan satu titik kegagalan dan menagih bayaran koordinasi — apa saja isi tagihannya?"
    : "Restate: distribution removes the single point of failure and bills for coordination — what items are on that bill?";
}
