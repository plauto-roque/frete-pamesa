"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou senha inválidos.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-full max-w-sm space-y-8 px-4">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined msym-lg text-primary">local_shipping</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Frete PAMESA</h1>
            <p className="text-sm text-on-surface-variant mt-1">Plataforma de controle logístico</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="admin@metricapb.com.br"
                required
                autoFocus
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                Senha
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary-color py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all mt-2"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
