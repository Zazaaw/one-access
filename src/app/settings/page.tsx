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
    Camera,
    Wand2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Shell } from "@/components/Shell";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction } from "@/lib/actions/auth";
import { categoryGradient } from "@/lib/constants/appVisuals";

export default function SettingsPage() {
    const { user } = useAuth();

    const [activeModal, setActiveModal] = useState<'password' | 'mfa' | 'profile' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
    const [mfaEnrollData, setMfaEnrollData] = useState<{ id: string, qr: string, secret: string } | null>(null);
    const [mfaCode, setMfaCode] = useState("");
    const [profileForm, setProfileForm] = useState({ display_name: "" });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [securityStatus, setSecurityStatus] = useState({
        mfaActive: false,
        emailVerified: false
    });

    const [sessions, setSessions] = useState([
        { device: "Perangkat ini", location: "Mendeteksi...", ip: "...", time: "Sesi aktif", active: true },
    ]);

    const supabase = createClient();

    useEffect(() => {
        if (activeModal === 'mfa') {
            startMfaEnrollment();
        }
        if (activeModal === 'profile' && user) {
            setProfileForm({ display_name: user.display_name });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeModal, user]);

    useEffect(() => {
        const fetchSecurityInfo = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: factors } = await supabase.auth.mfa.listFactors();
                const isMfaActive = factors?.all?.some(f => f.status === 'verified') || false;
                const isEmailVerified = !!authUser.email_confirmed_at;

                setSecurityStatus({ mfaActive: isMfaActive, emailVerified: isEmailVerified });

                try {
                    const ipRes = await fetch('https://api.ipify.org?format=json');
                    const ipData = await ipRes.json();
                    setSessions([
                        {
                            device: navigator.userAgent.split(') ')[0].split(' (')[1] || "Mac/PC",
                            location: "Jaringan Indonesia",
                            ip: ipData.ip,
                            time: "Sesi aktif",
                            active: true
                        }
                    ]);
                } catch (e) {
                    console.error("Failed to fetch IP", e);
                }

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
                                device: log.metadata?.device || "Gateway",
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                    factorId: mfaEnrollData.id
                });
                if (challengeError) throw challengeError;

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

    const inputClass = "w-full rounded-xl border border-line bg-elevated px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";
    const modalTitle = activeModal === 'password' ? 'Ganti Password' : activeModal === 'profile' ? 'Edit Profil' : 'Multi-Factor Authentication';

    const SettingsRow = ({ icon: Icon, title, subtitle, onClick }: { icon: typeof Key, title: string, subtitle: string, onClick: () => void }) => (
        <button onClick={onClick} className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-elevated transition-colors group text-left">
            <div className="w-9 h-9 rounded-[10px] bg-elevated text-accent flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium">{title}</p>
                <p className="text-[13px] text-ink-2 truncate">{subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-3 group-hover:text-ink-2 group-hover:translate-x-0.5 transition-all shrink-0" strokeWidth={2} />
        </button>
    );

    return (
        <Shell>
            {/* Notification toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-16 right-6 z-[90] flex items-center gap-2.5 rounded-2xl bg-panel border border-line shadow-billboard px-4 py-3 max-w-sm"
                    >
                        {notification.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 shrink-0 text-good" strokeWidth={2} />
                        ) : (
                            <X className="w-5 h-5 shrink-0 text-danger" strokeWidth={2} />
                        )}
                        <p className="text-[13px] text-ink leading-snug">{notification.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cinematic profile hero (matches Hak Akses) */}
            <section className="relative w-full overflow-hidden">
                <div className="absolute inset-0" style={{ background: categoryGradient('Infrastructure') }} />
                <div className="absolute inset-0 bg-gradient-to-t from-stage via-stage/70 to-stage/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-stage/80 via-transparent to-transparent" />

                <div className="relative mx-auto max-w-5xl px-6 lg:px-8 pt-24 lg:pt-28 pb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70 mb-4">Akun & Keamanan</p>
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center text-2xl lg:text-3xl font-display font-extrabold overflow-hidden shrink-0 ring-1 ring-white/20">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user?.display_name || "Profil"} className="w-full h-full object-cover" />
                                ) : (
                                    user?.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'
                                )}
                            </div>
                            <div>
                                <h1 className="font-display text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.02] text-white">{user?.display_name}</h1>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-2.5 text-[13px] text-white/75">
                                    <span className="capitalize">{user?.subject_type}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                                    <span className="font-mono tnum">NIK {user?.nik_sap}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/40" aria-hidden="true" />
                                    <button onClick={() => setActiveModal('profile')} className="font-medium text-white hover:text-white/80 transition-colors underline underline-offset-2 decoration-white/30">Edit profil</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="mx-auto max-w-5xl px-6 lg:px-8 pt-4 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left column */}
                <div className="space-y-6">
                    <section className="space-y-2">
                        <h4 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide pl-1">Akses Akun</h4>
                        <div className="rounded-2xl bg-panel border border-line shadow-poster divide-y divide-line overflow-hidden">
                            <SettingsRow
                                icon={Key}
                                title="Ganti Password"
                                subtitle="Berlaku untuk seluruh aplikasi PTPN Group (SSO)."
                                onClick={() => setActiveModal('password')}
                            />
                            <SettingsRow
                                icon={Smartphone}
                                title="Multi-Factor Authentication"
                                subtitle={securityStatus.mfaActive ? 'Aktif melalui aplikasi authenticator.' : 'Tambahkan lapisan keamanan ekstra.'}
                                onClick={() => setActiveModal('mfa')}
                            />
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h4 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide pl-1">Aktivitas Login</h4>
                        <div className="rounded-2xl bg-panel border border-line shadow-poster p-5 divide-y divide-line">
                            {sessions.map((session, i) => (
                                <div key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${session.active ? 'bg-good' : 'bg-line'}`} aria-hidden="true" />
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-medium truncate">{session.device}</p>
                                            <p className="text-[12px] text-ink-3 truncate">{session.location} <span className="font-mono">({session.ip})</span></p>
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-ink-2 shrink-0">{session.time}</p>
                                </div>
                            ))}
                            <div className="pt-3">
                                <button
                                    onClick={handleGlobalLogout}
                                    disabled={isLoading}
                                    className="text-[13px] font-semibold text-danger hover:opacity-70 transition-opacity disabled:opacity-50"
                                >
                                    {isLoading ? 'Memproses...' : 'Keluar dari semua perangkat lain'}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    <section className="space-y-2">
                        <h4 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide pl-1">Status Keamanan</h4>
                        <div className="rounded-2xl bg-panel border border-line shadow-poster p-5 space-y-3">
                            <div className="flex items-center justify-between text-[14px]">
                                <span className="flex items-center gap-2.5 text-ink-2"><Shield className="w-4.5 h-4.5 text-ink-3" strokeWidth={2} /> Multi-Factor Auth</span>
                                <span className={`font-semibold ${securityStatus.mfaActive ? 'text-good' : 'text-ink-3'}`}>{securityStatus.mfaActive ? 'Aktif' : 'Nonaktif'}</span>
                            </div>
                            <div className="h-px bg-line" />
                            <div className="flex items-center justify-between text-[14px]">
                                <span className="flex items-center gap-2.5 text-ink-2"><CheckCircle2 className="w-4.5 h-4.5 text-ink-3" strokeWidth={2} /> Email pemulihan</span>
                                <span className={`font-semibold ${securityStatus.emailVerified ? 'text-good' : 'text-ink-3'}`}>{securityStatus.emailVerified ? 'Terverifikasi' : 'Belum'}</span>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h4 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide pl-1">Preferensi</h4>
                        <div className="rounded-2xl bg-panel border border-line shadow-poster p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5">
                                    <Globe className="w-4.5 h-4.5 text-ink-3" strokeWidth={2} />
                                    <span className="text-[14px] font-medium">Bahasa</span>
                                </div>
                                <div className="inline-flex items-center rounded-lg bg-line p-0.5">
                                    <button
                                        onClick={() => handleLanguageChange('id')}
                                        className={`rounded-md px-3 py-1 text-[13px] font-medium transition-all ${language === 'id' ? 'bg-panel text-ink shadow-sm' : 'text-ink-2'}`}
                                    >
                                        Indonesia
                                    </button>
                                    <button
                                        onClick={() => handleLanguageChange('en')}
                                        className={`rounded-md px-3 py-1 text-[13px] font-medium transition-all ${language === 'en' ? 'bg-panel text-ink shadow-sm' : 'text-ink-2'}`}
                                    >
                                        English
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-2">
                        <h4 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide pl-1">Studio Aplikasi</h4>
                        <Link href="/kelola" className="press flex items-center gap-3.5 rounded-2xl bg-panel border border-line shadow-poster p-5 hover:border-white/20 transition-colors group">
                            <div className="w-9 h-9 rounded-[10px] bg-elevated text-accent flex items-center justify-center shrink-0">
                                <Wand2 className="w-5 h-5" strokeWidth={1.75} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-medium">Kelola Aplikasi</p>
                                <p className="text-[13px] text-ink-2">Atur poster, artwork, dan deskripsi aplikasi yang Anda kelola.</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-ink-3 group-hover:text-ink-2 group-hover:translate-x-0.5 transition-all shrink-0" strokeWidth={2} />
                        </Link>
                    </section>
                </div>
            </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveModal(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full sm:max-w-md rounded-t-[22px] sm:rounded-2xl bg-panel border border-line shadow-billboard overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-line flex justify-between items-center">
                                <h3 className="font-display text-[17px] font-bold tracking-tight">{modalTitle}</h3>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    aria-label="Tutup"
                                    className="p-1.5 rounded-full text-ink-3 hover:text-ink hover:bg-line transition-colors"
                                >
                                    <X className="w-5 h-5" strokeWidth={2} />
                                </button>
                            </div>

                            <div className="p-6 space-y-5 max-h-[75dvh] overflow-y-auto">
                                {activeModal === 'password' ? (
                                    <>
                                        <div className="space-y-3.5">
                                            <div className="space-y-1.5">
                                                <label htmlFor="current-password" className="block text-[13px] font-medium text-ink-2 pl-1">Password saat ini</label>
                                                <input id="current-password" type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className={inputClass} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="new-password" className="block text-[13px] font-medium text-ink-2 pl-1">Password baru</label>
                                                <input id="new-password" type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} className={inputClass} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="confirm-password" className="block text-[13px] font-medium text-ink-2 pl-1">Konfirmasi password baru</label>
                                                <input id="confirm-password" type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className={inputClass} />
                                            </div>
                                        </div>
                                        <p className="text-[12px] text-ink-3 leading-relaxed px-1">
                                            Password baru berlaku untuk seluruh aplikasi PTPN Group (SSO). Sesi di perangkat lain akan diakhiri.
                                        </p>
                                    </>
                                ) : activeModal === 'profile' ? (
                                    <div className="space-y-5">
                                        <div className="text-center space-y-2.5">
                                            <div className="relative inline-block group/avatar">
                                                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                <label htmlFor="avatar-upload" className="cursor-pointer block">
                                                    <div className="w-20 h-20 rounded-full bg-elevated text-ink flex items-center justify-center text-2xl font-display font-extrabold overflow-hidden relative ring-1 ring-white/10">
                                                        {avatarPreview ? (
                                                            <img src={avatarPreview} alt="Pratinjau" className="w-full h-full object-cover" />
                                                        ) : user?.avatar_url ? (
                                                            <img src={user.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                                                        ) : (
                                                            profileForm.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                                            <Camera className="w-6 h-6 text-white" strokeWidth={1.75} />
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                            <p className="text-[12px] text-ink-3">Klik foto untuk mengganti.</p>
                                        </div>

                                        <div className="space-y-3.5">
                                            <div className="space-y-1.5">
                                                <label htmlFor="display-name" className="block text-[13px] font-medium text-ink-2 pl-1">Nama tampilan</label>
                                                <input id="display-name" type="text" value={profileForm.display_name} onChange={e => setProfileForm({ ...profileForm, display_name: e.target.value })} placeholder="Masukkan nama lengkap Anda" className={inputClass} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="nik-field" className="block text-[13px] font-medium text-ink-2 pl-1">NIK korporat</label>
                                                <input id="nik-field" type="text" value={user?.nik_sap} disabled className="w-full rounded-xl border border-line bg-line px-4 py-3 font-mono text-[15px] text-ink-3 cursor-not-allowed" />
                                                <p className="text-[12px] text-ink-3 pl-1">NIK terikat permanen dengan akun korporat Anda.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-5">
                                        <p className="text-[14px] text-ink-2 leading-relaxed">
                                            Pindai kode QR dengan Google Authenticator, Microsoft Authenticator, atau aplikasi sejenis.
                                        </p>

                                        <div className="mx-auto w-44 h-44 rounded-2xl bg-white p-4 flex items-center justify-center border border-line">
                                            {isLoading && !mfaEnrollData ? (
                                                <Loader2 className="w-7 h-7 animate-spin text-ink-3" strokeWidth={2} />
                                            ) : mfaEnrollData?.qr ? (
                                                <img src={mfaEnrollData.qr} alt="Kode QR MFA" className="w-full h-full object-contain" />
                                            ) : (
                                                <p className="text-[12px] text-ink-3 px-3">Kode QR gagal dimuat. Tutup lalu buka kembali.</p>
                                            )}
                                        </div>

                                        <div className="space-y-3 text-left">
                                            <div className="rounded-xl bg-elevated border border-line p-3.5 space-y-1">
                                                <p className="text-[12px] text-ink-3">Kunci manual</p>
                                                <p className="font-mono text-[13px] text-accent font-medium break-all select-all">
                                                    {mfaEnrollData?.secret || 'Memuat kunci...'}
                                                </p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label htmlFor="mfa-code" className="block text-[13px] font-medium text-ink-2 pl-1">Kode 6 digit</label>
                                                <input
                                                    id="mfa-code"
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="000000"
                                                    value={mfaCode}
                                                    onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-center text-xl font-mono tnum tracking-[0.4em] text-ink placeholder:text-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                                                    maxLength={6}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleSaveSettings(activeModal)}
                                    disabled={isLoading}
                                    className="w-full rounded-full bg-accent hover:bg-accent-2 text-stage text-[15px] font-semibold py-3 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} /> : 'Simpan'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Shell>
    );
}
