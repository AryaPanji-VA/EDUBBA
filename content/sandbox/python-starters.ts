export type PythonStarter = {
  id: "blank" | "variables" | "data-types" | "if-else" | "conditionals" | "loop" | "while" | "function" | "function-return";
  label: string;
  description: string;
  code: string;
};

export const pythonStarters: PythonStarter[] = [
  {
    id: "blank",
    label: "Blank",
    description: "Mulai dari halaman kosong.",
    code: "",
  },
  {
    id: "variables",
    label: "Variables",
    description: "Simpan dua value lalu print.",
    code: 'name = "Panji"\nage = 18\n\nprint(name)\nprint(age)',
  },
  {
    id: "data-types",
    label: "Data types",
    description: "Bandingkan angka dan teks yang terlihat sama.",
    code: 'number = 42\ntext = "42"\n\nprint(type(number))\nprint(type(text))',
  },
  {
    id: "if-else",
    label: "Simple if / else",
    description: "Coba satu keputusan tanpa input pengguna.",
    code: 'score = 78\n\nif score >= 75:\n    print("Lulus")\nelse:\n    print("Coba lagi")',
  },
  {
    id: "conditionals",
    label: "Conditionals",
    description: "Keputusan dari input dengan if / elif / else.",
    code: 'age = int(input("Umur kamu: "))\n\nif age >= 18:\n    print("Kamu sudah dewasa")\nelif age >= 13:\n    print("Kamu remaja")\nelse:\n    print("Kamu anak-anak")',
  },
  {
    id: "loop",
    label: "For loop",
    description: "Ulangi print lima kali dengan range.",
    code: "for i in range(1, 6):\n    print(i)",
  },
  {
    id: "while",
    label: "While loop",
    description: "Ulangi selama kondisinya masih True.",
    code: "count = 1\n\nwhile count <= 5:\n    print(count)\n    count += 1",
  },
  {
    id: "function",
    label: "Simple function",
    description: "Definisikan sapaan dengan parameter lalu panggil.",
    code: 'def greet(name):\n    print("Hello", name)\n\ngreet("Panji")',
  },
  {
    id: "function-return",
    label: "Parameters + return",
    description: "Kirim dua argument dan pakai nilai return.",
    code: "def add(a, b):\n    return a + b\n\nprint(add(3, 4))",
  },
];

export function getPythonStarter(id: string): PythonStarter | null {
  return pythonStarters.find((starter) => starter.id === id) ?? null;
}
