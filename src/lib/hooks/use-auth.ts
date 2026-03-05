"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/auth";
import {
  clearAuthCookies,
  getStoredUser,
  clearStoredUser,
  setAuthCookies,
} from "@/lib/auth";
import { refreshSSOToken, parseTokenPayload, getAppRoles } from "@/lib/sso";
import { useRouter } from "next/navigation";

const APP_SLUG = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "dots-ca";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const user = getStoredUser();
    setState({ user, isLoading: false, isAuthenticated: user !== null });
  }, []);

  const logout = useCallback(async () => {
    clearAuthCookies();
    clearStoredUser();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push("/login");
  }, [router]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refreshToken =
      document.cookie.match(/(?:^|;\s*)refresh_token=([^;]+)/)?.[1];
    if (!refreshToken) return false;

    try {
      const tokens = await refreshSSOToken(decodeURIComponent(refreshToken));
      setAuthCookies({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        tokenType: tokens.token_type,
      });

      const payload = parseTokenPayload(tokens.access_token);
      const roles = getAppRoles(payload, APP_SLUG);
      const user: UserProfile = {
        id: payload.sub,
        username: payload.email?.split("@")[0] ?? payload.sub,
        fullName: payload.name || payload.email || payload.sub,
        email: payload.email || "",
        roles,
      };
      setState({ user, isLoading: false, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  }, []);

  const hasRole = useCallback(
    (role: string): boolean => {
      return state.user?.roles.includes(role) ?? false;
    },
    [state.user]
  );

  return {
    ...state,
    logout,
    refreshSession,
    hasRole,
  };
}
