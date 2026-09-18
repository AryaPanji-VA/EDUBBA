"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { useLocalProfile } from "@/lib/profile/use-local-profile";
import type { LocalProfileDraft } from "@/lib/profile/local-profile";
import { useLocalUser } from "@/lib/local-user/local-user-provider";

export default function ProfilePage() {
  const { profile, isLoaded, save, reset } = useLocalProfile();
  const { activeUser, switchUser } = useLocalUser();
  const [draft, setDraft] = useState<LocalProfileDraft>(() => ({
    displayName: profile.displayName,
    preferredName: profile.preferredName,
    studyProgram: profile.studyProgram,
    semester: profile.semester,
    shortBio: profile.shortBio,
  }));
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    setDraft({
      displayName: profile.displayName,
      preferredName: profile.preferredName,
      studyProgram: profile.studyProgram,
      semester: profile.semester,
      shortBio: profile.shortBio,
    });
  }, [isLoaded, profile]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setStatus(save(draft) ? "Profile tersimpan di browser ini." : "Profile belum bisa disimpan. Cek field-nya lalu coba lagi.");
  }

  function restoreDefault() {
    reset();
    setStatus("Profile lokal dikembalikan ke default.");
  }

  return (
    <AppShell active="profile">
      <TopBar breadcrumb={<><b>Profile</b><span className="sep">/</span>Local settings</>} />
      <div className="content profile-page">
        <header className="page-header profile-header">
          <div>
            <span className="eyebrow">Phase 17 · Local profile</span>
            <h1>Kenalan dulu, secukupnya.</h1>
            <p>Dipakai buat greeting dan konteks ringan Robin. Profile ini cuma tinggal di browser ini—bukan akun dan bukan login.</p>
          </div>
        </header>

        <form className="panel profile-form" onSubmit={submit}>
          <div className="profile-fields">
            <label>
              <span>Display name</span>
              <input required maxLength={80} value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} />
            </label>
            <label>
              <span>Preferred name</span>
              <input required maxLength={40} value={draft.preferredName} onChange={(event) => setDraft({ ...draft, preferredName: event.target.value })} />
            </label>
            <label>
              <span>Study program</span>
              <input required maxLength={120} value={draft.studyProgram} onChange={(event) => setDraft({ ...draft, studyProgram: event.target.value })} />
            </label>
            <label>
              <span>Semester</span>
              <select value={draft.semester} onChange={(event) => setDraft({ ...draft, semester: Number(event.target.value) })}>
                {Array.from({ length: 8 }, (_, index) => index + 1).map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}
              </select>
            </label>
            <label className="profile-bio">
              <span>Short bio <small>optional</small></span>
              <textarea rows={4} maxLength={240} value={draft.shortBio} onChange={(event) => setDraft({ ...draft, shortBio: event.target.value })} placeholder="Yang perlu Robin tahu tentang cara belajar lu—singkat aja." />
              <small>{draft.shortBio.length}/240</small>
            </label>
          </div>
          <div className="profile-actions">
            <button className="btn-p" type="submit">Save profile</button>
            <button className="btn-g" type="button" onClick={restoreDefault}>Reset to default</button>
            <button className="btn-g" type="button" onClick={() => void switchUser()}>Logout / switch user</button>
          </div>
          {status && <p className="profile-status" role="status">{status}</p>}
        </form>

        <aside className="profile-local-note">
          <strong>LOCAL ONLY</strong>
          <p>Local user ID: <code>{activeUser.localUserId}</code>. Progress, mastery, Practice, dan Learning Log terpisah untuk identity ini. Ini tetap bukan authentication; keamanan multi-user publik menunggu auth sungguhan.</p>
        </aside>
      </div>
    </AppShell>
  );
}
