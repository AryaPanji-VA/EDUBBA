import { listMemories, saveMemory, requireLocalMemory, memoryResponse, memoryFailure, MemoryError } from "@/lib/memory/server";
import { validateMemory } from "@/lib/memory/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try { requireLocalMemory(request); return memoryResponse({ memories: await listMemories() }); }
  catch (error) { return memoryFailure(error); }
}

export async function POST(request: Request) {
  try {
    requireLocalMemory(request);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
      throw new MemoryError("Kirim request sebagai JSON.", 415);
    }
    const reader = request.body?.getReader();
    if (!reader) throw new MemoryError("Request body kosong.", 400);
    let text = "";
    let size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_048) { await reader.cancel(); throw new MemoryError("Memory request terlalu panjang.", 413); }
      text += decoder.decode(value, { stream: true });
    }
    let body: unknown;
    try { body = JSON.parse(text + decoder.decode()); }
    catch { throw new MemoryError("JSON tidak valid.", 400); }
    const input = validateMemory(body);
    if (!input) throw new MemoryError("Pilih category, key, value, dan status yang didukung di ROBIN LAB.", 400);
    return memoryResponse(await saveMemory(input));
  } catch (error) { return memoryFailure(error); }
}
