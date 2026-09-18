"use client";

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createDefaultLocalProfile, type LocalProfileDraft } from "@/lib/profile/local-profile";
import {
  addLocalUser,
  createLocalUser,
  loadActiveLocalUserId,
  loadLocalUsers,
  saveActiveLocalUserId,
  saveLocalUsers,
  updateLocalUserProfile,
  type LocalUser,
  type LocalUsersState,
} from "./local-users";

type LocalUserContextValue = {
  users: LocalUser[];
  activeUser: LocalUser;
  updateProfile: (draft: LocalProfileDraft) => boolean;
  resetProfile: () => void;
  switchUser: () => Promise<void>;
};

const LocalUserContext = createContext<LocalUserContextValue | null>(null);
const EMPTY_STATE: LocalUsersState = { version: 1, users: [] };

async function syncSession(localUserId: string) {
  const response = await fetch("/api/local-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ localUserId }),
  });
  if (!response.ok) throw new Error("Local session unavailable.");
}

export function LocalUserGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalUsersState>(EMPTY_STATE);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"loading" | "select" | "syncing" | "ready">("loading");
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    let cancelled = false;
    const stored = loadLocalUsers(window.localStorage);
    const storedActiveId = loadActiveLocalUserId(window.localStorage, stored);
    setState(stored);
    if (!storedActiveId) { setPhase("select"); return; }
    setPhase("syncing");
    void syncSession(storedActiveId).then(() => {
      if (!cancelled) { setActiveId(storedActiveId); setPhase("ready"); }
    }).catch(() => { if (!cancelled) { saveActiveLocalUserId(window.localStorage, null); setError("Session lokal belum bisa dibuka. Coba lagi."); setPhase("select"); } });
    return () => { cancelled = true; };
  }, []);

  const selectUser = useCallback(async (localUserId: string) => {
    setError("");
    setPhase("syncing");
    try {
      await syncSession(localUserId);
      if (!saveActiveLocalUserId(window.localStorage, localUserId)) throw new Error("Local storage unavailable.");
      setActiveId(localUserId);
      setPhase("ready");
    } catch {
      setError("Session lokal belum bisa dibuka. Coba lagi.");
      setPhase("select");
    }
  }, []);

  const createUser = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    const user = createLocalUser(newName, () => crypto.randomUUID());
    const next = user ? addLocalUser(state, user) : null;
    if (!user || !next || !saveLocalUsers(window.localStorage, next)) {
      setError("Nama belum valid atau browser tidak bisa menyimpan profile.");
      return;
    }
    setState(next);
    setNewName("");
    await selectUser(user.localUserId);
  }, [newName, selectUser, state]);

  const switchUser = useCallback(async () => {
    try { await fetch("/api/local-session", { method: "DELETE" }); } catch { /* Browser state still signs out locally. */ }
    saveActiveLocalUserId(window.localStorage, null);
    setActiveId(null);
    setPhase("select");
  }, []);

  const updateProfile = useCallback((draft: LocalProfileDraft) => {
    if (!activeId) return false;
    const next = updateLocalUserProfile(state, activeId, draft);
    if (!next || !saveLocalUsers(window.localStorage, next)) return false;
    setState(next);
    return true;
  }, [activeId, state]);

  const resetProfile = useCallback(() => {
    if (!activeId) return;
    const current = state.users.find((user) => user.localUserId === activeId);
    if (!current) return;
    const defaults = createDefaultLocalProfile();
    updateProfile({
      displayName: current.profile.displayName,
      preferredName: current.profile.preferredName,
      studyProgram: defaults.studyProgram,
      semester: defaults.semester,
      shortBio: defaults.shortBio,
    });
  }, [activeId, state.users, updateProfile]);

  const activeUser = state.users.find((user) => user.localUserId === activeId) ?? null;
  const context = useMemo(() => activeUser ? { users: state.users, activeUser, updateProfile, resetProfile, switchUser } : null,
    [activeUser, resetProfile, state.users, switchUser, updateProfile]);

  if (phase === "loading" || phase === "syncing") {
    return <main className="local-login"><section className="panel local-login-card" aria-live="polite"><span className="eyebrow">EDUBBA // LOCAL</span><h1>nyiapin meja belajar…</h1></section></main>;
  }
  if (phase === "select" || !context) {
    return (
      <main className="local-login">
        <section className="panel local-login-card">
          <span className="eyebrow">EDUBBA // LOCAL IDENTITY</span>
          <h1>siapa yang belajar hari ini?</h1>
          <p>Ini profile lokal, bukan akun cloud. Tiap nama punya progress, mastery, practice, dan Learning Log sendiri di browser ini.</p>
          {state.users.length > 0 && <div className="local-user-list" aria-label="Local users">
            {state.users.map((user) => <button type="button" key={user.localUserId} onClick={() => void selectUser(user.localUserId)}>
              <span className="avatar">{user.profile.preferredName.charAt(0).toUpperCase()}</span>
              <span><strong>{user.profile.preferredName}</strong><small>{user.profile.studyProgram} · S{user.profile.semester}</small></span>
              <i>continue →</i>
            </button>)}
          </div>}
          <form className="local-user-create" onSubmit={(event) => void createUser(event)}>
            <label htmlFor="new-local-user">{state.users.length ? "Atau bikin local user baru" : "Bikin local user pertama"}</label>
            <div><input id="new-local-user" required maxLength={40} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Preferred name" /><button className="btn-p" type="submit">Continue</button></div>
          </form>
          {error && <p className="profile-status" role="alert">{error}</p>}
          <p className="local-login-note">Local identity ≠ authentication. Jangan pakai ini sebagai keamanan multi-user publik.</p>
        </section>
      </main>
    );
  }
  return <LocalUserContext.Provider value={context}><Fragment key={context.activeUser.localUserId}>{children}</Fragment></LocalUserContext.Provider>;
}

export function useLocalUser() {
  const value = useContext(LocalUserContext);
  if (!value) throw new Error("useLocalUser must run inside an active LocalUserGate session.");
  return value;
}
