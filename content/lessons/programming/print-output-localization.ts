import { printOutputActivities } from "./print-output-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const printOutputCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Fundamentals",
    prompt: "Explain in your own words: what does print(...) do, and why does the output appear in order when there are several print instructions?",
    placeholder: "print asks Python to show..., and the order...",
    oneLine: "One Python line",
    diagram: "code → dijalankan → output",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review print, code vs output, and execution order, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Fundamental Pemrograman",
    prompt: "Jelasin pakai bahasa lu sendiri: apa yang dilakukan print(...), dan kenapa output-nya muncul berurutan kalau ada beberapa print?",
    placeholder: "print itu minta Python nampilkan..., dan urutannya...",
    oneLine: "Satu baris Python",
    diagram: "code → dijalankan → output",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau print, beda code dan output, serta urutan eksekusinya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Program yang nggak bersuara", content: ["Program yang jalan tapi nggak nampilin apa-apa itu rasanya diam — lu nggak bisa lihat apa yang dia kerjakan, jadi nggak bisa dipercaya atau dipakai.", "Output adalah cara program ngomong sama lu. Kuasai satu instruksi yang menghasilkannya — print() — dan semua lesson setelah ini jadi lebih gampang dicek."] },
  { title: "INTUITION · print = \"tampilkan ini\"", content: ["Baca barisnya keras-keras: \"Python, tolong tampilkan Hello!\". print itu kata yang minta output; kurung membawa yang mau ditampilkan; kutip menandai teks persisnya.", "Untuk sekarang itu saja — print artinya tampilkan, ( ) membawa apa yang ditampilkan, \" \" menandai teksnya."] },
  { title: "SEE · Instruksi dan output-nya", content: ["Ada dua hal di layar ini, dan keduanya bukan jenis yang sama. Baris pertama adalah code — yang lu tulis. Baris setelah output: adalah output — yang muncul waktu code dijalankan.", "Perhatikan: output-nya persis teks di antara kutip. Kata print dan tanda kutipnya nggak ikut muncul — mereka bagian instruksinya, bukan isi pesannya."] },
  { title: "MENTAL MODEL · Code dan output itu beda hal", content: ["Code adalah instruksi yang ditulis; output adalah hasil yang kelihatan saat dijalankan. Ketuker keduanya itu kebingungan klasik beginner — pipeline kecil ini menjaga keduanya terpisah.", "Lu nulis code sekali, tapi tiap dijalankan output-nya muncul lagi. Makanya programmer ngecek kerjaannya lewat output, bukan dengan menatap code."] },
  { title: "PREDICT · Apa yang muncul?", content: ["Baris ini dijalankan. Apa yang muncul di layar?"], explanation: "print() menampilkan teks di antara kutip. Baris code adalah instruksinya; yang muncul adalah output-nya. Nggak ada yang tampil selama nggak ada instruksi yang bilang begitu." },
  { title: "PREDICT · Tiga instruksi, satu urutan", content: ["Tiga instruksi print(), ditulis dengan urutan ini. Apa yang tampil di layar?"], explanation: "Python menjalankan instruksi dari atas ke bawah, satu pada satu waktu, dan tiap print() menampilkan di baris baru sendiri. Tiga instruksi atau dua — urutan code = urutan output." },
  { title: "TRY · Tampilkan Hello! versi lu", content: ["Tulis satu baris Python yang menampilkan teks Hello!. Pakai bentuk dari SEE — print, kurung, kutip di sekeliling teks persisnya."], explanation: "print(\"Hello!\") — print minta output, kurung membawanya, kutip menandai teks persisnya. Kutip satu atau dua sama-sama valid." },
  { title: "FORMALIZE · Output, print(), dan urutan", content: ["Output adalah apa pun yang muncul saat program dijalankan. print() adalah instruksi Python untuk menampilkan sesuatu: print membawa arti \"tampilkan\", kurung menyimpan yang ditampilkan, dan kutip menandai teks persisnya.", "Tiap print() menampilkan teksnya di baris baru. Beberapa print() dijalankan dari atas ke bawah, jadi output muncul dengan urutan yang sama dengan urutan penulisannya.", "Mulai sekarang, output itu feedback lu: tulis instruksi, jalankan, baca yang muncul. Kalau outputnya sesuai niat, instruksinya benar."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [printOutputCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Output with print() → Syntax & Indentation → Comments → Understanding Errors", "Sekarang lu bisa menghasilkan output dan membacanya sebagai feedback. Lesson berikutnya: Syntax & Indentation — aturan penulisan yang Python harapkan sebelum instruksi lu mau dijalankan.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getPrintOutputActivities(language: LessonLanguage) {
  return printOutputActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [printOutputCopy[language].prompt] } : {}),
  }));
}

export function localizePrintOutputContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Program yang menghitung sesuatu tapi nggak pernah menampilkannya itu seperti ngomong tanpa suara. Output adalah cara program berbicara: teks, angka, dan hasil yang benar-benar muncul di depan lu.",
      "Di Python, cara minta output adalah print(). print(\"Hello!\") artinya: Python, tampilkan teks Hello!. Kata print adalah instruksinya, kurung membawa yang mau ditampilkan, dan kutip menandai teks persisnya.",
      "Jalankan, dan Hello! muncul. Segitu saja — dan sekaligus itu cara lu ngecek kerjaan dari sekarang: tulis instruksi, jalankan, baca output-nya.",
    ],
    academicExplanation: [
      "Output adalah apa pun yang muncul karena program dijalankan — teks di layar, baris di berkas, value yang diteruskan ke program lain. Output adalah efek program yang bisa diamati, berbeda dari code yang merupakan instruksi tertulisnya.",
      "print() adalah instruksi Python yang menampilkan sebuah value sebagai output. Kurung membungkus apa yang mau ditampilkan; tanda kutip menandai potongan teks yang persis (sejumlah karakter). Setiap print() menampilkan isinya di baris baru.",
      "Program dengan beberapa instruksi print() menghasilkan output sesuai urutan eksekusi: interpreter membaca program dari atas ke bawah dan menampilkan isi tiap baris saat instruksinya tercapai. Urutan code adalah urutan output.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Satu instruksi, satu output", "Beberapa instruksi, output berurutan", "Teksnya lu yang tentukan"][index] ?? example.title,
      explanation: ["print adalah instruksinya, kurung membawa yang ditampilkan, dan kutip menandai teks persisnya. Output muncul persis seperti yang ditulis di antara kutip.", "Tiap print() menampilkan teksnya sendiri di baris baru, sesuai urutan penulisan instruksinya. Instruksi kedua mulai setelah yang pertama selesai.", "Strukturnya nggak pernah berubah — print(...) — sementara teks di antara kutip sepenuhnya milik lu. Ubah teksnya, output-nya ikut."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Apa pun yang muncul karena program dijalankan.", "Instruksi Python untuk menampilkan sesuatu sebagai output.", "Bagian print yang membawa apa yang mau ditampilkan.", "Penanda teks persis yang mau ditampilkan.", "Urutan atas-ke-bawah saat Python menjalankan instruksi — urutan output muncul."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Ketuker code dengan output", "Menganggap kutip cuma hiasan", "Ngira semua output muncul sekaligus", "Mengabaikan urutan baris"][index] ?? mistake.title,
      explanation: ["print(\"Hello!\") adalah instruksi yang lu tulis. Hello! adalah yang muncul saat dijalankan. Kalau layar lu menampilkan print(\"Hello!\"), berarti code-nya sedang ditampilkan, bukan dijalankan.", "Kutip menandai teks persis yang mau ditampilkan. Tanpa kutip, lu nggak lagi minta Python menampilkan teks itu.", "Tiap print() menampilkan satu teks di barisnya sendiri. Output datang instruksi demi instruksi, sesuai urutan — bukan jadi satu baris yang digabung.", "Tukar dua baris print(), output-nya ikut kebalik. Urutan code adalah urutan output."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa itu output?", "Apa yang ditampilkan print(\"Hello!\")?", "print(\"A\") jalan duluan, lalu print(\"B\"). Apa yang muncul?"][index] ?? check.question,
      explanation: ["Code adalah instruksi yang ditulis; output adalah hasil yang teramati saat dijalankan.", "Kutip menandai teks persisnya; print menampilkannya. Baris code adalah instruksinya, bukan tampilannya.", "Python menjalankan instruksi dari atas ke bawah, dan tiap print() menampilkan di baris baru. Urutan code = urutan output."][index] ?? check.explanation,
    })),
  };
}

export const printOutputMasteryConceptLabels: Record<string, string> = {
  output_concept: "What output is", print_instruction: "print()", execution_order: "Output order",
};

export function printOutputReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("prints_code_text_confusion")) return id
    ? "Pisahkan dua halnya: mana yang lu tulis (code) dan mana yang muncul saat dijalankan (output)? print(...) itu instruksinya atau tampilannya?"
    : "Separate the two: which one did you write (code) and which one appears when it runs (output)? Is print(...) the instruction or the display?";
  if (result.misconceptions.includes("output_stored_confusion")) return id
    ? "Kalau print() cuma nyimpen, layar bakal nampilin apa? Coba sebut ulang tugas print() versi lu."
    : "If print() only stored the text, what would the screen show? Restate print()'s job in your own words.";
  if (result.misconceptions.includes("order_irrelevant_confusion")) return id
    ? "Coba tukar dua baris print-nya di kepala. Apa yang muncul di baris pertama sekarang? Apa kesimpulannya soal cara Python menjalankan program?"
    : "Swap the two print lines in your head. What appears on the first line now? What does that say about how Python runs a program?";
  if (result.misconceptions.includes("quotes_optional_confusion")) return id
    ? "Bandingkan print(Hello!) dan print(\"Hello!\"): mana yang menandai teks persisnya? Apa tugas tanda kutip?"
    : "Compare print(Hello!) and print(\"Hello!\"): which one marks the exact text? What are the quotes for?";
  return id
    ? "Restate alurnya: print(...) → dijalankan → output. Apa persisnya yang muncul, dan di baris ke berapa?"
    : "Restate the pipeline: print(...) → executed → output. What exactly appears, and on which line?";
}
