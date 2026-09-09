"use client";

import { useEffect, useRef, useState } from "react";
import { lessonCopy, type LessonLanguage } from "@/content/lessons/variables-localization";
import { parseQuizFeedbackResult, type QuizFeedbackResult } from "@/lib/robin/quiz-feedback";

type Props = {
  activityId: string;
  language: LessonLanguage;
  sourceMode: boolean;
  submitted: boolean;
  learnerAnswer: string;
};

export function SmartFeedback({ activityId, language, sourceMode, submitted, learnerAnswer }: Props) {
  const copy = lessonCopy[language];
  const [result, setResult] = useState<QuizFeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!submitted || sourceMode) {
      controller.current?.abort();
      controller.current = null;
      setLoading(false);
      setResult(null);
      return;
    }
    const requestController = new AbortController();
    controller.current = requestController;
    const timeout = window.setTimeout(() => requestController.abort(), 35_000);
    setLoading(true);
    setResult(null);
    fetch("/api/robin/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: requestController.signal,
      body: JSON.stringify({ activityId, lessonSlug: "variables", language, learnerAnswer }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("unavailable");
        return response.json();
      })
      .then((data) => {
        if (controller.current !== requestController) return;
        const parsed = parseQuizFeedbackResult(JSON.stringify(data.result), false);
        setResult(parsed);
      })
      .catch(() => { if (controller.current === requestController) setResult(null); })
      .finally(() => {
        window.clearTimeout(timeout);
        if (controller.current === requestController) { controller.current = null; setLoading(false); }
      });
    return () => { requestController.abort(); };
  }, [activityId, language, sourceMode, submitted, learnerAnswer]);

  if (sourceMode || !submitted) return null;
  if (loading) return <p className="panel-footnote" role="status"><span className="typing-dots"><i /><i /><i /></span> {copy.feedbackLoading}</p>;
  if (!result) return null;

  return <div className="mock-feedback" role="status">
    <strong>{copy.feedbackReady}</strong> <span>{result.feedback}</span>
    {result.followUp && <div className="quick-follow-up">
      <p><strong>{copy.followUpLabel}</strong> {result.followUp.prompt}</p>
      <div className="code-block"><div className="code-head"><span>python</span></div><pre><code>{result.followUp.code}</code></pre></div>
      <div className="answer-options">{result.followUp.options.map((option) => <button key={option} type="button" disabled>{option}</button>)}</div>
      <p className="panel-footnote">{copy.followUpNote}</p>
    </div>}
    <p className="panel-footnote">{copy.feedbackNote}</p>
  </div>;
}
