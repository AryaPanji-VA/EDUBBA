export type ChatMessage = { role: "user" | "assistant"; content: string };
export type RobinState = "idle" | "thinking" | "success" | "error";
export type RobinReply = {
  reply: string;
  grounding: { status: "grounded" | "general"; lesson: "variables" };
  sourceCount: number;
};
