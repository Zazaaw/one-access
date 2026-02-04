"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Globe,
  Zap,
  AppWindow
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loginAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const systemEmail = identifier.includes('@') ? identifier : `${identifier.trim().toLowerCase()}@hcis.local`;

      console.log('Attempting Login:', { systemEmail, password });

      const formData = new FormData();
      formData.append('email', systemEmail);
      formData.append('password', password);

      const result = await loginAction(formData);

      if (!result.success) {
        setError(result.message === 'Invalid login credentials'
          ? 'NIK atau password salah. Silakan coba lagi.'
          : result.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      console.log('Login successful, redirecting...');
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden px-6">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Branding & Value Proposition */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 glass-card flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white/90">PTPN OneAccess</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
              Enterprise <br />
              <span className="premium-gradient-text">Digital Gateway</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              Satu gerbang, seluruh akses. Platform identitas dan gerbang kerja terintegrasi untuk ekosistem digital PTPN Group.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Globe, label: "Unified Access" },
              { icon: Zap, label: "Enterprise Scale" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <item.icon className="w-5 h-5 text-emerald-500" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Portal Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="glass-card p-8 lg:p-10 space-y-8 relative overflow-hidden group">
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
              <p className="text-sm text-slate-500 text-pretty">Gunakan identitas korporat PTPN Anda.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Identity / NIK SAP</label>
                <input
                  type="text"
                  placeholder="Contoh: 3023255"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all focus:ring-4 focus:ring-emerald-500/5"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all focus:ring-4 focus:ring-emerald-500/5"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="glow-button w-full flex items-center justify-center gap-2 group mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Authenticating...' : 'Launch Services'}
                {!isLoading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="pt-6 border-t border-slate-800/50 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                All Systems Operational
              </div>
              <Link href="#" className="hover:text-emerald-400 transition-colors underline decoration-slate-800 underline-offset-4">
                Lupa Password?
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-medium">
              POWERED BY PT Perkebunan Nusantara III (Persero)
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Blur Object - Top Right */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
    </main>
  );
}
