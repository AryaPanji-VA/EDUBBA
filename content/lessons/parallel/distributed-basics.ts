import type { LessonContent } from "@/content/lessons/types";

export const distributedBasicsLessonContent: LessonContent = {
  slug: "distributed-basics",
  intuitiveExplanation: [
    "Satu laptop dipinjam teman: masih bisa kerja, cuma lebih lambat. Server pusat mati: seluruh kampus offline. Itulah bedanya sistem terdistribusi dan terpusat — di sistem terdistribusi, beberapa komputer bekerja bersama sebagai satu sistem, dan kerusakan salah satunya seharusnya bukan akhir dunia.",
    "Keuntungannya dua: performa (kerja dibagi banyak mesin) dan ketahanan (kalau satu mati, yang lain masih hidup — tidak ada satu titik kegagalan). Harganya: koordinasi. Mesin-mesin itu tidak berbagi otak; mereka saling kirim pesan, dan pesan bisa terlambat, hilang, atau datang dua kali.",
    "Bayangkan tim yang bekerja dari rumah masing-masing: semua orang bisa produktif, tapi semua masalah baru juga muncul — siapa yang pegang versi terbaru? bagaimana kalau dua orang mengubah data yang sama? Kalau pesan di grup terbaca, apakah artinya diproses?",
  ],
  academicExplanation: [
    "A distributed system is a collection of independent computers that appears to its users as a single coherent system. The machines do not share memory or clock; they coordinate exclusively by passing messages over a network.",
    "The motivations are performance (work divided across machines) and fault tolerance (no single point of failure, if replication is designed in). The costs arise from distribution itself: messages experience latency, can be lost, reordered, or duplicated; machines can crash and recover at any time; and there is no single source of truth for \"now\" — clocks on different machines drift apart.",
    "Two consequences define the field. First, failure becomes partial: in a single machine, a crash stops everything; in a distributed system, one component failing while others continue is the normal case, and the system must detect and contain it. Second, shared state becomes a coordination problem: updating the same data from multiple machines requires agreement protocols, which is why replicated state and consistency are the discipline's central topics.",
  ],
  codeExamples: [
    {
      title: "Centralized vs distributed, visually",
      language: "text",
      code: "CENTRALIZED:   all clients → one server\n               server dies → everyone is offline\n\nDISTRIBUTED:   clients → several servers, replicated data\n               one dies → others keep answering\n\nPrice: messages, coordination, partial failures.",
      explanation: "Distribution buys survivability and scale, and pays with coordination: the messages between machines become part of the system's behavior — and its failure modes.",
    },
    {
      title: "Partial failure",
      language: "text",
      code: "Checkout flow:  cart service ✓  payment service ✗  mail service ✓\n\nSingle-machine thinking: everything fails together.\nDistributed reality: some parts work, some don't.\nDesign question: what does the system do now?",
      explanation: "Partial failure is the defining distributed problem: the system is neither fully up nor fully down, and every design must decide how each piece degrades.",
    },
  ],
  keyTerms: [
    { term: "Distributed system", definition: "Independent computers coordinating via messages, appearing as one coherent system." },
    { term: "Message passing", definition: "The only way distributed components communicate; subject to latency, loss, duplication." },
    { term: "Partial failure", definition: "Some components failing while others continue — the normal failure mode of distributed systems." },
    { term: "Single point of failure", definition: "A component whose death stops the whole system; what distribution can eliminate." },
    { term: "Fault tolerance", definition: "The ability to keep operating, possibly degraded, when components fail." },
  ],
  commonMistakes: [
    {
      title: "Assuming the network is reliable",
      explanation: "Messages get lost, delayed, and duplicated. A design that only works when every message arrives is a design that will fail on a real network.",
    },
    {
      title: "Believing all machines share one clock",
      explanation: "Machine clocks drift. \"Save at 10:00\" on two machines can mean different moments. Ordering events across machines needs protocol, not timestamps alone.",
    },
    {
      title: "Treating distributed as automatically faster",
      explanation: "Distribution adds coordination overhead. Without independent work to divide, a distributed version can be slower than a single good machine.",
    },
  ],
  quickChecks: [
    {
      question: "What is the defining communication mechanism of a distributed system?",
      options: ["Passing messages over a network", "Sharing one memory", "Sharing one clock"],
      answer: "Passing messages over a network",
      explanation: "No shared memory, no shared clock — messages are the only coordination channel, and their imperfections shape every design.",
    },
    {
      question: "One of five servers crashes; the others keep serving. This is called…",
      options: ["Partial failure — the normal distributed case", "Total failure", "A network partition"],
      answer: "Partial failure — the normal distributed case",
      explanation: "Some components dead, some alive: distributed systems are designed around containing exactly this situation.",
    },
  ],
};
