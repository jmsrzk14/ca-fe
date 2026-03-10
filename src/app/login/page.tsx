"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loginWithSSO } from "@/lib/sso";
import { Button } from "@/shared/ui/button";
import { AlertCircle, LogIn } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  missing_params: "Parameter autentikasi tidak lengkap. Silakan coba lagi.",
  auth_failed: "Autentikasi gagal. Silakan coba lagi.",
  session_expired: "Sesi Anda telah berakhir karena masuk di perangkat lain.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reason = searchParams.get("error") || searchParams.get("reason");
    if (reason) {
      setError(ERROR_MESSAGES[reason] ?? "Terjadi kesalahan. Silakan coba lagi.");
    }
  }, [searchParams]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithSSO();
    } catch {
      setError("Gagal menghubungi SSO. Pastikan layanan SSO berjalan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      {/* Mobile brand */}
      <div className="lg:hidden flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center">
          <img src="dots.png" alt="" />
        </div>
        <div>
          <p className="font-bold text-foreground leading-none">DOTS</p>
          <p className="text-muted-foreground text-xs leading-tight">Credit Analyst</p>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Masuk</h1>
        <p className="text-sm text-muted-foreground">
          Masuk menggunakan akun Dots SSO Anda
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button
        className="w-full h-10 gap-2"
        onClick={handleLogin}
        disabled={isLoading}
      >
        <LogIn className="h-4 w-4" />
        {isLoading ? "Menghubungkan ke SSO..." : "Masuk dengan Dots SSO"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        DOTS Credit Analyst — Hanya untuk personel yang berwenang
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-1/2 bg-[hsl(222,47%,11%)] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src="dots.png" alt="" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">DOTS</p>
            <p className="text-white/50 text-xs leading-tight mt-0.5">Credit Analyst</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Sistem Analisis<br />Kredit Terpadu
          </h2>
          <p className="text-white/60 text-sm max-w-md">
            Platform manajemen pengajuan kredit, analisis peminjam, dan pemantauan pinjaman secara terintegrasi.
          </p>
        </div>

        <p className="text-white/30 text-xs">
          &copy; {new Date().getFullYear()} DOTS Platform
        </p>
      </div>

      {/* Right panel — login */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
