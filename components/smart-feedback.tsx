"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { type LessonLanguage } from "@/content/lessons/shared-copy";
import { type QuizFeedbackResult } from "@/lib/robin/quiz-feedback";
import { startFeedbackRequest } from "@/lib/robin/feedback-request";

type Props = {
  activityId: string;
  lessonSlug: string;
  language: LessonLanguage;
  copy: Record<string, string>;
  sourceMode: boolean;
  submitted: boolean;
  learnerAnswer: string;
  attemptId: string;
};

export function SmartFeedback({ activityId, lessonSlug, language, copy, sourceMode, submitted, learnerAnswer, attemptId }: Props) {
  const [result, setResult] = useState<QuizFeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const lastFetch = useRef<string>("");
  // Read submission content without treating a language change as a new attempt.
  const startRequest = useEffectEvent(() => startFeedbackRequest(
    { activityId, lessonSlug, language, learnerAnswer, attemptId },
    lastFetch, setResult, setLoading,
  ));

  // Fetch feedback only on a new submission attempt, not on language toggle or rerender.
  useEffect(() => {
    if (!submitted) { setLoading(false); setResult(null); return; }
    if (sourceMode) { setLoading(false); return; }
    if (!attemptId) return;
    return startRequest();
  }, [submitted, sourceMode, attemptId]);

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
