"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function LandingPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const systemEmail = identifier.includes('@') ? identifier : `${identifier.trim().toLowerCase()}@hcis.local`;

      const formData = new FormData();
      formData.append('email', systemEmail);
      formData.append('password', password);

      const result = await loginAction(formData);

      if (!result.success) {
        setError(result.message === 'Invalid login credentials'
          ? 'NIK atau password salah. Silakan coba lagi.'
          : result.message || 'Login gagal. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }

      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] bg-stage overflow-hidden flex items-center">
      {/* Full-bleed cinematic backdrop */}
      <img
        src="https://picsum.photos/seed/ptpn-estate-cinematic/1920/1280"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-stage via-stage/80 to-stage/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-stage via-transparent to-stage/60" />

      {/* Brand mark, top-left */}
      <div className="absolute top-6 left-6 lg:top-8 lg:left-14 flex items-center gap-2.5 z-10">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-accent text-stage font-display font-extrabold text-lg leading-none">P</span>
        <span className="leading-none">
          <span className="block font-display font-extrabold tracking-tight text-ink">PTPN</span>
          <span className="block text-[10px] tracking-[0.16em] uppercase text-ink-3 mt-0.5">OneAccess</span>
        </span>
      </div>

      <div className="relative z-10 w-full px-6 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-12 max-w-6xl">
          {/* Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl hidden lg:block"
          >
            <h1 className="font-display text-5xl xl:text-7xl font-extrabold tracking-tight leading-[1.02] text-ink text-balance">
              Gerbang digital PTPN Group.
            </h1>
            <p className="text-lg text-ink-2 leading-relaxed mt-6 max-w-md">
              Akses aman dan terpusat untuk seluruh ekosistem aplikasi korporat, dalam satu identitas.
            </p>
          </motion.div>

          {/* Sign-in card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm lg:w-[380px] rounded-2xl bg-panel/80 backdrop-blur-2xl border border-white/10 shadow-billboard p-8"
          >
            <div className="mb-7">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">Masuk</h2>
              <p className="text-ink-2 mt-1.5 text-[14px]">Gunakan identitas korporat PTPN Anda.</p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label htmlFor="identifier" className="block text-[13px] font-medium text-ink-2">NIK SAP</label>
                <input
                  id="identifier"
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 3023255"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-lg border border-line bg-elevated px-4 py-3 font-mono text-ink placeholder:text-ink-3 placeholder:font-sans focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-[13px] font-medium text-ink-2">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-line bg-elevated px-4 py-3 text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-white text-stage font-semibold py-3 mt-1 transition-colors hover:bg-white/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memverifikasi...' : 'Masuk'}
                {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={2.25} />}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-line">
              <Link href="#" className="text-[13px] text-accent hover:text-accent-2 font-medium transition-colors">
                Lupa password?
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <p className="absolute bottom-6 left-6 lg:left-14 text-[12px] text-ink-3 z-10">
        PT Perkebunan Nusantara III (Persero)
      </p>
    </main>
  );
}
