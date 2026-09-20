import { problemDecompositionActivities } from "./problem-decomposition-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const problemDecompositionCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Putting It Together",
    prompt: "Explain in your own words: why is the two-scores program easier to build as small steps — and which known concept powers each step?",
    placeholder: "The program splits into small steps..., and each step uses... because...",
    oneLine: "Split the problem, solve the steps",
    diagram: "BIG PROBLEM → INPUT → PROCESS → OUTPUT → small steps",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the seven small steps and the known concept behind each one, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Menyatukan Semuanya",
    prompt: "Jelasin pakai bahasa lu sendiri: kenapa program rata-rata dua nilai lebih gampang dipecah jadi langkah kecil — dan konsep apa yang dipakai di tiap langkah?",
    placeholder: "Programnya dipecah jadi langkah kecil..., dan tiap langkah pakai... karena...",
    oneLine: "Pecah masalahnya, selesaikan langkahnya",
    diagram: "MASALAH BESAR → INPUT → PROSES → OUTPUT → langkah kecil",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau tujuh langkah kecilnya dan konsep yang udah lu kenal di tiap langkah, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Masalah besar, langkah kecil", content: ["Nggak ada sintaks Python baru di lesson ini — ini cara berpikir. Tugasnya: minta dua nilai, hitung rata-ratanya, terus print Pass kalau rata-ratanya minimal 70, kalau nggak print Try Again. Ditulis sebagai satu blok keliatan gede; lihat deh dia bongkar jadi langkah kecil.", "Masalah gede jadi gampang pas dipecah: ambil nilai pertama, ambil nilai kedua, ubah kedua nilai jadi angka, hitung rata-rata, bandingin rata-rata dengan 70, milih hasilnya, print hasilnya. Tujuh langkah — dan semuanya konsep yang udah lu kenal."] },
  { title: "INTUITION · Input, proses, output", content: ["Sebutin dua ujungnya duluan. INPUT: dua nilai, dikumpulin dari user. OUTPUT: satu hasil yang di-print — Pass atau Try Again. Semua yang di antara dua ujung itu adalah PROCESS.", "Prosesnya bukan sulap: ubah teks jadi angka, hitung rata-rata, bandingin dengan 70, milih hasilnya. Input, proses, output — tiga zona, tujuh langkah, nol sintaks baru."] },
  { title: "MENTAL MODEL · Tujuh langkah kecil", content: ["Rencananya duduk di atas program: tujuh komentar, satu per langkah, dalam urutan yang bisa jalan — kumpulin, konversi, hitung, bandingin, milih, print.", "Tiap komentar tumbuh jadi sintaks yang udah dikenal: input() baca, int() cast, variable nyimpen, + dan / hitung rata-rata, if / else bandingin dan milih, print() nampilin. Programnya cuma tujuh langkah itu yang diketik ulang."] },
  { title: "PREDICT · Langkah mana yang duluan?", content: ["Tujuh langkahnya keacak. Langkah mana yang harus duluan?"], explanation: "Ambil nilai pertama. Nggak ada langkah di belakangnya yang bisa jalan tanpa data: lu nggak bisa me-rata-ratakan nilai yang belum lu punya. Kumpulin dua nilai dulu, baru konversi, hitung, bandingin, milih, print." },
  { title: "SPOT · Langkah ini keluarga apa?", content: ["Satu baris ditarik keluar dari program. Keluarga apa punya (first + second) / 2?"], explanation: "PROCESS. Angkanya udah dibaca dan dikonversi; baris ini cuma ngitung pakai + dan / — nggak nanya ke siapa-siapa dan nggak nge-print apa-apa." },
  { title: "PREDICT · Langkah mana yang hilang?", content: ["Rencana ini nggak pernah ngubah teks jadi angka. Langkah mana yang hilang?"], explanation: "Ubah kedua nilai jadi angka. input() balikin teks, dan teks nggak bisa di-rata-ratakan — int() harus cast tiap nilai di antara ngumpulin dan ngehitung." },
  { title: "TRY · Tulis rencananya sebagai komentar", content: ["Sebelum kode apa pun: tulis rencananya. Tujuh komentar Python, satu baris per langkah, sesuai urutan — satu komentar per langkah program rata-rata dua nilai. Komentar diawali # (Lesson 05), dan checker cuma ngecek bentuknya: tepat tujuh baris komentar, nggak ada yang jalan."], explanation: "Tujuh komentar dalam urutan yang bisa jalan: ambil nilai pertama, ambil nilai kedua, ubah kedua nilai jadi angka, hitung rata-rata, bandingin dengan 70, milih hasilnya, print hasilnya. Wording yang masuk akal lolos semua — checker cuma ngecek bentuk." },
  { title: "FORMALIZE · Pecah dulu, baru koding", content: ["Tiap program punya bentuk input, proses, output. Di sini input-nya dua nilai dari user, output-nya satu hasil yang di-print — Pass atau Try Again — dan prosesnya semua yang di antaranya: konversi, hitung, bandingin, milih.", "Selesaikan satu langkah sekaligus, terus gabungin — dan tiap langkah pakai konsep yang udah dikenal: input() buat baca, int() buat cast, variable buat nyimpen, + dan / buat rata-rata, if / else buat milih, print() buat nampilin. Decomposition nggak butuh sintaks baru; ini cara berpikir sebelum ngetik.", "Rencana ini bukan cuma buat nge-tempel: Mini Project — Student Score Checker — adalah decomposition yang sama ini, dibangun beneran. Tujuh langkah yang lu tulis di sini adalah rencana bangunnya di sana."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [problemDecompositionCopy.id.prompt] },
  { title: "CONNECT · Rencana siap, waktunya bangun", content: ["Problem Decomposition → Mini Project", "Mini Project-nya adalah Student Score Checker — program rata-rata dua nilai versi beneran: minta dua nilai, hitung rata-ratanya, print Pass kalau rata-ratanya minimal 70, kalau nggak Try Again. Decomposition tujuh langkah dari lesson ini adalah rencana bangunnya, dan program kompak dari lesson ini adalah bentuk jadinya.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getProblemDecompositionActivities(language: LessonLanguage) {
  return problemDecompositionActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [problemDecompositionCopy[language].prompt] } : {}),
  }));
}

export function localizeProblemDecompositionContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Program rata-rata dua nilai keliatan kayak satu blok gede, tapi coba baca pelan-pelan: minta nilai pertama, minta nilai kedua, ubah jadi angka, hitung rata-rata, bandingin dengan 70, milih hasil, print. Tujuh langkah kecil — dan nggak ada satu pun yang baru buat lu.",
      "Ini namanya problem decomposition: pecah masalah besarnya dulu sebelum nyentuh keyboard. Tiap langkah cuma butuh konsep yang udah lu kuasai — input() dari User Input, int() dari Casting, variable dari Variables, + dan / dari Operators, if/else dari Conditionals, print() dari print().",
      "Polanya selalu sama: INPUT (dua nilai dari user), PROCESS (konversi, hitung, bandingin, milih), OUTPUT (satu hasil ke layar). Kalau lu bisa sebutin input sama output-nya duluan, bagian tengahnya tinggal diisi satu langkah sekaligus.",
    ],
    academicExplanation: [
      "Problem decomposition adalah kebiasaan mecahin tugas gede jadi langkah kecil sebelum nulis kode. Program rata-rata dua nilai keliatan satu blok, tapi dibaca pelan-pelan dia tujuh langkah: ambil nilai pertama, ambil nilai kedua, ubah kedua nilai jadi angka, hitung rata-rata, bandingin dengan 70, milih hasil, print hasilnya.",
      "Tiap langkah nyambung ke konsep yang udah dipelajari: baca data itu User Input pakai input(), ubah teks itu Casting pakai int(), nyimpen nilai itu Variables, aritmatikanya Operators pakai + dan /, bandingin dan milih itu Conditionals pakai if / else, nampilin hasil itu print(). Decomposition nggak ngenalin sintaks baru sama sekali — ini cara berpikir, bukan fitur bahasa.",
      "Bentuknya input, proses, output: dua nilai masuk (INPUT), semua di antaranya mengubahnya (PROCESS), dan satu hasil yang di-print keluar (OUTPUT). Nyebutin input sama output duluan mematok targetnya, dan proses di tengah tinggal diselesaikan satu langkah sekaligus.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Pecah dulu, koding kemudian", "Program final yang kompak", "Tiap langkah adalah konsep yang udah lu kenal", "Input, proses, output"][index] ?? example.title,
      explanation: ["Seluruh program sebagai rencana: tujuh komentar, satu per langkah, dalam urutan yang bisa jalan. Nggak ada sintaks buat dipelajari di sini — ini masalahnya, yang dipecah.", "Program kompaknya cuma muncul setelah decomposition: tiap langkah dari tujuh langkah jadi satu-dua baris sintaks yang dikenal. Baca rencananya dari atas ke bawah dan kodenya ngikutin persis.", "Decomposition juga peta balik ke yang udah lu punya: tiap langkah nunjuk ke lesson yang udah selesai. Nggak ada langkah yang minta function, keyword, atau apa pun yang baru.", "Tiga zona dari program yang sama. Data masuk (INPUT), diubah (PROCESS), satu hasil keluar (OUTPUT). Sebutin dua ujungnya duluan dan bagian tengahnya ngisi sendiri, langkah demi langkah."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Mecahin tugas gede jadi langkah kecil sebelum nulis kode — rencana dulu, kode kemudian.", "Data yang dikumpulin program — di sini, dua nilai yang dibaca dari user pakai input().", "Semua yang di antara input dan output: konversi, hitung rata-rata, bandingin, milih.", "Hasil yang ditunjukin program — di sini, satu baris yang di-print: Pass atau Try Again.", "Satu aksi kecil yang bisa dikerjain di rencana, ditulis dalam urutan yang bisa jalan.", "Tool yang udah dipelajari: input(), int(), variable, + dan /, if / else, print(). Decomposition nggak butuh sintaks baru."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Nulis kode sebelum rencana", "Nganggep hasil print sebagai langkah pertama", "Ngerasa decomposition butuh sintaks baru", "Langkah dalam urutan yang nggak bisa jalan", "Me-rata-ratakan teks, bukan angka"][index] ?? mistake.title,
      explanation: ["Langsung loncat ke editor itu ng-skip decomposition. Tulis tujuh langkah kecilnya dulu — sebagai komentar — terus ubah jadi kode satu-satu.", "Output itu langkah terakhir, bukan pertama. Program nggak bisa print Pass sebelum dia ngumpulin dan me-rata-ratakan nilainya.", "Mecahin masalah itu mikir, bukan fitur bahasa. Tiap langkah di sini pakai input(), int(), variable, + dan /, if / else, dan print() — semua udah dipelajari.", "Nge-rata-ratakan sebelum baca nilainya, atau konversi setelah ngehitung, nggak bisa jalan. Tiap langkah harus nyerahin hasilnya ke langkah berikutnya dalam urutan yang bisa jalan.", "(first + second) / 2 di string input() mentah nggak ngasilin rata-rata beneran — konversi tiap nilai pakai int() dulu, baru aritmatikanya."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Di program rata-rata dua nilai, bagian mana yang jadi INPUT?", "Langkah mana yang harus langsung setelah baca dua nilai?", "Apa yang dibutuhkan buat mendekomposisi masalah ini?"][index] ?? check.question,
      explanation: ["Input itu apa yang dikumpulin program: dua nilai dari input(). Perhitungannya proses, baris yang di-print itu output.", "input() balikin teks, dan teks nggak bisa di-rata-ratakan — int() harus cast tiap nilai di antara ngumpulin dan ngehitung.", "Decomposition itu mikir, bukan sintaks. Tiap langkah nyambung ke input(), int(), variable, + dan /, if / else, atau print()."][index] ?? check.explanation,
    })),
  };
}

export const problemDecompositionMasteryConceptLabels: Record<string, string> = {
  identify_input_output: "Input, process, output", step_decomposition: "Step decomposition", concept_mapping: "Mapping known concepts",
};

export function problemDecompositionReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("step_order_confusion")) return id
    ? "Coba urutin ulang tujuh langkahnya: langkah mana yang harus pegang data duluan sebelum langkah lain bisa jalan?"
    : "Reorder the seven steps: which step must hold the data first before any other step can run?";
  if (result.misconceptions.includes("output_first_confusion")) return id
    ? "Pass yang di-print itu ujung mana — awal atau akhir? Apa aja yang programnya harus punya sebelum bisa nge-print hasilnya?"
    : "The printed Pass is which end — the start or the finish? What must the program already have before it can print a result?";
  if (result.misconceptions.includes("new_syntax_needed")) return id
    ? "Sebutin tujuh langkahnya satu-satu: ada nggak langkah yang butuh sesuatu di luar input(), int(), variable, + dan /, if / else, print()?"
    : "Name the seven steps one by one: is there any step needing something beyond input(), int(), variables, + and /, if / else, print()?";
  if (result.misconceptions.includes("monolithic_solution")) return id
    ? "Pecah dulu tugasnya: program rata-rata dua nilai itu bisa jadi berapa langkah kecil? Sebutin satu per satu."
    : "Split the task first: into how many small steps does the two-scores program break? Name them one by one.";
  return id
    ? "Restate bentuk programnya: input dua nilai, proses di tengah, output satu hasil. Di langkah keberapa prosesnya ngubah teks jadi angka?"
    : "Restate the program's shape: two scores in, process in between, one result out. At which small step does the process turn text into numbers?";
}
