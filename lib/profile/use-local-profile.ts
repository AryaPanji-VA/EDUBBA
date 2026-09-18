"use client";

import type { LocalProfileDraft } from "./local-profile";
import { useLocalUser } from "@/lib/local-user/local-user-provider";

export function useLocalProfile() {
  const { activeUser, updateProfile, resetProfile } = useLocalUser();
  return {
    profile: activeUser.profile,
    isLoaded: true,
    save: (draft: LocalProfileDraft) => updateProfile(draft),
    reset: resetProfile,
  };
}
