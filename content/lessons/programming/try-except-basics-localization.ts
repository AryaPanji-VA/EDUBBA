import { tryExceptBasicsActivities } from "./try-except-basics-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const tryExceptBasicsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Putting It Together",
    prompt: "Explain in your own words: why does int(\"hello\") stop the program — and what does try/except do when it happens?",
    placeholder: "int(text) sits inside try..., and except ValueError: prints the fallback when...",
    oneLine: "Handle one expected failure",
    diagram: "try: risky line · except ValueError: fallback",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the try/except flow and the named ValueError, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Menyatukan Semuanya",
    prompt: "Jelasin pakai bahasa lu sendiri: kenapa int(\"hello\") bikin program berhenti — dan apa yang try/except lakuin saat itu terjadi?",
    placeholder: "int(text) ada di dalam try..., dan except ValueError: nge-print fallback pas...",
    oneLine: "Tangani satu kegagalan yang diharapkan",
    diagram: "try: baris berisiko · except ValueError: rencana cadangan",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau alur try/except dan ValueError yang disebut, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Dari baca error ke nangani satu", content: ["Lesson Understanding Errors udah ngajarin baca pesan error terus benerin kesalahan di kode lu. Tapi ada failure yang bukan salah tulis kode — datanya yang jadi masalah: int(\"hello\") nggak akan pernah jadi angka, seberapapun rapi kode lu.", "Errors / Try Except Basics ngenalin tool-nya: try/except. Lu tandain baris berisikonya, sebutin satu failure yang lu harapkan, terus kasih program rencana cadangan — jadi satu input jelek berhenti jadi crash dan berubah jadi situasi yang ditangani."] },
  { title: "INTUITION · Crash menghentikan program", content: ["int() cuma bisa parse teks yang bentuknya angka. \"hello\" bukan, jadi int(text) gagal pas run time — dan failure yang nggak ditangani menghentikan program di situ juga.", "Output-nya nyebutin nama failure-nya: ValueError: invalid literal for int() with base 10: 'hello'. Nama itulah sinyal yang bakal ditangkep handler di langkah berikutnya."] },
  { title: "MENTAL MODEL · try, except, lanjut", content: ["try membungkus baris berisiko; except ValueError menyebut satu kegagalan yang diharapkan dan menjalankan fallback-nya. int(\"hello\") gagal, print(\"That is not a number\") jalan — dan program lanjut normal.", "Jadi alurnya: kode normal → sesuatu gagal → except menangani kegagalan yang diharapkan itu. Nggak ada crash, nggak ada baris yang kelewat — cuma jalur alternatif yang lu siapin sendiri."] },
  { title: "PREDICT · Yang ini crash nggak?", content: ["\"7\" adalah teks yang bentuknya angka. Apa yang ditampilkan print(number + 1)?"], explanation: "8. int(\"7\") berhasil karena teksnya bisa di-parse — number jadi 7, dan number + 1 mencetak 8. int() cuma gagal pas teksnya nggak bisa di-parse." },
  { title: "PREDICT · Apa yang jalan setelah fallback?", content: ["int(\"hello\") gagal, jadi blok except ValueError jalan. Setelah itu, apa yang kejadian sama print(\"done\")?"], explanation: "Dua-duanya. \"Please enter a number\" tercetak dari blok except, dan setelah selesai program lanjut ke baris berikutnya — jadi \"done\" ikut tercetak. Nangkep kegagalan bikin program tetap jalan." },
  { title: "SPOT · Sebut error yang diharapkan", content: ["Kegagalan konversinya memang diharapkan, jadi lu sebutin. Baris except yang mana yang tepat di sini — dan kenapa bukan except:?"], explanation: "except ValueError:. Nyebutin nama error berarti cuma kegagalan konversi yang diharapkan yang ditangani — masalah lain, kayak NameError, tetap menghentikan program dan tetap kelihatan. except: polos nelen semuanya, termasuk bug beneran." },
  { title: "TRY · Tangkep kegagalan konversinya", content: ["Tulis baris input plus handler-nya: baca input pakai input(\"Enter a number: \"), convert pakai int(text) di dalam blok try, terus kasih except ValueError: sebuah print(...) ter-indent sebagai fallback. except: polos nggak diterima — sebutin error yang diharapkan — dan konversinya harus di dalam try, bukan sebelumnya."], explanation: "text = input(\"Enter a number: \") → try: number = int(text) → except ValueError: print(\"Please enter a number\") — konversi berisikonya ada di dalam try, dan fallback cuma tercetak pas konversinya gagal." },
  { title: "FORMALIZE · Tangani kegagalan yang diharapkan", content: ["try membungkus baris berisiko; except ValueError menyebut satu kegagalan yang diharapkan dan menjalankan fallback-nya. Setelah fallback, program lanjut normal — int(\"hello\") gagal, \"That is not a number\" tercetak, dan print(\"done\") tetap jalan.", "Kontrasnya dengan Lesson 06: Understanding Errors itu baca dan benerin kesalahan di source lu sendiri pas nulis. Try Except Basics itu nangani kegagalan run time yang memang diharapkan pas program jalan — kegagalannya datang dari data, dan handler-nya adalah jalur yang lu siapin. Nama errornya tetap informasi: ValueError bilang persis kegagalan apa yang lu antisipasi.", "Berikutnya: Problem Decomposition — ngubah masalah programming jadi langkah-langkah kecil yang bisa diselesaikan, salah satunya bisa jadi \"tangani input yang jelek\"."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [tryExceptBasicsCopy.id.prompt] },
  { title: "CONNECT · Ditangani, lanjut dekomposisi", content: ["Try Except Basics → Problem Decomposition", "Handler-nya jalan: satu kegagalan yang diharapkan ditangkep, fallback-nya jalan, dan program lanjut. Langkah berikutnya adalah Problem Decomposition — ngedecomp masalah programming jadi langkah-langkah kecil yang bisa diselesaikan satu per satu.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getTryExceptBasicsActivities(language: LessonLanguage) {
  return tryExceptBasicsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [tryExceptBasicsCopy[language].prompt] } : {}),
  }));
}

export function localizeTryExceptBasicsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "Lesson Understanding Errors udah ngajarin baca error terus benerin kesalahan di kode lu. Tapi ada failure yang bukan salah tulis kode — datanya yang nggak bisa diproses: int(\"hello\") nggak akan pernah jadi angka, sebagus apapun kode lu.",
      "try/except itu rencana cadangan. Baris berisiko lu taruh di dalam try, failure yang lu harapkan lu sebutin di except ValueError, dan fallback-nya jalan cuma pas kejadian. int(\"hello\") gagal → print fallback jalan, program lanjut normal.",
      "Yang penting: sebut nama errornya. except ValueError: cuma nangkep kegagalan yang lu antisipasi, jadi kesalahan lain kayak NameError tetep kelihatan. except: polos nelen semua — termasuk bug beneran.",
    ],
    academicExplanation: [
      "Blok try/except menangani satu kegagalan run time yang diharapkan: baris berisiko ditaruh di dalam try, dan klausa except menyebut kegagalan yang diantisipasi — int(\"hello\") menimbulkan ValueError, jadi except ValueError: menangkapnya dan menjalankan fallback. Setelah fallback selesai, program lanjut normal dari baris berikutnya.",
      "Menyebut nama error itu penting. except ValueError: cuma menangani kegagalan yang diharapkan itu; masalah lain — nama yang salah ketik, indentasi yang salah — tetap menghentikan program dan tetap terlihat. except: polos menangkap semuanya, termasuk kesalahan beneran yang seharusnya diperbaiki, dan itu yang dihindari di level ini.",
      "Ini beda dengan Lesson 06. Di sana, error adalah sinyal untuk membaca dan memperbaiki kesalahan di source lu; di sini, kegagalannya memang diharapkan saat run time, dan handler mengubahnya jadi jalur yang direncanain program. Satu-satunya nama error di lesson ini adalah ValueError, yang muncul pas int() menerima teks yang nggak bisa di-parse.",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Kegagalan tanpa penanganan menghentikan program", "try/except: fallback jalan", "Program lanjut setelah fallback", "Sukses lewat jalur normal"][index] ?? example.title,
      explanation: ["int() cuma bisa parse teks yang bentuknya angka, dan \"hello\" bukan. Tanpa handler, kegagalannya menghentikan program tepat di baris itu — dan output-nya nyebutin namanya: ValueError.", "try membungkus baris berisiko; except ValueError: nyebutin satu kegagalan yang diharapkan dan menjalankan fallback-nya pas kejadian. Crash-nya berubah jadi situasi yang ditangani.", "Fallback bukan ujung program: setelah except selesai, eksekusi lanjut ke baris berikutnya, jadi \"done\" ikut tercetak. Nangkep kegagalan bikin program tetap jalan.", "Pas teksnya bisa di-parse, blok try jalan sampai habis dan except nggak pernah nyala — int(\"7\") jadi 8, jadi number + 1 mencetak 8. Fallback cuma ada buat kegagalan yang lu harapkan."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Blok yang membungkus baris berisiko — kode yang bisa gagal saat run time.", "Menyebut satu kegagalan yang diharapkan dan menjalankan fallback-nya cuma pas kegagalan itu kejadian.", "Kegagalan yang ditimbulkan int() pas teks nggak bisa di-parse jadi angka — satu-satunya nama error di lesson ini.", "Rencana cadangan yang ter-indent di dalam except — print pesan biar kegagalannya ditangani, bukan crash.", "Kegagalan run time yang diharapkan dan ditangkep except; program lanjut setelah fallback-nya.", "except: tanpa nama error — nangkep semuanya, termasuk kesalahan beneran; dihindari."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Nulis except: polos", "Naruh konversi di luar try", "Nyebut error yang salah", "Ngalain blok except kosong", "Pakai try/except buat nutupin kesalahan source"][index] ?? mistake.title,
      explanation: ["except: nangkep semua kegagalan, termasuk kesalahan beneran kayak NameError. Sebutin ValueError yang diharapkan biar bug asli tetap kelihatan.", "except cuma bisa jaga baris yang ada di dalam blok try. number = int(text) yang ditulis sebelum try nggak ke-cover, dan kegagalannya tetap bikin crash.", "Teks yang nggak bisa di-parse itu ValueError, bukan NameError atau TypeError. Sebutin kegagalan yang baris berisikonya beneran timbulkan.", "Blok except butuh baris fallback yang ter-indent di bawahnya. Kalau nggak ada apa-apa di situ, blok-nya sendiri jadi syntax error — kasih print fallback-nya.", "Error di Lesson 06 dibaca dan diperbaiki di source lu. Try/except itu buat kegagalan run time yang diharapkan dari data — bukan pembungkus yang nutupin kesalahan yang harus lu perbaiki."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["text = \"hello\". Apa yang terjadi di number = int(text) tanpa try/except?", "Fallback try/except ValueError tercetak, terus print(\"done\") nyusul. Apa yang tercetak pas konversinya gagal?", "Kenapa nulis except ValueError: bukan except: polos?"][index] ?? check.question,
      explanation: ["int() nggak bisa parse \"hello\", jadi dia menimbulkan ValueError — dan tanpa handler, kegagalan itu menghentikan program di baris itu.", "Fallback-nya jalan, dan setelah except selesai program lanjut ke baris berikutnya — jadi \"done\" ikut tercetak.", "except ValueError: jaga persis kegagalan konversi yang diharapkan; yang lain tetap menghentikan program dan tetap terlihat, nggak ditelen."][index] ?? check.explanation,
    })),
  };
}

export const tryExceptBasicsMasteryConceptLabels: Record<string, string> = {
  error_as_signal: "Errors as information", try_except_flow: "try / except flow", valueerror_handling: "Handling ValueError",
};

export function tryExceptBasicsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("bare_except_confusion")) return id
    ? "except: polos nelen semua kegagalan — termasuk NameError yang sebenernya bug. Error apa yang seharusnya lu sebut di except buat kegagalan konversi?"
    : "A bare except: swallows every failure — including a NameError that is a real bug. Which error should your except name for the conversion failure?";
  if (result.misconceptions.includes("fallback_without_try")) return id
    ? "except cuma bisa jaga baris yang ada di dalam try-nya. Baris konversinya harus dipindah ke mana?"
    : "except can only guard lines sitting inside its try block. Where does the conversion line need to move?";
  if (result.misconceptions.includes("wrong_error_type")) return id
    ? "Teks yang nggak bisa di-parse itu ValueError — bukan NameError atau TypeError. Error apa yang int(\"hello\") beneran timbulkan?"
    : "Unparsable text is a ValueError — not a NameError or a TypeError. Which error does int(\"hello\") actually cause?";
  if (result.misconceptions.includes("conversion_always_fails")) return id
    ? "Coba int(\"7\") di kepala lu: teksnya bisa di-parse, jadi konversinya berhasil. Kapan int() beneran gagal?"
    : "Run int(\"7\") in your head: the text parses, so the conversion succeeds. When does int() actually fail?";
  return id
    ? "Restate alurnya: baris berisiko di try, except ValueError nyebut kegagalan yang diharapkan, fallback jalan, program lanjut. Di titik mana int(\"hello\") berubah dari crash jadi situasi yang ditangani?"
    : "Restate the flow: the risky line in try, except ValueError naming the expected failure, the fallback running, the program continuing. At which point does int(\"hello\") turn from a crash into a handled situation?";
}
