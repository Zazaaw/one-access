"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, KeyRound } from "lucide-react";
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
    <main className="relative min-h-[100dvh] bg-stage overflow-hidden grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
      {/* ===================== LEFT: cinematic brand panel ===================== */}
      <section className="relative hidden lg:flex flex-col justify-between p-14 xl:p-20 overflow-hidden">
        {/* Layered gradient backdrop (self-contained, no external images) */}
        <div className="absolute inset-0 -z-10" style={{
          background:
            "radial-gradient(120% 120% at 15% 10%, #1f6a45 0%, transparent 45%)," +
            "radial-gradient(100% 100% at 90% 20%, #123a57 0%, transparent 50%)," +
            "radial-gradient(120% 120% at 70% 100%, #0e2a1c 0%, transparent 55%)," +
            "linear-gradient(155deg, #0c1a12, #070b0d)",
        }} />
        {/* Subtle grid texture */}
        <div className="absolute inset-0 -z-10 opacity-[0.06]" style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px)," +
            "linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(120% 100% at 40% 40%, #000 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(120% 100% at 40% 40%, #000 40%, transparent 80%)",
        }} />
        {/* soft vignette to seat the form panel */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent to-stage/40" />

        {/* Brand lockup */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center gap-3"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-white text-stage font-extrabold text-xl leading-none shadow-lg">P</span>
          <span className="leading-none">
            <span className="block font-extrabold tracking-tight text-white text-lg">PTPN OneAccess</span>
            <span className="block text-[11px] tracking-[0.18em] uppercase text-white/50 mt-1.5">Enterprise Digital Gateway</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-xl"
        >
          <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05] text-white text-balance">
            Satu identitas,<br />seluruh akses.
          </h1>
          <p className="text-[17px] text-white/70 leading-relaxed mt-6 max-w-md">
            Gerbang tunggal yang aman untuk seluruh ekosistem aplikasi korporat PTPN Group.
          </p>

          {/* Trust points */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-9">
            {[
              { icon: ShieldCheck, label: "Single Sign-On" },
              { icon: Lock, label: "Terenkripsi end-to-end" },
              { icon: KeyRound, label: "Multi-Factor Auth" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[13px] text-white/60">
                <Icon className="w-4 h-4 text-white/70" strokeWidth={2} /> {label}
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-[12px] text-white/40">
          &copy; {new Date().getFullYear()} PT Perkebunan Nusantara III (Persero)
        </p>
      </section>

      {/* ===================== RIGHT: sign-in ===================== */}
      <section className="relative flex flex-col justify-center items-center px-6 py-12 sm:px-12">
        {/* mobile-only backdrop */}
        <div className="lg:hidden absolute inset-0 -z-10" style={{
          background: "radial-gradient(120% 80% at 50% 0%, #14402b 0%, transparent 55%), linear-gradient(180deg, #0c1a12, #070b0d)",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-white text-stage font-extrabold text-lg leading-none">P</span>
            <span className="leading-none">
              <span className="block font-extrabold tracking-tight text-ink">PTPN OneAccess</span>
              <span className="block text-[10px] tracking-[0.16em] uppercase text-ink-3 mt-1">Enterprise Gateway</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold tracking-tight text-ink">Masuk ke akun Anda</h2>
            <p className="text-ink-2 mt-2 text-[14px]">Gunakan identitas korporat PTPN untuk melanjutkan.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger flex items-start gap-2.5"
            >
              <Lock className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
              <span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="block text-[13px] font-medium text-ink-2">NIK SAP</label>
              <input
                id="identifier"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="Contoh: 3023255"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-line bg-elevated px-4 py-3.5 font-mono text-ink placeholder:text-ink-3 placeholder:font-sans focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[13px] font-medium text-ink-2">Password</label>
                <Link href="#" className="text-[12px] text-ink-3 hover:text-accent font-medium transition-colors">Lupa password?</Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-elevated px-4 py-3.5 text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="press w-full flex items-center justify-center gap-2 rounded-xl bg-white text-stage font-semibold py-3.5 mt-2 transition-colors hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk'}
              {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={2.25} />}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-line flex items-center gap-2 text-[12px] text-ink-3">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            Koneksi aman &amp; terenkripsi. Butuh bantuan? Hubungi IT Support.
          </div>
        </motion.div>
      </section>
    </main>
  );
}
