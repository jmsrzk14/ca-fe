/**
 * Auth helpers — cookie and storage management for Dots SSO tokens.
 */

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  displayName: string;
  email: string;
  roles: string[];
}

// Cookie helpers (client-side only)

export function setAuthCookies(pair: TokenPair): void {
  const secure = window.location.protocol === "https:" ? "Secure;" : "";
  document.cookie = `access_token=${encodeURIComponent(pair.accessToken)}; Path=/; Max-Age=${pair.expiresIn}; SameSite=Lax; ${secure}`;
  if (pair.refreshToken) {
    const refreshMaxAge = 7 * 24 * 3600; // 7 days
    document.cookie = `refresh_token=${encodeURIComponent(pair.refreshToken)}; Path=/; Max-Age=${refreshMaxAge}; SameSite=Lax; ${secure}`;
  }
}

export function clearAuthCookies(): void {
  document.cookie = "access_token=; Path=/; Max-Age=0";
  document.cookie = "refresh_token=; Path=/; Max-Age=0";
}

// User profile storage (sessionStorage)

export function getStoredUser(): UserProfile | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem("dots_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function storeUser(user: UserProfile): void {
  sessionStorage.setItem("dots_user", JSON.stringify(user));
}

export function clearStoredUser(): void {
  sessionStorage.removeItem("dots_user");
}
