import type { LessonContent } from "@/content/lessons/types";

export const dataTypesLessonContent: LessonContent = {
  slug: "data-types",
  intuitiveExplanation: [
    "Setiap value di Python punya tipe. Angka bulat, angka desimal, teks, dan benar/salah itu semua tipe yang berbeda. Program memperlakukan mereka secara berbeda.",
    "Misalnya: 20 itu integer, 172.5 itu float, \"Arya\" itu string, dan True itu boolean. Tipe menentukan operasi apa yang masuk akal untuk value itu.",
    "Salah satu jebakan paling umum: \"42\" (string) dan 42 (integer) kelihatannya mirip, tapi Python memperlakukan mereka sangat berbeda. Tipe itu bukan kosmetik — itu menentukan perilaku.",
  ],
  academicExplanation: [
    "A value's type determines how the programming language interprets and operates on that value. Python is dynamically typed: values have types, and a name can be rebound to values of different types.",
    "The built-in types int, float, str, and bool represent integers, floating-point numbers, text, and truth values respectively. A string like \"42\" is text, not a number: the quotes make its type different even when the characters look the same.",
    "The type() function returns the type of a value, allowing quick inspection. For now, reading a value's shape — quotes, a decimal point, True or False — is enough to name its type.",
  ],
  codeExamples: [
    { title: "Four basic types", language: "python", code: "age = 20          # int\nheight = 172.5   # float\nname = \"Arya\"     # str\nis_student = True # bool", explanation: "Each value has a distinct type: integer, float, string, and boolean." },
    { title: "Same characters, different types", language: "python", code: "score = 100    # int\ncode = \"100\"   # str\nprint(score)   # 100\nprint(code)    # 100", explanation: "Both print the same characters, yet score is an int and code is a str — the printed output can look identical while the types differ." },
    { title: "Type inspection", language: "python", code: "type(42)        # <class 'int'>\ntype(\"42\")       # <class 'str'>\ntype(True)       # <class 'bool'>\ntype(3.14)       # <class 'float'>", explanation: "type() reveals what kind of value you are working with." },
    { title: "Reading the shape", language: "python", code: "20        # int\n172.5     # float\n\"Arya\"    # str\nTrue      # bool", explanation: "The shape names the type: digits without a decimal point are int, a decimal point makes float, quotes make str, and True or False is bool." },
  ],
  keyTerms: [
    { term: "Type", definition: "The category of a value that determines how the program interprets it." },
    { term: "int", definition: "Python's integer type for whole numbers like 7, 42, or -3." },
    { term: "float", definition: "Python's type for numbers with a decimal point like 3.14 or -0.5." },
    { term: "str", definition: "Python's string type for text, written in quotes like \"hello\"." },
    { term: "bool", definition: "Python's boolean type for truth values: True or False." },
    { term: "type()", definition: "A built-in function that returns the type of a value." },
  ],
  commonMistakes: [
    { title: "Confusing \"42\" with 42", explanation: "\"42\" is a string (text). 42 is an integer (number). They look similar but cannot be used interchangeably." },
    { title: "Treating True as text", explanation: "True is a boolean, not a string. \"True\" with quotes is text that happens to spell a boolean." },
    { title: "Reading the type from the output alone", explanation: "print(100) and print(\"100\") show the same characters. The type can differ even when the printed text matches — check the quotes in the code, not the output." },
  ],
  quickChecks: [
    { question: "What is the type of 3.14?", code: "type(3.14)", options: ["int", "float", "str", "bool"], answer: "float", explanation: "Numbers with a decimal point are floats." },
    { question: "Which value is a string?", options: ["42", "\"42\"", "True", "3.14"], answer: "\"42\"", explanation: "Quotes make it text, not a number." },
    { question: "What does type(True) return?", options: ["int", "str", "bool", "float"], answer: "bool", explanation: "True and False are boolean values." },
  ],
};
