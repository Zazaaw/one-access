"use client";

import { motion } from "framer-motion";
import {
    Shield,
    Key,
    Smartphone,
    History,
    Bell,
    Globe,
    LogOut,
    ChevronRight,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState } from "react";

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    const sessions = [
        { device: "MacBook Pro M2", location: "Jakarta, ID", ip: "10.2.40.12", time: "Current Session", active: true },
        { device: "iPhone 15 Pro", location: "Bandung, ID", ip: "114.12.55.90", time: "2 hours ago", active: false },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex font-sans">
            <Sidebar />

            <div className="flex-1 ml-20 lg:ml-72 min-h-screen flex flex-col">
                <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <main className="flex-1 p-8 lg:p-12 space-y-12 max-w-6xl">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            Account Security
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Settings & <span className="premium-gradient-text text-emerald-400">Privacy.</span></h2>
                        <p className="text-slate-500 font-medium max-w-2xl">
                            Kelola keamanan akun, preferensi notifikasi, dan tinjau aktivitas sesi login Anda untuk perlindungan maksimal.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Profile Card */}
                        <div className="space-y-8">
                            <div className="glass-card p-8 flex flex-col items-center text-center gap-4 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20">
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-emerald-500/30">
                                    {user?.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">{user?.display_name}</h3>
                                    <p className="text-sm font-medium text-emerald-500 mt-1">{user?.subject_type} / NIK: {user?.nik_sap}</p>
                                </div>
                                <button className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
                                    Edit Public Profile
                                </button>
                            </div>

                            <div className="glass-card p-6 space-y-4">
                                <div className="flex items-center gap-3 text-white font-bold pb-4 border-b border-slate-800">
                                    <Shield className="w-5 h-5 text-emerald-500" /> Security Status
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Password Strength</span>
                                    <span className="text-emerald-400 font-bold">Strong</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">MFA Status</span>
                                    <span className="text-emerald-400 font-bold">Active</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Recovery Email</span>
                                    <span className="text-slate-500">Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings Controls */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Account Access Section */}
                            <section className="space-y-4">
                                <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <Key className="w-5 h-5 text-slate-500" /> Account Access
                                </h4>

                                <div className="glass-card divide-y divide-slate-800/50 overflow-hidden">
                                    <button className="w-full flex items-center justify-between p-6 hover:bg-slate-800/30 transition-colors group">
                                        <div className="flex items-start gap-4 text-left">
                                            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 transition-colors">
                                                <Key className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">Change Password</p>
                                                <p className="text-xs text-slate-500 mt-1">Last changed 3 months ago</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                    </button>

                                    <button className="w-full flex items-center justify-between p-6 hover:bg-slate-800/30 transition-colors group">
                                        <div className="flex items-start gap-4 text-left">
                                            <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 transition-colors">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">Multi-Factor Authentication</p>
                                                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Enabled via Authenticator App
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                    </button>
                                </div>
                            </section>

                            {/* Session History */}
                            <section className="space-y-4">
                                <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <History className="w-5 h-5 text-slate-500" /> Login Activity
                                </h4>
                                <div className="glass-card p-6 space-y-4">
                                    {sessions.map((session, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${session.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                                <div>
                                                    <p className="text-sm font-bold text-white">{session.device}</p>
                                                    <p className="text-xs text-slate-500">{session.location} • {session.ip}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-slate-400">{session.time}</p>
                                        </div>
                                    ))}
                                    <button className="w-full mt-4 text-xs font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest pt-4 border-t border-slate-800 transition-colors">
                                        Sign out of all other devices
                                    </button>
                                </div>
                            </section>

                            {/* Preferences */}
                            <section className="space-y-4">
                                <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-slate-500" /> Preferences
                                </h4>
                                <div className="glass-card p-1">
                                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/50 rounded-xl">
                                        <button className="py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg shadow-lg">Bahasa Indonesia</button>
                                        <button className="py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">English (US)</button>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
