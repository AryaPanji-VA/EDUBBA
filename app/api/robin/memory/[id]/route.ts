import { deleteMemory, requireLocalMemory, memoryResponse, memoryFailure } from "@/lib/memory/server";

export const runtime = "nodejs";
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireLocalMemory(request);
    return memoryResponse(await deleteMemory((await params).id));
  } catch (error) { return memoryFailure(error); }
}
