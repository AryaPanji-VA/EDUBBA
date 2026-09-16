import type { LessonContent } from "@/content/lessons/types";

export const functionsLessonContent: LessonContent = {
  slug: "functions",
  intuitiveExplanation: [
    "Kalau kamu nulis perhitungan atau sapaan yang sama di tiga tempat, kamu harus juga memperbaikinya di tiga tempat kalau ternyata salah. Function memecahkan itu: sekali definisikan, panggil berkali-kali.",
    "Function itu mesin kecil: def membuka mesinnya, parameter jadi pintu masuk bahan mentahnya, return jadi pintu keluar hasilnya. Panggil mesinnya dengan nama, beri argument, dan dia kerjakan.",
    "Beda return dengan print: print cuma menampilkan ke layar — hasilnya nggak bisa dipakai lagi. return mengembalikan nilai ke pemanggil, jadi hasilnya bisa disimpan, dihitung, atau diterusin ke function lain.",
  ],
  academicExplanation: [
    "A function packages reusable behavior behind a clear name. The def statement defines it: def greet(): opens the function with a colon and an indented body. Defining does NOT run the body — only a call does.",
    "Calling greet() runs the body. Parameters are the names listed in the def (def greet(name) has one parameter); arguments are the actual values handed over at the call (greet(\"Panji\")). The number of arguments must match what the def expects, or Python raises a TypeError.",
    "return ends the call and hands a value back to the caller: result = add(3, 4) binds the returned value to result. A function without a return — or one that ends without reaching it — returns None. print() only displays text on screen; it does not produce a usable value for the caller.",
    "Variables assigned inside a function are local: they exist only during the call. That is what makes functions dependable — the same function can be called many times without disturbing the rest of the program, and one function may call another.",
  ],
  codeExamples: [
    { title: "Define once, call many times", language: "python", code: "def greet():\n    print(\"Hello\")\n\ngreet()\ngreet()", explanation: "The body runs once per call — Hello prints twice. Without the calls, nothing prints." },
    { title: "Parameters take arguments", language: "python", code: "def greet(name):\n    print(\"Hello\", name)\n\ngreet(\"Panji\")\ngreet(\"Arya\")", explanation: "name is the parameter; \"Panji\" and \"Arya\" are the arguments. One definition, many different calls." },
    { title: "return hands back a value", language: "python", code: "def add(a, b):\n    return a + b\n\nresult = add(3, 4)\nprint(result)", explanation: "add returns 7; the call becomes the value 7, which is bound to result." },
    { title: "print does not return", language: "python", code: "def show(a, b):\n    print(a + b)\n\nresult = show(3, 4)\nprint(result)", explanation: "show prints 7 as a side effect, but returns None — so result is None. Returning makes the value reusable." },
  ],
  keyTerms: [
    { term: "Function", definition: "A named, reusable block of behavior with optional inputs and an optional output." },
    { term: "def", definition: "The statement that defines a function; it opens the body but does not run it." },
    { term: "Call", definition: "Running a function by writing its name with parentheses, like greet()." },
    { term: "Parameter", definition: "A name in the def that receives an input, like name in def greet(name)." },
    { term: "Argument", definition: "The actual value handed to a function at the call, like \"Panji\" in greet(\"Panji\")." },
    { term: "return", definition: "Ends the call and hands a value back to the caller." },
    { term: "None", definition: "What a call evaluates to when the function has no return (or never reaches one)." },
    { term: "Local variable", definition: "A variable assigned inside a function; it exists only during that call." },
  ],
  commonMistakes: [
    { title: "Defining but never calling", explanation: "def greet(): only creates the function. Without a call like greet(), the body never runs and nothing happens." },
    { title: "Calling without parentheses", explanation: "greet is the function object; greet() runs it. Printing greet shows something like <function greet> instead of executing it." },
    { title: "Forgetting the colon", explanation: "The def line ends with : — the colon opens the indented body." },
    { title: "Mismatched parameter and argument count", explanation: "def greet(name) expects one argument. greet() or greet(\"A\", \"B\") raises a TypeError about missing or unexpected arguments." },
    { title: "Using print where a value should be returned", explanation: "print shows text but hands back None. When the result must be reused or stored, the function needs return." },
    { title: "Expecting a result from a function without return", explanation: "result = add(2, 3) with only print inside binds result to None — the sum was displayed, not returned." },
    { title: "Using a local variable outside the function", explanation: "Variables assigned inside a function exist only during the call. Using the name outside raises a NameError." },
  ],
  quickChecks: [
    { question: "What does this program print?", code: "def greet():\n    print(\"Hello\")", options: ["Hello", "Nothing", "greet", "Error"], answer: "Nothing", explanation: "The function is defined but never called — def creates it, a call runs it." },
    { question: "What is name in def greet(name):?", code: "greet(\"Panji\")", options: ["An argument", "A parameter", "A return value", "A local variable"], answer: "A parameter", explanation: "The name in the def is the parameter; \"Panji\" at the call site is the argument." },
    { question: "result = show(3, 4) where show only prints — what is result?", options: ["7", "5", "None", "Error"], answer: "None", explanation: "A function without return hands back None. The printed 7 was a side effect, not a value." },
  ],
};
