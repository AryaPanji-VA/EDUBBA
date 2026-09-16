export type PythonStarter = {
  id: "blank" | "variables" | "if-else" | "loop" | "function";
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
    id: "if-else",
    label: "If / Else",
    description: "Coba keputusan sederhana.",
    code: 'score = 78\n\nif score >= 75:\n    print("Lulus")\nelse:\n    print("Coba lagi")',
  },
  {
    id: "loop",
    label: "Loop",
    description: "Ulangi print lima kali.",
    code: "for i in range(5):\n    print(i)",
  },
  {
    id: "function",
    label: "Function",
    description: "Buat lalu panggil function kecil.",
    code: 'def greet(name):\n    return "Halo, " + name\n\nprint(greet("Arya"))',
  },
];

export function getPythonStarter(id: string): PythonStarter | null {
  return pythonStarters.find((starter) => starter.id === id) ?? null;
}

