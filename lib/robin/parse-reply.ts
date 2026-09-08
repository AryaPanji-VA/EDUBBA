type ParsedReply = { reply: string; grounding: "grounded" | "general" };

export function parseRobinReply(content: string): ParsedReply {
  const text = content.trim();
  if (!text) throw new Error("Empty Robin reply.");

  // Some compatible models wrap their JSON in a Markdown code fence.
  const candidate = text.replace(/^\x60{3}(?:json)?\s*\n?([\s\S]*?)\n?\x60{3}$/i, "$1").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    // Useful plain text is still displayable, but cannot claim lesson grounding.
    return { reply: text.slice(0, 3000), grounding: "general" };
  }
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const { reply, grounding } = parsed as Record<string, unknown>;
    if (typeof reply === "string" && reply.trim()) {
      const trimmedReply = reply.trim();
      return {
        reply: trimmedReply.slice(0, 3000),
        grounding: grounding === "grounded" && trimmedReply.length <= 3000 ? "grounded" : "general",
      };
    }
  }
  // A valid JSON value without an answer is malformed, not useful prose.
  if (typeof parsed === "string" && parsed.trim()) {
    return { reply: parsed.trim().slice(0, 3000), grounding: "general" };
  }
  throw new Error("Missing Robin reply.");
}
