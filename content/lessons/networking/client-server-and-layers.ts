import type { LessonContent } from "@/content/lessons/types";

export const clientServerAndLayersLessonContent: LessonContent = {
  slug: "client-server-and-layers",
  intuitiveExplanation: [
    "Buka Instagram: ponsel lu adalah client — yang meminta. Server di tempat lain — yang menjawab. Pola dasar seluruh web cuma itu: request dan response. Client minta (“kirim feed-ku”), server proses dan jawab.",
    "Alamatnya adalah URL, dan di dalamnya tersembunyi alamat IP — nomor yang mengidentifikasi perangkat di jaringan, seperti nomor rumah. DNS adalah buku teleponnya: ubah nama yang mudah diingat (instagram.com) jadi nomor yang bisa dirutekan.",
    "Dan semua ini bekerja berlapis-lapis, kayak mengirim paket lewat ekspedisi: lu cuma tulis surat (aplikasi); ekspedisinya yang urus amplop, rute, dan kendaraan. Tiap lapisan cuma bicara dengan lapisan tetangganya — itulah kenapa aplikasi bisa berubah tanpa menulis ulang jaringan.",
  ],
  academicExplanation: [
    "The client-server model divides roles: clients initiate requests; servers await them, process, and respond. A browser fetching a page, an app loading a feed, and mail clients retrieving messages are all client-server interactions. The pattern's power is centralization of service: many clients, one (or a farm of) server(s), coordinating through a defined protocol.",
    "Addressing makes delivery possible: an IP address identifies a network interface, and the Domain Name System (DNS) translates human-readable names into IP addresses — a lookup before almost every connection.",
    "Layering organizes the whole stack: each layer provides services to the layer above and uses the layer below, communicating through defined interfaces. Application protocols (HTTP) ride on transport (TCP) which rides on internetworking (IP) which rides on physical links. The separation of concerns lets each layer evolve independently — new applications require no changes to routing, and new link technologies require no changes to applications.",
  ],
  codeExamples: [
    {
      title: "One request, one response",
      language: "text",
      code: "CLIENT (browser)                    SERVER\n     │ GET /feed        ───────────▶ │\n     │                  (process)   │\n     │ ◀─────────── 200 OK + data   │\n\nThe whole web is this, repeated.",
      explanation: "Clients initiate; servers respond. Every protocol detail is elaboration on this request-response spine.",
    },
    {
      title: "The stack, as shipping",
      language: "text",
      code: "YOU (application)     write the letter       — HTTP\nEXPEDITION HQ (transport)  tracking, resend  — TCP\nPOSTAL SYSTEM (network)    address, route    — IP\nROADS (link)               the actual wire   — Ethernet/Wi-Fi\n\nEach layer talks only to its neighbors.",
      explanation: "Layering is separation of concerns: you write letters without knowing roads; roads carry traffic without reading letters.",
    },
  ],
  keyTerms: [
    { term: "Client", definition: "The side that initiates a request." },
    { term: "Server", definition: "The side that awaits requests, processes them, and responds." },
    { term: "IP address", definition: "A network-locatable identifier assigned to a device's interface." },
    { term: "DNS", definition: "The system translating human-readable names into IP addresses." },
    { term: "Layering", definition: "Organizing the stack so each layer serves the one above and uses the one below, through defined interfaces." },
  ],
  commonMistakes: [
    {
      title: "Thinking the server initiates",
      explanation: "Servers wait. The conversation starts with the client's request — always. Push notifications are clever arrangements on top, not exceptions.",
    },
    {
      title: "Confusing DNS with the server",
      explanation: "DNS is the phone book lookup before the call — it finds the address, then the client connects to the server itself.",
    },
    {
      title: "Imagining one giant program",
      explanation: "The stack is layers, not a monolith. HTTP does not route, IP does not deliver applications — each layer does one job.",
    },
  ],
  quickChecks: [
    {
      question: "Who initiates a web interaction?",
      options: ["The client — servers wait for requests", "The server pushes pages unprompted", "The router decides"],
      answer: "The client — servers wait for requests",
      explanation: "Request first, response second: the client-server conversation always starts with the client.",
    },
    {
      question: "What does DNS do?",
      options: ["Translates names like example.com into IP addresses", "Stores web pages", "Encrypts traffic"],
      answer: "Translates names like example.com into IP addresses",
      explanation: "DNS is the lookup before the connection: name in, routable address out.",
    },
  ],
};
