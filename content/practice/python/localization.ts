// Guided practice exercises are authored in English. This file carries the
// Indonesian (id) variant, keyed by the stable exercise id so ids, grading,
// and exercise identity never change. Arrays are positional with a
// `?? original` fallback per item. Code tokens, Python keywords, identifiers,
// regex `source` strings, outputs, and ids are NEVER translated.

import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { PracticeExercise, PracticeTopic, PracticeTrack } from "../types";

type ExerciseOverride = {
  concept?: string;
  prompt?: string;
  hint?: string;
  explanation?: string;
  misconceptionOutputNotes?: string[];
  requiredPatternDescriptions?: string[];
  misconceptionPatternNotes?: string[];
};

const idByExercise: Record<string, ExerciseOverride> = {
  "variables-predict-1": {
    concept: "Membaca name",
    prompt: "Baca kodenya, lalu tulis persis apa yang di-print — nggak usah nambah apa pun.",
    hint: "print baca value yang sedang dipegang name saat ini. Dia nggak baca ejaan nama variable-nya.",
    explanation: "print(speed) baca value yang di-bind ke name speed lalu print 60. Nama variable-nya sendiri nggak pernah ikut di-print.",
    misconceptionOutputNotes: [
      "print nampilin value yang dipegang name, bukan ejaan nama variable-nya.",
      "speed sudah di-assign, jadi nggak ada error.",
    ],
  },
  "variables-predict-2": {
    concept: "Reassignment",
    prompt: "Baca baris-barisnya sesuai urutan. Tulis persis apa yang di-print.",
    hint: "Assignment kedua me-rebind count. print baca binding yang sekarang, bukan riwayatnya.",
    explanation: "count awalnya di-bind ke 3, lalu di-rebind ke hasil count + 2, yaitu 5. print nampilin binding terkini: 5.",
    misconceptionOutputNotes: [
      "Assignment kedua menggantikan binding pertama; 3 nggak berlaku lagi.",
      "Ruas kanan dievaluasi dulu; print nampilin 5, bukan teks expression-nya.",
      "Reassignment itu hal biasa di Python; name-nya tinggal di-rebind.",
    ],
  },
  "variables-fix-1": {
    concept: "Name sebelum dipakai",
    prompt: "Kode ini bikin NameError. Perbaiki supaya name-nya sudah ada sebelum dibaca. Target output: 10",
    hint: "Name cuma bisa dibaca setelah binding-nya ada. Pikirkan baris mana yang harus jalan duluan.",
    explanation: "Python jalan dari atas ke bawah. total = 10 harus dieksekusi sebelum print(total) bisa baca name-nya.",
    requiredPatternDescriptions: [
      "assign total sebelum di-print",
    ],
    misconceptionPatternNotes: [
      "print-nya masih jalan sebelum assignment.",
      "Ngasih kutip ke total bikin yang di-print kata, bukan value-nya.",
    ],
  },
  "variables-fix-2": {
    concept: "Identifier yang valid",
    prompt: "Python menolak name ini. Perbaiki identifier-nya supaya valid dan tetap gampang dibaca.",
    hint: "Identifier nggak boleh ada spasi di dalamnya. Sambung kata-katanya pakai underscore.",
    explanation: "user_name itu identifier yang valid: huruf, digit, dan underscore, dimulai huruf atau underscore. Nama valid yang sama harus dipakai di kedua baris.",
    requiredPatternDescriptions: [
      "pakai identifier user_name yang valid di kedua baris",
    ],
    misconceptionPatternNotes: [
      "Spasi nggak boleh ada di dalam name Python.",
    ],
  },
  "variables-write-1": {
    concept: "Assignment pertama",
    prompt: "Tulis dua baris: bind name tempo ke integer 92, lalu print tempo. Target output: 92",
    hint: "Satu baris buat binding pakai =, baris berikutnya baca name-nya di dalam print(...).",
    explanation: "tempo = 92 me-bind name ke object integer-nya. print(tempo) baca value-nya lewat name itu.",
    requiredPatternDescriptions: [
      "bind tempo ke 92",
      "print tempo",
    ],
    misconceptionPatternNotes: [
      "Ngasih kutip ke 92 menyimpan teks \"92\", bukan integer-nya.",
      "Kutip bikin Python print kata tempo.",
    ],
  },
  "variables-write-2": {
    concept: "Rebind pakai expression",
    prompt: "score mulai dari 7. Tambahin baris yang menaikkan score sebanyak 5, lalu print. Target output: 12",
    hint: "Baca value lama lewat name-nya, tambah 5, lalu rebind hasilnya ke name yang sama.",
    explanation: "score = score + 5 baca 7 lewat name-nya, evaluasi 7 + 5, lalu rebind score ke 12. print(score) berikutnya nampilin 12.",
    requiredPatternDescriptions: [
      "naikkan score 5 lewat name-nya",
      "print score",
    ],
    misconceptionPatternNotes: [
      "Itu langsung me-rebind score ke 12; tujuannya baca value lama lalu tambah 5.",
      "Kutip bakal bikin score jadi string, bukan angka.",
    ],
  },
  "data-types-predict-1": {
    concept: "String yang digabung",
    prompt: "Kedua value-nya string. Tulis persis apa yang di-print.",
    hint: "Kalau kedua sisi + adalah string, + menggabungkan, bukan menjumlahkan.",
    explanation: "\"3\" dan \"4\" itu string, jadi + menggabungkannya jadi \"34\". Penjumlahan angka cuma terjadi kalau kedua sisi angka.",
    misconceptionOutputNotes: [
      "+ menjumlahkan angka, tapi di sini kedua sisinya string, jadi keduanya digabung.",
      "Nggabungin dua string itu Python yang valid; nggak ada error.",
    ],
  },
  "data-types-predict-2": {
    concept: "Mengintip type",
    prompt: "Tulis persis apa yang di-print, termasuk wrapper-nya.",
    hint: "type() print wrapper class lengkap, bukan cuma nama type-nya.",
    explanation: "type(7) adalah class integer, di-print sebagai <class 'int'> — wrapper lengkap, termasuk kata class dan kutipnya.",
    misconceptionOutputNotes: [
      "type() print wrapper lengkapnya: <class 'int'>.",
      "Python laporin nama type yang spesifik, bukan kategori umum.",
      "7 nggak pakai kutip, jadi dia integer, bukan string.",
    ],
  },
  "data-types-fix-1": {
    concept: "Teks vs angka",
    prompt: "Ini crash dengan TypeError. Perbaiki type-nya supaya hitungannya jalan. Target output: 20",
    hint: "Perhatiin baik-baik baris pertama: type apa yang sebenarnya dipegang price?",
    explanation: "\"12\" itu teks, dan teks + angka nggak ada artinya di Python. Simpan integer 12 tanpa kutip bikin price + 8 jadi penjumlahan angka yang valid: 20.",
    requiredPatternDescriptions: [
      "simpan 12 sebagai angka, bukan teks",
      "tetap print total",
    ],
    misconceptionPatternNotes: [
      "Kutip bikin price tetap teks.",
      "Ngasih kutip ke angka satunya cuma nyembunyiin masalah type, bukan memperbaikinya.",
    ],
  },
  "data-types-fix-2": {
    concept: "Bool, bukan teks",
    prompt: "finished harusnya bool, bukan teks. Perbaiki value-nya supaya type() lapor bool.",
    hint: "Value bool ditulis tanpa kutip dan huruf depannya kapital.",
    explanation: "False (tanpa kutip) itu value bool-nya. \"False\" itu string empat huruf, jadi type() lapor <class 'str'>.",
    requiredPatternDescriptions: [
      "simpan bool False tanpa kutip",
      "tetap print type(finished)",
    ],
    misconceptionPatternNotes: [
      "False yang dikutip tetap string.",
      "Python nulis value bool-nya False, dengan F kapital.",
    ],
  },
  "data-types-write-1": {
    concept: "Value float",
    prompt: "Tulis dua baris: bind height ke float 1.75, lalu print type-nya. Target output: <class 'float'>",
    hint: "Float ditulis pakai titik desimal. Tampilkan type-nya dengan type(height) di dalam print.",
    explanation: "1.75 punya titik desimal, jadi Python menyimpannya sebagai float. print(type(height)) nampilin <class 'float'>.",
    requiredPatternDescriptions: [
      "bind height ke 1.75",
      "print type(height)",
    ],
    misconceptionPatternNotes: [
      "\"1.75\" yang dikutip itu string, bukan float.",
    ],
  },
  "data-types-write-2": {
    concept: "String atau integer",
    prompt: "Bind label ke teks \"42\" — sebagai string — lalu print type-nya. Target output: <class 'str'>",
    hint: "Kutipnya itu kuncinya: dengan kutip, 42 jadi teks; tanpa kutip, dia integer.",
    explanation: "\"42\" pakai kutip itu string dua karakter. type() lapor <class 'str'>. Tanpa kutip, 42 bakal jadi integer.",
    requiredPatternDescriptions: [
      "simpan teks \"42\" pakai kutip",
      "print type(label)",
    ],
    misconceptionPatternNotes: [
      "Tanpa kutip itu integer 42, bukan teksnya.",
    ],
  },
  "operators-predict-1": {
    concept: "Aritmetika dan precedence",
    prompt: "Tulis persis apa yang di-print program ini.",
    hint: "Perkalian jalan sebelum penjumlahan kecuali kurung mengubah urutannya.",
    explanation: "3 * 4 dievaluasi dulu, hasilnya 12. Lalu 2 + 12 menghasilkan 14.",
    misconceptionOutputNotes: [
      "Python menjalankan perkalian sebelum penjumlahan.",
      "Cuma 3 dan 4 yang dikalikan sebelum 2 dijumlahkan.",
    ],
  },
  "operators-predict-2": {
    concept: "Comparison dan logika",
    prompt: "Evaluasi kedua comparison-nya, lalu tulis output-nya.",
    hint: "and cuma True kalau kedua expression comparison-nya True.",
    explanation: "85 minimal 75 dan nggak lebih dari 100. True and True evaluasinya True.",
    misconceptionOutputNotes: [
      "Kedua sisinya True, jadi and menghasilkan True.",
      "Expression comparison menghasilkan boolean, bukan angka aslinya.",
    ],
  },
  "operators-fix-1": {
    concept: "Assignment vs equality",
    prompt: "Perbaiki expression-nya supaya program membandingkan age dengan 18 dan print True.",
    hint: "Satu tanda sama dengan menyimpan value; dua tanda sama dengan membandingkan value.",
    explanation: "age == 18 itu comparison equality dan evaluasinya True. = nggak bisa dipakai sebagai comparison itu di dalam print.",
    requiredPatternDescriptions: [
      "pertahankan assignment age",
      "bandingkan age dengan 18 pakai ==",
    ],
    misconceptionPatternNotes: [
      "Expression-nya masih pakai assignment, bukan comparison equality.",
    ],
  },
  "operators-fix-2": {
    concept: "Range logika",
    prompt: "Aturannya harusnya True cuma untuk score 70 sampai 100. Perbaiki operator logikanya.",
    hint: "Batas bawah dan batas atas harus dua-duanya terpenuhi.",
    explanation: "and minta score memenuhi kedua batas. Pakai or, hampir semua angka lolos minimal satu sisi.",
    requiredPatternDescriptions: [
      "pertahankan comparison batas bawah",
      "pertahankan comparison batas atas",
      "wajibin kedua batas pakai and",
    ],
    misconceptionPatternNotes: [
      "or nerima value walau cuma satu batas terpenuhi; range ini butuh and.",
    ],
  },
  "operators-write-1": {
    concept: "Expression aritmetika",
    prompt: "Set price = 12 dan quantity = 3. Hitung total pakai perkalian, lalu print total.",
    hint: "Bind kedua value dulu, lalu pakai price * quantity di assignment ke total.",
    explanation: "Expression perkaliannya evaluasinya 36, disimpan di total lalu di-print.",
    requiredPatternDescriptions: [
      "assign price",
      "assign quantity",
      "hitung total pakai perkalian",
      "print total",
    ],
    misconceptionPatternNotes: [
      "Total harga untuk item berulang butuh perkalian, bukan penjumlahan.",
    ],
  },
  "operators-write-2": {
    concept: "Expression comparison dan logika",
    prompt: "Set age = 20. Print satu expression yang True saat age minimal 18 dan nggak lebih dari 65.",
    hint: "Tulis dua comparison yang disambung and di dalam print.",
    explanation: "Kedua comparison batasnya True untuk age 20, jadi expression gabungannya print True.",
    requiredPatternDescriptions: [
      "assign age",
      "print expression logika dengan batas itu",
    ],
    misconceptionPatternNotes: [
      "Value-nya harus memenuhi kedua batas, jadi pakai and.",
      "Pakai comparison di dalam expression-nya; jangan assign age baru di situ.",
    ],
  },
  "conditionals-predict-1": {
    concept: "Trace if/else",
    prompt: "Baca branch-nya, lalu tulis persis apa yang di-print — satu kata.",
    hint: "Cek condition-nya dulu: apakah 20 minimal 18? Cuma satu branch yang pernah jalan.",
    explanation: "20 >= 18 itu True, jadi blok if jalan dan print Dewasa. Blok else dilewati.",
    misconceptionOutputNotes: [
      "Condition-nya True untuk 20, jadi blok else nggak pernah jalan.",
      "print nampilin teks dari branch, bukan value variable-nya.",
      "Blok-bloknya menjorok konsisten, jadi ini jalan tanpa error.",
    ],
  },
  "conditionals-predict-2": {
    concept: "Urutan chain elif",
    prompt: "Python ngecek condition-condition ini dari atas ke bawah. Tulis persis apa yang di-print.",
    hint: "Condition pertama: apakah 78 >= 90? Kalau bukan, Python lanjut ke elif. Branch True yang pertama yang menang.",
    explanation: "78 >= 90 itu False, jadi elif dicek: 78 >= 75 itu True, jadi B di-print. else nggak pernah dicapai — tepat satu branch yang jalan.",
    misconceptionOutputNotes: [
      "78 >= 90 itu False, jadi branch pertama nggak jalan.",
      "elif nggak butuh kecocokan persis — 78 >= 75 itu True, jadi B di-print.",
      "Tepat satu branch dari chain yang jalan; sisanya dilewati.",
    ],
  },
  "conditionals-fix-1": {
    concept: "= vs ==",
    prompt: "Condition-nya rusak. Perbaiki supaya pengecekannya nunjukin pertanyaan, bukan assign. Target output: Dewasa",
    hint: "Di dalam if, Python butuh comparison. Operator mana yang nanya apakah dua value itu sama?",
    explanation: "= meng-assign value; == nanya apakah dua value sama. Condition-nya harus pertanyaan age == 18, diakhiri titik dua.",
    requiredPatternDescriptions: [
      "bandingkan pakai == alih-alih assign pakai =",
      "tetap print Dewasa",
    ],
    misconceptionPatternNotes: [
      "= tunggal itu masih assign; condition-nya butuh ==.",
      "Baris if harus diakhiri titik dua untuk membuka blok.",
    ],
  },
  "conditionals-fix-2": {
    concept: "Input sebelum compare",
    prompt: "Program ini harusnya print Dewasa untuk age 19, tapi comparison-nya invalid. Perbaiki. Target output: Dewasa",
    hint: "input() kasih lu teks. Function mana yang ngubah teks seperti \"19\" jadi angka 19?",
    explanation: "input() me-return string, dan string nggak bisa dibandingkan dengan angka 18 seperti yang lu maksud. Bungkus dengan int() untuk konversi teksnya jadi integer dulu.",
    requiredPatternDescriptions: [
      "konversi input-nya pakai int()",
      "pertahankan comparison age",
      "tetap print Dewasa",
    ],
    misconceptionPatternNotes: [
      "Teks input mentahnya masih dibandingkan dengan angka.",
      "Baris if-nya masih butuh titik dua.",
    ],
  },
  "conditionals-write-1": {
    concept: "Tulis if/else",
    prompt: "score sudah di-set. Tulis pengecekannya: print Lulus saat score minimal 75, selain itu print Coba lagi.",
    hint: "Dua branch: if dengan comparison >= dan titik dua, lalu else. Tiap branch print satu string.",
    explanation: "if score >= 75: membuka branch pertama, else: cadangannya. Tepat satu dari dua blok yang jalan.",
    requiredPatternDescriptions: [
      "cek score >= 75 dengan titik dua",
      "print Lulus di blok if",
      "tambahin branch else",
      "print Coba lagi di blok else",
    ],
    misconceptionPatternNotes: [
      "= tunggal itu assign; condition-nya butuh comparison.",
      "Baris if harus diakhiri titik dua.",
    ],
  },
  "conditionals-write-2": {
    concept: "Tulis if/elif/else",
    prompt: "score sudah di-set. Print grade-nya: A untuk 90 ke atas, B untuk 80 ke atas, C untuk sisanya. Pakai satu chain if/elif/else.",
    hint: "Tiga branch sesuai urutan: if untuk range paling atas, elif untuk tengah, else untuk sisanya. Chain berhenti di True yang pertama.",
    explanation: "Chain-nya ngecek dari atas ke bawah: score >= 90, lalu score >= 80, lalu else. Tepat satu branch yang jalan, jadi 85 masuk ke elif.",
    requiredPatternDescriptions: [
      "cek range A dulu",
      "cek range B pakai elif",
      "tambahin fallback C",
      "print A",
      "print B",
      "print C",
    ],
    misconceptionPatternNotes: [
      "if kedua yang berdiri sendiri dicek terpisah; branch tengahnya harus elif.",
      "Branch B harus mencakup 80 ke atas, bukan mengulang range A.",
    ],
  },
  "loops-predict-1": {
    concept: "Trace range",
    prompt: "Tulis persis apa yang di-print — satu angka per baris, sesuai urutan.",
    hint: "range mulai dari mana secara default, dan berhenti di mana? Value stop-nya nggak ikut.",
    explanation: "range(3) ngasih 0, 1, 2 — mulai dari 0 dan berhenti sebelum 3. Tiap value di-print di barisnya sendiri.",
    misconceptionOutputNotes: [
      "range mulai dari 0 secara default, bukan dari 1.",
      "range berhenti sebelum value stop-nya; 3 nggak pernah dihasilkan.",
      "Body jalan sekali per value — tiga print, bukan satu.",
    ],
  },
  "loops-predict-2": {
    concept: "Trace while",
    prompt: "Ikuti count di tiap putaran. Tulis persis apa yang di-print — satu angka per baris.",
    hint: "Body print count lalu menaikkannya. Baca lagi condition-nya di tiap putaran, termasuk putaran tempat dia akhirnya gagal.",
    explanation: "count ke-print sebagai 1, 2, 3. Saat count jadi 4, condition 4 <= 3 itu False dan loop-nya selesai.",
    misconceptionOutputNotes: [
      "Saat count 4, condition 4 <= 3 sudah False, jadi 4 nggak pernah ke-print.",
      "Body jalan sekali per putaran — tiap putaran print count yang sekarang, bukan cuma yang terakhir.",
      "count di-update di dalam loop, jadi condition-nya lama-lama jadi False.",
    ],
  },
  "loops-fix-1": {
    concept: "while yang nggak berhenti",
    prompt: "Loop ini nggak pernah berhenti. Perbaiki dengan meng-update count di dalam loop supaya print 1 sampai 5.",
    hint: "Condition-nya baca count di tiap putaran. Baris mana yang harus jalan di dalam loop supaya count lama-lama lewat 5?",
    explanation: "while loop cuma berhenti saat condition-nya jadi False. Nambahin count = count + 1 di dalam body menggerakkan count menuju 6, tempat 6 <= 5 itu False dan loop-nya selesai.",
    requiredPatternDescriptions: [
      "pertahankan condition while",
      "tetap print count",
      "naikkan count di dalam loop",
    ],
    misconceptionPatternNotes: [
      "Nggak ada apa pun di dalam loop yang mengubah count, jadi condition-nya True selamanya.",
    ],
  },
  "loops-fix-2": {
    concept: "Batas range",
    prompt: "Program ini harusnya menjumlahkan 1 sampai 5 dan print 15, tapi dia print 10. Perbaiki batasnya. Target output: 15",
    hint: "Tulisin angka-angka yang benar-benar diberikan range(1, 5). Dia berhenti di mana, dan apa yang kurang?",
    explanation: "range(1, 5) ngasih 1, 2, 3, 4 — berhenti sebelum 5. Biar 5 ikut, value stop-nya harus 6: range(1, 6).",
    requiredPatternDescriptions: [
      "perpanjang range biar 5 ikut",
      "tetap mengakumulasi number",
      "tetap print total",
    ],
    misconceptionPatternNotes: [
      "Batasnya masih exclusive — range(1, 5) nggak pernah ngasih 5.",
      "Nge-reset total di dalam loop ngehapus jumlahan sementara di tiap putaran.",
    ],
  },
  "loops-write-1": {
    concept: "Tulis for loop",
    prompt: "Tulis for loop yang print angka 1 sampai 5, satu per baris. Pakai i sebagai loop variable dan range dengan start value.",
    hint: "range butuh start dan stop — ingat, value stop-nya dikecualikan, jadi buat sampai 5 lu harus stop di 6.",
    explanation: "for i in range(1, 6) jalanin i lewat 1, 2, 3, 4, 5, print satu per satu. Loop body-nya adalah print yang menjorok.",
    requiredPatternDescriptions: [
      "loop i di atas range(1, 6)",
      "print i di dalam loop",
    ],
    misconceptionPatternNotes: [
      "range(1, 5) berhenti sebelum 5 — angka terakhir nggak pernah ke-print.",
      "range(5) mulai dari 0, jadi yang ke-print 0 sampai 4, bukan 1 sampai 5.",
    ],
  },
  "loops-write-2": {
    concept: "Tulis accumulator",
    prompt: "total mulai dari 0. Pakai for loop di atas range(1, 6), masukin tiap angka ke total. Print total SETELAH loop. Target output: 15",
    hint: "Initialize sebelum loop, update di dalamnya, print setelahnya. Tiap putaran nambahin angka saat ini ke yang sudah dipegang total.",
    explanation: "total = total + number mengumpulkan 1 + 2 + 3 + 4 + 5 lewat lima putaran. print(total) yang tidak menjorok jalan sekali, setelah loop, dan nampilin 15.",
    requiredPatternDescriptions: [
      "loop di atas range(1, 6)",
      "tambahin angka saat ini ke total di dalam loop",
      "print total setelah loop",
    ],
    misconceptionPatternNotes: [
      "total = 0 di dalam loop ngehapus jumlahan sementara di tiap putaran.",
      "range(1, 5) nggak pernah ngasih 5, jadi totalnya kurang.",
    ],
  },
  "functions-predict-1": {
    concept: "Define dan call",
    prompt: "Tulis persis apa yang di-print program ini — satu baris.",
    hint: "def menyimpan function body. Cari baris yang benar-benar memanggilnya.",
    explanation: "def bikin greet tanpa menjalankannya. greet(\"Panji\") ngasih argument dan menjalankan body sekali, jadi Hello Panji ke-print.",
    misconceptionOutputNotes: [
      "Ada call setelah definisinya, jadi body jalan sekali.",
      "name nerima argument Panji; Python print value yang diterima, bukan nama parameter-nya.",
      "Function-nya print Hello string-nya dan argument-nya.",
    ],
  },
  "functions-predict-2": {
    concept: "Print vs return",
    prompt: "Function-nya print sebuah jumlahan tapi nggak me-return-nya. Tulis dua baris output sesuai urutan.",
    hint: "Call-nya print sekali di dalam function. Lalu tanya: value apa yang dikasih balik function tanpa return?",
    explanation: "add print 5 saat call. Karena nggak ada return, call evaluasinya None, jadi print(result) print None di baris berikutnya.",
    misconceptionOutputNotes: [
      "Print di dalam nampilin 5, tapi print luar juga nampilin value yang di-return: None.",
      "print nampilin 5 tapi nggak ngasih 5 balik. Tanpa return, result-nya None.",
      "Call-nya jalanin body dulu, jadi 5 ke-print sebelum None.",
    ],
  },
  "functions-fix-1": {
    concept: "Syntax definisi function",
    prompt: "Definisinya kurang satu karakter wajib. Perbaiki supaya call-nya print Hello Arya.",
    hint: "Baris def membuka blok menjorok sama seperti header if atau loop.",
    explanation: "Header function diakhiri titik dua. Body yang menjorok itu milik definisinya, dan greet(\"Arya\") memanggilnya.",
    requiredPatternDescriptions: [
      "akhiri header def dengan titik dua",
      "tetap print parameter-nya",
      "pertahankan function call-nya",
    ],
    misconceptionPatternNotes: [
      "Baris def-nya masih butuh titik dua sebelum body yang menjorok.",
    ],
  },
  "functions-fix-2": {
    concept: "Return value yang reusable",
    prompt: "Function-nya harusnya return jumlahannya supaya result jadi 5. Ganti baris yang salah dan pertahankan print terakhir.",
    hint: "Caller-nya butuh value balik, bukan output yang dihasilkan di dalam function.",
    explanation: "return a + b ngasih 5 balik ke call-nya. result nerima value itu, dan print terakhir nampilin dia sekali.",
    requiredPatternDescriptions: [
      "pertahankan definisi dua parameter",
      "return jumlahan yang dihitung",
      "simpan value yang di-return",
      "print result setelah call",
    ],
    misconceptionPatternNotes: [
      "Function-nya masih menampilkan jumlahannya alih-alih ngasih balik ke result.",
    ],
  },
  "functions-write-1": {
    concept: "Tulis dan call function",
    prompt: "Tulis greet(name). Body-nya harus print Hello dan name. Lalu call dengan Panji.",
    hint: "Tulis dulu header def dengan satu parameter dan titik dua. Jorokkan print-nya, lalu call function-nya di luar body.",
    explanation: "Parameter name nerima Panji dari call-nya. Satu definisi sekarang bisa nyapa argument apa pun yang dikasih nanti.",
    requiredPatternDescriptions: [
      "define greet dengan parameter name",
      "print Hello dengan name",
      "call greet dengan Panji",
    ],
    misconceptionPatternNotes: [
      "Definisinya butuh parameter name untuk nerima Panji.",
      "Nulis greet itu menyebut function-nya; greet(\"Panji\") yang memanggilnya.",
    ],
  },
  "functions-write-2": {
    concept: "Parameter dan return",
    prompt: "Tulis add(a, b) supaya me-return a + b. Lalu print hasil add(3, 4).",
    hint: "Perhitungannya ada setelah return di dalam body. Caller bisa taruh call-nya langsung di dalam print.",
    explanation: "a dan b nerima dua argument itu. return ngasih jumlahannya balik, jadi print(add(3, 4)) nampilin 7.",
    requiredPatternDescriptions: [
      "define add dengan dua parameter",
      "return jumlahannya",
      "call add dan print value yang di-return",
    ],
    misconceptionPatternNotes: [
      "Function-nya perlu return jumlahannya supaya caller-nya bisa memakainya.",
      "add define dua parameter, jadi call ini harus kasih dua argument.",
    ],
  },
};

const idTopicTitles: Record<string, string> = {
  variables: "Variables",
  "data-types": "Data Types",
  operators: "Operators",
  conditionals: "Conditionals",
  loops: "Loops",
  functions: "Functions",
};

const idTrack = {
  title: "Dasar-Dasar Python",
  description: "Gym koding kecil buat konsep-konsep dari Foundations of Programming.",
};

export function localizePracticeExercises(exercises: PracticeExercise[], language: LessonLanguage): PracticeExercise[] {
  if (language !== "id") return exercises;
  return exercises.map((exercise) => {
    const override = idByExercise[exercise.id];
    if (!override) return exercise;
    return {
      ...exercise,
      concept: override.concept ?? exercise.concept,
      prompt: override.prompt ?? exercise.prompt,
      hint: override.hint ?? exercise.hint,
      explanation: override.explanation ?? exercise.explanation,
      misconceptionOutputs: exercise.misconceptionOutputs?.map((item, index) => ({
        ...item,
        note: override.misconceptionOutputNotes?.[index] ?? item.note,
      })),
      requiredPatterns: exercise.requiredPatterns?.map((pattern, index) => ({
        ...pattern,
        description: override.requiredPatternDescriptions?.[index] ?? pattern.description,
      })),
      misconceptionPatterns: exercise.misconceptionPatterns?.map((pattern, index) => ({
        ...pattern,
        note: override.misconceptionPatternNotes?.[index] ?? pattern.note,
      })),
    };
  });
}

export function localizePracticeTrack(track: PracticeTrack, language: LessonLanguage): PracticeTrack {
  if (language !== "id") return track;
  return {
    ...track,
    title: idTrack.title,
    description: idTrack.description,
    topics: track.topics.map((topic: PracticeTopic) => ({
      ...topic,
      title: idTopicTitles[topic.lessonSlug] ?? topic.title,
      exercises: localizePracticeExercises(topic.exercises, language),
    })),
  };
}
