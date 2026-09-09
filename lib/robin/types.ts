export type ChatMessage = { role: "user" | "assistant"; content: string };
export type RobinState = "idle" | "thinking" | "success" | "error";
export type RobinReply = {
  memoryAction?: import("@/lib/memory/types").MemoryAction;
  reply: string;
  grounding: { status: "grounded" | "general"; lesson: "variables" };
  sourceCount: number;
};
