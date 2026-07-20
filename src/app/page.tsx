"use client";

import { motion } from "framer-motion";
import {
    ArrowRight, ShieldCheck, Lock, User,
    BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase, LayoutGrid,
    type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Application } from "@/lib/types/iam";
import { posterBackground, hasPoster } from "@/lib/constants/appVisuals";

const IconMap: Record<string, LucideIcon> = {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase
};

function MarqueeCard({ app }: { app: Application }) {
    const Icon = IconMap[app.icon_name] || LayoutGrid;
    const realImg = hasPoster(app);
    return (
        <div
            className="relative shrink-0 w-32 aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-white/10 shadow-xl"
            style={{ background: posterBackground(app) }}
        >
            {!realImg && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                    <Icon className="absolute top-3 left-3 w-5 h-5 text-white/90" strokeWidth={1.5} />
                    <p className="absolute inset-x-3 bottom-3 text-[13px] font-bold tracking-tight text-white leading-tight line-clamp-3 drop-shadow">
                        {app.app_name}
                    </p>
                </>
            )}
        </div>
    );
}

function MarqueeRow({ apps, reverse, durationSec }: { apps: Application[]; reverse?: boolean; durationSec: number }) {
    if (apps.length === 0) return null;
    const doubled = [...apps, ...apps];
    return (
        <div className="overflow-hidden">
            <div
                className={`flex gap-3 w-max ${reverse ? 'marquee-track-rev' : 'marquee-track'}`}
                style={{ ['--marquee-dur' as string]: `${durationSec}s` }}
            >
                {doubled.map((app, i) => <MarqueeCard key={`${app.id}-${i}`} app={app} />)}
            </div>
        </div>
    );
}

export default function LandingPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apps, setApps] = useState<Application[]>([]);

    useEffect(() => {
        fetch('/api/catalog')
            .then(r => r.json())
            .then(d => setApps(Array.isArray(d) ? d : []))
            .catch(() => setApps([]));
    }, []);

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

    const half = Math.ceil(apps.length / 2) || 1;
    const rowA = apps.slice(0, half);
    const rowB = apps.slice(half);

    return (
        <main className="min-h-[100dvh] bg-[#08090b] text-white grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">

            {/* ================= LEFT: showcase (info + marquee) ================= */}
            <section className="relative hidden lg:flex flex-col justify-between overflow-hidden p-14 xl:p-16">
                {/* aurora */}
                <div className="absolute inset-0 -z-0 pointer-events-none" aria-hidden="true">
                    <div className="aurora-a absolute -top-[18%] -left-[12%] w-[55vw] h-[55vw] rounded-full blur-[130px] opacity-45"
                        style={{ background: "radial-gradient(circle, #1f6a45, transparent 65%)" }} />
                    <div className="aurora-b absolute top-[40%] left-[15%] w-[45vw] h-[45vw] rounded-full blur-[140px] opacity-30"
                        style={{ background: "radial-gradient(circle, #123a57, transparent 65%)" }} />
                    <div className="aurora-c absolute -bottom-[20%] left-0 w-[50vw] h-[50vw] rounded-full blur-[130px] opacity-35"
                        style={{ background: "radial-gradient(circle, #14513a, transparent 65%)" }} />
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage:
                            "linear-gradient(to right, #ffffff 1px, transparent 1px)," +
                            "linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                        maskImage: "radial-gradient(130% 110% at 30% 30%, #000 35%, transparent 80%)",
                        WebkitMaskImage: "radial-gradient(130% 110% at 30% 30%, #000 35%, transparent 80%)",
                    }} />
                </div>

                {/* Brand + headline */}
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-2.5 mb-14"
                    >
                        <span className="grid place-items-center w-9 h-9 rounded-lg bg-white text-[#08090b] font-extrabold leading-none">P</span>
                        <span className="font-bold tracking-tight">PTPN OneAccess</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-xl"
                    >
                        <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.08] text-balance">
                            Satu gerbang untuk seluruh aplikasi PTPN Group.
                        </h1>
                        <p className="text-[15px] text-white/60 leading-relaxed mt-5 max-w-md">
                            Akses aman dan terpusat untuk seluruh ekosistem digital korporat. Login sekali, jangkau semua aplikasi Anda.
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2.5 mt-8 text-[13px] text-white/55">
                            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-white/70" strokeWidth={2} /> Single Sign-On</span>
                            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-white/70" strokeWidth={2} /> Terenkripsi end-to-end</span>
                            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-white/70" strokeWidth={2} /> Multi-Factor Auth</span>
                        </div>
                    </motion.div>
                </div>

                {/* Marquee showcase */}
                <div className="relative z-10 mt-10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 mb-4">
                        {apps.length > 0 ? `${apps.length} aplikasi dalam ekosistem` : 'Ekosistem aplikasi PTPN'}
                    </p>
                    <div className="space-y-3" style={{
                        maskImage: "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
                        WebkitMaskImage: "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
                    }}>
                        <MarqueeRow apps={rowA} durationSec={46} />
                        <MarqueeRow apps={rowB} reverse durationSec={54} />
                    </div>
                </div>
            </section>

            {/* ================= RIGHT: sign-in ================= */}
            <section className="relative flex flex-col justify-center overflow-hidden px-6 sm:px-12 lg:px-14 xl:px-16 py-12 border-l border-white/[0.06] bg-white/[0.015]">
                {/* mobile marquee backdrop (blurred) */}
                <div className="lg:hidden absolute inset-0 -z-0 pointer-events-none overflow-hidden opacity-30 blur-[3px] scale-125" aria-hidden="true">
                    <div className="flex flex-col justify-center h-full gap-3">
                        <MarqueeRow apps={rowA} durationSec={50} />
                        <MarqueeRow apps={rowB} reverse durationSec={60} />
                    </div>
                </div>
                <div className="lg:hidden absolute inset-0 -z-0 bg-[#08090b]/80" aria-hidden="true" />

                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-sm mx-auto"
                >
                    {/* Mobile brand */}
                    <div className="flex lg:hidden items-center gap-2.5 mb-10">
                        <span className="grid place-items-center w-10 h-10 rounded-xl bg-white text-[#08090b] font-extrabold text-lg leading-none">P</span>
                        <span className="font-bold tracking-tight">PTPN OneAccess</span>
                    </div>

                    <h2 className="text-[28px] font-extrabold tracking-tight">Masuk</h2>
                    <p className="text-[14px] text-white/50 mt-2 mb-8">Gunakan identitas korporat PTPN Anda untuk melanjutkan.</p>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-[13px] text-red-300 flex items-start gap-2.5">
                            <Lock className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-1.5">
                            <label htmlFor="identifier" className="block text-[13px] font-semibold text-white/80">NIK SAP</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" strokeWidth={2} />
                                <input
                                    id="identifier" type="text" inputMode="numeric" autoComplete="username"
                                    placeholder="Contoh: 3023255"
                                    value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] pl-10 pr-4 py-3 font-mono text-[15px] text-white placeholder:text-white/30 placeholder:font-sans focus:outline-none focus:border-white/40 focus:ring-4 focus:ring-white/10 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-[13px] font-semibold text-white/80">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" strokeWidth={2} />
                                <input
                                    id="password" type="password" autoComplete="current-password"
                                    placeholder="Masukkan password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] pl-10 pr-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:ring-4 focus:ring-white/10 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 text-[13px] text-white/60 cursor-pointer select-none">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/20" />
                                Ingat saya
                            </label>
                            <Link href="#" className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">Lupa password?</Link>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className="press w-full flex items-center justify-center gap-2 rounded-xl bg-white text-[#08090b] font-semibold py-3.5 mt-2 transition-colors hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Memverifikasi...' : 'Masuk'}
                            {!isLoading && <ArrowRight className="w-4 h-4" strokeWidth={2.25} />}
                        </button>
                    </form>

                    <p className="mt-8 text-[12px] text-white/35 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                        Koneksi aman &amp; terenkripsi &middot; &copy; {new Date().getFullYear()} PTPN III (Persero)
                    </p>
                </motion.div>
            </section>
        </main>
    );
}
