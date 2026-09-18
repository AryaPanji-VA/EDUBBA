import type { LessonContent } from "@/content/lessons/types";

export const packetsAndProtocolsLessonContent: LessonContent = {
  slug: "packets-and-protocols",
  intuitiveExplanation: [
    "Mengirim satu file 50 MB sekaligus itu seperti memindah rumah pakai satu truk raksasa: kalau truknya tersangkut, semua ikut macet. Jaringan memilih cara lain: file dipecah jadi paket-paket kecil, masing-masing bernomor dan beralamat, dikirim lewat jalur yang bisa berbeda-beda, lalu dirakit ulang di tujuan.",
    "Tiap paket punya dua bagian: header (amplop — alamat pengirim, penerima, nomor urut) dan payload (isi — potongan datanya). Karena bernomor urut, paket yang datang tidak berurutan tetap bisa disusun ulang dengan benar.",
    "Kalau ada paket hilang? Tidak semua hancur — cukup paket itu yang dikirim ulang. Itulah keuntungan terbesarnya: kegagalan jadi kecil dan lokal, bukan besar dan total.",
  ],
  academicExplanation: [
    "Packet switching divides data into discrete units — packets — each independently routed toward the destination. Each packet carries a header (source and destination addresses, sequence information, protocol identifiers) and a payload (a fragment of the application data).",
    "Because each packet is routed independently, packets from the same transfer can traverse different paths and arrive out of order; sequence numbers at the destination enable reassembly. This contrasts with circuit switching, which reserves a dedicated path for the whole conversation.",
    "Protocols define the rules at each step: how packets are addressed and forwarded (IP), how loss and ordering are recovered end to end (TCP), and how applications format their messages (HTTP and others). Reliability is not a property of the wire — links lose packets routinely — but a property that higher protocols construct on top, via acknowledgments, sequence numbers, and retransmission.",
  ],
  codeExamples: [
    {
      title: "One file, many numbered envelopes",
      language: "text",
      code: "photo.jpg (5 MB) → 3,500 packets\n\n[hdr: to B, from A, #1][data] [hdr: to B, #2][data] ...\n\nsent:  #1 #2 #3 ... #3500\narrived: #1 #3 #2 ...    (out of order — fine)\nreassembled at B by sequence number",
      explanation: "Sequence numbers make out-of-order arrival harmless: the destination reassembles by number, not by arrival time.",
    },
    {
      title: "Loss is local",
      language: "text",
      code: "3,500 packets in flight.\nPacket #417 is lost.\n\nCircuit mindset: the transfer failed.\nPacket mindset:  #417 is retransmitted.\nThe other 3,499 keep moving.",
      explanation: "Independence localizes failure: one lost packet costs one retransmission, not the whole transfer. This is the core resilience property of packet switching.",
    },
  ],
  keyTerms: [
    { term: "Packet", definition: "An independently routed unit of data: header plus payload." },
    { term: "Header", definition: "The envelope part of a packet: addresses, sequence number, protocol identifiers." },
    { term: "Payload", definition: "The actual data fragment carried inside the packet." },
    { term: "Packet switching", definition: "Routing each packet independently, instead of reserving a fixed circuit." },
    { term: "Reassembly", definition: "Rebuilding the original data at the destination using sequence numbers." },
  ],
  commonMistakes: [
    {
      title: "Imagining a reserved lane",
      explanation: "No path is reserved for your transfer. Each packet finds its own way, sharing links with everyone else's packets.",
    },
    {
      title: "Expecting order on arrival",
      explanation: "Different routes mean different delays: packets routinely arrive out of order. Sequence numbers, not arrival order, define the message.",
    },
    {
      title: "Assuming the wire is lossless",
      explanation: "Loss is normal on real networks. Reliability is constructed above the wire by protocols that detect loss and retransmit.",
    },
  ],
  quickChecks: [
    {
      question: "Why do packets carry sequence numbers?",
      options: ["So the destination can reassemble data regardless of arrival order", "To make packets arrive in order", "To encrypt the payload"],
      answer: "So the destination can reassemble data regardless of arrival order",
      explanation: "Independent routing means arbitrary arrival order; sequence numbers restore the original sequence at reassembly.",
    },
    {
      question: "One packet out of thousands is lost. In packet switching, the cost is…",
      options: ["Retransmitting that one packet", "Restarting the whole transfer", "Rebuilding the connection from scratch"],
      answer: "Retransmitting that one packet",
      explanation: "Failure is local: independence is what makes packet-switched networks resilient.",
    },
  ],
};
