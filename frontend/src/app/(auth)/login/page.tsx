"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5E5E5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <div className="text-7xl font-display font-black tracking-tighter logo-animated">
              RIG
            </div>
          </Link>
          <div className="font-mono text-[10px] text-[#666] uppercase tracking-widest mt-3">
            AUTHENTICATION / ACCESS CONTROL
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000] p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-[#FFE600] border border-black" />
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
              Авторизация
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="font-mono text-[10px] text-[#666] uppercase tracking-widest block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rig.ai"
                required
                className="w-full px-4 py-3 text-sm font-mono"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#666] uppercase tracking-widest block mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                className="w-full px-4 py-3 text-sm font-mono"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-500 px-4 py-3 text-red-700 text-xs font-mono uppercase">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full px-6 py-4 text-sm font-bold mt-2 disabled:opacity-50"
            >
              {loading ? "ВХОД..." : "ВОЙТИ В СИСТЕМУ"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="font-mono text-[10px] text-[#999] uppercase tracking-wider text-center">
              Первый запуск: admin@rig.ai / admin123
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="font-mono text-[11px] text-[#666] uppercase tracking-wider hover:text-black transition-colors"
          >
            &larr; Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
