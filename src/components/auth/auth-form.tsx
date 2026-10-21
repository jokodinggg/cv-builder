"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useTurnstile } from "./use-turnstile";

type Mode = "login" | "register";

function safeNext(value: string | null): string {
  // Only allow same-site relative paths to avoid open redirects.
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

type Props = { mode: Mode; googleEnabled: boolean; captchaSiteKey: string | null };

export function AuthForm({ mode, googleEnabled, captchaSiteKey }: Props) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const captcha = useTurnstile(captchaSiteKey);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setPending(true);
    setError(null);
    const token = await captcha.getToken();
    if (captcha.enabled && !token) {
      setPending(false);
      captcha.reset();
      setError("Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.");
      return;
    }
    const fetchOptions = token ? { headers: { "x-captcha-response": token } } : undefined;
    const result =
      mode === "login"
        ? await authClient.signIn.email({ email, password, fetchOptions })
        : await authClient.signUp.email({ email, password, name: String(form.get("name") ?? "").trim(), fetchOptions });
    // Turnstile tokens are single-use.
    captcha.reset();
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Terjadi kesalahan. Coba lagi.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function signInWithGoogle() {
    setPending(true);
    await authClient.signIn.social({ provider: "google", callbackURL: next });
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-[0_18px_45px_#2630291c] sm:p-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        {mode === "login" ? "Masuk ke akun" : "Buat akun baru"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "login" ? "Lanjutkan mengedit CV Anda." : "Gratis. CV Anda tersimpan aman di akun sendiri."}
      </p>
      <form onSubmit={onSubmit} className="mt-6">
        {mode === "register" && (
          <label className="label">
            Nama lengkap
            <input name="name" required maxLength={120} autoComplete="name" className="input mt-1.5" />
          </label>
        )}
        <label className="label">
          Email
          <input name="email" type="email" required autoComplete="email" className="input mt-1.5" />
        </label>
        <label className="label">
          Kata sandi
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="input mt-1.5"
          />
          {mode === "register" && <span className="mt-1 block font-medium text-muted">Minimal 8 karakter.</span>}
        </label>
        <div ref={captcha.containerRef} className="mb-3 empty:hidden" />
        {error && <p role="alert" className="mb-3 rounded-lg bg-[#feecec] px-3 py-2 text-sm text-danger">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full py-3">
          {pending ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
        </button>
      </form>
      {googleEnabled && (
        <button type="button" onClick={signInWithGoogle} disabled={pending} className="btn-secondary mt-3 w-full py-3">
          Lanjut dengan Google
        </button>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
        <Link href={mode === "login" ? "/register" : "/login"} className="font-bold text-brand hover:underline">
          {mode === "login" ? "Daftar" : "Masuk"}
        </Link>
      </p>
    </div>
  );
}
