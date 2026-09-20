import type { LessonContent } from "@/content/lessons/types";

export const tryExceptBasicsLessonContent: LessonContent = {
  slug: "try-except-basics",
  intuitiveExplanation: [
    "Lesson Understanding Errors udah ngajarin baca error terus benerin kesalahan di kode lu. Tapi ada failure yang bukan salah tulis kode — datanya yang nggak bisa diproses: int(\"hello\") nggak akan pernah jadi angka, sebagus apapun kode lu.",
    "try/except itu rencana cadangan. Baris berisiko lu taruh di dalam try, failure yang lu harapkan lu sebutin di except ValueError, dan fallback-nya jalan cuma pas kejadian. int(\"hello\") gagal → print fallback jalan, program lanjut normal.",
    "Yang penting: sebut nama errornya. except ValueError: cuma nangkep kegagalan yang lu antisipasi, jadi kesalahan lain kayak NameError tetep kelihatan. except: polos nelen semua — termasuk bug beneran.",
  ],
  academicExplanation: [
    "A try/except block handles one expected runtime failure: the risky line goes inside try, and the except clause names the failure it plans for — int(\"hello\") produces ValueError, so except ValueError: catches it and runs the fallback. After the fallback finishes, the program continues normally from the next line.",
    "Naming the error matters. except ValueError: handles only that expected failure; any other problem — a misspelled name, a broken indentation — still stops the program and stays visible. A bare except: catches everything, including real mistakes that should be fixed, which is why it is avoided at this level.",
    "This is different from Lesson 06. There, an error was a signal to read and fix a mistake in your source; here, the failure is expected at run time, and the handler turns it into a planned path of the program. The only error name used in this lesson is ValueError, produced when int() receives text it cannot parse.",
  ],
  codeExamples: [
    {
      title: "An unhandled failure stops the program",
      language: "python",
      code: "text = \"hello\"\nnumber = int(text)\n\noutput:\nValueError: invalid literal for int() with base 10: 'hello'",
      explanation: "int() can only parse text that looks like a number, and \"hello\" does not. With no handler, the failure stops the program right at that line — and the output names it: ValueError.",
    },
    {
      title: "try/except: the fallback runs",
      language: "python",
      code: "try:\n    number = int(\"hello\")\nexcept ValueError:\n    print(\"That is not a number\")\n\noutput:\nThat is not a number",
      explanation: "try wraps the risky line; except ValueError: names the one expected failure and runs the fallback when it happens. The crash becomes a handled situation.",
    },
    {
      title: "The program continues after the fallback",
      language: "python",
      code: "try:\n    number = int(\"hello\")\nexcept ValueError:\n    print(\"Please enter a number\")\nprint(\"done\")\n\noutput:\nPlease enter a number\ndone",
      explanation: "The fallback is not the end of the program: after except finishes, execution continues at the next line, so \"done\" prints too. Handling a failure keeps the program running.",
    },
    {
      title: "Success takes the normal path",
      language: "python",
      code: "text = \"7\"\ntry:\n    number = int(text)\n    print(number + 1)\nexcept ValueError:\n    print(\"Please enter a number\")\n\noutput:\n8",
      explanation: "When the text parses, the try block runs to the end and except never fires — int(\"7\") becomes 8, so number + 1 prints 8. The fallback exists only for the failure you expect.",
    },
  ],
  keyTerms: [
    { term: "Try", definition: "A block that wraps the risky line — the code that might fail at run time." },
    { term: "Except", definition: "The `except ValueError:` line names the one expected failure and runs its fallback only when that failure happens." },
    { term: "ValueError", definition: "The failure int() produces when text cannot be parsed into a number — the only error name in this lesson." },
    { term: "Fallback", definition: "The indented plan inside except — print a message so the failure is handled instead of crashing." },
    { term: "Handled failure", definition: "An expected runtime failure caught by except; the program continues after the fallback." },
    { term: "Bare except:", definition: "except: with no error named — catches everything, including real mistakes, so it stays avoided." },
  ],
  commonMistakes: [
    {
      title: "Writing a bare except:",
      explanation: "except: catches every failure, including real mistakes like a NameError. Name the expected ValueError instead so genuine bugs stay visible.",
    },
    {
      title: "Putting the conversion outside try",
      explanation: "except can only guard lines that sit inside the try block. number = int(text) written before try is not covered, and the failure still crashes the program.",
    },
    {
      title: "Naming the wrong error",
      explanation: "Unparsable text is a ValueError, not a NameError or a TypeError. Name the failure the risky line actually causes.",
    },
    {
      title: "Leaving the except block empty",
      explanation: "An except block needs an indented fallback line under it. With nothing there, the block itself is a syntax error — give it the fallback print.",
    },
    {
      title: "Using try/except to hide source mistakes",
      explanation: "Lesson 06's errors are read and fixed in your source. Try/except is for an expected runtime failure coming from the data — not a wrapper that hides mistakes you should fix.",
    },
  ],
  quickChecks: [
    {
      question: "text = \"hello\". What happens at number = int(text) with no try/except?",
      options: ["ValueError — the failure stops the program", "number becomes \"hello\" — assignment always works", "number becomes 0 — int() falls back to zero"],
      answer: "ValueError — the failure stops the program",
      explanation: "int() cannot parse \"hello\", so it produces ValueError — and with no handler, that failure stops the program at that line.",
    },
    {
      question: "A try/except ValueError fallback prints, and print(\"done\") follows. What prints when the conversion fails?",
      options: ["Both — the fallback message, then \"done\"", "Only the fallback message — the program stops there", "Only \"done\" — the fallback is skipped on failure"],
      answer: "Both — the fallback message, then \"done\"",
      explanation: "The fallback runs, and after except finishes the program continues at the next line — so \"done\" prints too.",
    },
    {
      question: "Why write except ValueError: instead of a bare except:?",
      options: ["Naming it handles only the expected failure — other mistakes stay visible", "A bare except is faster to type and safer", "except ValueError: also catches NameError"],
      answer: "Naming it handles only the expected failure — other mistakes stay visible",
      explanation: "except ValueError: guards exactly the expected conversion failure; anything unexpected still stops the program and stays visible instead of being swallowed.",
    },
  ],
};
