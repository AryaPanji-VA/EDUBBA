import type { LessonContent } from "@/content/lessons/types";

export const loopsLessonContent: LessonContent = {
  slug: "loops",
  intuitiveExplanation: [
    "Kalau kamu disuruh print \"Halo\" lima kali, nulis print lima baris itu berhari-hari dan gampang salah. Program punya cara untuk mengulang kerja: loop.",
    "for itu buat pengulangan yang jumlahnya sudah jelas — \"ulang 5 kali\". while itu buat pengulangan yang tergantung kondisi — \"ulang selama masih belum selesai\".",
    "Di dalam loop, ada yang berubah tiap putaran: itulah loop state. Ada variable penghitung (counter) dan variable penampung hasil (accumulator). Kalau state-nya nggak pernah berubah, while bisa muter selamanya — itulah infinite loop.",
  ],
  academicExplanation: [
    "A loop repeats a block of code. The for loop iterates over a sequence: for each value the sequence yields, the loop variable is bound to it and the indented body runs. range(5) produces the integers 0, 1, 2, 3, 4 — it starts at 0 and stops BEFORE the end value, so it yields exactly 5 numbers but never 5 itself.",
    "range() accepts one to three arguments: range(stop), range(start, stop), or range(start, stop, step). range(1, 6) yields 1, 2, 3, 4, 5 — the stop value is always excluded. This half-open boundary is the source of most beginner off-by-one mistakes.",
    "The while loop repeats as long as its condition evaluates to True. Something inside the body must eventually make the condition False — typically updating a counter — otherwise the loop never stops (an infinite loop).",
    "Counters and accumulators are loop state. A counter counts iterations (count = count + 1); an accumulator collects a result across iterations (total = total + number). Both must be initialized before the loop and updated inside it. Resetting an accumulator inside the loop destroys everything collected so far.",
  ],
  codeExamples: [
    { title: "for repeats a known number of times", language: "python", code: "for i in range(5):\n    print(i)", explanation: "i takes the values 0, 1, 2, 3, 4 — one per iteration. range(5) never includes 5." },
    { title: "range with a start value", language: "python", code: "for i in range(1, 6):\n    print(i)", explanation: "Starts at 1 and stops before 6: prints 1, 2, 3, 4, 5. The stop value is excluded." },
    { title: "while repeats while a condition holds", language: "python", code: "count = 1\n\nwhile count <= 5:\n    print(count)\n    count = count + 1", explanation: "Each pass prints count, then increases it. When count becomes 6, the condition is False and the loop ends." },
    { title: "An accumulator collects a result", language: "python", code: "total = 0\n\nfor number in range(1, 6):\n    total = total + number\n\nprint(total)", explanation: "total gathers 1 + 2 + 3 + 4 + 5 across iterations and prints 15 after the loop ends." },
  ],
  keyTerms: [
    { term: "Loop", definition: "A construct that repeats a block of code multiple times." },
    { term: "for", definition: "A loop that iterates over a sequence, running its body once per value." },
    { term: "while", definition: "A loop that repeats as long as its condition is True." },
    { term: "range()", definition: "Produces a sequence of integers; the stop value is excluded. range(5) yields 0 through 4." },
    { term: "Iteration", definition: "One single pass through the loop body." },
    { term: "Loop variable", definition: "The name that receives the current value on each for iteration, like i in for i in range(5)." },
    { term: "Counter", definition: "A variable that counts iterations, updated inside the loop." },
    { term: "Accumulator", definition: "A variable that collects a running result across iterations, like a sum." },
    { term: "Infinite loop", definition: "A loop whose condition never becomes False — usually because nothing inside updates the loop state." },
  ],
  commonMistakes: [
    { title: "Forgetting to update a while counter", explanation: "while count <= 5: without count = count + 1 inside never changes the condition, so the loop runs forever." },
    { title: "Assuming range(5) includes 5", explanation: "range(5) yields 0, 1, 2, 3, 4 — it stops before the stop value. Use range(1, 6) to get 1 through 5." },
    { title: "Wrong range boundary", explanation: "range(1, 5) yields 1 through 4, not 5. Off-by-one mistakes show up as a missing first or last number." },
    { title: "Incorrect indentation", explanation: "The loop body is whatever is indented under for/while. A print that is not indented runs only once, after the loop." },
    { title: "Resetting an accumulator inside the loop", explanation: "total = 0 inside the loop wipes the running total on every pass. Initialize before the loop, update inside it." },
    { title: "Confusing loop count with the loop variable", explanation: "for i in range(5) runs 5 times, but i is 0 through 4 during those passes — the count of iterations is not the values i takes." },
    { title: "Using while where for is easier", explanation: "When you know how many repetitions you need, for with range() updates the loop variable for you. while is for repetition with an unknown end." },
  ],
  quickChecks: [
    { question: "What does this print?", code: "for i in range(3):\n    print(i)", options: ["0, 1, 2", "1, 2, 3", "3", "0, 1, 2, 3"], answer: "0, 1, 2", explanation: "range(3) starts at 0 and stops before 3, so i takes 0, 1, 2." },
    { question: "How many times does this loop run?", code: "count = 1\nwhile count <= 4:\n    count = count + 1", options: ["3", "4", "5", "Forever"], answer: "4", explanation: "count goes 2, 3, 4, 5 — after the fourth update the condition 5 <= 4 is False. Four iterations." },
    { question: "What is missing from this program?", code: "count = 1\nwhile count <= 5:\n    print(count)", options: ["A colon", "Indentation", "An update to count inside the loop", "Nothing"], answer: "An update to count inside the loop", explanation: "Without count = count + 1 inside the loop, the condition stays True forever — an infinite loop." },
  ],
};
