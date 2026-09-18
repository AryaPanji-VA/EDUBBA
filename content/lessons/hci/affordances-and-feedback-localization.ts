import { affordancesAndFeedbackActivities } from "./affordances-and-feedback-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const affordancesAndFeedbackCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "HCI Foundations",
    prompt: "Explain in your own words the difference between affordance and feedback — and why an unresponsive button is a design problem, not a user problem.",
    placeholder: "Affordance is the promise, feedback is...",
    oneLine: "Your answer",
    diagram: "scenario",
    codeLabel: "scenario",
    sourceCheck: "Source Mode: no AI evaluation. Review promises and answers, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi HCI",
    prompt: "Jelasin pakai bahasa lu sendiri bedanya affordance dan feedback — dan kenapa tombol yang nggak merespon setelah ditekan itu masalah desain, bukan masalah pengguna.",
    placeholder: "Affordance itu janjinya, feedback itu...",
    oneLine: "Jawaban kamu",
    diagram: "skenario",
    codeLabel: "skenario",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau janji dan jawaban, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Bentuk ngomong sebelum kata-kata", content: ["Pengguna memutuskan apa yang dilakukan dengan sebuah layar dalam hitungan detik, kebanyakan dari bentuknya — sebelum membaca instruksi, kalau sampean dibaca.", "Affordance dan feedback adalah dua saluran yang membawa percakapan itu: apa yang dijanjikan bentuk, dan bagaimana sistem menjawab. Layar yang gagal di salah satunya gagal secara diam-diam."] },
  { title: "INTUITION · Janji dan jawaban", content: ["Affordance itu janji: bentuk ini menyarankan aksi begini dan bukan yang lain. Gagang fisik melakukannya lewat bentuk; antarmuka lewat konvensi — kotak menonjol, teks bergaris bawah, kursor.", "Feedback itu jawaban: setelah bertindak, pengguna harus lihat atau dengar bahwa sesuatu terjadi, apa yang terjadi, dan kira-kira apa selanjutnya."] },
  { title: "PREDICT · Apa yang dijanjikan bentuknya?", content: ["Dari bentuknya saja, apa yang dikomunikasikan tombol \"Simpan\" yang menonjol itu?"], explanation: "Kotak menonjol seperti tombol plus label yang jelas adalah janji satu aksi spesifik. Teks abu-abu datar \"Batal\" menjanjikan kemenonjolan lebih rendah — dan secara konvensi, penutupan." },
  { title: "SEE · Tiga tugas feedback", content: ["Feedback mengerjakan tiga tugas: mengonfirmasi aksinya terdaftar (kuitansi), menjelaskan keadaan baru, dan menetapkan ekspektasi untuk selanjutnya.", "Spinner saja bilang “ada sesuatu terjadi”; timestamp tersimpan-kapan bilang apa; progress bar bilang apa selanjutnya dan berapa lama."] },
  { title: "PREDICT · Harga dari keheningan", content: ["Save-nya jalan, tapi antarmukanya diam. Apa yang paling mungkin dilakukan pengguna?"], explanation: "Diam terbaca sebagai tidak terdaftar. Respons yang bisa diprediksi adalah pengiriman ulang — begitulah save yang tak terlihat berubah jadi bug data ganda." },
  { title: "PREDICT · Tombol palsu", content: ["Apa yang dikorbankan elemen mirip tombol yang tidak melakukan apa-apa itu?"], explanation: "Bentuk itu janji. Janji yang sekali patah bikin pengguna ragu di semua tempat lain di antarmuka — bahasa affordance seluruh layar ikut terdegradasi." },
  { title: "TRY · Sebut saluran yang gagal", content: ["Jawab satu kata: affordance / feedback."], explanation: "Aksinya tersedia dan sudah diambil — janjinya bekerja. Yang gagal adalah jawabannya: tidak ada respons yang terlihat, jadi pengguna mengulang." },
  { title: "FORMALIZE · Affordance dan feedback", content: ["Affordance adalah hubungan antara bentuk objek dan aksi yang pengguna persepsikan bisa didukungnya. Signifier — label, placeholder, keadaan disabled — membuat affordance tertentu jelas; saat pengguna tidak bertindak seperti yang diharapkan, cari dulu signifier yang hilang atau bertentangan.", "Feedback adalah respons sistem yang bisa dipersepsikan terhadap sebuah aksi, dengan tiga tujuan: mengonfirmasi penerimaan, menyampaikan keadaan, dan menetapkan ekspektasi. Ketiadaannya bukan netral — dibaca sebagai kegagalan dan dijawab dengan aksi berulang.", "Audit layar apa pun dengan dua pertanyaan: apa yang dijanjikan bentuk-bentuknya, dan apa yang dijawab sistem setelah tiap aksi?"] },
  { title: "ROBIN CHECK · Jelasin balik", content: [affordancesAndFeedbackCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Affordances & feedback → interface evaluation", "Lesson berikutnya mengubah ide-ide ini jadi praktik evaluasi: menelusuri antarmuka nyata dan menemukan di mana janji patah dan jawaban hilang.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getAffordancesAndFeedbackActivities(language: LessonLanguage) {
  return affordancesAndFeedbackActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [affordancesAndFeedbackCopy[language].prompt] } : {}),
  }));
}

export function localizeAffordancesAndFeedbackContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Affordance adalah hubungan antara bentuk suatu objek dan aksi yang bisa dipersepsikan pengguna sebagai didukung oleh objek itu. Pada benda fisik, bentuk dan material menandakan penggunaan — gagang mengajak menarik, pelat datar mengajak mendorong. Pada antarmuka grafis, konvensi (wadah mirip tombol, tautan bergaris bawah, kursor grab) memikul peran penanda yang sama; kemungkinan aksi yang dipersepsikan itulah yang memandu perilaku, cocok atau tidaknya dengan maksud designer.",
      "Signifier membuat affordance menjadi spesifik: tanda jalur kursi roda, placeholder di kolom isian, keadaan disabled di tombol. Ketika pengguna tidak bertindak sesuai maksud, kegagalan yang umum adalah signifier yang hilang atau bertentangan, bukan affordance yang tidak ada.",
      "Feedback adalah respons sistem terhadap sebuah aksi, dan ia melayani tiga tujuan: mengonfirmasi penerimaan (sesuatu terjadi), menyampaikan keadaan (apa yang terjadi), dan menetapkan ekspektasi (apa selanjutnya, termasuk progres dan durasi). Antarmuka tanpa feedback memaksa pengguna menebak apakah aksinya terdaftar — yang secara andal menghasilkan pengiriman ulang, keraguan, dan penyerahan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Affordance di pintu dan di layar", "Tiga tugas feedback"][index] ?? example.title,
      explanation: ["Bentuk bicara sebelum instruksi. Pelat pintu dan tombol menonjol sama-sama menjanjikan aksi tanpa kata-kata.", "Konfirmasi, jelaskan, dan tetapkan ekspektasi. Keheningan tidak menghasilkan ketiganya, jadi pengguna mengganti dengan tebakan sendiri dan mengulang aksi."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Hubungan antara bentuk objek dan aksi yang pengguna persepsikan didukungnya.", "Penanda yang bisa dipersepsikan yang membuat affordance spesifik jelas — label, ikon, placeholder, keadaan disabled.", "Respons sistem yang terlihat/terdengar terhadap aksi: mengonfirmasi penerimaan, menyampaikan keadaan, menetapkan ekspektasi.", "Tidak adanya feedback setelah aksi, yang ditafsirkan pengguna sebagai kegagalan dan dijawab dengan mengulang aksi."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Hal yang terlihat bisa diklik tapi nggak melakukan apa-apa", "Aksi tanpa respons yang terlihat", "Menyembunyikan affordance di balik kebiasaan"][index] ?? mistake.title,
      explanation: ["Teks kartu yang ditata seperti tautan atau label yang diberi kotak seperti tombol menjanjikan aksi; tidak memberi apa-apa mengajari pengguna untuk tidak memercayai antarmuka.", "Save yang selesai tanpa terlihat akan ditekan tiga kali. Kerjanya selesai; antarmukanya gagal mengatakannya.", "“Nanti ketemu sendiri sambil swipe” hanya berhasil untuk satu audiens: yang sudah tahu. Signifier bisa diskalakan; rahasia tidak."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Tombol \"Simpan\" yang menonjol dan berlabel paling langsung mengomunikasikan…", "Pengguna menekan \"Simpan\" dan tidak ada yang berubah terlihat. Apa yang biasanya terjadi?"][index] ?? check.question,
      explanation: ["Bentuknya (wadah menonjol mirip tombol) plus labelnya (signifier) bersama menjanjikan satu aksi spesifik.", "Tanpa feedback, pengguna tak bisa memastikan aksinya terdaftar; pengiriman ulang adalah respons yang bisa diprediksi — dan bug save-ganda yang menunggu waktu."][index] ?? check.explanation,
    })),
  };
}

export const affordancesAndFeedbackMasteryConceptLabels: Record<string, string> = {
  affordance: "Affordances", feedback: "Feedback",
};

export function affordancesAndFeedbackReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("fake_clickable_confusion")) return id
    ? "Ambil satu layar yang lu kenal: elemen mana yang bentuknya menjanjikan aksi? Cek satu per satu — janjinya kebayar?"
    : "Take one screen you know: which elements promise actions by their shape? Check each — is the promise kept?";
  if (result.misconceptions.includes("silence_confusion")) return id
    ? "Rekayasa ulang momennya: tekan Simpan, layar diam 300 ms. Apa yang pengguna pikirkan di detik itu — dan apa yang bikin dia yakin?"
    : "Replay the moment: tap Save, screen silent for 300 ms. What does the user think in that second — and what would make them certain?";
  return id
    ? "Jelaskan ulang dua salurannya: bentuk menjanjikan apa, sistem menjawab apa — lalu pakai tombol diam sebagai contoh kegagalan jawaban."
    : "Restate the two channels: what form promises, what the system answers — then use the silent button as the example of a failed answer.";
}
