import type { LessonContent } from "@/content/lessons/types";

export const scopeBasicsLessonContent: LessonContent = {
  slug: "scope-basics",
  intuitiveExplanation: [
    "Setiap function punya meja kerja sendiri. Setiap kali function dipanggil, Python menyiapkan area kerja kosong untuk call itu — dan semua variable yang dibuat di dalam body hidup di meja itu, bukan di meja program.",
    "Jadi ada dua tempat: variable yang dibuat di luar function itu milik program (kata umumnya: global), sedangkan variable yang dibuat di dalam body itu local — milik function itu saja, hidup di area kerja call-nya.",
    "Kesalahpahaman paling umum: mengira variable local bisa langsung dipakai di luar. Nggak bisa — area kerja local cuma ada selama call berjalan. Setelah call selesai, local names-nya hilang, dan manggil nama itu di luar bakal error.",
  ],
  academicExplanation: [
    "Each function call gets its own local working area. When greet() runs, the assignment message = \"Hello\" creates the name message inside that call's area; it exists only for the duration of the call and is gone when the call returns.",
    "Names created at the top level of the program — like name = \"Arya\" — belong to the program itself; the common word for them is global. Parameters behave like local names too: each parameter lives in the call's working area, receives its value when the call starts, and disappears when the call ends.",
    "The safe default: an assignment inside a function creates a local name. It does not reach outside and change a same-named program variable. Using a local name after its call has finished raises a NameError, because the working area it lived in no longer exists.",
  ],
  codeExamples: [
    {
      title: "Two areas, two variables",
      language: "python",
      code: "name = \"Arya\"\n\ndef greet():\n    message = \"Hello\"\n    print(message)\n\ngreet()\nprint(name)\n\noutput:\nHello\nArya",
      explanation: "message is created inside greet's local working area during the call. name is created outside, so it belongs to the program — print(name) works anywhere because an outside name exists for the whole run.",
    },
    {
      title: "A local variable is not available outside",
      language: "python",
      code: "def make_message():\n    message = \"Hello\"\n    print(message)\n\nmake_message()\nprint(message)\n\noutput:\nHello\nNameError: name 'message' is not defined",
      explanation: "message exists only inside the call's local area. While make_message() runs, the print inside works. After the call finishes, the area is gone — so using message outside raises a NameError.",
    },
    {
      title: "Parameters behave like local names",
      language: "python",
      code: "def greet_person(nama):\n    print(\"Halo,\", nama)\n\ngreet_person(\"Arya\")\nprint(nama)\n\noutput:\nHalo, Arya\nNameError: name 'nama' is not defined",
      explanation: "nama lives in the call's working area: it receives its value when the call starts and is usable inside the body. When the call ends, nama is gone — it never becomes an outside name.",
    },
    {
      title: "Same name, two independent areas",
      language: "python",
      code: "x = \"luar\"\n\ndef show():\n    x = \"dalam\"\n    print(x)\n\nshow()\nprint(x)\n\noutput:\ndalam\nluar",
      explanation: "The assignment inside creates its own local x in the call's area — it does not change the outside x. Two working areas, two separate names that just happen to be spelled the same.",
    },
  ],
  keyTerms: [
    { term: "Local variable", definition: "A variable created inside a function's body — it belongs to that call's local working area." },
    { term: "Outside variable (global)", definition: "A name created outside any function — it belongs to the program itself and exists for the whole run." },
    { term: "Scope", definition: "The area where a name exists and can be used: inside the function (local) or outside in the program." },
    { term: "Function call", definition: "Running a function — the call is what opens the local working area and fills the parameters." },
    { term: "Local working area", definition: "The private space a function call gets, where its local names and parameters live while the call runs." },
    { term: "Lifetime (exists during the call)", definition: "Local names exist only while the call runs — when the call finishes, they are gone." },
  ],
  commonMistakes: [
    {
      title: "Using a local variable outside its function",
      explanation: "message created inside greet exists only during the call. Using it outside raises a NameError — the local working area no longer exists.",
    },
    {
      title: "Expecting a local variable to survive after the call",
      explanation: "Local names live in the call's working area; when the call ends, the area and its names disappear. Calling the function again starts a fresh area.",
    },
    {
      title: "Assuming an assignment inside a function changes the outside variable",
      explanation: "Assignments inside create local names — that is the safe default. A same-named outside variable keeps its own value, untouched.",
    },
    {
      title: "Confusing a parameter with a global name",
      explanation: "A parameter is filled per call and behaves like a local name inside the body. It is not a program-wide variable and it does not exist after the call.",
    },
    {
      title: "Expecting a local name to be usable by a different function",
      explanation: "Each call gets its own working area. A function cannot see the local names of another function — only its own.",
    },
  ],
  quickChecks: [
    {
      question: "message = \"Hello\" is written inside def greet():. Where does message live?",
      options: [
        "In greet's local working area, created during the call",
        "In the program's outside names",
        "Everywhere in the program at once",
        "Only on the line where it is printed",
      ],
      answer: "In greet's local working area, created during the call",
      explanation: "An assignment inside a body creates a local name in that call's working area.",
    },
    {
      question: "After greet() finishes, what happens to message?",
      options: [
        "It is gone — the local area exists only during the call",
        "It moves to the program's outside names",
        "It stays until the program ends",
        "It turns into a parameter",
      ],
      answer: "It is gone — the local area exists only during the call",
      explanation: "The local working area closes when the call returns; its names disappear with it.",
    },
    {
      question: "The parameter nama in greet_person(nama) behaves like...",
      options: [
        "A local name inside the call's working area",
        "A global name the whole program can see",
        "A name that still exists after the call ends",
        "A name shared between different functions",
      ],
      answer: "A local name inside the call's working area",
      explanation: "Parameters receive their value per call and live in that call's local area — gone when the call ends.",
    },
  ],
};
