import {
  LOCAL_PROFILE_STORAGE_KEY,
  createDefaultLocalProfile,
  validateLocalProfile,
  validateLocalProfileDraft,
  type LocalProfile,
  type LocalProfileDraft,
  type ProfileStorage,
} from "@/lib/profile/local-profile";

export const LOCAL_USERS_STORAGE_KEY = "edubba.local-users.v1";
export const ACTIVE_LOCAL_USER_STORAGE_KEY = "edubba.active-local-user.v1";
export const ARYA_LOCAL_USER_ID = "00000000-0000-4000-8000-000000000001";

export type LocalUser = {
  localUserId: string;
  profile: LocalProfile;
};

export type LocalUsersState = {
  version: 1;
  users: LocalUser[];
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isLocalUserId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function validateLocalUsersState(value: unknown): LocalUsersState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || !Array.isArray(record.users) || Object.keys(record).some((key) => !["version", "users"].includes(key))) return null;
  const ids = new Set<string>();
  const users: LocalUser[] = [];
  for (const item of record.users) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const candidate = item as Record<string, unknown>;
    if (Object.keys(candidate).length !== 2 || !isLocalUserId(candidate.localUserId) || ids.has(candidate.localUserId)) return null;
    const profile = validateLocalProfile(candidate.profile);
    if (!profile) return null;
    ids.add(candidate.localUserId);
    users.push({ localUserId: candidate.localUserId, profile });
  }
  return { version: 1, users };
}

function legacyArya(storage: ProfileStorage): LocalUser | null {
  try {
    const raw = storage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const profile = validateLocalProfile(JSON.parse(raw));
    return profile ? { localUserId: ARYA_LOCAL_USER_ID, profile } : null;
  } catch {
    return null;
  }
}

export function loadLocalUsers(storage: ProfileStorage): LocalUsersState {
  try {
    const raw = storage.getItem(LOCAL_USERS_STORAGE_KEY);
    if (raw) {
      const valid = validateLocalUsersState(JSON.parse(raw));
      if (valid) return valid;
    }
  } catch { /* Fall through to the safe migration/default. */ }
  const migrated = legacyArya(storage);
  const state: LocalUsersState = { version: 1, users: migrated ? [migrated] : [] };
  saveLocalUsers(storage, state);
  return state;
}

export function saveLocalUsers(storage: ProfileStorage, state: LocalUsersState): boolean {
  const valid = validateLocalUsersState(state);
  if (!valid) return false;
  try {
    storage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(valid));
    return true;
  } catch {
    return false;
  }
}

export function loadActiveLocalUserId(storage: ProfileStorage, state: LocalUsersState): string | null {
  try {
    const id = storage.getItem(ACTIVE_LOCAL_USER_STORAGE_KEY);
    return isLocalUserId(id) && state.users.some((user) => user.localUserId === id) ? id : null;
  } catch {
    return null;
  }
}

export function saveActiveLocalUserId(storage: ProfileStorage, localUserId: string | null): boolean {
  try {
    if (localUserId === null) storage.removeItem(ACTIVE_LOCAL_USER_STORAGE_KEY);
    else {
      if (!isLocalUserId(localUserId)) return false;
      storage.setItem(ACTIVE_LOCAL_USER_STORAGE_KEY, localUserId);
    }
    return true;
  } catch {
    return false;
  }
}

export function createLocalUser(preferredName: string, createId: () => string, now = new Date()): LocalUser | null {
  const name = preferredName.trim();
  const localUserId = createId();
  if (!name || name.length > 40 || !isLocalUserId(localUserId)) return null;
  return {
    localUserId,
    profile: { ...createDefaultLocalProfile(now), displayName: name, preferredName: name },
  };
}

export function addLocalUser(state: LocalUsersState, user: LocalUser): LocalUsersState | null {
  if (!isLocalUserId(user.localUserId) || !validateLocalProfile(user.profile) || state.users.some((item) => item.localUserId === user.localUserId)) return null;
  return { version: 1, users: [...state.users, user] };
}

export function updateLocalUserProfile(state: LocalUsersState, localUserId: string, draft: LocalProfileDraft, now = new Date()): LocalUsersState | null {
  const valid = validateLocalProfileDraft(draft);
  const current = state.users.find((user) => user.localUserId === localUserId);
  if (!valid || !current) return null;
  return {
    version: 1,
    users: state.users.map((user) => user.localUserId === localUserId
      ? { ...user, profile: { ...valid, createdAt: current.profile.createdAt, updatedAt: now.toISOString() } }
      : user),
  };
}
