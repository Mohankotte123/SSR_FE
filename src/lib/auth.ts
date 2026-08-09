const TOKEN_KEY = "ssr_admin_token";
const USER_KEY = "ssr_admin_user";

export interface StoredAdminUser {
  id: string;
  email: string;
}

/** Read admin Bearer token (localStorage on client, env on server). */
export function getAdminToken(): string | undefined {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (stored?.trim()) return stored.trim();
    } catch {
      /* ignore */
    }
  }
  return (
    process.env.NEXT_PUBLIC_ADMIN_TOKEN?.trim() ||
    process.env.ADMIN_TOKEN?.trim() ||
    undefined
  );
}

/** Persist admin token for client-side admin mutations. */
export function setAdminToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!token) window.localStorage.removeItem(TOKEN_KEY);
    else window.localStorage.setItem(TOKEN_KEY, token.trim());
  } catch {
    /* ignore */
  }
}

export function getStoredAdminUser(): StoredAdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAdminUser;
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user: StoredAdminUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!user) window.localStorage.removeItem(USER_KEY);
    else window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

export function clearAdminSession(): void {
  setAdminToken(null);
  setStoredAdminUser(null);
}
