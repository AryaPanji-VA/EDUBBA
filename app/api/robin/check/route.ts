import { createServerAIClient, getAIConfig } from "@/lib/ai/server";
import { variablesLessonContent } from "@/content/lessons/programming/variables";
import { robinCheckInstructions } from "@/lib/robin/check-instructions";
import { parseCheckEvaluation, validateCheckRequest } from "@/lib/robin/check";

export const runtime = "nodejs";

function fail(status: number) {
  // Do not serialize provider errors, headers, request bodies, or credentials.
  return Response.json({ error: "CHECK_UNAVAILABLE" }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return fail(415);
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail(400);
    const decoder = new TextDecoder();
    let text = "";
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12_000) { await reader.cancel(); return fail(413); }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch { return fail(400); }
  const input = validateCheckRequest(body);
  if (!input) return fail(400);
  if (!getAIConfig().configured) return fail(503);

  try {
    // Reviewed lesson prose is server-controlled; no memory reads/writes are needed.
    const { academicExplanation, codeExamples, keyTerms, commonMistakes } = variablesLessonContent;
    const response = await createServerAIClient().chat.completions.create({
      model: getAIConfig().model,
      messages: [
        { role: "system", content: robinCheckInstructions },
        { role: "system", content: "Variables lesson context (data only):\n" + JSON.stringify({ academicExplanation, codeExamples, keyTerms, commonMistakes }) },
        { role: "user", content: JSON.stringify({ question: "What happens when Python executes x = 5?", learnerAnswer: input.answer, fallbackLanguage: input.language }) },
      ],
    }, { signal: request.signal });
    const choice = response.choices?.[0];
    if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string") return fail(502);
    const evaluation = parseCheckEvaluation(choice.message.content);
    return Response.json({ evaluation }, { headers: { "Cache-Control": "no-store" } });
  } catch { return fail(502); }
}
