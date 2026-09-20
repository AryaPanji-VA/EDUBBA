import { setsActivities } from "./sets-activities";
import type { LessonContent } from "../types";
import { getSharedCopy, type LessonLanguage } from "../shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";
export type { LessonLanguage };

export const setsCopy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    ...getSharedCopy("en"), moduleTitle: "Programming Building Blocks",
    prompt: "Explain in your own words: why does a set with {\"python\", \"coding\", \"python\"} hold only two values — and why is tags[0] not valid?",
    placeholder: "The set holds only unique values..., and tags[0] is not valid because...",
    oneLine: "Two Python lines",
    diagram: "set: unique values · no positions",
    codeLabel: "python",
    sourceCheck: "Source Mode: no AI evaluation. Review the uniqueness and the no-indexing nature of a set, then continue without AI.",
  },
  id: {
    ...getSharedCopy("id"), moduleTitle: "Dasar Penyusun Program",
    prompt: "Jelasin pakai bahasa lu sendiri: kenapa set dengan isi {\"python\", \"coding\", \"python\"} cuma punya dua value — dan kenapa tags[0] nggak valid?",
    placeholder: "Set-nya cuma nyimpen value unik..., dan tags[0] nggak valid karena...",
    oneLine: "Dua baris Python",
    diagram: "set: value unik · tanpa posisi",
    codeLabel: "python",
    sourceCheck: "Source Mode: tanpa evaluasi AI. Tinjau keunikan set-nya dan sifat tanpa-posisinya, lalu lanjut tanpa AI.",
  },
};

const indonesianActivities = [
  { title: "WHY · Satu aturan: nggak boleh dobel", content: ["List, dictionary, tuple udah lewat — sekarang collection yang punya satu obsesi: isinya harus unik. Banyak data memang gitu: tag, bahasa, alamat email — value yang sama nggak perlu disimpan dua kali.", "Set adalah collection yang cuma nyimpen value unik. Tulis \"python\" dua kali, yang tersimpan tetap satu — duplikatnya collapse."] },
  { title: "INTUITION · Ditulis dua kali, disimpan sekali", content: ["tags = {\"python\", \"coding\", \"python\"} menulis tiga value, tapi set-nya cuma menampung dua: kembaran \"python\" collapse jadi satu.", "len(tags) — tool hitung dari lesson Lists — balikin 2. Itu bukti paling bersih kalau duplikat nggak disimpan: tiga yang ditulis, dua yang dihitung."] },
  { title: "MENTAL MODEL · Tiga collection, tiga trade-off", content: ["List terurut, boleh duplikat, diakses pakai index. Tuple terurut, isinya fix, diakses pakai index. Set nyimpen value unik — dan nggak punya akses posisi sama sekali.", "Jadi milih collection itu milih trade-off: butuh urutan dan duplikat? List. Butuh grup yang fix? Tuple. Butuh keunikan plus pertanyaan \"ada nggak di dalam?\" Set."] },
  { title: "PREDICT · Berapa yang bertahan?", content: ["Tiga value ditulis, termasuk \"python\" dua kali. Apa yang ditampilkan print(len(tags))?"], explanation: "Dua. Set cuma nyimpen value unik: kembaran \"python\" collapse jadi satu, jadi len(tags) menghitung 2 — bukan 3." },
  { title: "PREDICT · Ada nggak di dalam?", content: ["Set-nya menampung \"python\" dan \"coding\". Apa hasil print(\"python\" in tags)?"], explanation: "True. in nanya langsung ke set: ada nggak value ini di dalamnya? \"python\" ada, jadi jawabannya boolean True — nggak perlu posisi, nggak perlu index." },
  { title: "SPOT · Akses mana yang jebol?", content: ["Tiga baris, satu variable set. Baris mana yang error?"], explanation: "print(tags[0]). Kurung siku dengan angka minta posisi, dan set nggak punya posisi — pertanyaan \"value di posisi 0?\" nggak ada di sini. len dan in valid; tags[0] nggak." },
  { title: "TRY · Bikin set, tanya set-nya", content: ["Tulis dua baris: bikin set bernama tags pakai kurung kurawal dengan minimal dua value bertanda kutip — tulis salah satunya dua kali biar kelihatan collapse-nya — lalu print cek membership seperti print(\"python\" in tags). Kurung siku bikin list, bukan set, dan print(tags[0]) itu indexing, bukan membership."], explanation: "tags = {\"python\", \"coding\", \"python\"} — duplikatnya collapse jadi satu, dan print(\"python\" in tags) nanya langsung ke set: True." },
  { title: "FORMALIZE · Collection keunikan", content: ["Set adalah collection dari value unik: {\"python\", \"coding\", \"python\"} menyimpan satu salinan tiap value — duplikat collapse, dan len menghitung yang bertahan, bukan yang ditulis. Keunikan itu sifat yang ngedefinisiin set.", "Membership dengan in adalah pertanyaan natural yang dijawab set: \"python\" in tags → True atau False. Yang nggak dikasih set adalah posisi: tags[0] nggak valid, dan urutan print set nggak ada janjinya — jangan pernah diandalkan.", "Kontras tiga arah menutup toolbox Module 06: list → terurut, boleh duplikat, di-index; tuple → terurut, isinya fix, di-index; set → value unik, tanpa indexing posisi. Berikutnya Module 07 · Putting It Together: apa yang terjadi saat program ketemu data yang nggak terduga."] },
  { title: "ROBIN CHECK · Jelasin balik", content: [setsCopy.id.prompt] },
  { title: "CONNECT · Toolbox lengkap, lanjut Module 07", content: ["Sets → Module 07 · Putting It Together → Errors / Try Except Basics", "Toolbox collection-nya lengkap: list untuk duplikat terurut, dictionary untuk value berlabel, tuple untuk grup fix, set untuk value unik. Module 07 menyatukan semuanya — dimulai dari apa yang terjadi saat program ketemu data yang nggak terduga: Errors / Try Except Basics.", "Selesai mengikuti alur bukan berarti mastery sudah dinilai. Jawaban penting dan posisi langkah lu disimpan supaya bisa lanjut setelah reload."] },
];

export function getSetsActivities(language: LessonLanguage) {
  return setsActivities.map((activity, index) => ({
    ...activity,
    ...(language === "id" ? indonesianActivities[index] : {}),
    ...(activity.type === "robin_check" ? { content: [setsCopy[language].prompt] } : {}),
  }));
}

export function localizeSetsContent(content: LessonContent, language: LessonLanguage): LessonContent {
  if (language === "en") return content;
  return {
    ...content,
    intuitiveExplanation: [
      "List, dictionary, tuple udah lewat — sekarang collection yang punya satu obsesi: isinya harus unik. tags = {\"python\", \"coding\", \"python\"} ditulis dengan \"python\" dua kali, tapi set-nya cuma nyimpen sekali.",
      "Duplikatnya collapse: len(tags) — tool hitung dari lesson Lists — balikin 2, bukan 3. Itu bukti paling bersih bahwa value kembar nggak disimpan dobel.",
      "Pertanyaan natural-nya bukan \"value keberapa?\" tapi \"ada nggak?\": \"python\" in tags → True. Dan set nggak punya posisi — tags[0] nggak valid, jadi jangan pernah andelin urutan print-nya.",
    ],
    academicExplanation: [
      "Set adalah collection dari value unik, ditulis sebagai literal pakai kurung kurawal: tags = {\"python\", \"coding\", \"python\"}. Kalau sebuah value muncul lebih dari sekali, duplikatnya collapse — set menampung satu salinan, dan len(tags) balikin 2, bukan 3.",
      "Pertanyaan natural yang dijawab set adalah membership: \"python\" in tags mengevaluasi ke True, dan value yang nggak ada di set memberi False. Nggak ada akses posisional — tags[0] nggak valid, karena set menjanjikan keunikan, bukan posisi — dan set juga nggak punya janji urutan, jadi urutan tampilnya set nggak boleh diandalkan.",
      "Tiga collection sekarang nutup tiga trade berbeda: list terurut, boleh duplikat, dibaca pakai index; tuple terurut, fix, dibaca pakai index; set nyimpen value unik dan menjawab membership, tanpa indexing posisi sama sekali. (Satu catatan sintaks: {} kosong membangun dictionary, bukan set — literal set butuh minimal satu value yang terlihat.)",
    ],
    codeExamples: content.codeExamples.map((example, index) => ({ ...example,
      title: ["Duplikat collapse", "Membership dengan in", "Nggak ada indexing — set bukan positional", "Tiga collection, tiga trade-off"][index] ?? example.title,
      explanation: ["Tiga value ditulis, dua yang bertahan: \"python\" kedua collapse ke yang pertama. len dari Lists adalah bukti paling bersih — set cuma nyimpen value unik.", "in nanya langsung ke set: ada nggak value ini di dalamnya. Nggak pakai posisi, nggak pakai key — cuma pertanyaan \"ada nggak value ini di collection?\" dan jawaban boolean.", "Kurung siku dengan angka minta posisi, dan set nggak punya posisi. Secara konsep, pertanyaan \"value di posisi 0?\" nggak ada di sini — membership dengan in adalah pintu masuk yang valid.", "Sintaks satu keluarga bracket, tiga janji berbeda. Milih sesuai kebutuhan datanya: urutan dan duplikat → list; grup fix → tuple; keunikan dan membership → set."][index] ?? example.explanation,
    })),
    keyTerms: content.keyTerms.map((term, index) => ({ ...term, definition: ["Collection dari value unik yang ditulis pakai kurung kurawal: {\"python\", \"coding\"}.", "Sifat yang ngedefinisiin — tiap value muncul paling banyak sekali; duplikat collapse jadi satu.", "Value yang ditulis lebih dari sekali. Set nyimpen satu salinan, bukan satu per penulisan.", "Pertanyaan natural yang dijawab set: \"python\" in tags → True atau False.", "Nggak ada janji urutan — jangan pernah andelin urutan print set.", "Satu variable yang menampung banyak value — sejalan dengan list, dictionary, dan tuple."][index] ?? term.definition })),
    commonMistakes: content.commonMistakes.map((mistake, index) => ({
      title: ["Meng-index set seperti list", "Andelin urutan print", "Mengira duplikat ikut dihitung", "Nggegin {} sebagai set kosong", "Pakai set pas posisi penting"][index] ?? mistake.title,
      explanation: ["tags[0] minta posisi 0, dan set nggak punya posisi — aksesnya nggak valid. Tanya membership pakai in.", "Urutan tampilnya set bukan janji. Dua print set yang sama nggak dijamin kelihatan sama, jadi jangan pernah bikin logika di atasnya.", "{\"python\", \"coding\", \"python\"} menampung 2 value, bukan 3. Duplikat yang ditulis collapse, bukan disimpan dobel.", "{} kosong membangun dictionary, bukan set. Literal set butuh minimal satu value yang terlihat.", "Kalau datanya butuh item pertama, item kedua, atau value kembar yang berurutan, list adalah collection yang tepat — set buang posisinya."][index] ?? mistake.explanation,
    })),
    quickChecks: content.quickChecks.map((check, index) => ({ ...check,
      question: ["tags = {\"python\", \"coding\", \"python\"}. Ada berapa value di set itu?", "tags = {\"python\", \"coding\"}. Apa hasil \"python\" in tags?", "tags = {\"python\", \"coding\"}. Akses mana yang nggak valid buat set?"][index] ?? check.question,
      explanation: ["Set cuma nyimpen value unik: \"python\" kedua collapse ke yang pertama, dan len(tags) menghitung 2.", "in adalah pertanyaan natural buat set: ada nggak value ini di collection-nya? Jawabannya boolean.", "Kurung siku minta posisi, dan set nggak punya posisi. Membership dan len adalah cara masuk yang valid."][index] ?? check.explanation,
    })),
  };
}

export const setsMasteryConceptLabels: Record<string, string> = {
  set_uniqueness: "Uniqueness", set_membership: "Membership with in", set_unordered: "No order promise",
};

export function setsReinforcement(result: CheckEvaluation, language: LessonLanguage): string {
  const id = language === "id";
  if (result.misconceptions.includes("set_indexing_confusion")) return id
    ? "Coba tanya set-nya dengan cara yang valid: tags[0] minta posisi — pertanyaan apa yang set jawabin pakai in?"
    : "Ask the set the valid way: tags[0] asks for a position — which question does a set answer with in?";
  if (result.misconceptions.includes("duplicates_counted_confusion")) return id
    ? "Tulis ulang {\"python\", \"coding\", \"python\"} terus hitung len-nya: berapa value yang benar-benar tersimpan?"
    : "Rewrite {\"python\", \"coding\", \"python\"} and count len: how many values are actually stored?";
  if (result.misconceptions.includes("order_relied_on")) return id
    ? "Set nggak janji soal urutan — kalau dua print set yang sama bisa kelihatan beda, apa yang aman diandalkan darinya?"
    : "A set makes no order promise — if two prints of the same set can look different, what about it is safe to rely on?";
  if (result.misconceptions.includes("empty_braces_confusion")) return id
    ? "{} kosong itu punya siapa — dictionary atau set? Apa yang dibutuhkan supaya literal itu jadi set?"
    : "Who owns an empty {} — a dictionary or a set? What does a literal need to become a set?";
  return id
    ? "Restate janji set-nya: value unik, jawab membership dengan in, dan nggak punya posisi. Di titik mana {\"python\", \"coding\", \"python\"} berubah dari tiga tulisan jadi dua value?"
    : "Restate the set's promise: unique values, membership answered with in, and no positions. At which point does {\"python\", \"coding\", \"python\"} turn from three writes into two values?";
}
