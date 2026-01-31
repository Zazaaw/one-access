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
import { useState, useEffect } from "react";
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

export default function AppCatalogPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [allApps, setAllApps] = useState<Application[]>([]);
    const [myAppIds, setMyAppIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

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
            setMyAppIds(myAppsData.map((app: Application) => app.id));
        } catch (error) {
            console.error("Failed to fetch catalog", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredApps = allApps.filter(app =>
        app.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                <button className="text-sm font-black text-emerald-400 border-b-2 border-emerald-400 pb-1">All Systems</button>
                                <button className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">By Category</button>
                                <button className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">New Apps</button>
                            </div>
                            <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{filteredApps.length} Systems Identified</div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
                                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Querying Enterprise Index...</p>
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredApps.map((app, i) => {
                                        const Icon = IconMap[app.icon_name] || Layers;
                                        const isAuthorized = myAppIds.includes(app.id);

                                        return (
                                            <motion.div
                                                key={app.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`glass-card p-10 flex flex-col items-start gap-8 transition-all duration-500 group relative ${!isAuthorized ? 'opacity-80 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'hover:translate-y-[-8px]'}`}
                                            >
                                                {/* Status Tag */}
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
                                                            onClick={() => window.open(app.launch_url, '_blank')}
                                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
                                                        >
                                                            Launch Service <ArrowUpRight className="w-3 h-3" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                            onClick={() => alert("Request access feature coming soon!")}
                                                        >
                                                            <Lock className="w-3 h-3" /> Request Access
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </main>
            </div>
            <div className="fixed top-[20%] right-[-5%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[200px] -z-10 pointer-events-none" />
        </div>
    );
}
