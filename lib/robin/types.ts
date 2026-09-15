export type ChatMessage = { role: "user" | "assistant"; content: string };
export type RobinState = "idle" | "thinking" | "success" | "error";

export type LogPreview = {
  courseSlug: string;
  lessonSlug: string;
  summary: string;
  conceptsLearned: string[];
  weakConcepts: string[];
  nextStep: string | null;
};

export type RobinReply = {
  memoryAction?: import("@/lib/memory/types").MemoryAction;
  logPreview?: LogPreview;
  reply: string;
  grounding: { status: "grounded" | "general"; lesson: string };
  sourceCount: number;
};
