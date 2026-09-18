"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LOCAL_PROFILE_STORAGE_KEY,
  createDefaultLocalProfile,
  loadLocalProfile,
  resetLocalProfile,
  saveLocalProfile,
  updateLocalProfile,
  type LocalProfileDraft,
} from "./local-profile";

const PROFILE_CHANGE_EVENT = "edubba:local-profile-change";

export function useLocalProfile() {
  const [profile, setProfile] = useState(() => createDefaultLocalProfile());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setProfile(loadLocalProfile(window.localStorage));
      setIsLoaded(true);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_PROFILE_STORAGE_KEY) refresh();
    };
    refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener(PROFILE_CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PROFILE_CHANGE_EVENT, refresh);
    };
  }, []);

  const save = useCallback((draft: LocalProfileDraft) => {
    const current = loadLocalProfile(window.localStorage);
    const next = updateLocalProfile(current, draft);
    if (!next || !saveLocalProfile(window.localStorage, next)) return false;
    setProfile(next);
    window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
    return true;
  }, []);

  const reset = useCallback(() => {
    const next = resetLocalProfile(window.localStorage);
    setProfile(next);
    window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
  }, []);

  return { profile, isLoaded, save, reset };
}
