import "server-only";
import { isLocalUserId } from "./local-users";

export const LOCAL_USER_COOKIE = "edubba_local_user";

export class LocalUserSessionError extends Error {
  constructor(message = "Pilih local user dulu.", public status = 401) { super(message); }
}

export function readLocalUserId(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const value = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${LOCAL_USER_COOKIE}=`))?.slice(LOCAL_USER_COOKIE.length + 1);
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value);
    return isLocalUserId(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export function requireLocalUserId(request: Request): string {
  const localUserId = readLocalUserId(request);
  if (!localUserId) throw new LocalUserSessionError();
  return localUserId;
}
