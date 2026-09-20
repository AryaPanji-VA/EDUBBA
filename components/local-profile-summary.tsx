"use client";

import Link from "next/link";
import { useLocalProfile } from "@/lib/profile/use-local-profile";

export function LocalProfileSummary() {
  const { profile } = useLocalProfile();
  const initial = profile.preferredName.charAt(0).toUpperCase() || "A";
  return (
    <Link className="me profile-summary" href="/profile" aria-label={`Open profile for ${profile.preferredName}`}>
      <span className="avatar">{initial}</span>
      <span className="profile-summary-copy">
        <span className="me-name">{profile.preferredName}</span>
        <span className="me-sub">{profile.studyProgram} · S{profile.semester}</span>
      </span>
      <span className="profile-summary-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
