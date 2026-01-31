"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutGrid,
    ExternalLink,
    ShieldCheck,
    BarChart3,
    Users,
    Layers,
    HelpCircle,
    Briefcase,
    Loader2,
    ChevronRight
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
    Layers
};

export default function DashboardPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [apps, setApps] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user) {
            fetchMyApps();
        }
    }, [user]);

    const fetchMyApps = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/my-apps');
            const data = await res.json();
            setApps(data);

            // Audit Log: Login (Client-side trigger on first load)
            if (user && !sessionStorage.getItem('login_audited')) {
                fetch('/api/audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject_id: user.subject_id,
                        action: 'login',
                        metadata: {
                            device: navigator.userAgent.split(' (')[1]?.split(';')[0] || 'Unknown Device',
                            location: 'Enterprise Portal',
                            ip: 'client-ip'
                        }
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

    const handleLaunchApp = async (app: Application) => {
        if (!user) return;

        let finalUrl = app.launch_url;
        let protocolUrl = "";

        // Define protocols for specific apps
        if (app.app_name.toLowerCase().includes("iam")) {
            protocolUrl = `web+ptpn-iam://`;
        } else if (app.app_name.toLowerCase().includes("command center")) {
            protocolUrl = `web+hcis-cc://`;
        } else if (app.app_name.toLowerCase().includes("tracker")) {
            protocolUrl = `web+hcis-tracker://`;
        }

        // SSO: Append tokens if available and app is internal (localhost or known domain)
        try {
            const supabase = await import('@/lib/supabase/client').then(m => m.createClient());
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token && session?.refresh_token) {
                const separator = app.launch_url.includes('?') ? '&' : '?';
                const tokens = `access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
                finalUrl = `${app.launch_url}${separator}${tokens}`;
                if (protocolUrl) {
                    protocolUrl = `${protocolUrl}?${tokens}`;
                }
            }
        } catch (err) {
            console.warn("Failed to attach SSO tokens:", err);
        }

        try {
            await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject_id: user.subject_id,
                    app_id: app.id,
                    action: 'launch',
                    metadata: { app_name: app.app_name, url: app.launch_url }
                })
            });
        } catch (e) {
            console.error("Audit logging failed", e);
        }

        if (protocolUrl) {
            // Attempt to open the PWA via protocol handler
            const start = Date.now();
            let hasOpenedPWA = false;

            // Blur listener to detect if the PWA window took focus
            const onBlur = () => {
                hasOpenedPWA = true;
                window.removeEventListener('blur', onBlur);
            };
            window.addEventListener('blur', onBlur);

            // Trigger protocol
            window.location.href = protocolUrl;

            // Precision fallback: if focus hasn't shifted within 1.5s, open in browser
            setTimeout(() => {
                window.removeEventListener('blur', onBlur);
                if (!hasOpenedPWA && (Date.now() - start < 2000)) {
                    window.open(finalUrl, '_blank');
                }
            }, 1500);
        } else {
            window.open(finalUrl, '_blank');
        }
    };

    const filteredApps = apps.filter(app =>
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

    if (!user) {
        window.location.href = '/';
        return null;
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex font-sans">
            <Sidebar />

            <div className="flex-1 ml-20 lg:ml-72 min-h-screen flex flex-col">
                <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <main className="flex-1 p-8 lg:p-12 space-y-12">
                    {/* Welcome Intro */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Safe access, <span className="premium-gradient-text text-emerald-400">anywhere.</span></h2>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-slate-500 font-medium text-sm">PTPN OneAccess ID: {user?.nik_sap} • Connected to Enterprise IAM</p>
                        </div>
                    </motion.div>

                    {/* Strategic Banner */}
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden p-10 lg:p-16 rounded-[40px] border border-slate-800/50 bg-slate-900/30 group">
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-emerald-500/5 via-cyan-500/5 to-transparent -z-10 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-6 max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Board Perspective</span>
                            </div>
                            <h3 className="text-5xl lg:text-6xl font-black text-white leading-[1] tracking-tighter">
                                Drive <span className="premium-gradient-text">Transformation</span> with Integrated Data.
                            </h3>
                            <p className="text-slate-400 text-xl leading-relaxed max-w-2xl font-medium">
                                Pondasi digital untuk ketahanan bisnis dan efisiensi operasional PTPN Group di era industri 4.0.
                            </p>
                        </div>
                    </motion.div>

                    {/* Integrated Services Grid */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h4 className="text-2xl font-black text-white flex items-center gap-4 tracking-tight">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                    <LayoutGrid className="w-5 h-5 text-emerald-500" />
                                </div>
                                Authorized Applications
                            </h4>
                            <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">{filteredApps.length} Apps Available</div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
                                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Synchronizing Access...</p>
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredApps.map((app, i) => {
                                        const Icon = IconMap[app.icon_name] || LayoutGrid;
                                        return (
                                            <motion.button
                                                key={app.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                onClick={() => handleLaunchApp(app)}
                                                className="glass-card p-10 flex flex-col items-start gap-8 hover:translate-y-[-8px] transition-all duration-500 group text-left w-full h-full relative"
                                            >
                                                <div className="flex justify-between items-start w-full">
                                                    <div className="w-16 h-16 bg-slate-800/50 border border-slate-700/50 rounded-3xl flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-500 shadow-xl">
                                                        <Icon className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">{app.category}</p>
                                                    <h5 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{app.app_name}</h5>
                                                    <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">{app.description}</p>
                                                </div>
                                                <div className="mt-4 pt-6 border-t border-slate-800/50 w-full flex items-center justify-between group-hover:border-emerald-500/20 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        {app.is_pwa && <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10">PWA READY</span>}
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Connect Service</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* Secondary Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                        <div className="p-10 lg:p-12 rounded-[40px] border border-slate-800/50 bg-slate-900/10 space-y-6 hover:bg-slate-900/20 transition-all group">
                            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-all">
                                <HelpCircle className="w-7 h-7" />
                            </div>
                            <h5 className="text-2xl font-black text-white uppercase tracking-tight">IT Support Center</h5>
                            <button className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2">Launch Ticket Center <ChevronRight className="w-3 h-3" /></button>
                        </div>
                        <div className="p-10 lg:p-12 rounded-[40px] border border-slate-800/50 bg-slate-900/10 space-y-6 hover:bg-slate-900/20 transition-all group">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-all">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <h5 className="text-2xl font-black text-white uppercase tracking-tight">Governance Docs</h5>
                            <button className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">Browse Repository <ChevronRight className="w-3 h-3" /></button>
                        </div>
                    </section>
                </main>
            </div>
            <div className="fixed top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[200px] -z-10 pointer-events-none" />
        </div>
    );
}
