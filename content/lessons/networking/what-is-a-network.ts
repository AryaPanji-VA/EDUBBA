import type { LessonContent } from "@/content/lessons/types";

export const whatIsANetworkLessonContent: LessonContent = {
  slug: "what-is-a-network",
  intuitiveExplanation: [
    "Dua laptop dengan satu kabel sudah jadi jaringan: dua perangkat yang bisa saling mengirim data. Internet adalah jaringan jaringan — miliaran perangkat yang tersambung lewat rangkaian tautan dan perantara.",
    "Istilah dasarnya sedikit: node (perangkat apa pun di jaringan — laptop, server, router), link (koneksi antar node — kabel, wifi, seluler), dan protokol (kesepakatan aturan bagaimana data dikirim dan diterima). Tanpa protokol, dua perangkat terhubung tetap tidak bisa bicara — kayak dua orang punya telepon tapi beda bahasa.",
    "Cara paling berguna membayangkan jaringan: sistem pos untuk bit. Ada alamat (kepada siapa), ada amplop/paket (isi yang dibungkus), ada aturan pengiriman (protokol), dan ada jalur (route) yang bisa berbeda-beda tiap pengiriman.",
  ],
  academicExplanation: [
    "A computer network is a set of nodes — computing devices — connected by links, able to exchange data. Nodes include end devices (laptops, phones, servers) and intermediaries (routers, switches) whose job is forwarding traffic toward its destination.",
    "Protocols are the agreed rules that make exchange possible: format of messages, order of exchanges, error handling, and addressing. Interoperability across vendors and decades exists because protocols are standardized specifications, not implementations.",
    "The Internet is a network of networks: independently operated networks interconnected through common protocols and agreed addressing. Its defining property is that no single operator owns or controls the whole — global reachability emerges from local agreements between networks.",
  ],
  codeExamples: [
    {
      title: "The postal metaphor, mapped",
      language: "text",
      code: "postal system              network\n------------------------   ------------------------\nrecipient's address   →   IP address (kepada siapa)\nletter inside envelope →  packet (data + header)\npostal rules          →   protocol (aturan kirim)\npossible routes       →   routing path (jalur)",
      explanation: "Address, envelope, rules, route: the four ideas that carry almost every networking concept you will meet.",
    },
    {
      title: "Two laptops are already a network",
      language: "text",
      code: "laptop A ── cable ── laptop B\n\nnodes:  A, B              (perangkat)\nlink:   the cable          (koneksi)\nneed:   same protocol      (kesepakatan aturan)\n\nConnected ≠ able to talk. Protocol does that.",
      explanation: "The physical connection is only the possibility of communication; the protocol is what makes it actual.",
    },
  ],
  keyTerms: [
    { term: "Node", definition: "Any device in the network: end device or intermediary like a router." },
    { term: "Link", definition: "A connection between nodes: cable, Wi-Fi, cellular." },
    { term: "Protocol", definition: "Agreed rules for how data is sent, received, and interpreted." },
    { term: "Internet", definition: "A network of networks, interconnected by common protocols and addressing." },
    { term: "Router", definition: "An intermediary node whose job is forwarding traffic toward its destination." },
  ],
  commonMistakes: [
    {
      title: "Confusing connection with communication",
      explanation: "A cable creates the possibility of talking; a shared protocol makes it happen. Two connected devices with different rules still cannot exchange data.",
    },
    {
      title: "Thinking the Internet is one network",
      explanation: "The Internet is many independently operated networks agreeing on common protocols. No single party owns it.",
    },
    {
      title: "Imagining a fixed path for data",
      explanation: "There is no reserved lane. Each packet can take a different route, and routes change as the network changes.",
    },
  ],
  quickChecks: [
    {
      question: "What does a protocol provide?",
      options: ["Agreed rules for sending and interpreting data", "The physical cable", "The electricity"],
      answer: "Agreed rules for sending and interpreting data",
      explanation: "Connection is hardware; protocol is agreement. Both are needed for actual communication.",
    },
    {
      question: "The Internet is best described as…",
      options: ["A network of networks with common protocols", "One giant computer", "A single company's network"],
      answer: "A network of networks with common protocols",
      explanation: "Independently operated networks interconnect through shared protocols and addressing — nobody owns the whole.",
    },
  ],
};
