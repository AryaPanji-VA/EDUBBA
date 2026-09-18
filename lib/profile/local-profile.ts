export const LOCAL_PROFILE_STORAGE_KEY = "edubba.local-profile.v1";

export type LocalProfileDraft = {
  displayName: string;
  preferredName: string;
  studyProgram: string;
  semester: number;
  shortBio: string;
};

export type LocalProfile = LocalProfileDraft & {
  createdAt: string;
  updatedAt: string;
};

export type RobinProfileContext = Pick<LocalProfile, "preferredName" | "studyProgram" | "semester">;

export type ProfileStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const PROFILE_KEYS = ["displayName", "preferredName", "studyProgram", "semester", "shortBio", "createdAt", "updatedAt"];
const PROFILE_DRAFT_KEYS = ["displayName", "preferredName", "studyProgram", "semester", "shortBio"];
const ROBIN_PROFILE_KEYS = ["preferredName", "studyProgram", "semester"];

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isBoundedText(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum;
}

function isISODate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

export function createDefaultLocalProfile(now = new Date()): LocalProfile {
  const timestamp = now.toISOString();
  return {
    displayName: "Arya",
    preferredName: "Arya",
    studyProgram: "Computer Science",
    semester: 1,
    shortBio: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function validateLocalProfile(value: unknown): LocalProfile | null {
  if (!isPlainRecord(value) || Object.keys(value).some((key) => !PROFILE_KEYS.includes(key)) ||
      Object.keys(value).length !== PROFILE_KEYS.length ||
      !isBoundedText(value.displayName, 1, 80) ||
      !isBoundedText(value.preferredName, 1, 40) ||
      !isBoundedText(value.studyProgram, 1, 120) ||
      !Number.isInteger(value.semester) || Number(value.semester) < 1 || Number(value.semester) > 8 ||
      typeof value.shortBio !== "string" || value.shortBio.trim().length > 240 ||
      !isISODate(value.createdAt) || !isISODate(value.updatedAt)) return null;

  return {
    displayName: value.displayName.trim(),
    preferredName: value.preferredName.trim(),
    studyProgram: value.studyProgram.trim(),
    semester: Number(value.semester),
    shortBio: value.shortBio.trim(),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function validateLocalProfileDraft(value: unknown): LocalProfileDraft | null {
  if (!isPlainRecord(value) || Object.keys(value).some((key) => !PROFILE_DRAFT_KEYS.includes(key)) ||
      Object.keys(value).length !== PROFILE_DRAFT_KEYS.length ||
      !isBoundedText(value.displayName, 1, 80) ||
      !isBoundedText(value.preferredName, 1, 40) ||
      !isBoundedText(value.studyProgram, 1, 120) ||
      !Number.isInteger(value.semester) || Number(value.semester) < 1 || Number(value.semester) > 8 ||
      typeof value.shortBio !== "string" || value.shortBio.trim().length > 240) return null;
  return {
    displayName: value.displayName.trim(),
    preferredName: value.preferredName.trim(),
    studyProgram: value.studyProgram.trim(),
    semester: Number(value.semester),
    shortBio: value.shortBio.trim(),
  };
}

export function loadLocalProfile(storage: ProfileStorage, now = new Date()): LocalProfile {
  try {
    const raw = storage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    if (!raw) return createDefaultLocalProfile(now);
    return validateLocalProfile(JSON.parse(raw)) ?? createDefaultLocalProfile(now);
  } catch {
    return createDefaultLocalProfile(now);
  }
}

export function saveLocalProfile(storage: ProfileStorage, profile: LocalProfile): boolean {
  const valid = validateLocalProfile(profile);
  if (!valid) return false;
  try {
    storage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(valid));
    return true;
  } catch {
    return false;
  }
}

export function updateLocalProfile(current: LocalProfile, draft: LocalProfileDraft, now = new Date()): LocalProfile | null {
  const valid = validateLocalProfileDraft(draft);
  if (!valid) return null;
  return { ...valid, createdAt: current.createdAt, updatedAt: now.toISOString() };
}

export function resetLocalProfile(storage: ProfileStorage, now = new Date()): LocalProfile {
  try { storage.removeItem(LOCAL_PROFILE_STORAGE_KEY); } catch { /* Safe default still works. */ }
  return createDefaultLocalProfile(now);
}

export function toRobinProfileContext(profile: LocalProfile): RobinProfileContext {
  return { preferredName: profile.preferredName, studyProgram: profile.studyProgram, semester: profile.semester };
}

export function validateRobinProfileContext(value: unknown): RobinProfileContext | null {
  if (!isPlainRecord(value) || Object.keys(value).some((key) => !ROBIN_PROFILE_KEYS.includes(key)) ||
      Object.keys(value).length !== ROBIN_PROFILE_KEYS.length ||
      !isBoundedText(value.preferredName, 1, 40) ||
      !isBoundedText(value.studyProgram, 1, 120) ||
      !Number.isInteger(value.semester) || Number(value.semester) < 1 || Number(value.semester) > 8) return null;
  return {
    preferredName: value.preferredName.trim(),
    studyProgram: value.studyProgram.trim(),
    semester: Number(value.semester),
  };
}
