"use client";

import { useEffect, useRef, useState } from "react";
import type { PracticeAssistAction, PracticeAssistHintStage, PracticeAssistMode } from "@/lib/practice/assistance";
import { getActiveLessonLanguage } from "@/lib/robin/locale";
import { useUiCopy } from "@/lib/i18n/language-provider";

// Compact contextual Robin assistance for all Practice modes (Phase 11B.4).
// Not a chat window: one click sends one minimal, task-specific payload and
// renders one response. Deterministic Practice flow is never blocked here.

export type PracticeAssistPayload = {
  exerciseId?: string;
  activityId?: string;
  learnerAnswer?: string;
  submission?: string;
  sandboxCode?: string;
  sandboxError?: string;
};

export type PracticeAssistActionConfig = {
  action: PracticeAssistAction;
  label: string;
  disabled?: boolean;
};

type AssistState = "idle" | "loading" | "success" | "error";

type Props = {
  mode: PracticeAssistMode;
  payload: PracticeAssistPayload;
  actions: PracticeAssistActionConfig[];
  resetKey: string;
  note?: string;
};

export function PracticeAssist({ mode, payload, actions, resetKey, note }: Props) {
  const copy = useUiCopy();
  const [state, setState] = useState<AssistState>("idle");
  const [reply, setReply] = useState<string | null>(null);
  const [replyAction, setReplyAction] = useState<PracticeAssistAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hintStage, setHintStage] = useState<PracticeAssistHintStage>(1);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  // A new exercise/activity/code target starts the panel over.
  useEffect(() => {
    controller.current?.abort();
    controller.current = null;
    setState("idle");
    setReply(null);
    setReplyAction(null);
    setError(null);
    setHintStage(1);
  }, [resetKey]);

  async function run(action: PracticeAssistAction) {
    if (controller.current) return;
    const requestController = new AbortController();
    controller.current = requestController;
    setState("loading");
    setError(null);
    const stage = action === "hint" ? hintStage : undefined;
    const timeout = window.setTimeout(() => requestController.abort(), 45_000);
    try {
      const response = await fetch("/api/practice/robin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, action, ...payload, hintStage: stage, language: getActiveLessonLanguage() }),
        signal: requestController.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error(typeof data.error === "string" ? data.error : copy["robin.errorGeneric"]);
      }
      if (controller.current !== requestController) return;
      setReply(data.reply as string);
      setReplyAction(action);
      if (action === "hint") setHintStage(2);
      setState("success");
    } catch (failure) {
      if (controller.current !== requestController) return;
      setError(requestController.signal.aborted
        ? copy["assist.errorTimeout"]
        : failure instanceof Error ? failure.message : copy["assist.errorOffline"]);
      setState("error");
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === requestController) controller.current = null;
    }
  }

  return (
    <div className="practice-assist" role="region" aria-label={copy["assist.aria"]}>
      <span className="message-label">ROBIN // PRACTICE</span>
      <div className="practice-assist-actions">
        {actions.map(({ action, label, disabled }) =>
          <button
            key={action}
            type="button"
            className="practice-ghost"
            disabled={disabled || state === "loading"}
            onClick={() => void run(action)}
          >{action === "hint" && replyAction === "hint" && state === "success" ? copy["assist.moreHelp"] : label}</button>)}
      </div>
      {state === "loading" && <p className="practice-assist-state" role="status"><span className="typing-dots"><i /><i /><i /></span>{copy["assist.thinking"]}</p>}
      {state === "success" && reply && <p className="practice-assist-reply">{reply}</p>}
      {state === "error" && error && <p className="practice-assist-error" role="alert">{error}</p>}
      {note && <p className="panel-footnote">{note}</p>}
    </div>
  );
}
