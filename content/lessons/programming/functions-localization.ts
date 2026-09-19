import { functionsActivities } from "./functions-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
export type { LessonLanguage };

export const functionsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"),
    moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: what happens when Python reads def greet(): — and what changes when the line greet() runs?",
    placeholder: "def records the function...",
    oneLine: "A def and a call",
    diagram: "def → Python remembers · call → body runs",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review your explanation with the define → remember / call → execute model, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"),
    moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: apa yang terjadi ketika Python membaca def greet(): — dan apa yang berubah ketika baris greet() dijalankan?",
    placeholder: "def itu cuma mencatat functionnya...",
    oneLine: "Satu def dan satu call",
    diagram: "def → Python mengingat · call → body jalan",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau penjelasan lu dengan model define → mengingat / call → jalan, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Kenapa function ada", content: ["Kalau sapaan yang sama atau tiga langkah yang sama ditulis di tiga tempat, setiap perbaikan juga harus terjadi di tiga tempat — dan satu tempat yang kelewat bikin program nggak konsisten.", "Function mengakhiri pengulangan itu: tulis instruksinya sekali, kasih nama untuk blok itu, lalu panggil namanya di mana pun kerjanya dibutuhkan. Sekali define, panggil di mana saja."] },
  { title: "INTUITION · Bikin sekali, panggil berkali-kali", content: ["def greet(): bilang ke Python: inget satu set instruksi bernama greet. Python mencatat body yang menjorok — dan tidak menjalankannya. Call greet() dan greet() masing-masing bilang: jalankan instruksi itu sekarang.", "Dua call, dua jalan penuh: Hello tampil dua kali. Titik dua membuka definisinya; baris yang menjorok adalah body yang dijalankan ulang di tiap call."] },
  { title: "PREDICT · Apa yang jalan?", content: ["Program ini punya definisi tapi nggak ada call. Apa yang ditampilkan?"], explanation: "Mendefinisikan function hanya membuatnya. Tanpa call seperti greet(), body-nya tidak pernah jalan — nggak ada yang tampil." },
  { title: "PREDICT · Definisi dulu, call belakangan", content: ["Telusuri programnya baris per baris. Python membaca def duluan — tapi apakah body-nya jalan di situ? Apa yang tampil?"], explanation: "Membaca def cuma mencatat function-nya — di situ nggak ada yang tampil. Eksekusi lanjut ke print(\"Start\"), lalu greet() menjalankan body. Hasilnya: Start, lalu Hi." },
  { title: "PREDICT · Dua call, satu body", content: ["Body-nya didefinisikan sekali, tapi call-nya muncul dua kali. Apa yang tampil?"], explanation: "Setiap call menjalankan seluruh body lagi. Dua call, dua eksekusi penuh — Halo tampil dua kali." },
  { title: "TRY · Definisikan, lalu panggil", content: ["Tulis program lengkap: baris def yang menamai function lu dengan kurung kosong dan titik dua, satu print yang menjorok berisi string tetap sebagai body, dan — setelah body — sebuah call: nama yang sama plus kurung. Nama satu kata huruf kecil apa saja boleh, seperti say_hello atau sapa. Keduanya wajib: definisi tanpa call nggak nampilin apa-apa, dan print tanpa definisi bukan function."], explanation: "def say_hello(): mencatat function-nya, print(\"Halo\") yang menjorok itu body-nya, dan say_hello() di bawah memanggilnya — definisi plus call, dua-duanya wajib." },
  { title: "FORMALIZE · Define → mengingat; call → jalan", content: ["Function itu kumpulan instruksi yang bernama. Statement def membuatnya: Python membaca nama, mencatat body yang menjorok di bawah nama itu, dan di momen itu nggak ngelakuin apa-apa lagi — nggak ada output, nggak ada eksekusi. Define → Python mengingat.", "Call baru mengeksekusi: greet() menjalankan seluruh body yang menjorok dari atas ke bawah, lalu eksekusi lanjut di baris setelah call. Body-nya mengulang penuh di tiap call — dua call, dua jalan penuh. Dan karena Python membaca file dari atas ke bawah, def harus jalan sebelum baris call tercapai; call ke nama yang belum didefinisikan melempar NameError.", "Sekarang tiap call mengerjakan hal yang persis sama, karena body-nya tetap. Lesson berikutnya, Parameters & Arguments: bagaimana function bisa menerima data di tiap call, supaya satu definisi bisa mengerjakan banyak pekerjaan yang beda."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [functionsCopy.id.prompt] },
  { title: "CONNECT · Konsep ini nyambung ke mana?", content: ["Functions → Parameters & Arguments", "Function dengan body yang tetap selalu mengerjakan hal yang persis sama — greet() nggak bisa menyapa orang di atas namanya. Berikutnya Parameters & Arguments: cara function menerima data di tiap call, supaya satu definisi bisa mengerjakan banyak pekerjaan yang beda.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getFunctionsActivities(language: LessonLanguage) {
  return functionsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [functionsCopy[language].prompt] } : {}),
  }));
}

export function localizeFunctionsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Perhatiin dulu masalahnya: kalau lu mau nge-print sapaan yang sama di tiga tempat, lu nulis print yang sama tiga kali. Kalau ternyata teksnya salah, lu harus ubah di tiga tempat — dan satu yang kelewat bikin program nggak konsisten. Function memecahkan itu: tulis instruksinya sekali, kasih nama, lalu panggil namanya kapan pun lu butuh.",
      "Ada dua momen yang beda total. def greet(): itu cuma bilang ke Python: \"inget ya, ada instruksi bernama greet\". Python nyimpen instruksinya — tapi nggak ngerjain apa-apa. Baru baris greet() yang menyuruh Python ngerjain instruksi itu, dari atas sampai bawah.",
      "Isi function-nya adalah baris-baris yang menjorok ke dalam di bawah def. Setiap kali lu panggil greet(), seluruh baris yang menjorok itu jalan lagi dari awal. Polanya simpel: define → Python mengingat; call → body-nya jalan.",
    ],
    academicExplanation: [
      "Function itu blok perilaku yang bernama dan reusable. Statement def mendefinisikannya: def greet(): membuka definisi dengan titik dua, dan baris-baris yang menjorok di bawahnya adalah function body. Ketika Python membaca baris def, dia mencatat body-nya di bawah nama greet lalu lanjut — body tidak jalan pada saat definisi.",
      "Call yang menjalankan body. Menulis greet() mengeksekusi setiap baris yang menjorok di dalam body, dari atas ke bawah, lalu eksekusi lanjut di baris setelah call. Body-nya mengulang penuh di tiap call: dua call berarti seluruh body jalan dua kali.",
      "Urutan itu penting. Python membaca file dari atas ke bawah, jadi baris def harus dijalankan sebelum baris call tercapai; memanggil nama yang belum didefinisikan Python melempar NameError. Model mentannya: define → Python mengingat; call → body-nya jalan.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Bikin sekali, panggil berkali-kali", "Mendefinisikan nggak menjalankan body", "Seluruh body jalan per call", "Call jalan sesuai urutan sumber"][index] ?? example.title,
      explanation: ["def-nya mencatat body greet tanpa menjalankannya. Setiap call greet() mengeksekusi body yang menjorok, jadi Hello tampil dua kali.", "def cuma mencatat function-nya — di situ nggak ada yang tampil. Eksekusi mulai di print(\"Start\"), jadi hasilnya Start, lalu Hi.", "Ketiga baris yang menjorok itu milik function. Satu call menjalankan seluruh body secara berurutan — tiga call berarti ketiga baris itu jalan tiga kali.", "Program dibaca dari atas ke bawah: Before, Hello, Middle, Hello, After. Tiap call menjalankan body penuh satu kali, tepat di posisi call-nya."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Blok perilaku bernama yang bisa Python ingat dan jalankan lagi kapan pun dibutuhkan.", "Statement yang memulai definisi function: def greet(): diakhiri titik dua dan membuka body.", "Momen ketika Python membaca def dan mencatat body di bawah nama function-nya — tanpa menjalankannya.", "Menjalankan function dengan menulis namanya plus kurung, seperti greet().", "Baris-baris yang menjorok di bawah baris def; semuanya dieksekusi penuh di tiap call.", "Tulis instruksinya sekali, lalu panggil nama yang sama sebanyak yang dibutuhkan."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Nge-def tapi nggak pernah dipanggil", "Ngira body langsung jalan pas didefinisikan", "Memanggil sebelum didefinisikan", "Body nggak dijorokkan", "Ngira baris def sendiri nampilin sesuatu"][index] ?? mistake.title,
      explanation: ["def greet(): itu cuma mencatat function. Tanpa call seperti greet(), body-nya tidak pernah jalan dan nggak ada yang tampil.", "Python cuma mencatat instruksinya ketika membaca baris def. print di dalam body diem sampai ada call.", "Python membaca file dari atas ke bawah, jadi def harus jalan sebelum baris call. greet() yang ditulis di atas def-nya melempar NameError.", "Baris-baris di bawah def harus menjorok. print(\"Hello\") yang sejajar dengan def bukan bagian dari function — Python melempar error karena body-nya kosong.", "def greet(): membuat dan menamai function; dia nggak menampilkan apa pun. Hanya print di dalam body yang menghasilkan output, dan itu pun baru ketika function dipanggil."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["Program ini menampilkan apa?", "Program ini menampilkan apa?", "Apa yang terjadi saat program ini jalan?"][index] ?? check.question,
      explanation: ["Function-nya didefinisikan tapi tidak pernah dipanggil — def mencatat body-nya, call menjalankannya.", "def jalan duluan tapi cuma mencatat function-nya. Eksekusi lanjut ke print(\"Start\"), lalu greet() menjalankan body — Start, lalu Hi.", "Python membaca dari atas ke bawah. Baris call greet() tercapai sebelum def pernah jalan, jadi nama itu belum ada — NameError."][index] ?? check.explanation,
    })),
  };
}
