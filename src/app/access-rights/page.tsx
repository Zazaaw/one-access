"use client";

import { motion } from "framer-motion";
import {
    Users,
    ShieldCheck,
    BarChart3,
    Layers,
    Activity,
    Globe,
    Database,
    Scale,
    Briefcase,
    CheckCircle2,
    Loader2,
    Info,
    type LucideIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shell } from "@/components/Shell";
import { createClient } from "@/lib/supabase/client";
import { categoryGradient } from "@/lib/constants/appVisuals";
import { CountUp } from "@/components/CountUp";

const IconMap: Record<string, LucideIcon> = {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase
};

interface AccessAssignment {
    app_name: string;
    icon_name: string;
    category: string;
    role: string;
    scope: string;
    valid_until: string;
}

export default function AccessRightsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [accessList, setAccessList] = useState<AccessAssignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastLogin, setLastLogin] = useState<string>("Baru saja");

    useEffect(() => {
        if (user) {
            fetchAccess();
            fetchLastLogin();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchLastLogin = async () => {
        try {
            const { data: logs } = await createClient()
                .from('hr_audit_logs')
                .select('created_at')
                .eq('subject_id', user?.subject_id)
                .eq('action', 'login')
                .order('created_at', { ascending: false })
                .limit(1);
            if (logs?.[0]) {
                setLastLogin(new Date(logs[0].created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }));
            }
        } catch (e) { }
    }

    const fetchAccess = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/my-access');
            const data = await res.json();
            setAccessList(data);
        } catch (error) {
            console.error("Failed to fetch access rights", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthLoading) {
        return (
            <div className="min-h-[100dvh] bg-stage flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-accent" strokeWidth={2} />
            </div>
        );
    }

    const initials = user?.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U';

    return (
        <Shell>
            {/* Cinematic profile hero (matches the app detail page) */}
            <section className="relative w-full overflow-hidden">
                <div className="absolute inset-0" style={{ background: categoryGradient(accessList[0]?.category || 'Human Capital') }} />
                <div className="absolute inset-0 bg-gradient-to-t from-stage via-stage/70 to-stage/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-stage/80 via-transparent to-transparent" />

                <div className="relative mx-auto max-w-5xl px-6 lg:px-8 pt-24 lg:pt-28 pb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70 mb-4">Tata Kelola Identitas</p>
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center text-2xl lg:text-3xl font-display font-extrabold overflow-hidden shrink-0 ring-1 ring-white/20">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user?.display_name || "Profil"} className="w-full h-full object-cover" />
                                ) : initials}
                            </div>
                            <div>
                                <h1 className="font-display text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.02] text-white">{user?.display_name}</h1>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2.5 text-[13px] text-white/75">
                                    <span className="capitalize">{user?.subject_type}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                                    <span className="font-mono tnum">NIK {user?.nik_sap}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                                    <span className="flex items-center gap-1.5 text-good font-medium"><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} /> Terverifikasi</span>
                                    <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                                    <span>Login terakhir {lastLogin}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Assignments */}
            <div className="mx-auto max-w-5xl px-6 lg:px-8 pt-4 pb-10">
                <div className="flex items-baseline justify-between mb-4">
                    <h2 className="font-display text-[22px] font-bold tracking-tight">Penugasan Aktif</h2>
                    {!isLoading && accessList.length > 0 && <span className="text-[13px] text-ink-3 tnum"><CountUp value={accessList.length} /> aplikasi</span>}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-panel border border-line p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl skeleton shrink-0" />
                                <div className="flex-1 space-y-2"><div className="h-4 w-1/2 rounded skeleton" /><div className="h-3.5 w-2/3 rounded skeleton" /></div>
                            </div>
                        ))}
                    </div>
                ) : accessList.length === 0 ? (
                    <div className="rounded-2xl bg-panel border border-line px-8 py-16 text-center space-y-3">
                        <div className="w-14 h-14 rounded-[15px] bg-elevated text-ink-3 flex items-center justify-center mx-auto"><Users className="w-6 h-6" strokeWidth={1.75} /></div>
                        <p className="text-[17px] font-semibold">Belum ada penugasan</p>
                        <p className="text-[14px] text-ink-2">Hak akses yang disetujui Admin IAM akan tampil di sini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {accessList.map((access, i) => {
                            const Icon = IconMap[access.icon_name] || ShieldCheck;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(i * 0.05, 0.35), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className="rounded-2xl bg-panel border border-line hover:border-white/20 shadow-poster p-5 flex items-start gap-4 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ring-1 ring-white/10" style={{ background: categoryGradient(access.category) }}>
                                        <Icon className="w-6 h-6" strokeWidth={1.75} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-display text-[15px] font-bold tracking-tight truncate">{access.app_name}</p>
                                            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-good/12 px-2.5 py-0.5 text-[11px] font-semibold text-good">
                                                <span className="w-1.5 h-1.5 rounded-full bg-good" aria-hidden="true" /> Aktif
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-line">
                                            <div><p className="text-[11px] text-ink-3">Peran</p><p className="text-[13px] font-medium mt-0.5 truncate">{access.role}</p></div>
                                            <div><p className="text-[11px] text-ink-3">Lingkup</p><p className="text-[13px] font-medium mt-0.5 truncate">{access.scope}</p></div>
                                            <div><p className="text-[11px] text-ink-3">Berlaku</p><p className="text-[13px] font-medium mt-0.5 truncate">{access.valid_until}</p></div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Review note */}
                <div className="mt-6 rounded-2xl bg-panel border border-line p-5 flex items-start gap-3.5">
                    <Info className="w-5 h-5 text-ink-3 shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="space-y-0.5">
                        <p className="text-[14px] font-semibold">Tinjauan akses berkala</p>
                        <p className="text-[13px] text-ink-2 leading-relaxed">
                            Data ini tersinkronisasi langsung dari PTPN Enterprise IAM. Jika ada peran yang tidak Anda kenali, hubungi administrator IT melalui Pusat Bantuan.
                        </p>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
