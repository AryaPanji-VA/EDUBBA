import type { LessonContent } from "@/content/lessons/types";

export const loopsLessonContent: LessonContent = {
  slug: "loops",
  intuitiveExplanation: [
    "Coba lihat ini: for name in [\"Arya\", \"Bima\", \"Citra\"]: lalu print(name) yang menjorok ke bawah. Python ambil value pertama dari list — \"Arya\" — taruh di name, jalanin print. Terus giliran \"Bima\", terus \"Citra\". Tiga kali print, tapi kamu cuma nulis barisnya sekali.",
    "name itu loop variable: dia ganti value di tiap putaran — tiap putaran itu namanya iterasi. Python nggak nebak-nebak; dia jalan sesuai urutan value di list-nya, dari depan sampai habis.",
    "Blok yang menjorok di bawah for itu loop body — badan loopnya. Semua baris yang menjorok ikut diulang di tiap iterasi. Jadi kalau ada kerjaan sama yang harus dilakuin untuk banyak data, satu for sudah cukup.",
  ],
  academicExplanation: [
    "A for loop repeats a block of code across a sequence of values. The statement for name in [\"Arya\", \"Bima\", \"Citra\"]: iterates over the list: on each iteration, Python binds the loop variable name to the next value in order and runs the indented body once. Three values in the list means exactly three iterations: name is \"Arya\", then \"Bima\", then \"Citra\".",
    "The indented block under the for line is the loop body, and the whole body repeats per iteration. With for word in [\"Hi\", \"Hey\"]: followed by two indented prints, each iteration prints the current word and then \"!\" — so \"!\" prints twice, once per iteration. The first non-indented line after the body is not part of the loop; it runs exactly once, after the loop finishes.",
    "After the loop ends, the loop variable still holds the last value it was bound to — but the repetition is over. Writing the loop variable again after the loop does not continue iterating; any code that is not indented runs once.",
    "for is for repeating across known items — a list you can write down. When the repetition should continue while a condition stays True instead, that is the job of the while loop, covered in the next lesson.",
  ],
  codeExamples: [
    { title: "for walks through a list", language: "python", code: "for name in [\"Arya\", \"Bima\", \"Citra\"]:\n    print(name)", explanation: "Iteration 1 binds name to \"Arya\", iteration 2 to \"Bima\", iteration 3 to \"Citra\". Three values, three prints." },
    { title: "Numbers work the same way", language: "python", code: "for number in [2, 4, 6]:\n    print(number)", explanation: "The loop variable takes each value in order: 2, then 4, then 6. The type of the values does not change the model." },
    { title: "The body can be several lines", language: "python", code: "for word in [\"Hi\", \"Hey\"]:\n    print(word)\n    print(\"!\")", explanation: "Both indented prints are the body, so both repeat per iteration: Hi, !, Hey, ! — the \"!\" prints twice." },
    { title: "After the loop runs once", language: "python", code: "for name in [\"Arya\", \"Bima\"]:\n    print(name)\n\nprint(\"Selesai\")", explanation: "print(name) is indented, so it repeats. print(\"Selesai\") is not indented, so it runs a single time after the loop ends." },
  ],
  keyTerms: [
    { term: "Loop", definition: "A construct that repeats a block of code multiple times." },
    { term: "for", definition: "A loop that iterates over a sequence, running its body once per value." },
    { term: "Iteration", definition: "One single pass through the loop body — one value of the sequence." },
    { term: "Loop variable", definition: "The name that receives the current value on each iteration, like name in for name in [\"Arya\", \"Bima\", \"Citra\"]." },
    { term: "Loop body", definition: "The indented block under the for line. The whole body repeats on every iteration." },
    { term: "Indentation", definition: "The spaces at the start of a line. Indentation is what marks which lines belong to the loop body." },
  ],
  commonMistakes: [
    { title: "Hardcoded prints instead of a loop", explanation: "print(\"Arya\") then print(\"Bima\") then print(\"Citra\") repeats the work by hand. The for loop does it in one body: bind the loop variable to each value and print the variable, not the literals." },
    { title: "Forgetting the colon", explanation: "for name in [\"Arya\", \"Bima\"] starts a block, so the line must end with a colon. Without it, Python reports a SyntaxError before the body even runs." },
    { title: "Body not indented — or only partly", explanation: "Everything indented under the for line is the body and repeats; a line that lost its indentation runs once after the loop. If only one of two prints is indented, only that one repeats." },
    { title: "Expecting the loop variable to keep working after the loop", explanation: "After the last iteration, name just holds the last value (\"Citra\"). The repetition is finished — unindented code after the loop runs once and cannot step through the values again." },
    { title: "Reusing the loop variable name incorrectly", explanation: "Assigning to the loop variable inside the body does not change the sequence: on the next iteration Python rebinds it to the next value anyway. And reusing the same name for unrelated data means the for loop overwrites it on its first pass." },
  ],
  quickChecks: [
    { question: "What does this print?", code: "for color in [\"red\", \"green\"]:\n    print(color)", options: ["red, green", "green", "red", "red, green, red, green"], answer: "red, green", explanation: "Two values in the list, two iterations: color is \"red\", then \"green\". One print per value." },
    { question: "The list has two values and the body has two prints. What is the output?", code: "for number in [5, 10]:\n    print(number)\n    print(\"-\")", options: ["5, -, 10, -", "5, 10, -", "5, -, 10", "5, 10"], answer: "5, -, 10, -", explanation: "The whole body repeats per iteration: 5 then -, then 10 then -. Two values × two prints = four lines." },
    { question: "How many times does the indented print run?", code: "for name in [\"Arya\", \"Bima\", \"Citra\"]:\n    print(name)", options: ["1", "2", "3", "0"], answer: "3", explanation: "One iteration per value in the sequence: three values, three iterations, three prints." },
  ],
};
