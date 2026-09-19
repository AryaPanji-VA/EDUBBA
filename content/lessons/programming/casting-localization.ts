import { castingActivities } from "./casting-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const castingCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what changes after int(\"20\") runs, and how is it different from \"20\"?",
    placeholder: "int(\"20\") produces..., while \"20\"...",
    oneLine: "One Python line",
    diagram: "value → conversion → new value, new type",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the conversion functions and the result type, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa yang berubah setelah int(\"20\") dijalankan, dan apa bedanya dengan \"20\"?",
    placeholder: "int(\"20\") menghasilkan..., sedangkan \"20\"...",
    oneLine: "Satu baris Python",
    diagram: "value → konversi → value baru, tipe baru",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau fungsi konversinya dan tipe hasilnya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Value-nya ada, type-nya salah", content: ["Value punya tipe — dan kadang value yang lu pegang adalah tipe yang salah untuk langkah berikutnya: teks yang terbaca sebagai angka, seperti \"20\".", "Casting (type conversion) itu mengubah value secara sengaja dari satu tipe ke tipe lain. Bukan sulap, bukan otomatis — lu yang memanggilnya."] },
  { title: "INTUITION · Tiga fungsi konversi", content: ["Python menamai setiap fungsi konversi sesuai type yang dihasilkannya: int() untuk integer, float() untuk desimal, str() untuk teks.", "Value masuk, value baru dengan tipe baru keluar. Itu seluruh bentuk casting."] },
  { title: "SEE · Konversi utamanya", content: ["age_text menampung string \"20\". Panggilan int(age_text) mengubahnya menjadi integer 20, dan assignment menyimpan hasil konversi di bawah nama baru.", "float() dan str() bekerja sama persis: float(\"12.5\") menghasilkan 12.5 sebagai float, dan str(100) menghasilkan teks \"100\". Fungsi yang lu panggil menentukan type tujuannya."] },
  { title: "MENTAL MODEL · Value baru, tipe baru", content: ["Konversi menghasilkan value baru dengan tipe baru — dia tidak mundur dan mengubah yang asli. Setelah pemanggilan, age_text tetap menampung \"20\" sementara hasil 20 tinggal di tempat lu simpan.", "Rantai modelnya bertambah satu langkah: value → konversi → value baru dengan tipe lain."] },
  { title: "CONTRAST · Mana yang int?", content: ["Dua value di layar. Variable mana yang menampung integer?"], explanation: "a menampung string \"20\" — teks. Panggilan int(\"20\") menghasilkan value baru bertipe int. Assignment saja tidak pernah mengonversi; fungsi konversinya yang melakukannya." },
  { title: "PREDICT · Type apa yang keluar?", content: ["String \"42\" dikonversi lalu disimpan. Apa yang ditunjukkan inspeksi tipenya?"], explanation: "int(value) menghasilkan value baru bertipe int — asal usul value tidak ikut. Hasil konversinya sekarang benar-benar angka." },
  { title: "PREDICT · Konversi mana yang pas?", content: ["count_text menampung \"25\", dan lu ingin number bulat dari situ. Panggilan mana yang cocok?"], explanation: "Nama fungsinya adalah type tujuannya: teks yang terbaca sebagai angka bulat dikonversi dengan int(). float() akan menghasilkan desimal, dan str() justru menghasilkan teks lagi." },
  { title: "TRY · Konversi \"30\" versi lu", content: ["Tulis konversi yang mengubah teks \"30\" menjadi integer, disimpan di age. Fungsi konversinya harus muncul — menyimpan teksnya saja bukan mengonversi."], explanation: "age = int(\"30\") — int() membaca teks \"30\" dan menghasilkan integer 30, yang disimpan assignment ke age." },
  { title: "FORMALIZE · Konversi itu disengaja", content: ["Casting adalah konversi value ke tipe lain secara sengaja dengan memanggil fungsi yang dinamai sesuai targetnya: int(), float(), str(). Panggilannya menghasilkan value baru dengan tipe baru; value aslinya tidak berubah.", "Konversi itu eksplisit — assignment tidak pernah mengubah tipe. Dan konversi harus masuk akal untuk type tujuannya: \"20\" bisa menjadi integer 20, tapi teks yang tidak mengeja angka, seperti \"hello\", tidak bisa — Python berhenti dengan pesan kalau konversinya mustahil.", "Perangkat value Module 02 sejauh ini sudah lengkap di tangan lu: value dengan tipe, angka yang bisa dihitung, dan konversi antar tipe. Berikutnya Strings: tipe teks dapat lesson sendiri."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [castingCopy.id.prompt] },
  { title: "CONNECT · Ke mana arahnya", content: ["Casting → Strings → Booleans", "Konversi memindahkan value antar tipe. Berikutnya Strings: tipe teks dapat lesson sendiri — apa yang bisa ditampung dan bagaimana perilakunya.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getCastingActivities(language: LessonLanguage) {
  return castingActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [castingCopy[language].prompt] } : {}),
  }));
}

export function localizeCastingContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Kadang value yang lu pegang adalah tipe yang salah untuk pekerjaannya: teks \"20\" terbaca sebagai angka, tapi Python memperlakukannya sebagai teks. Casting — type conversion — adalah mengubah value secara sengaja dari satu tipe ke tipe lain.",
      "Python menyediakan tiga fungsi konversi: int() mengubah value menjadi integer, float() menjadi angka desimal, str() menjadi teks. \"20\" → int() → 20: karakternya menjadi angka sungguhan.",
      "Dua hal untuk dipegang: konversi menghasilkan value baru dengan tipe baru (yang asli tetap seperti semula), dan konversi hanya bekerja kalau masuk akal — \"20\" bisa menjadi 20, tapi \"hello\" tidak bisa menjadi angka apa pun.",
    ],
    academicExplanation: [
      "Type conversion (casting) adalah transformasi value ke tipe lain secara sengaja dengan memanggil fungsi konversi: int(), float(), atau str(). Panggilannya menghasilkan value baru dengan tipe tujuan; value yang dimasukkan tetap tidak berubah.",
      "Type tujuan dipilih oleh fungsinya: int(\"20\") menjadi integer 20, float(\"12.5\") menjadi float 12.5, dan str(100) menjadi string \"100\". Setelah konversi, value baru berperilaku seperti value lain di tipenya — int(\"20\") adalah angka, sedangkan \"20\" tetap teks.",
      "Konversi itu eksplisit: menyimpan \"100\" ke variable tidak pernah mengubahnya menjadi angka. Konversi juga harus masuk akal untuk type tujuannya — teks yang tidak mengeja angka, seperti \"hello\", tidak bisa dikonversi menjadi integer, dan Python berhenti dengan pesan kalau konversinya mustahil.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Fungsi-fungsi konversi", "Contoh utamanya: teks yang terbaca angka", "float() dan str() bekerja sama"][index] ?? example.title,
      explanation: ["Tiap fungsi dinamai sesuai type yang dihasilkannya: int() untuk integer, float() untuk float, str() untuk string. Value masuk, value baru dengan tipe baru keluar.", "age_text menampung string \"20\". int(age_text) mengubahnya menjadi integer 20, dan assignment menyimpan value hasil konversi di bawah nama baru. age_text sendiri tetap menampung \"20\".", "float() menghasilkan angka desimal; str() menghasilkan teks. Fungsi yang lu panggil menentukan type value barunya."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Mengubah value secara sengaja dari satu tipe ke tipe lain.", "Mengonversi value menjadi integer: \"20\" menjadi 20.", "Mengonversi value menjadi angka desimal: \"12.5\" menjadi 12.5, 5 menjadi 5.0.", "Mengonversi value menjadi teks: 100 menjadi \"100\".", "Value baru dengan tipe baru yang dihasilkan sebuah konversi; value aslinya tetap tidak berubah."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Mengira assignment ikut mengonversi", "Lupa kutip pada value aslinya", "Memanggil fungsi konversi yang salah", "Mengonversi teks yang tidak masuk akal"][index] ?? mistake.title,
      explanation: ["value = \"100\" menampung string — assignment tidak pernah mengubah tipe. Hanya panggilan eksplisit seperti int(value) yang mengonversi.", "\"20\" itu teks dan int(\"20\") adalah angka 20. Keduanya hanya mirip; konversinya yang memisahkan mereka.", "Nama fungsinya adalah type tujuannya. Teks yang terbaca angka bulat butuh int(); memilih float() akan menghasilkan desimal.", "Konversi bekerja kalau value-nya masuk akal untuk type tujuan. \"hello\" tidak bisa menjadi integer, dan Python berhenti dengan pesan kalau konversinya mustahil."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Apa itu int(\"20\")?", "value = \"100\" — type dari value itu apa?", "price_text = \"12.5\" berisi teks. Panggilan mana yang membuatnya float?"][index] ?? check.question,
      explanation: ["int() mengonversi teks yang terbaca angka bulat menjadi integer 20.", "Menyimpan value mempertahankan tipenya. Hanya int(value) yang akan menghasilkan angka.", "Nama fungsinya adalah type tujuannya: float() menghasilkan angka desimal 12.5."][index] ?? check.explanation,
    })),
  };
}

export const castingMasteryConceptLabels: Record<string, string> = {
  type_conversion: "What conversion is", conversion_functions: "int() / float() / str()", conversion_result: "The converted result",
};

export function castingReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("assignment_changes_type_confusion")) return id
    ? "Cek barisnya: apa yang dipanggil — fungsi konversi atau sekadar assignment? Mana yang bisa mengubah tipe?"
    : "Check the line: what is being called — a conversion function or a plain assignment? Which one can change a type?";
  if (result.misconceptions.includes("quotes_number_confusion")) return id
    ? "Bandingin \"20\" dan int(\"20\"): apa beda tipe mereka, dan bagian mana dari panggilannya yang membuat beda itu?"
    : "Compare \"20\" and int(\"20\"): what are their types, and which part of the call creates the difference?";
  if (result.misconceptions.includes("wrong_conversion_function")) return id
    ? "Nama fungsinya adalah type tujuannya: lu mau hasilnya bulat, desimal, atau teks? Fungsi mana yang namanya cocok?"
    : "The function's name is the target type: do you want a whole number, a decimal, or text? Which function is named for that?";
  if (result.misconceptions.includes("conversion_always_works_confusion")) return id
    ? "Coba int(\"hello\"): teks itu mengeja angka nggak? Apa syarat konversinya biar masuk akal?"
    : "Try int(\"hello\"): does that text spell a number? What makes a conversion make sense?";
  return id
    ? "Restate modelnya: value → konversi → value baru dengan tipe lain. Setelah int(age_text), apa yang dipegang age_text dan apa yang dipegang age?"
    : "Restate the model: value → conversion → new value, new type. After int(age_text), what does age_text hold and what does age hold?";
}
