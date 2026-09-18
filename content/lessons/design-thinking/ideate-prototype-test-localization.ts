import { ideatePrototypeTestActivities } from "./ideate-prototype-test-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const ideatePrototypeTestCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Design Thinking Foundations",
    prompt: "Explain in your own words why prototyping and testing are cheaper than building the product directly — and what a test actually looks for.",
    placeholder: "A prototype answers one question cheaply, and a test...",
    oneLine: "Your answer",
    diagram: "scenario",
    codeLabel: "scenario",
    sourceCheck: "Source Mode: no AI evaluation. Review prototype cost logic and test observation, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fondasi Design Thinking",
    prompt: "Jelasin pakai bahasa lu sendiri kenapa prototyping dan testing itu lebih murah daripada langsung membangun produknya — dan apa yang sebenarnya dicari saat testing.",
    placeholder: "Prototipe menjawab satu pertanyaan dengan murah, dan test...",
    oneLine: "Jawaban kamu",
    diagram: "skenario",
    codeLabel: "skenario",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau logika biaya prototipe dan observasi test, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa paruh belakang loop itu ada", content: ["Ide itu murah; bangunan yang salah itu mahal. Ideation, prototyping, dan testing adalah tiga langkah yang mencegah tim menghabiskan budget untuk ide pertama yang masuk.", "Bersama-sama mereka mengubah satu tebakan menjadi tebakan yang sudah dicek — berkali-kali per minggu, bukan sekali per proyek."] },
  { title: "INTUITION · Lebarkan, sempitkan, cek", content: ["Otak kita otomatis nempel di ide pertama dan membela ide itu. Ideation adalah disiplin untuk melewati refleks itu: kuantitas dulu, penilaian belakangan.", "Penyempitan memakai POV sebagai filternya. Yang bertahan jadi prototipe — artefak termurah yang bisa menjawab satu pertanyaan — dan test memperhatikan orang beneran memakainya."] },
  { title: "PREDICT · Jebakan ide pertama", content: ["Ide pertama yang muncul di sesi ideation adalah aplikasi notifikasi. Langkah sehat apa selanjutnya?"], explanation: "Ide pertama biasanya yang paling umum. Langkahnya bukan membunuh atau menobatkannya, tapi melebarkan pilihan selama penilaian ditangguhkan — lalu memilih dengan POV." },
  { title: "PREDICT · Prototipe itu buat apa?", content: ["Apa tugas utama sebuah prototipe?"], explanation: "Prototipe adalah pertanyaan yang diwujudkan. Dia menjawab “apa mahasiswa transfer bisa lihat perubahan kelas sekali pandang?” dengan sketsa — tanpa kode, tanpa gaya, tanpa harus lengkap." },
  { title: "SEE · Apa yang sebenarnya diamati saat test", content: ["Saat test, fasilitatornya diam dan memperhatikan perilaku: jeda, ketukan salah, jalan pintas yang diciptakan sendiri.", "Pendapat yang ditawarkan setelahnya itu sekunder. Apa yang pengguna lakukan — tanpa dibantu — adalah bukti yang dicari."] },
  { title: "PREDICT · Membaca perilaku saat test", content: ["Bagaimana tim seharusnya membaca momen itu?"], explanation: "Jeda plus ketukan salah plus tebakan yang diucapkan berarti antarmukanya tidak mengomunikasikan keadaannya. Menyalahkan pengguna menghapus temuan; mencatatnya memperbaiki desain." },
  { title: "TRY · Sebutkan aturan fideltas", content: ["Lengkapi aturannya. Satu kata yang diharapkan — kata tanya. (Inggris atau Indonesia.)"], explanation: "Fideltas mengikuti pertanyaan: pilih artefak termurah yang menjawabnya. Sketsa menjawab pertanyaan layout; alur butuh mockup yang bisa diklik; pertanyaan nilai mungkin butuh Wizard-of-Oz." },
  { title: "FORMALIZE · Ideate, prototype, test", content: ["Ideation menerapkan divergen sebelum konvergen: hasilkan banyak pilihan dengan penilaian ditangguhkan, lalu pilih dengan kriteria eksplisit — POV-nya. Pemisahan itu menjaga ide yang tidak biasa tetap hidup, dan di situlah solusi baru berasal.", "Prototipe adalah artefak yang dibangun untuk menjawab satu pertanyaan spesifik dengan biaya minimum; fideltasnya menyesuaikan pertanyaan. Berusaha menjawab semua pertanyaan sekaligus bikin prototipe mahal dan sulit dipelajari.", "Testing mengamati pengguna nyata dengan intervensi minimal. Jeda, salah baca, dan jalan pintas adalah datanya; pendapat itu sekunder. Hasilnya mengisi loop — kembali ke ideation, ke bingkai masalah, atau maju."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [ideatePrototypeTestCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Design thinking → loop lengkap dalam praktik → diterapkan ke masalah kampus nyata", "Lain kali ketemu masalah yang kabur, urutannya sudah siap: pahami orangnya, bingkai masalahnya, lebarkan pilihan, prototipe pertanyaannya, lihat hasil testnya — dan berputar.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getIdeatePrototypeTestActivities(language: LessonLanguage) {
  return ideatePrototypeTestActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [ideatePrototypeTestCopy[language].prompt] } : {}),
  }));
}

export function localizeIdeatePrototypeTestContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    academicExplanation: [
      "Ideation menerapkan divergen sebelum konvergen: pertama hasilkan banyak pilihan sambil sengaja menangguhkan penilaian, lalu seleksi. Pemisahan ini penting karena evaluasi yang berlangsung saat generasi menekan ide yang tidak biasa, padahal ide tidak biasa justru sumber solusi baru. Teknik seperti brainstorming, brainwriting, dan inspirasi analog adalah cara terstruktur untuk menegakkan pemisahan itu.",
      "Prototipe adalah artefak yang dibangun untuk menjawab satu pertanyaan spesifik dengan biaya minimum. Fideltas dipilih sesuai pertanyaannya: sketsa kertas menjawab pertanyaan layout, mockup yang bisa diklik menjawab pertanyaan alur, setup Wizard-of-Oz menjawab apakah konsep layanan punya nilai. Prototipe yang mencoba menjawab semua pertanyaan sekaligus menjadi mahal dan sulit dipelajari.",
      "Testing mengamati pengguna nyata berinteraksi dengan artefak dengan intervensi fasilitator seminimal mungkin. Ukuran yang menarik adalah di mana pengguna ragu, salah baca, atau menciptakan jalan pintas — perilaku, bukan pendapat. Hasil test mengisi loop: bisa mengirim tim kembali ke ideation, ke bingkai masalah, atau maju ke penyempurnaan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu pertanyaan per prototipe", "Divergen lalu konvergen", "Apa yang diamati saat test"][index] ?? example.title,
      explanation: ["Artefaknya ada untuk menjawab satu pertanyaan bernama dengan murah. Dia tidak butuh kode yang jalan, styling, atau kelengkapan.", "Lebarkan dulu, sempitkan belakangan. Kriteria seleksi datang dari POV, bukan dari siapa yang berargumentasi paling keras.", "Perilaku saat test adalah buktinya. Pendapat tentang artefak itu sekunder; apa yang pengguna lakukan mengalahkan apa yang mereka katakan tentangnya."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Menghasilkan banyak pilihan sambil menangguhkan penilaian.", "Menyempitkan banyak pilihan menjadi sedikit, dengan kriteria eksplisit.", "Artefak murah yang dibangun untuk menjawab satu pertanyaan spesifik.", "Seberapa jadi kesan sebuah prototipe; dipilih sesuai pertanyaan yang dijawabnya.", "Test tempat pengguna menceritakan pikirannya sambil memakai artefak, diamati dengan intervensi minimal."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Menilai ide sambil menghasilkannya", "Cinta mati sama ide pertama", "Semua diprototipekan fideltas tinggi", "Menjelaskan saat test"][index] ?? mistake.title,
      explanation: ["“Udah pernah dicoba 2019” membunuh ide di tengah generasi. Catat dulu, evaluasi belakangan — pemisahannya itulah tekniknya.", "Ide pertama biasanya yang paling jelas. Divergen ada untuk melewatinya sebelum berkomitmen.", "Prototipe yang dipoles tidak menjawab pertanyaannya lebih baik dari sketsa, jauh lebih mahal, dan bikin tim ogah membuangnya.", "Setiap penjelasan yang lu kasih saat testing menghapus data yang justru dicari: di mana pengguna tersesat tanpa bantuan."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa tugas utama sebuah prototipe?", "Saat test, pengguna berhenti sejenak dan menekan elemen yang salah. Ini apa?", "Kenapa memisahkan generasi ide dari evaluasi?"][index] ?? check.question,
      explanation: ["Prototipe adalah pertanyaan yang diwujudkan: pilih pertanyaannya, bangun artefak termurah yang menjawabnya.", "Di mana pengguna ragu, salah baca, atau mencari jalan pintas persis informasi yang ingin dikumpulkan sebuah test.", "Penilaian saat generasi menekan ide yang tidak biasa; menunda penilaian menjaganya tetap hidup cukup lama untuk dipertimbangkan."][index] ?? check.explanation,
    })),
  };
}

export const ideatePrototypeTestMasteryConceptLabels: Record<string, string> = {
  ideation: "Ideation", prototyping: "Prototyping", testing: "Testing",
};

export function ideatePrototypeTestReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("prototype_as_product_confusion")) return id
    ? "Ambil satu pertanyaan spesifik — “apakah pengguna bisa lihat statusnya?” — lalu tentukan artefak termurah yang menjawabnya. Apa bentuknya?"
    : "Pick one specific question — \"can the user see the status?\" — then decide the cheapest artifact that answers it. What shape is it?";
  if (result.misconceptions.includes("blame_the_user")) return id
    ? "Ubah bingkainya: ketukan salah itu bukan “user kurang paham teknologi”. Apa yang tidak dikomunikasikan antarmukanya saat itu?"
    : "Reframe it: a wrong tap is not \"the user is bad with tech\". What did the interface fail to communicate in that moment?";
  return id
    ? "Jelaskan ulang logika biayanya: kenapa salah pakai kertas 15 menit lebih murah daripada salah pakai produk 3 bulan?"
    : "Restate the cost logic: why is being wrong with 15 minutes of paper cheaper than being wrong with 3 months of product?";
}
