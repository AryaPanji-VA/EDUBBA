"use client";

import { useEffect, useState } from "react";
import { memoryOptions, type Memory, type MemoryKey } from "@/lib/memory/types";

export function RobinMemory() {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [key, setKey] = useState<MemoryKey>("explanation_style");
  const [value, setValue] = useState<string>("analogy-first");

  async function refresh(signal?: AbortSignal) {
    const response = await fetch("/api/robin/memory", { cache: "no-store", signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Memory belum bisa dimuat.");
    setMemories(data.memories);
  }
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    refresh(controller.signal).catch(() => {
      if (!controller.signal.aborted) setError("Memory belum tersedia. Periksa SUPABASE_SECRET_KEY (atau legacy SUPABASE_SERVICE_ROLE_KEY), SQL Phase 7, dan gunakan server development lokal.");
    }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, []);

  async function run(action: "refresh" | "save" | "delete", memory?: Memory) {
    if (busy) return;
    if (action === "delete" && (!memory || !window.confirm(`Hapus hanya ${memory.key} = ${memory.value}?`))) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (action !== "refresh") {
        const response = await fetch(action === "delete" ? `/api/robin/memory/${memory!.id}` : "/api/robin/memory", {
          method: action === "delete" ? "DELETE" : "POST",
          ...(action === "save" ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            category: memoryOptions[key].category, key, value,
            status: memoryOptions[key].category === "learning" ? value : null,
          }) } : {}),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Memory belum bisa diubah.");
        setNotice(`MEMORY ${data.memoryAction.type.toUpperCase()}`);
      }
      await refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Memory belum tersedia.");
    } finally { setBusy(false); }
  }

  return <section className="lab-panel lab-wide" aria-busy={busy}>
    <div className="lab-panel-head"><span>07</span><h2>ROBIN MEMORY</h2></div>
    <dl className="status-list">
      <div><dt>Memory mode</dt><dd>PERSISTENT V1</dd></div>
      <div><dt>Scope</dt><dd>SINGLE USER · LOCAL DEVELOPMENT ONLY</dd></div>
      <div><dt>Stored memories</dt><dd>{busy ? "Loading…" : memories?.length ?? "Unavailable — setup required"}</dd></div>
    </dl>
    <p className="lab-panel-note">Memory v1 assumes one personal ROBIN user. Belum aman untuk deployment publik: authentication dan authorization per-user wajib ditambahkan dulu.</p>
    {error && <p className="robin-error" role="alert">{error}</p>}
    {notice && <p className="lab-panel-note" role="status">{notice}</p>}
    <button className="button" disabled={busy} onClick={() => void run("refresh")}>refresh memories</button>
    {memories?.length === 0 && <p className="lab-panel-note">Belum ada memory. Nggak ada percakapan yang disimpan otomatis.</p>}
    {memories?.map((memory) => <div className="endpoint-row" key={memory.id}>
      <code>{memory.category} / {memory.key}</code>
      <span>{memory.value} · status: {memory.status ?? "—"} · updated: {new Date(memory.updated_at).toLocaleString()}</span>
      <div className="companion-actions">
        <button disabled={busy} onClick={() => { setKey(memory.key); setValue(memory.value); }}>edit</button>
        <button disabled={busy} onClick={() => void run("delete", memory)}>delete {memory.key}</button>
      </div>
    </div>)}
    <form className="robin-ask" onSubmit={(event) => { event.preventDefault(); void run("save"); }}>
      <label htmlFor="memory-key">Create / update one memory</label>
      <select id="memory-key" className="button" value={key} disabled={busy || memories === null} onChange={(event) => {
        const nextKey = event.target.value as MemoryKey;
        setKey(nextKey); setValue(memoryOptions[nextKey].values[0]);
      }}>{Object.keys(memoryOptions).map((option) => <option key={option} value={option}>{option}</option>)}</select>
      <label htmlFor="memory-value">Value / learning status</label>
      <select id="memory-value" className="button" value={value} disabled={busy || memories === null} onChange={(event) => setValue(event.target.value)}>
        {memoryOptions[key].values.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <button className="button" disabled={busy || memories === null}>save memory (upsert)</button>
    </form>
    <p className="lab-panel-note">SESSION: React → max 8 messages → reset saat reload. PERSISTENT: PostgreSQL → structured learning facts → tetap ada setelah reload. CRUD = Create, Read, Update, Delete. UPSERT membuat row baru atau memperbarui pasangan category + key yang sama.</p>
  </section>;
}
