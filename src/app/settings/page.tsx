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
    Lock,
    User,
    Camera
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction } from "@/lib/actions/auth";

export default function SettingsPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [activeModal, setActiveModal] = useState<'password' | 'mfa' | 'profile' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Form States
    const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
    const [mfaEnrollData, setMfaEnrollData] = useState<{ id: string, qr: string, secret: string } | null>(null);
    const [mfaCode, setMfaCode] = useState("");
    const [profileForm, setProfileForm] = useState({ display_name: "" });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [securityStatus, setSecurityStatus] = useState({
        mfaActive: false,
        emailVerified: false,
        passwordStrength: 'Strong' // Mocked but we can keep it for UI
    });

    const [sessions, setSessions] = useState([
        { device: "Current Device", location: "Detecting...", ip: "...", time: "Current Session", active: true },
    ]);

    const supabase = createClient();

    useEffect(() => {
        if (activeModal === 'mfa') {
            startMfaEnrollment();
        }
        if (activeModal === 'profile' && user) {
            setProfileForm({ display_name: user.display_name });
        }
    }, [activeModal, user]);

    useEffect(() => {
        const fetchSecurityInfo = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                // 1. Check MFA
                const { data: factors } = await supabase.auth.mfa.listFactors();
                const isMfaActive = factors?.all?.some(f => f.status === 'verified') || false;

                // 2. Check Email Verification
                const isEmailVerified = !!authUser.email_confirmed_at;

                setSecurityStatus(prev => ({
                    ...prev,
                    mfaActive: isMfaActive,
                    emailVerified: isEmailVerified
                }));

                // 3. Current Session Basic Info (Simplified)
                try {
                    const ipRes = await fetch('https://api.ipify.org?format=json');
                    const ipData = await ipRes.json();

                    // Note: In real app we would fetch location from ip-api or similar
                    setSessions([
                        {
                            device: navigator.userAgent.split(') ')[0].split(' (')[1] || "Mac/PC",
                            location: "Browsing from ID",
                            ip: ipData.ip,
                            time: "Current Session",
                            active: true
                        }
                    ]);
                } catch (e) {
                    console.error("Failed to fetch IP", e);
                }

                // 4. Fetch Login History from hr_audit_logs
                try {
                    const { data: subject } = await supabase
                        .from('subjects')
                        .select('id')
                        .eq('auth_id', authUser.id)
                        .single();

                    if (subject) {
                        const { data: logs } = await supabase
                            .from('hr_audit_logs')
                            .select('*')
                            .eq('subject_id', subject.id)
                            .eq('action', 'login')
                            .order('created_at', { ascending: false })
                            .limit(3);

                        if (logs && logs.length > 0) {
                            const historicalSessions = logs.map(log => ({
                                device: log.metadata?.device || "Inisiatif Gateway",
                                location: log.metadata?.location || "PTPN Network",
                                ip: log.metadata?.ip || "Unknown",
                                time: new Date(log.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
                                active: false
                            }));

                            setSessions(prev => [prev[0], ...historicalSessions]);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch logs", e);
                }
            }
        };

        fetchSecurityInfo();
    }, []);

    const [language, setLanguage] = useState<'id' | 'en'>('id');

    useEffect(() => {
        const savedLang = localStorage.getItem('pref_lang');
        if (savedLang === 'en' || savedLang === 'id') setLanguage(savedLang);
    }, []);

    const handleLanguageChange = (lang: 'id' | 'en') => {
        setLanguage(lang);
        localStorage.setItem('pref_lang', lang);
        setNotification({ message: `Bahasa diatur ke ${lang === 'id' ? 'Indonesia' : 'English'}`, type: 'success' });
    };

    const handleGlobalLogout = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signOut({ scope: 'others' });
            if (error) throw error;
            setNotification({ message: "Berhasil keluar dari seluruh perangkat lain.", type: 'success' });
        } catch (err: any) {
            setNotification({ message: err.message || "Gagal melakukan global logout", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startMfaEnrollment = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                issuer: 'PTPN OneAccess',
                friendlyName: user?.display_name || 'My Authenticator'
            });

            if (error) throw error;

            setMfaEnrollData({
                id: data.id,
                qr: data.totp.qr_code,
                secret: data.totp.secret
            });
        } catch (err: any) {
            console.error("MFA Enrollment Error:", err);
            setNotification({ message: err.message || "Gagal inisialisasi MFA", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async (action: 'password' | 'mfa' | 'profile') => {
        setIsLoading(true);

        try {
            if (action === 'mfa') {
                if (!mfaEnrollData) throw new Error("MFA enrollment data missing");

                // 1. Create a challenge
                const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                    factorId: mfaEnrollData.id
                });

                if (challengeError) throw challengeError;

                // 2. Verify the challenge
                const { error: verifyError } = await supabase.auth.mfa.verify({
                    factorId: mfaEnrollData.id,
                    challengeId: challengeData.id,
                    code: mfaCode
                });

                if (verifyError) throw verifyError;

                setNotification({ message: "Multi-Factor Authentication telah diaktifkan!", type: 'success' });
                setActiveModal(null);
                return;
            }

            if (action === 'profile') {
                const formData = new FormData();
                formData.append('userId', user?.subject_id!);
                formData.append('displayName', profileForm.display_name);
                if (avatarFile) {
                    formData.append('file', avatarFile);
                }

                const result = await updateProfileAction(formData);

                if (!result.success) throw new Error(result.message);

                setNotification({ message: "Profil berhasil diperbarui!", type: 'success' });
                setActiveModal(null);
                // Force AuthContext to refresh data
                setTimeout(() => window.location.reload(), 1500);
                return;
            }

            if (action === 'password') {
                if (passwordForm.new !== passwordForm.confirm) {
                    throw new Error("Password baru dan konfirmasi tidak cocok");
                }
            }

            const payload = {
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new,
                confirmPassword: passwordForm.confirm
            };

            const res = await fetch('/api/settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: action, payload })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setActiveModal(null);
                setNotification({ message: data.message, type: 'success' });
                if (action === 'password') setPasswordForm({ current: "", new: "", confirm: "" });
            } else {
                setNotification({ message: data.message || "Operation failed", type: 'error' });
            }
        } catch (e: any) {
            console.error("Save Settings Error:", e);
            setNotification({ message: e.message || "Terjadi kesalahan", type: 'error' });
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
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-emerald-500/30 overflow-hidden">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">{user?.display_name}</h3>
                                    <p className="text-sm font-medium text-emerald-500 mt-1">{user?.subject_type} / NIK: {user?.nik_sap}</p>
                                </div>
                                <button onClick={() => setActiveModal('profile')} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
                                    Edit Public Profile
                                </button>
                            </div>

                            <div className="glass-card p-6 space-y-4">
                                <div className="flex items-center gap-3 text-white font-bold pb-4 border-b border-slate-800">
                                    <Shield className="w-5 h-5 text-emerald-500" /> Security Status
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Password Strength</span>
                                    <span className="text-emerald-400 font-bold">{securityStatus.passwordStrength}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">MFA Status</span>
                                    <span className={securityStatus.mfaActive ? "text-emerald-400 font-bold" : "text-slate-500 font-bold"}>
                                        {securityStatus.mfaActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Recovery Email</span>
                                    <span className={securityStatus.emailVerified ? "text-emerald-400 font-bold" : "text-slate-500 font-bold"}>
                                        {securityStatus.emailVerified ? 'Verified' : 'Unverified'}
                                    </span>
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
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Terakhir diperbarui {user && new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
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
                                                <p className={`text-xs mt-1 flex items-center gap-1 ${securityStatus.mfaActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                    {securityStatus.mfaActive ? (
                                                        <><CheckCircle2 className="w-3 h-3" /> Enabled via Authenticator App</>
                                                    ) : (
                                                        <>Security enhancement available</>
                                                    )}
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
                                                    <p className="text-sm font-bold text-white uppercase">{session.device}</p>
                                                    <p className="text-xs text-slate-500">{session.location} • {session.ip}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-slate-400 capitalize">{session.time}</p>
                                        </div>
                                    ))}
                                    {user && (
                                        <div className="flex items-center justify-between opacity-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                <div>
                                                    <p className="text-sm font-bold text-white">Previous Session</p>
                                                    <p className="text-xs text-slate-500">Last seen from secure gateway</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-slate-400">Authenticated</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleGlobalLogout}
                                        disabled={isLoading}
                                        className="w-full mt-4 text-xs font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest pt-4 border-t border-slate-800 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? 'Processing...' : 'Sign out of all other devices'}
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
                                        <button
                                            onClick={() => handleLanguageChange('id')}
                                            className={`py-2 text-xs font-bold rounded-lg transition-all ${language === 'id' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            Bahasa Indonesia
                                        </button>
                                        <button
                                            onClick={() => handleLanguageChange('en')}
                                            className={`py-2 text-xs font-bold rounded-lg transition-all ${language === 'en' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                        >
                                            English (US)
                                        </button>
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
                                    {activeModal === 'password' ? 'Change Password' : activeModal === 'profile' ? 'Edit Public Profile' : 'MFA Settings'}
                                </h3>
                                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
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
                                ) : activeModal === 'profile' ? (
                                    <div className="space-y-6">
                                        <div className="text-center space-y-4">
                                            <div className="relative inline-block group/avatar cursor-pointer">
                                                <input
                                                    type="file"
                                                    id="avatar-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                                <label htmlFor="avatar-upload" className="cursor-pointer block">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden relative">
                                                        {avatarPreview ? (
                                                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : user?.avatar_url ? (
                                                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            profileForm.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                            <Camera className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </label>
                                                <div className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Public Display Identity</h4>
                                                <p className="text-xs text-slate-500">Klik pada foto untuk mengunggah foto profil baru.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={profileForm.display_name}
                                                    onChange={e => setProfileForm({ ...profileForm, display_name: e.target.value })}
                                                    placeholder="Masukkan nama lengkap Anda"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate Identity (NIK)</label>
                                                <input
                                                    type="text"
                                                    value={user?.nik_sap}
                                                    disabled
                                                    className="w-full bg-slate-900/50 border border-slate-800/50 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed opacity-70"
                                                />
                                                <p className="text-[10px] text-slate-600 italic">NIK terikat secara permanen dengan akun korporat Anda.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-6 py-2">
                                        <div className="w-20 h-20 bg-[#064e3b]/20 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                                <Smartphone className="w-7 h-7 text-emerald-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-2xl font-black text-white tracking-tight">Authenticator App</h4>
                                            <p className="text-sm text-slate-400 px-4 leading-relaxed">
                                                Gunakan aplikasi seperti Google Authenticator atau Microsoft Authenticator untuk mengamankan akun Anda.
                                            </p>
                                        </div>

                                        <div className="relative group mx-auto w-48 h-48">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                                            <div className="relative p-5 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden">
                                                {isLoading && !mfaEnrollData ? (
                                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                                ) : mfaEnrollData?.qr ? (
                                                    <img src={mfaEnrollData.qr} alt="MFA QR Code" className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-36 h-36 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 border-2 border-dashed border-slate-300 uppercase tracking-widest text-center px-4">
                                                        [QR CODE ERROR]
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 group-hover:border-emerald-500/30 transition-colors">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Manual Entry Key</span>
                                                <p className="text-sm font-mono text-emerald-400 font-bold tracking-[0.1em] break-all select-all">
                                                    {mfaEnrollData?.secret || '•••• •••• •••• ••••'}
                                                </p>
                                            </div>

                                            <div className="px-4">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Masukkan kode 6-digit"
                                                        value={mfaCode}
                                                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-center text-xl font-black tracking-[0.5em] text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-700 placeholder:tracking-normal placeholder:text-sm"
                                                        maxLength={6}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        onClick={() => handleSaveSettings(activeModal)}
                                        disabled={isLoading}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
