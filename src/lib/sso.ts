/**
 * Dots SSO — OAuth2 Authorization Code + PKCE utilities.
 *
 * Environment variables:
 *   NEXT_PUBLIC_SSO_URL          – SSO base URL, e.g. http://localhost:8003
 *   NEXT_PUBLIC_SSO_CLIENT_ID    – OAuth client ID, e.g. "dots-ca"
 *   NEXT_PUBLIC_SSO_REDIRECT_URI – Callback URL, e.g. http://localhost:3001/auth/callback
 */

const SSO_URL =
  process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:8003";
const CLIENT_ID =
  process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "dots-ca";
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_SSO_REDIRECT_URI ||
  "http://localhost:3001/auth/callback";

// PKCE helpers

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return { verifier, challenge };
}

// Token types

export interface SSOTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface SSOTokenPayload {
  sub: string;
  email: string;
  name: string;
  display_name: string;
  tenant_id?: string;
  tenant_slug?: string;
  roles?: Record<string, string[]>;
  exp?: number;
  iat?: number;
}

// Auth flow

export async function loginWithSSO(): Promise<void> {
  const { verifier, challenge } = await generatePKCE();
  const state = crypto.randomUUID();

  sessionStorage.setItem("pkce_verifier", verifier);
  sessionStorage.setItem("oauth_state", state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    scope: "openid profile email",
  });

  window.location.href = `${SSO_URL}/oauth/authorize?${params}`;
}

export async function exchangeCodeForTokens(
  code: string,
  state: string
): Promise<SSOTokenResponse> {
  const savedState = sessionStorage.getItem("oauth_state");
  if (state !== savedState) {
    throw new Error("State mismatch — possible CSRF attack");
  }

  const verifier = sessionStorage.getItem("pkce_verifier");
  if (!verifier) {
    throw new Error("Missing PKCE verifier");
  }

  const res = await fetch(`${SSO_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { error_description?: string }).error_description ||
        "Token exchange failed"
    );
  }

  sessionStorage.removeItem("pkce_verifier");
  sessionStorage.removeItem("oauth_state");

  return res.json() as Promise<SSOTokenResponse>;
}

export async function refreshSSOToken(
  refreshToken: string
): Promise<SSOTokenResponse> {
  const res = await fetch(`${SSO_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  return res.json() as Promise<SSOTokenResponse>;
}

export function parseTokenPayload(token: string): SSOTokenPayload {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as SSOTokenPayload;
  } catch {
    return { sub: "", email: "", name: "", display_name: "" };
  }
}

export function getAppRoles(
  payload: SSOTokenPayload,
  appSlug: string
): string[] {
  return payload.roles?.[appSlug] ?? [];
}
