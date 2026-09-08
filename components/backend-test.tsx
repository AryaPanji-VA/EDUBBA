"use client";

import { useEffect, useRef, useState } from "react";
import { SignalBackground } from "@/components/signal-background";

type RequestState = "idle" | "requesting" | "success" | "error";
type DatabaseStatus = "checking" | "online" | "error";
type SignalState = "calm" | "active" | "error";

type RequestPanelProps = {
  number: string;
  title: string;
  endpoint: string;
  buttonLabel: string;
  requestingLabel: string;
  onStateChange: (state: RequestState) => void;
  onDatabaseResult?: (online: boolean) => void;
};

function RequestPanel({ number, title, endpoint, buttonLabel, requestingLabel, onStateChange, onDatabaseResult }: RequestPanelProps) {
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [responseData, setResponseData] = useState<Record<string, unknown> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function sendRequest() {
    const requestStartedAt = Date.now();
    setRequestState("requesting");
    onStateChange("requesting");
    setResponseData(null);
    setErrorMessage("");

    try {
      const response = await fetch(endpoint);
      const data = await response.json() as Record<string, unknown>;
      const remainingDisplayTime = 300 - (Date.now() - requestStartedAt);

      if (remainingDisplayTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDisplayTime));
      }

      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : `Backend returned ${response.status}`);
      }

      setResponseData(data);
      setRequestState("success");
      onStateChange("success");
      onDatabaseResult?.(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown request error");
      setRequestState("error");
      onStateChange("error");
      onDatabaseResult?.(false);
    }
  }

  return (
    <section className={`lab-panel backend-test state-${requestState}`}>
      <div className="lab-panel-head"><span>{number}</span><h2>{title}</h2></div>
      <div className="request-monitor"><div><span>REQUEST STATE</span><strong><i />{requestState}</strong></div><code>GET {endpoint}</code></div>
      <button className="button button-primary" onClick={() => void sendRequest()} disabled={requestState === "requesting"}>
        {requestState === "requesting" ? <><span className="typing-dots"><i /><i /><i /></span>{requestingLabel}</> : buttonLabel}
      </button>
      <div className="backend-response" aria-live="polite">
        {requestState === "idle" && <span>// response will appear here</span>}
        {requestState === "requesting" && <span>// waiting for JSON...</span>}
        {responseData && <pre>{JSON.stringify(responseData, null, 2)}</pre>}
        {requestState === "error" && <span className="response-error">// ERROR: {errorMessage}</span>}
      </div>
    </section>
  );
}

export function BackendTest({ aiConfigured = false }: { aiConfigured?: boolean }) {
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>("checking");
  const [signalState, setSignalState] = useState<SignalState>("calm");
  const [signalPulse, setSignalPulse] = useState(false);
  const signalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function checkDatabase() {
      try {
        const response = await fetch("/api/db-test");
        setDatabaseStatus(response.ok ? "online" : "error");
      } catch {
        setDatabaseStatus("error");
      }
    }

    void checkDatabase();
    return () => {
      if (signalTimer.current) clearTimeout(signalTimer.current);
    };
  }, []);

  function updateSignal(state: RequestState) {
    if (signalTimer.current) clearTimeout(signalTimer.current);
    setSignalPulse(state === "success");
    setSignalState(state === "error" ? "error" : state === "idle" ? "calm" : "active");

    if (state === "success") {
      signalTimer.current = setTimeout(() => {
        setSignalState("calm");
        setSignalPulse(false);
      }, 900);
    }
  }

  const statuses = [
    { label: "Frontend", value: "online", kind: "ok" },
    { label: "Backend", value: "online", kind: "ok" },
    { label: "Local data", value: "partial", kind: "dev" },
    { label: "Database", value: databaseStatus, kind: databaseStatus === "online" ? "ok" : databaseStatus === "checking" ? "dev" : "error" },
    { label: "AI", value: aiConfigured ? "configured" : "not configured", kind: aiConfigured ? "ok" : "off" },
    { label: "Auth", value: "not configured", kind: "off" },
  ];

  return (
    <>
      <SignalBackground intensity={signalState} pulse={signalPulse} />
      <div className="lab-grid">
        <section className="lab-panel"><div className="lab-panel-head"><span>01</span><h2>System status</h2></div><dl className="status-list">{statuses.map((status) => <div key={status.label}><dt>{status.label}</dt><dd className={`status-value ${status.kind}`}><i />{status.value}</dd></div>)}</dl></section>
        <div className="diagnostic-tests">
          <RequestPanel number="02" title="Backend test" endpoint="/api/hello" buttonLabel="ping backend" requestingLabel="requesting" onStateChange={updateSignal} />
          <RequestPanel number="03" title="Database test" endpoint="/api/db-test" buttonLabel="test database" requestingLabel="connecting" onStateChange={updateSignal} onDatabaseResult={(online) => setDatabaseStatus(online ? "online" : "error")} />
        </div>
      </div>
    </>
  );
}
