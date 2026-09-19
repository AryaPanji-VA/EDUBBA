import type { LessonContent } from "@/content/lessons/types";

export const functionsLessonContent: LessonContent = {
  slug: "functions",
  intuitiveExplanation: [
    "Coba perhatiin dulu masalahnya: kalau lu mau nge-print sapaan yang sama di tiga tempat, lu nulis print yang sama tiga kali. Kalau ternyata teksnya salah, lu harus ubah di tiga tempat — dan satu yang kelewat, programnya jadi nggak konsisten. Function memecahkan itu: tulis instruksinya sekali, kasih nama, lalu panggil namanya kapan pun lu butuh.",
    "Ada dua momen yang beda total. def greet(): itu cuma bilang ke Python: \"inget ya, ada instruksi bernama greet\". Python nyimpen instruksinya — tapi nggak ngerjain apa-apa. Baru baris greet() yang menyuruh Python ngerjain instruksi itu, dari atas sampai bawah.",
    "Isi function-nya adalah baris-baris yang menjorok ke dalam di bawah def. Setiap kali lu panggil greet(), seluruh baris yang menjorok itu jalan lagi dari awal. Jadi polanya simpel: define → Python mengingat; call → body-nya jalan.",
  ],
  academicExplanation: [
    "A function is a named, reusable block of behavior. The def statement defines it: def greet(): opens the definition with a colon, and the indented lines below are the function body. When Python reads a def line, it records the body under the name greet and moves on — the body does not run at definition time.",
    "A call runs the body. Writing greet() executes every indented line in the body, top to bottom, and then execution continues at the line after the call. The body repeats in full on every call: two calls mean the whole body runs twice.",
    "Order matters. Python reads a file top to bottom, so the def line must be executed before the call line is reached; calling a name Python has not defined yet raises a NameError. The mental model: define → Python remembers; call → the body executes.",
  ],
  codeExamples: [
    { title: "Define once, call many times", language: "python", code: "def greet():\n    print(\"Hello\")\n\ngreet()\ngreet()", explanation: "The def records greet's body without running it. Each call greet() executes the indented body, so Hello prints twice." },
    { title: "Defining does not run the body", language: "python", code: "def greet():\n    print(\"Hi\")\n\nprint(\"Start\")\ngreet()", explanation: "The def only records the function — nothing prints there. Execution starts at print(\"Start\"), so the output is Start, then Hi." },
    { title: "The whole body runs per call", language: "python", code: "def show_steps():\n    print(\"Step 1\")\n    print(\"Step 2\")\n    print(\"Step 3\")\n\nshow_steps()", explanation: "All three indented lines belong to the function. One call runs the entire body in order — three calls would run all three lines, three times." },
    { title: "Calls run in source order", language: "python", code: "def greet():\n    print(\"Hello\")\n\nprint(\"Before\")\ngreet()\nprint(\"Middle\")\ngreet()\nprint(\"After\")", explanation: "The program reads top to bottom: Before, Hello, Middle, Hello, After. Each call runs the full body once, exactly where the call sits." },
  ],
  keyTerms: [
    { term: "Function", definition: "A named block of behavior that Python can remember and run again on demand." },
    { term: "def", definition: "The statement that starts a function definition: def greet(): ends with a colon and opens the body." },
    { term: "Define", definition: "The moment Python reads the def and records the body under the function's name — without running it." },
    { term: "Call", definition: "Running a function by writing its name with parentheses, like greet()." },
    { term: "Function body", definition: "The indented lines under the def line; they execute in full on every call." },
    { term: "Reuse", definition: "Define the instructions once, then call the same name as many times as needed." },
  ],
  commonMistakes: [
    { title: "Defining without calling", explanation: "def greet(): only records the function. Without a call like greet(), the body never runs and nothing prints." },
    { title: "Expecting the body to run at definition", explanation: "Python only records the instructions when it reads the def line. The print inside the body stays silent until a call happens." },
    { title: "Calling before defining", explanation: "Python reads the file top to bottom, so the def must run before the call line. A greet() above the def raises a NameError." },
    { title: "Body not indented", explanation: "The lines under the def line must be indented. print(\"Hello\") at the same level as def is not part of the function — Python raises an error because the body is empty." },
    { title: "Thinking the def line itself prints something", explanation: "def greet(): creates and names the function; it displays nothing. Only the print inside the body produces output, and only when the function is called." },
  ],
  quickChecks: [
    { question: "What does this program print?", code: "def greet():\n    print(\"Hello\")", options: ["Hello", "Nothing", "greet", "Error"], answer: "Nothing", explanation: "The function is defined but never called — def records the body, a call runs it." },
    { question: "What does this program print?", code: "def greet():\n    print(\"Hi\")\n\nprint(\"Start\")\ngreet()", options: ["Start, then Hi", "Hi, then Start", "Hi", "Nothing"], answer: "Start, then Hi", explanation: "The def runs first but only records the function. Execution continues at print(\"Start\"), then greet() runs the body — Start, then Hi." },
    { question: "What happens when this program runs?", code: "greet()\n\ndef greet():\n    print(\"Hello\")", options: ["It prints Hello", "It prints Hello twice", "NameError — the call runs before the def", "Nothing"], answer: "NameError — the call runs before the def", explanation: "Python reads top to bottom. The call line greet() is reached before the def has ever run, so the name does not exist yet — a NameError." },
  ],
};
