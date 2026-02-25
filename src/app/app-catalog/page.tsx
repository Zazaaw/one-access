"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Layers,
    ExternalLink,
    ShieldCheck,
    BarChart3,
    Users,
    Globe,
    BookOpen,
    Loader2,
    ChevronRight,
    Lock,
    ArrowUpRight
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Application } from "@/lib/types/iam";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const IconMap: Record<string, any> = {
    ShieldCheck,
    BarChart3,
    Users,
    Layers,
    Globe,
    BookOpen
};

function AppCard({ app, index, isAuthorized, onRequestAccess, onLaunch }: { app: Application, index: number, isAuthorized: boolean, onRequestAccess: (app: Application) => void, onLaunch: (app: Application) => void }) {
    const Icon = IconMap[app.icon_name] || Layers;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card p-10 flex flex-col items-start gap-8 transition-all duration-500 group relative ${!isAuthorized ? 'opacity-80 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'hover:translate-y-[-8px]'}`}
        >
            <div className="absolute top-6 right-8">
                {isAuthorized ? (
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">Authorized</span>
                ) : (
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">Requestable</span>
                )}
            </div>

            <div className="w-16 h-16 bg-slate-800/30 border border-slate-700/50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl">
                <Icon className={`w-8 h-8 ${isAuthorized ? 'text-emerald-400' : 'text-slate-500'}`} />
            </div>

            <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{app.category}</p>
                <h5 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{app.app_name}</h5>
                <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3">{app.description}</p>
            </div>

            <div className="mt-auto pt-8 w-full border-t border-slate-800/50">
                {isAuthorized ? (
                    <button
                        onClick={() => onLaunch(app)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
                    >
                        Launch Service <ArrowUpRight className="w-3 h-3" />
                    </button>
                ) : (
                    <button
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                        onClick={() => onRequestAccess(app)}
                    >
                        <Lock className="w-3 h-3" /> Request Access
                    </button>
                )}
            </div>
        </motion.div>
    );
}

export default function AppCatalogPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [allApps, setAllApps] = useState<Application[]>([]);
    const [myAppIds, setMyAppIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'category' | 'new'>('all');

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [justification, setJustification] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [catalogRes, myAppsRes] = await Promise.all([
                fetch('/api/catalog'),
                fetch('/api/my-apps')
            ]);
            const catalogData = await catalogRes.json();
            const myAppsData = await myAppsRes.json();

            setAllApps(catalogData);
            if (Array.isArray(myAppsData)) {
                setMyAppIds(myAppsData.map((app: Application) => app.id));
            } else {
                setMyAppIds([]);
            }

        } catch (error) {
            console.error("Failed to fetch catalog", error);
        } finally {
            setIsLoading(false);
        }
    };

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // SSO-aware app launch handler (same as Dashboard)
    const handleLaunchApp = useCallback(async (app: Application) => {
        let finalUrl = app.launch_url;

        try {
            const supabase = await import('@/lib/supabase/client').then(m => m.createClient());
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token && session?.refresh_token) {
                const separator = app.launch_url.includes('?') ? '&' : '?';
                const tokens = `access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
                finalUrl = `${app.launch_url}${separator}${tokens}`;
            }
        } catch (err) {
            console.warn("Failed to attach SSO tokens:", err);
        }

        window.open(finalUrl, '_blank');
    }, []);

    const handleRequestClick = (app: Application) => {
        setSelectedApp(app);
        setIsRequestModalOpen(true);
    };

    const handleRequestSubmit = async () => {
        if (!selectedApp || !justification.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    app_id: selectedApp.id,
                    justification: justification
                })
            });
            if (res.ok) {
                setNotification({ message: "Permintaan akses berhasil dikirim. Menunggu persetujuan Admin IAM.", type: 'success' });
                setIsRequestModalOpen(false);
                setJustification("");
            } else {
                const err = await res.json();
                setNotification({ message: `Gagal: ${err.error || 'Terjadi kesalahan arsitektur'}`, type: 'error' });
            }
        } catch (error) {
            console.error("Submission error:", error);
            setNotification({ message: "Terjadi kesalahan jaringan atau database.", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredApps = allApps.filter(app => {
        const matchesSearch = app.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.category.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'new') return matchesSearch && app.is_pwa; // Proxy for 'new'
        return matchesSearch;
    });

    const categories = Array.from(new Set(allApps.map(app => app.category)));

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex font-sans">
            <Sidebar />

            <div className="flex-1 ml-20 lg:ml-72 min-h-screen flex flex-col">
                <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <main className="flex-1 p-8 lg:p-12 space-y-12">
                    {/* Header Section */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            Enterprise Library
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Application <span className="premium-gradient-text text-emerald-400">Library.</span></h2>
                        <p className="text-slate-500 font-medium max-w-2xl">
                            Jelajahi seluruh ekosistem layanan digital PTPN Nusantara. Temukan alat yang dapat membantu efisiensi dan kolaborasi tim Anda.
                        </p>
                    </motion.div>

                    {/* Catalog Grid */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`text-sm font-black pb-1 transition-all ${activeTab === 'all' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    All Systems
                                </button>
                                <button
                                    onClick={() => setActiveTab('category')}
                                    className={`text-sm font-black pb-1 transition-all ${activeTab === 'category' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    By Category
                                </button>
                                <button
                                    onClick={() => setActiveTab('new')}
                                    className={`text-sm font-black pb-1 transition-all ${activeTab === 'new' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    New Apps
                                </button>
                            </div>
                            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{filteredApps.length} Systems Identified</div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
                                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Querying Enterprise Index...</p>
                                </div>
                            ) : activeTab === 'category' ? (
                                <div className="space-y-16">
                                    {categories.map(cat => {
                                        const catApps = filteredApps.filter(a => a.category === cat);
                                        if (catApps.length === 0) return null;
                                        return (
                                            <div key={cat} className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <h6 className="text-sm font-black text-emerald-400 uppercase tracking-[0.3em]">{cat}</h6>
                                                    <div className="h-[1px] flex-1 bg-slate-800/30" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {catApps.map((app, i) => (
                                                        <AppCard
                                                            key={app.id}
                                                            app={app}
                                                            index={i}
                                                            isAuthorized={myAppIds.includes(app.id)}
                                                            onRequestAccess={handleRequestClick}
                                                            onLaunch={handleLaunchApp}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredApps.map((app, i) => (
                                        <AppCard
                                            key={app.id}
                                            app={app}
                                            index={i}
                                            isAuthorized={myAppIds.includes(app.id)}
                                            onRequestAccess={handleRequestClick}
                                            onLaunch={handleLaunchApp}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </main>

                {/* Request Modal */}
                <AnimatePresence>
                    {isRequestModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-card max-w-lg w-full p-10 space-y-8 border-emerald-500/20 shadow-2xl shadow-emerald-950/40"
                            >
                                <div className="space-y-2">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                                        <Lock className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Request Access</h3>
                                    <p className="text-slate-500 font-medium">Anda sedang meminta akses ke layanan <span className="text-emerald-400 font-bold">{selectedApp?.app_name}</span>.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Business Justification</label>
                                    <textarea
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-emerald-500/50 min-h-[120px] transition-all"
                                        placeholder="Jelaskan mengapa Anda membutuhkan akses ini untuk pekerjaan Anda..."
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsRequestModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-800 transition-all border border-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRequestSubmit}
                                        disabled={isSubmitting || !justification.trim()}
                                        className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Request"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 20, x: '-50%' }}
                            className={`fixed bottom-10 left-1/2 z-[200] px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 min-w-[320px] ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                    'bg-slate-800/80 border-slate-700 text-slate-300'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500/20' :
                                notification.type === 'error' ? 'bg-rose-500/20' : 'bg-slate-700'
                                }`}>
                                {notification.type === 'success' ? <ShieldCheck className="w-4 h-4" /> :
                                    notification.type === 'error' ? <Lock className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 text-sm font-bold">{notification.message}</div>
                            <button
                                onClick={() => setNotification(null)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 rotate-90" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="fixed top-[20%] right-[-5%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[200px] -z-10 pointer-events-none" />
        </div>
    );
}
