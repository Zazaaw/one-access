"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase, LayoutGrid,
    Play, Plus, Loader2, ChevronLeft, CheckCircle2, X, AlertCircle,
    type LucideIcon
} from "lucide-react";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Application } from "@/lib/types/iam";
import { useAuth } from "@/context/AuthContext";
import { Shell } from "@/components/Shell";
import { Shelf } from "@/components/tv/Shelf";
import { PosterCard } from "@/components/tv/PosterCard";
import { HeroMedia } from "@/components/tv/HeroMedia";
import { launchAppWithSSO } from "@/lib/launch";
import { withStudioDefaults } from "@/lib/constants/appVisuals";

const IconMap: Record<string, LucideIcon> = {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase
};

export default function AppDetailPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [allApps, setAllApps] = useState<Application[]>([]);
    const [myAppIds, setMyAppIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [justification, setJustification] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [logoOk, setLogoOk] = useState(true); // hide the logo slot entirely if the image fails to load

    useEffect(() => {
        if (user) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [catalogRes, myAppsRes] = await Promise.all([fetch('/api/catalog'), fetch('/api/my-apps')]);
            const catalog = await catalogRes.json();
            const mine = await myAppsRes.json();
            setAllApps(Array.isArray(catalog) ? catalog : []);
            setMyAppIds(Array.isArray(mine) ? mine.map((a: Application) => a.id) : []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(t);
        }
    }, [notification]);

    const base = allApps.find(a => a.app_code.toLowerCase() === code.toLowerCase() || a.id === code);
    const app = base ? withStudioDefaults(base) : null;
    const authorized = app ? myAppIds.includes(app.id) : false;
    const related = app ? allApps.filter(a => a.category === app.category && a.id !== app.id).slice(0, 12) : [];

    const handleLaunch = useCallback(() => {
        if (app) launchAppWithSSO(app, user?.subject_id);
    }, [app, user?.subject_id]);

    const submitRequest = async () => {
        if (!app || !justification.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ app_id: app.id, justification })
            });
            if (res.ok) {
                setNotification({ message: "Permintaan akses berhasil dikirim. Menunggu persetujuan Admin IAM.", type: 'success' });
                setIsRequestModalOpen(false);
                setJustification("");
            } else {
                const err = await res.json();
                setNotification({ message: `Gagal: ${err.error || 'Terjadi kesalahan sistem'}`, type: 'error' });
            }
        } catch {
            setNotification({ message: "Terjadi kesalahan jaringan.", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isAuthLoading || isLoading) {
        return (
            <Shell>
                <div className="min-h-[70vh] flex items-center justify-center">
                    <Loader2 className="w-7 h-7 animate-spin text-accent" strokeWidth={2} />
                </div>
            </Shell>
        );
    }

    if (!app) {
        return (
            <Shell>
                <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
                    <p className="text-[17px] font-semibold">Aplikasi tidak ditemukan</p>
                    <button onClick={() => router.push('/app-catalog')} className="rounded-full bg-accent text-stage px-5 py-2.5 text-[14px] font-semibold">
                        Kembali ke katalog
                    </button>
                </div>
            </Shell>
        );
    }

    const Icon = IconMap[app.icon_name] || LayoutGrid;
    const detail = app.detail;
    const releasedLabel = app.released_at
        ? new Date(app.released_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : "2025";

    return (
        <Shell>
            {/* HERO */}
            <section className="relative min-h-[72vh] w-full overflow-hidden">
                <HeroMedia app={app} />
                <div className="absolute inset-0 bg-gradient-to-t from-stage via-stage/45 to-stage/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-stage/85 via-stage/20 to-transparent" />

                {/* Back */}
                <button
                    onClick={() => router.back()}
                    aria-label="Kembali"
                    className="absolute top-16 lg:top-16 left-4 lg:left-8 z-10 grid place-items-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2.25} />
                </button>

                <div className="relative h-full min-h-[72vh] flex flex-col justify-end px-6 lg:px-14 pb-10 lg:pb-14">
                    <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl">
                        {/* App Store-style lockup: square app icon + title, vertically centered */}
                        <div className="flex items-center gap-4 lg:gap-5">
                            {logoOk && app.logo_url && (
                                <img
                                    src={app.logo_url}
                                    alt=""
                                    onError={() => setLogoOk(false)}
                                    className="w-20 h-20 lg:w-28 lg:h-28 rounded-[22px] object-cover ring-1 ring-white/15 shadow-billboard shrink-0"
                                />
                            )}
                            <div className="min-w-0">
                                <p className="text-[13px] lg:text-[15px] font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">{app.category}</p>
                                <h1 className="font-display text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.03] text-white line-clamp-3">
                                    {app.app_name}
                                </h1>
                            </div>
                        </div>

                        {/* meta row - Apple TV style: text facts + boxed format badges inline */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 mt-4 text-[13px] text-white/75">
                            <span className="font-mono">v{app.version}</span>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span>{releasedLabel}</span>
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            <span className="flex items-center gap-1.5">
                                {authorized
                                    ? <><CheckCircle2 className="w-3.5 h-3.5 text-good" strokeWidth={2.5} /> Akses aktif</>
                                    : <>Perlu persetujuan</>}
                            </span>
                            <span className="mx-1 h-4 w-px bg-white/20" aria-hidden="true" />
                            {app.tags.map(t => (
                                <span key={t} className="rounded border border-white/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/85 leading-none">{t}</span>
                            ))}
                        </div>

                        {/* synopsis */}
                        <p className="text-[15px] lg:text-[17px] text-white/85 mt-5 leading-relaxed max-w-2xl">
                            {app.long_description}
                        </p>

                        {/* actions */}
                        <div className="flex items-center gap-3 mt-7">
                            {authorized ? (
                                <button onClick={handleLaunch} className="flex items-center gap-2 rounded-full bg-white text-stage font-semibold px-7 py-3 text-[15px] hover:bg-white/90 transition-colors active:scale-[0.98]">
                                    <Play className="w-4 h-4 fill-current" strokeWidth={0} /> Buka Aplikasi
                                </button>
                            ) : (
                                <button onClick={() => setIsRequestModalOpen(true)} className="flex items-center gap-2 rounded-full bg-accent text-stage font-semibold px-7 py-3 text-[15px] hover:bg-accent-2 transition-colors active:scale-[0.98]">
                                    <Plus className="w-4 h-4" strokeWidth={2.5} /> Ajukan Akses
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Info strip */}
            <section className="px-6 lg:px-14 py-8 border-b border-line">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl">
                    {[
                        { k: "Developer", v: app.creator || "Belum diatur" },
                        { k: "Divisi", v: app.publisher || "Belum diatur" },
                        { k: "Versi", v: `v${app.version}` },
                        { k: "Kategori", v: app.category },
                    ].map(item => (
                        <div key={item.k}>
                            <p className="text-[12px] text-ink-3">{item.k}</p>
                            <p className={`text-[14px] font-semibold mt-0.5 ${item.v === "Belum diatur" ? 'text-ink-3' : ''}`}>{item.v}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== Rich detail (poin 3-7 + tim) ===== */}
            {detail && (
                <div className="px-6 lg:px-14 py-10 space-y-12 max-w-5xl">
                    {/* Tentang: target + masalah + manfaat as an About card grid */}
                    {(detail.target_users || detail.problem || detail.benefits) && (
                        <section className="space-y-4">
                            <h2 className="font-display text-[22px] font-bold tracking-tight">Tentang</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {detail.target_users && (
                                    <div className="rounded-2xl bg-panel border border-line p-5">
                                        <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3 mb-2">Target Pengguna</p>
                                        <p className="text-[14px] text-ink-2 leading-relaxed">{detail.target_users}</p>
                                    </div>
                                )}
                                {detail.problem && (
                                    <div className="rounded-2xl bg-panel border border-line p-5">
                                        <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3 mb-2">Masalah yang Diselesaikan</p>
                                        <p className="text-[14px] text-ink-2 leading-relaxed">{detail.problem}</p>
                                    </div>
                                )}
                                {detail.benefits && (
                                    <div className="rounded-2xl bg-panel border border-line p-5">
                                        <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3 mb-2">Manfaat</p>
                                        <p className="text-[14px] text-ink-2 leading-relaxed">{detail.benefits}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Fitur Utama */}
                    {detail.features && detail.features.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="font-display text-[22px] font-bold tracking-tight">Fitur Utama</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {detail.features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3 rounded-xl bg-panel border border-line p-4">
                                        <span className="grid place-items-center w-6 h-6 rounded-full bg-accent/15 text-accent text-[12px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        <div>
                                            <p className="text-[14px] font-semibold">{f.name}</p>
                                            {f.note && <p className="text-[13px] text-ink-2 mt-0.5 leading-relaxed">{f.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Keunggulan */}
                    {detail.advantages && detail.advantages.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="font-display text-[22px] font-bold tracking-tight">Keunggulan</h2>
                            <div className="flex flex-wrap gap-2.5">
                                {detail.advantages.map((a, i) => (
                                    <span key={i} className="inline-flex items-center gap-2 rounded-full bg-panel border border-line px-4 py-2 text-[14px] font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-good shrink-0" strokeWidth={2.25} /> {a}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* Developer & Tim (Cast & Crew style) */}
            {detail?.team && detail.team.length > 0 && (
                <div className="py-8">
                    <Shelf title="Tim Pengembang">
                        {detail.team.map((m, i) => (
                            <div key={i} className="shrink-0 w-[132px] text-center">
                                <div className="w-[120px] h-[120px] mx-auto rounded-full overflow-hidden bg-panel ring-1 ring-white/10 grid place-items-center">
                                    {m.photo_url ? (
                                        <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-display text-2xl font-extrabold text-ink-3">{m.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                                    )}
                                </div>
                                <p className="text-[13px] font-semibold mt-2.5 leading-tight line-clamp-2">{m.name}</p>
                                <p className="text-[12px] text-ink-3 mt-0.5 line-clamp-1">{m.role}</p>
                            </div>
                        ))}
                    </Shelf>
                </div>
            )}

            {/* Related shelf */}
            {related.length > 0 && (
                <div className="py-8">
                    <Shelf title={`Lainnya di ${app.category}`}>
                        {related.map(r => (
                            <PosterCard
                                key={r.id}
                                app={r}
                                authorized={myAppIds.includes(r.id)}
                                onClick={() => router.push(`/app/${r.app_code}`)}
                            />
                        ))}
                    </Shelf>
                </div>
            )}

            {/* Request modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <div onClick={() => setIsRequestModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-panel border border-line shadow-billboard p-6 space-y-5"
                    >
                        <div>
                            <h3 className="font-display text-[19px] font-extrabold tracking-tight">{app.app_name}</h3>
                            <p className="text-[13px] text-ink-3 mt-0.5">{app.category}</p>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="j" className="block text-[13px] font-medium text-ink-2">Kenapa Anda butuh akses ini?</label>
                            <textarea
                                id="j"
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Jelaskan singkat untuk mempercepat persetujuan Admin IAM."
                                className="w-full rounded-xl border border-line bg-elevated p-3.5 text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[100px] transition-all"
                            />
                        </div>
                        <div className="flex gap-2.5">
                            <button onClick={() => setIsRequestModalOpen(false)} className="flex-1 rounded-full bg-elevated hover:bg-line py-2.5 text-[14px] font-semibold transition-colors">Batal</button>
                            <button onClick={submitRequest} disabled={isSubmitting || !justification.trim()} className="flex-1 rounded-full bg-accent hover:bg-accent-2 text-stage py-2.5 text-[14px] font-semibold transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" strokeWidth={2} /> : "Kirim"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Toast */}
            {notification && (
                <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 rounded-xl bg-panel border border-line shadow-billboard px-4 py-3.5 min-w-[300px] max-w-md">
                    {notification.type === 'success'
                        ? <CheckCircle2 className="w-5 h-5 shrink-0 text-good" strokeWidth={2} />
                        : <AlertCircle className="w-5 h-5 shrink-0 text-danger" strokeWidth={2} />}
                    <p className="flex-1 text-[13px] leading-snug">{notification.message}</p>
                    <button onClick={() => setNotification(null)} aria-label="Tutup" className="p-1 rounded-md text-ink-3 hover:text-ink hover:bg-elevated">
                        <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                </div>
            )}
        </Shell>
    );
}
