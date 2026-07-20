"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase, LayoutGrid,
    Play, Info, ArrowRight, Loader2,
    type LucideIcon
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Application } from "@/lib/types/iam";
import { useAuth } from "@/context/AuthContext";
import { Shell } from "@/components/Shell";
import { Shelf } from "@/components/tv/Shelf";
import { PosterCard } from "@/components/tv/PosterCard";
import { HeroMedia } from "@/components/tv/HeroMedia";
import { launchAppWithSSO } from "@/lib/launch";

const IconMap: Record<string, LucideIcon> = {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase
};

function BillboardSkeleton() {
    return (
        <div className="relative h-[66vh] min-h-[460px] w-full skeleton">
            <div className="absolute inset-0 bg-gradient-to-t from-stage via-stage/40 to-transparent" />
        </div>
    );
}


export default function DashboardPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [apps, setApps] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [slide, setSlide] = useState(0);
    const [heroLogoOk, setHeroLogoOk] = useState(true); // reset when the billboard slide changes
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (user) fetchMyApps();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchMyApps = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/my-apps');
            const data = await res.json();
            setApps(Array.isArray(data) ? data : []);
            if (user && !sessionStorage.getItem('login_audited')) {
                fetch('/api/audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject_id: user.subject_id, action: 'login',
                        metadata: { device: navigator.userAgent.split(' (')[1]?.split(';')[0] || 'Unknown Device', location: 'Enterprise Portal', ip: 'client-ip' }
                    })
                });
                sessionStorage.setItem('login_audited', 'true');
            }
        } catch (error) {
            console.error("Failed to fetch apps", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openDetail = useCallback((app: Application) => router.push(`/app/${app.app_code}`), [router]);
    const launch = useCallback((app: Application) => {
        if (user) launchAppWithSSO(app, user.subject_id);
    }, [user]);

    // Reset logo-error guard whenever the visible billboard changes
    useEffect(() => { setHeroLogoOk(true); }, [slide]);

    // Billboard carousel (top 5 apps), auto-advance
    const billboards = apps.slice(0, Math.min(5, apps.length));
    useEffect(() => {
        if (billboards.length < 2) return;
        timerRef.current = setInterval(() => {
            setSlide(s => (s + 1) % billboards.length);
        }, 6000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [billboards.length]);

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 11) return "Selamat pagi";
        if (h < 15) return "Selamat siang";
        if (h < 19) return "Selamat sore";
        return "Selamat malam";
    })();

    if (isAuthLoading) {
        return <div className="min-h-[100dvh] bg-stage flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-accent" strokeWidth={2} /></div>;
    }
    if (!user) {
        window.location.href = '/';
        return null;
    }

    const hasApps = apps.length > 0;
    const current = billboards[slide] ?? apps[0];
    const CurIcon = current ? (IconMap[current.icon_name] || LayoutGrid) : LayoutGrid;
    const categories = Array.from(new Set(apps.map(a => a.category)));
    const topApps = apps.slice(0, Math.min(10, apps.length));

    return (
        <Shell>
            {/* BILLBOARD CAROUSEL */}
            {isLoading ? (
                <BillboardSkeleton />
            ) : hasApps ? (
                <section className="relative h-[66vh] min-h-[460px] w-full overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        <HeroMedia key={current.id} app={current} animateKey={current.id} />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-stage via-stage/45 to-stage/15" />
                    <div className="absolute inset-0 bg-gradient-to-r from-stage/85 via-transparent to-transparent" />

                    <div className="relative h-full flex flex-col justify-end px-6 lg:px-14 pb-14 lg:pb-16 max-w-3xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <p className="text-[13px] font-medium text-white/70 mb-4">{greeting}, {user?.display_name?.split(' ')[0]}</p>
                                {/* App Store-style lockup: big square app icon + title, vertically centered */}
                                <div className="flex items-center gap-4 lg:gap-5">
                                    {current.logo_url && heroLogoOk ? (
                                        <img
                                            src={current.logo_url}
                                            alt=""
                                            onError={() => setHeroLogoOk(false)}
                                            className="w-20 h-20 lg:w-24 lg:h-24 rounded-[22px] object-cover ring-1 ring-white/15 shadow-billboard shrink-0"
                                        />
                                    ) : (
                                        <span className="grid place-items-center w-20 h-20 lg:w-24 lg:h-24 rounded-[22px] bg-white/12 backdrop-blur-sm text-white ring-1 ring-white/15 shrink-0">
                                            <CurIcon className="w-9 h-9" strokeWidth={1.5} />
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-[12px] lg:text-[13px] font-semibold uppercase tracking-[0.16em] text-white/60 mb-1.5">{current.category}</p>
                                        <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05] text-white line-clamp-2">{current.app_name}</h1>
                                    </div>
                                </div>
                                <p className="text-[15px] lg:text-[17px] text-white/85 mt-5 leading-relaxed max-w-xl line-clamp-2">{current.description}</p>
                                {current.creator && (
                                    <p className="text-[13px] text-white/60 mt-3">
                                        <span className="text-white/45">Developer </span>
                                        <span className="font-semibold text-white/85">{current.creator}</span>
                                        {current.publisher && <span> · {current.publisher}</span>}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 mt-7">
                                    <button onClick={() => launch(current)} className="flex items-center gap-2 rounded-full bg-white text-stage font-semibold px-7 py-3 text-[15px] hover:bg-white/90 transition-colors active:scale-[0.98]">
                                        <Play className="w-4 h-4 fill-current" strokeWidth={0} /> Buka
                                    </button>
                                    <button onClick={() => openDetail(current)} className="flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-sm text-white font-semibold px-6 py-3 text-[15px] hover:bg-white/20 transition-colors ring-1 ring-white/15">
                                        <Info className="w-4 h-4" strokeWidth={2} /> Detail
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Dot indicators */}
                        {billboards.length > 1 && (
                            <div className="flex items-center gap-2 mt-8">
                                {billboards.map((b, i) => (
                                    <button
                                        key={b.id}
                                        onClick={() => setSlide(i)}
                                        aria-label={`Slide ${i + 1}`}
                                        className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                <section className="relative h-[56vh] min-h-[400px] w-full flex items-center px-6 lg:px-14">
                    <div className="absolute inset-0 bg-gradient-to-br from-panel to-stage" />
                    <div className="relative max-w-xl">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent mb-3">{greeting}, {user?.display_name?.split(' ')[0]}</p>
                        <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">Belum ada aplikasi di pustaka Anda.</h1>
                        <p className="text-[15px] text-ink-2 mt-4 leading-relaxed">Jelajahi katalog dan ajukan akses ke aplikasi yang Anda butuhkan.</p>
                        <Link href="/app-catalog" className="inline-flex items-center gap-2 rounded-full bg-accent text-stage font-semibold px-6 py-3 text-[15px] mt-7 hover:bg-accent-2 transition-colors">
                            Jelajahi katalog <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
                        </Link>
                    </div>
                </section>
            )}

            {/* SHELVES */}
            {hasApps && (
                <div className="relative z-10 -mt-4 lg:-mt-6 space-y-9 lg:space-y-11">
                    {/* Continue - landscape 16:9 (Apple TV "Continue Watching") */}
                    <Shelf title="Lanjutkan" action={<Link href="/app-catalog" className="text-[13px] font-medium text-ink-2 hover:text-ink transition-colors mr-1">Semua</Link>}>
                        {apps.map((app) => (
                            <PosterCard
                                key={app.id}
                                app={app}
                                layout="landscape"
                                onClick={() => openDetail(app)}
                                badge={app.app_name.includes("Command Center") ? "3" : undefined}
                            />
                        ))}
                    </Shelf>

                    {/* Top 10 - portrait posters with giant rank numerals */}
                    {topApps.length >= 3 && (
                        <Shelf title="Top Aplikasi PTPN">
                            {topApps.map((app, i) => (
                                <PosterCard key={app.id} app={app} rank={i + 1} onClick={() => openDetail(app)} />
                            ))}
                        </Shelf>
                    )}

                    {/* Category shelves - portrait */}
                    {categories.length > 1 && categories.map(cat => {
                        const catApps = apps.filter(a => a.category === cat);
                        if (catApps.length === 0) return null;
                        return (
                            <Shelf key={cat} title={cat}>
                                {catApps.map(app => (
                                    <PosterCard key={app.id} app={app} onClick={() => openDetail(app)} />
                                ))}
                            </Shelf>
                        );
                    })}
                </div>
            )}
        </Shell>
    );
}
