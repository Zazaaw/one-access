"use client";

import { motion } from "framer-motion";
import { Search, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Application } from "@/lib/types/iam";
import { useAuth } from "@/context/AuthContext";
import { Shell } from "@/components/Shell";
import { Shelf } from "@/components/tv/Shelf";
import { PosterCard } from "@/components/tv/PosterCard";
import { categoryArtwork } from "@/lib/constants/appVisuals";

export default function AppCatalogPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [allApps, setAllApps] = useState<Application[]>([]);
    const [myAppIds, setMyAppIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCat, setActiveCat] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [catalogRes, myAppsRes] = await Promise.all([fetch('/api/catalog'), fetch('/api/my-apps')]);
            const catalog = await catalogRes.json();
            const mine = await myAppsRes.json();
            setAllApps(Array.isArray(catalog) ? catalog : []);
            setMyAppIds(Array.isArray(mine) ? mine.map((a: Application) => a.id) : []);
        } catch (error) {
            console.error("Failed to fetch catalog", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openDetail = (app: Application) => router.push(`/app/${app.app_code}`);

    if (isAuthLoading) {
        return <div className="min-h-[100dvh] bg-stage flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-accent" strokeWidth={2} /></div>;
    }

    const isSearching = searchQuery.trim().length > 0;
    const searchResults = allApps.filter(app =>
        app.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const categories = Array.from(new Set(allApps.map(app => app.category)));
    const shownCategories = activeCat ? categories.filter(c => c === activeCat) : categories;

    return (
        <Shell>
            <div className="px-6 lg:px-14 pt-20 lg:pt-24">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight"
                >
                    Katalog
                </motion.h1>

                {/* Search field */}
                <div className="relative max-w-2xl mt-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Cari aplikasi, kategori, dan lainnya"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-line bg-elevated pl-11 pr-10 py-3 text-[15px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                    {isSearching && (
                        <button onClick={() => setSearchQuery("")} aria-label="Bersihkan" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-ink-3 hover:text-ink hover:bg-line transition-colors">
                            <X className="w-4 h-4" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="px-6 lg:px-14 pt-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-video rounded-xl skeleton" />
                        ))}
                    </div>
                </div>
            ) : isSearching ? (
                <div className="px-6 lg:px-14 pt-8">
                    {searchResults.length === 0 ? (
                        <div className="py-16 text-center space-y-2">
                            <p className="text-[17px] font-semibold">Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;</p>
                            <p className="text-[14px] text-ink-2">Coba kata kunci lain.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="font-display text-[19px] font-bold tracking-tight mb-4">{searchResults.length} hasil</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3.5 lg:gap-4">
                                {searchResults.map((app) => (
                                    <PosterCard key={app.id} app={app} authorized={myAppIds.includes(app.id)} onClick={() => openDetail(app)} fluid />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <>
                    {/* BROWSE grid - gradient category cards (Apple TV Search style) */}
                    <div className="px-6 lg:px-14 pt-9">
                        <h2 className="font-display text-[19px] lg:text-[22px] font-bold tracking-tight mb-4">Telusuri</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                            {categories.map((cat, idx) => {
                                const count = allApps.filter(a => a.category === cat).length;
                                const isActive = activeCat === cat;
                                return (
                                    <motion.button
                                        key={cat}
                                        initial={{ opacity: 0, y: 12 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
                                        onClick={() => setActiveCat(isActive ? null : cat)}
                                        className={`press relative aspect-video rounded-xl overflow-hidden text-left ring-1 transition-[box-shadow,transform] hover:scale-[1.02] ${isActive ? 'ring-2 ring-white' : 'ring-white/10 hover:ring-white/25'}`}
                                        style={{ background: categoryArtwork(cat) }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/5" />
                                        <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                            <p className="font-display font-extrabold tracking-tight text-white text-[20px] lg:text-[24px] leading-none drop-shadow">{cat}</p>
                                            <p className="text-[12px] text-white/75 mt-1.5">{count} aplikasi</p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                        {activeCat && (
                            <button onClick={() => setActiveCat(null)} className="mt-4 text-[13px] font-medium text-ink-2 hover:text-ink transition-colors">
                                Tampilkan semua kategori
                            </button>
                        )}
                    </div>

                    {/* Shelves per category */}
                    <div className="pt-9 space-y-9 lg:space-y-11">
                        {shownCategories.map(cat => {
                            const catApps = allApps.filter(a => a.category === cat);
                            if (catApps.length === 0) return null;
                            return (
                                <Shelf key={cat} title={cat}>
                                    {catApps.map((app) => (
                                        <PosterCard key={app.id} app={app} authorized={myAppIds.includes(app.id)} onClick={() => openDetail(app)} />
                                    ))}
                                </Shelf>
                            );
                        })}
                    </div>
                </>
            )}
        </Shell>
    );
}
