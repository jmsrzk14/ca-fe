"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  exchangeCodeForTokens,
  parseTokenPayload,
  getAppRoles,
} from "@/lib/sso";
import { setAuthCookies, storeUser } from "@/lib/auth";
import type { UserProfile } from "@/lib/auth";

const APP_SLUG = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "dots-ca";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(`Autentikasi ditolak SSO: ${errorParam}`);
      return;
    }

    if (!code || !state) {
      router.replace("/login?error=missing_params");
      return;
    }

    isProcessing.current = true;

    exchangeCodeForTokens(code, state)
      .then((tokens) => {
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
        storeUser(user);

        const redirect =
          new URLSearchParams(window.location.search).get("redirect") ?? "/";
        router.replace(redirect);
      })
      .catch((err) => {
        console.error("SSO callback failed:", err);
        setError(err instanceof Error ? err.message : "Autentikasi gagal");
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-destructive font-medium">{error}</p>
        <button
          onClick={() => router.replace("/login")}
          className="text-sm text-muted-foreground underline"
        >
          Kembali ke halaman masuk
        </button>
      </div>
    );
  }

  return (
    <p className="text-muted-foreground text-sm animate-pulse">
      Sedang masuk...
    </p>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
