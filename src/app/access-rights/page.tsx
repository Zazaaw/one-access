"use client";

import { motion } from "framer-motion";
import {
    Users,
    ShieldCheck,
    BarChart3,
    Layers,
    Calendar,
    MapPin,
    CheckCircle2,
    Loader2,
    Lock,
    History
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const IconMap: Record<string, any> = {
    ShieldCheck,
    BarChart3,
    Users,
    Layers
};

export default function AccessRightsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [accessList, setAccessList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user) {
            fetchAccess();
        }
    }, [user]);

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
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            Identity Governance
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">My Access <span className="premium-gradient-text text-emerald-400">Rights.</span></h2>
                        <p className="text-slate-500 font-medium max-w-2xl">
                            Tinjauan transparan mengenai hak akses, peran, dan batasan operasional Anda di seluruh platform PTPN Nusantara.
                        </p>
                    </motion.div>

                    {/* Identity Card Mini */}
                    <div className="glass-card p-8 flex flex-col md:flex-row gap-10 items-center justify-between bg-gradient-to-r from-slate-900/60 to-emerald-950/20 border-emerald-500/10">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-emerald-500/20">
                                {user?.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-white">{user?.display_name}</h3>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">NIK: {user?.nik_sap} • {user?.subject_type}</p>
                            </div>
                        </div>
                        <div className="flex gap-10">
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Keamanan</p>
                                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                                    <CheckCircle2 className="w-4 h-4" /> VERIFIED
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Terakhir Login</p>
                                <div className="flex items-center gap-2 text-white font-black text-sm uppercase">
                                    <History className="w-4 h-4 text-slate-500" /> Hari ini, 19:42
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Access Table / List */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">Active Assignments</h4>
                            <div className="h-[1px] flex-1 mx-6 bg-slate-800/50" />
                            <Lock className="w-5 h-5 text-slate-700 hover:text-emerald-500 transition-colors" />
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                </div>
                            ) : accessList.map((access, i) => {
                                const Icon = IconMap[access.icon_name] || ShieldCheck;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-6 flex flex-col lg:flex-row items-center gap-8 group"
                                    >
                                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                            <Icon className="w-7 h-7 text-slate-400 group-hover:text-emerald-400" />
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Application</p>
                                                <p className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">{access.app_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned Role</p>
                                                <p className="text-sm font-bold text-slate-300">{access.role}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organization Scope</p>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {access.scope}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Validity</p>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> {access.valid_until}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/10">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Disclaimer Header */}
                    <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                        <History className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-amber-500">Tinjauan Akses Berkala</p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Data di atas adalah sinkronisasi real-time dari PTPN Enterprise IAM. Jika Anda menemukan ketidaksesuaian hak akses atau role yang tidak dikenali, harap segera hubungi administrator IT melalui menu IT Support.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
