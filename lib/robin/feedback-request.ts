import { type QuizFeedbackRequest, type QuizFeedbackResult } from "./quiz-feedback";

// One effect lifetime. Defer dispatch so Strict Mode's setup/cleanup replay
// cannot mark an aborted, never-started request as an already-sent attempt.
export function startFeedbackRequest(
  input: QuizFeedbackRequest,
  lastAttempt: { current: string },
  onResult: (result: QuizFeedbackResult | null) => void,
  onLoading: (loading: boolean) => void,
) {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  void Promise.resolve().then(async () => {
    if (disposed || lastAttempt.current === input.attemptId) return;
    lastAttempt.current = input.attemptId;
    onLoading(true);
    onResult(null);
    timeout = setTimeout(() => controller.abort(), 35_000);
    try {
      const response = await fetch("/api/robin/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: controller.signal, body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("unavailable");
      const data = await response.json();
      // Trust the server-validated result; the server already parsed with the lesson's vocabulary.
      if (!disposed) onResult(data.result as QuizFeedbackResult);
    } catch {
      if (!disposed) onResult(null);
    } finally {
      clearTimeout(timeout);
      if (!disposed) onLoading(false);
    }
  });
  return () => {
    disposed = true;
    clearTimeout(timeout);
    controller.abort();
  };
}
