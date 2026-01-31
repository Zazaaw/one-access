"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Key,
    Smartphone,
    History,
    Globe,
    ChevronRight,
    CheckCircle2,
    X,
    Loader2,
    Lock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState } from "react";

export default function SettingsPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [activeModal, setActiveModal] = useState<'password' | 'mfa' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Form States
    const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

    const sessions = [
        { device: "MacBook Pro M2", location: "Jakarta, ID", ip: "10.2.40.12", time: "Current Session", active: true },
        { device: "iPhone 15 Pro", location: "Bandung, ID", ip: "114.12.55.90", time: "2 hours ago", active: false },
    ];

    const handleSaveSettings = async (action: 'password' | 'mfa') => {
        setIsLoading(true);

        try {
            const payload = action === 'password'
                ? { currentPassword: passwordForm.current, newPassword: passwordForm.new }
                : { enabled: true }; // Mock MFA enable

            const res = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: action, payload })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setActiveModal(null);
                setNotification({ message: data.message, type: 'success' });
                // Reset form
                if (action === 'password') setPasswordForm({ current: "", new: "", confirm: "" });
            } else {
                setNotification({ message: data.message || "Operation failed", type: 'error' });
            }
        } catch (e) {
            setNotification({ message: "Network error occurred", type: 'error' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 flex font-sans relative">
            <Sidebar />

            <div className="flex-1 ml-20 lg:ml-72 min-h-screen flex flex-col">
                <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                {/* Global Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-24 right-8 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            {notification.message}
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                <button onClick={() => alert("Data profil terhubung otomatis dengan SAP HRIS. Hubungi Human Capital untuk pembaruan data.")} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
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
                                    <button onClick={() => setActiveModal('password')} className="w-full flex items-center justify-between p-6 hover:bg-slate-800/30 transition-colors group">
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

                                    <button onClick={() => setActiveModal('mfa')} className="w-full flex items-center justify-between p-6 hover:bg-slate-800/30 transition-colors group">
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

            {/* MODALS */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                                <h3 className="text-xl font-black text-white">
                                    {activeModal === 'password' ? 'Change Password' : 'MFA Settings'}
                                </h3>
                                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {activeModal === 'password' ? (
                                    <>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.current}
                                                    onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.new}
                                                    onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordForm.confirm}
                                                    onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start">
                                            <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-500/80 leading-relaxed">Password baru akan berlaku untuk seluruh aplikasi PTPN Group (Integrated SSO). Sesi aktif di perangkat lain akan diakhiri.</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center space-y-6">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                            <Smartphone className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-bold text-white">Authenticator App</h4>
                                            <p className="text-sm text-slate-400">Gunakan aplikasi seperti Google Authenticator atau Microsoft Authenticator untuk mengamankan akun Anda.</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-xl w-48 h-48 mx-auto flex items-center justify-center">
                                            <div className="w-40 h-40 bg-slate-900/10 flex items-center justify-center text-xs font-bold text-slate-400 border-2 border-dashed border-slate-300">
                                                [QR CODE MOCKUP]
                                            </div>
                                        </div>
                                        <p className="text-xs font-mono bg-slate-950 p-2 rounded border border-slate-800 text-slate-500">
                                            SECRET: JKD8 93JD 993K L20A
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleSaveSettings(activeModal)}
                                    disabled={isLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
