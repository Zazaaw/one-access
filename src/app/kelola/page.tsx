"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2, Upload, Check, X, ChevronLeft, ImageIcon, Wand2, ShieldCheck, AlertCircle, Youtube, Link2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shell } from "@/components/Shell";
import { parseYouTubeId, youTubeThumbnail } from "@/lib/youtube";
import { AppDetail } from "@/lib/types/iam";

interface ManagedApp {
    id: string;
    app_code: string;
    app_name: string;
    app_description: string | null;
    app_category: string | null;
    poster_url: string | null;
    artwork_url: string | null;
    artwork_video_url: string | null;
    logo_url: string | null;
    creator_name: string | null;
    publisher_name: string | null;
    app_detail: AppDetail | null;
}

// Poster & logo are image-upload only; artwork gets its own section (image OR video).
const IMAGE_SPECS: { kind: 'poster' | 'logo'; label: string; hint: string; aspect: string }[] = [
    { kind: 'poster', label: 'Poster', hint: '600 x 900 (2:3)', aspect: 'aspect-[2/3] max-w-[160px]' },
    { kind: 'logo', label: 'Logo', hint: '512 x 192, PNG transparan', aspect: 'aspect-[512/192] bg-elevated' },
];

export default function KelolaPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [apps, setApps] = useState<ManagedApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<ManagedApp | null>(null);

    useEffect(() => {
        if (user) fetchApps();
    }, [user]);

    const fetchApps = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/manage/apps');
            const data = await res.json();
            setApps(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthLoading || isLoading) {
        return <Shell><div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-accent" strokeWidth={2} /></div></Shell>;
    }

    return (
        <Shell>
            <div className="mx-auto max-w-5xl px-6 lg:px-8 pt-24 lg:pt-28 pb-12">
                {!selected ? (
                    <>
                        <motion.header
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="pb-8"
                        >
                            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3 mb-3">Studio Aplikasi</p>
                            <h1 className="font-display text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.02]">Kelola Aplikasi</h1>
                            <p className="text-[15px] text-ink-2 mt-3 max-w-xl leading-relaxed">
                                Atur poster, artwork, logo, dan deskripsi untuk aplikasi yang Anda kelola sebagai Super Administrator.
                            </p>
                        </motion.header>

                        {apps.length === 0 ? (
                            <div className="rounded-2xl bg-panel border border-line px-8 py-16 text-center space-y-3">
                                <div className="w-14 h-14 rounded-[15px] bg-elevated text-ink-3 flex items-center justify-center mx-auto"><ShieldCheck className="w-6 h-6" strokeWidth={1.75} /></div>
                                <p className="text-[17px] font-semibold">Belum ada aplikasi untuk dikelola</p>
                                <p className="text-[14px] text-ink-2 max-w-md mx-auto">Anda perlu peran <span className="font-medium text-ink">Super Administrator</span> pada sebuah aplikasi untuk mengelola tampilannya.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {apps.map((app, i) => (
                                    <motion.button
                                        key={app.id}
                                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                        onClick={() => setSelected(app)}
                                        className="press group rounded-2xl bg-panel border border-line hover:border-white/20 shadow-poster p-4 text-left flex items-center gap-4 transition-colors"
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0 bg-elevated grid place-items-center">
                                            {app.poster_url ? (
                                                <img src={app.poster_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-ink-3" strokeWidth={1.5} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-display text-[15px] font-bold tracking-tight truncate">{app.app_name}</p>
                                            <p className="text-[12px] text-ink-3 mt-0.5">
                                                {[app.poster_url, app.artwork_url, app.logo_url].filter(Boolean).length}/3 gambar diatur
                                            </p>
                                        </div>
                                        <Wand2 className="w-4.5 h-4.5 text-ink-3 group-hover:text-accent transition-colors shrink-0" strokeWidth={2} />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <AppEditor app={selected} onBack={() => setSelected(null)} onSaved={(u) => { setSelected(u); setApps(prev => prev.map(a => a.id === u.id ? u : a)); }} />
                )}
            </div>
        </Shell>
    );
}

function AppEditor({ app, onBack, onSaved }: { app: ManagedApp; onBack: () => void; onSaved: (a: ManagedApp) => void }) {
    const [draft, setDraft] = useState<ManagedApp>(app);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
    }, [toast]);

    const [artTab, setArtTab] = useState<'image' | 'video'>(app.artwork_video_url ? 'video' : 'image');
    const videoId = parseYouTubeId(draft.artwork_video_url);

    // --- app_detail (poin 3-7 + tim) helpers ---
    const detail: AppDetail = draft.app_detail || {};
    const patchDetail = (patch: Partial<AppDetail>) =>
        setDraft(p => ({ ...p, app_detail: { ...(p.app_detail || {}), ...patch } }));

    const features = detail.features || [];
    const advantages = detail.advantages || [];
    const team = detail.team || [];
    const [uploadingTeam, setUploadingTeam] = useState<number | null>(null);

    const uploadTeamPhoto = async (idx: number, file: File) => {
        setUploadingTeam(idx);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('app_id', app.id);
            fd.append('kind', 'team');
            const res = await fetch('/api/manage/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal upload');
            const next = [...team];
            next[idx] = { ...next[idx], photo_url: data.url };
            patchDetail({ team: next });
        } catch (e) {
            setToast({ msg: (e as Error).message, ok: false });
        } finally {
            setUploadingTeam(null);
        }
    };

    const upload = async (kind: 'poster' | 'artwork' | 'logo', file: File) => {
        setUploading(kind);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('app_id', app.id);
            fd.append('kind', kind);
            const res = await fetch('/api/manage/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal upload');
            setDraft(prev => ({ ...prev, [`${kind}_url`]: data.url }));
            setToast({ msg: `${kind} berhasil diunggah. Jangan lupa Simpan.`, ok: true });
        } catch (e) {
            setToast({ msg: (e as Error).message, ok: false });
        } finally {
            setUploading(null);
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/manage/apps', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    app_id: app.id,
                    app_category: draft.app_category || 'Enterprise',
                    app_detail: draft.app_detail || {},
                    app_description: draft.app_description,
                    poster_url: draft.poster_url,
                    artwork_url: draft.artwork_url,
                    artwork_video_url: draft.artwork_video_url,
                    logo_url: draft.logo_url,
                    creator_name: draft.creator_name,
                    publisher_name: draft.publisher_name,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
            onSaved(data);
            setToast({ msg: 'Perubahan tersimpan.', ok: true });
        } catch (e) {
            setToast({ msg: (e as Error).message, ok: false });
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full rounded-xl border border-line bg-elevated px-4 py-3 text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

    return (
        <div>
            <button onClick={onBack} className="press flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink transition-colors mb-6">
                <ChevronLeft className="w-4 h-4" strokeWidth={2.25} /> Semua aplikasi
            </button>

            <div className="flex items-baseline justify-between gap-4 mb-8">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3 mb-2">{app.app_code}</p>
                    <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight">{app.app_name}</h1>
                </div>
                <button onClick={save} disabled={saving} className="press shrink-0 flex items-center gap-2 rounded-full bg-accent hover:bg-accent-2 text-stage font-semibold px-6 py-2.5 text-[14px] transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Check className="w-4 h-4" strokeWidth={2.5} />} Simpan
                </button>
            </div>

            {/* Poster + Logo (image upload only) */}
            <section className="space-y-4">
                <h2 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide">Gambar</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {IMAGE_SPECS.map(spec => {
                        const url = draft[`${spec.kind}_url` as keyof ManagedApp] as string | null;
                        return (
                            <div key={spec.kind} className="rounded-2xl bg-panel border border-line p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[13px] font-semibold">{spec.label}</p>
                                    <span className="text-[11px] text-ink-3">{spec.hint}</span>
                                </div>
                                <div className={`relative w-full ${spec.aspect} rounded-lg overflow-hidden ring-1 ring-white/10 grid place-items-center`} style={{ background: url ? undefined : 'var(--elevated)' }}>
                                    {url ? (
                                        <img src={url} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="w-7 h-7 text-ink-3" strokeWidth={1.25} />
                                    )}
                                    {uploading === spec.kind && (
                                        <div className="absolute inset-0 bg-black/50 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-white" strokeWidth={2} /></div>
                                    )}
                                </div>
                                <input
                                    ref={el => { fileRefs.current[spec.kind] = el; }}
                                    type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) upload(spec.kind, f); e.target.value = ''; }}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => fileRefs.current[spec.kind]?.click()} disabled={!!uploading} className="press flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-elevated hover:bg-line py-2 text-[13px] font-medium transition-colors disabled:opacity-50">
                                        <Upload className="w-3.5 h-3.5" strokeWidth={2} /> Unggah
                                    </button>
                                    {url && (
                                        <button onClick={() => setDraft(prev => ({ ...prev, [`${spec.kind}_url`]: null }))} className="press rounded-lg bg-elevated hover:bg-line px-3 text-ink-3 hover:text-danger transition-colors" aria-label="Hapus">
                                            <X className="w-4 h-4" strokeWidth={2} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Artwork / Hero: image OR YouTube video */}
            <section className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide">Artwork / Hero</h2>
                    <span className="text-[11px] text-ink-3">2400 x 1200 (2:1) atau video YouTube</span>
                </div>
                <div className="rounded-2xl bg-panel border border-line p-4 space-y-4">
                    {/* Tabs */}
                    <div className="inline-flex items-center rounded-lg bg-elevated p-0.5">
                        <button onClick={() => setArtTab('image')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${artTab === 'image' ? 'bg-panel text-ink shadow-sm' : 'text-ink-2'}`}>
                            <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} /> Unggah gambar
                        </button>
                        <button onClick={() => setArtTab('video')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${artTab === 'video' ? 'bg-panel text-ink shadow-sm' : 'text-ink-2'}`}>
                            <Youtube className="w-3.5 h-3.5" strokeWidth={2} /> URL YouTube
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 grid place-items-center bg-elevated">
                        {artTab === 'video' && videoId ? (
                            <>
                                <img src={youTubeThumbnail(videoId)} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 grid place-items-center bg-black/25">
                                    <span className="grid place-items-center w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm"><Youtube className="w-6 h-6 text-white" strokeWidth={2} /></span>
                                </div>
                            </>
                        ) : artTab === 'image' && draft.artwork_url ? (
                            <img src={draft.artwork_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-7 h-7 text-ink-3" strokeWidth={1.25} />
                        )}
                        {uploading === 'artwork' && (
                            <div className="absolute inset-0 bg-black/50 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-white" strokeWidth={2} /></div>
                        )}
                    </div>

                    {artTab === 'image' ? (
                        <div className="flex gap-2">
                            <input
                                ref={el => { fileRefs.current['artwork'] = el; }}
                                type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) upload('artwork', f); e.target.value = ''; }}
                            />
                            <button onClick={() => fileRefs.current['artwork']?.click()} disabled={!!uploading} className="press flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-elevated hover:bg-line py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50">
                                <Upload className="w-3.5 h-3.5" strokeWidth={2} /> Unggah gambar
                            </button>
                            {draft.artwork_url && (
                                <button onClick={() => setDraft(p => ({ ...p, artwork_url: null }))} className="press rounded-lg bg-elevated hover:bg-line px-3 text-ink-3 hover:text-danger transition-colors" aria-label="Hapus">
                                    <X className="w-4 h-4" strokeWidth={2} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="relative">
                                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" strokeWidth={2} />
                                <input
                                    value={draft.artwork_video_url || ''}
                                    onChange={e => setDraft(p => ({ ...p, artwork_video_url: e.target.value }))}
                                    placeholder="Tempel tautan YouTube (youtube.com/... atau youtu.be/...)"
                                    className={`${inputClass} pl-10 pr-9`}
                                />
                                {draft.artwork_video_url && (
                                    <button onClick={() => setDraft(p => ({ ...p, artwork_video_url: null }))} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-ink-3 hover:text-danger transition-colors" aria-label="Hapus">
                                        <X className="w-4 h-4" strokeWidth={2} />
                                    </button>
                                )}
                            </div>
                            <p className={`text-[12px] ${draft.artwork_video_url && !videoId ? 'text-danger' : 'text-ink-3'}`}>
                                {draft.artwork_video_url && !videoId
                                    ? 'Tautan tidak valid. Gunakan URL YouTube.'
                                    : 'Video akan diputar otomatis sebagai latar hero (tanpa suara).'}
                            </p>
                        </div>
                    )}
                    {(draft.artwork_url && draft.artwork_video_url) && (
                        <p className="text-[12px] text-warn flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" strokeWidth={2} /> Video akan diprioritaskan bila keduanya diisi.</p>
                    )}
                </div>
            </section>

            {/* Text fields */}
            <section className="space-y-4 mt-8">
                <h2 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide">Informasi</h2>
                <div className="rounded-2xl bg-panel border border-line p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-ink-2">Kategori</label>
                        <div className="inline-flex items-center rounded-lg bg-elevated p-0.5">
                            {(['Enterprise', 'Personal'] as const).map(cat => {
                                const active = (draft.app_category || 'Enterprise') === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setDraft(p => ({ ...p, app_category: cat }))}
                                        className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${active ? 'bg-panel text-ink shadow-sm' : 'text-ink-2 hover:text-ink'}`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-ink-2">Deskripsi</label>
                        <textarea value={draft.app_description || ''} onChange={e => setDraft(p => ({ ...p, app_description: e.target.value }))} placeholder="Jelaskan aplikasi ini dalam 1-2 kalimat." className={`${inputClass} min-h-[90px]`} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-ink-2">Developer</label>
                            <input value={draft.creator_name || ''} onChange={e => setDraft(p => ({ ...p, creator_name: e.target.value }))} placeholder="Nama pembuat" className={inputClass} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-ink-2">Divisi / Publisher</label>
                            <input value={draft.publisher_name || ''} onChange={e => setDraft(p => ({ ...p, publisher_name: e.target.value }))} placeholder="Nama divisi" className={inputClass} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Detail Aplikasi (poin 3-7) */}
            <section className="space-y-4 mt-8">
                <h2 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide">Detail Aplikasi</h2>
                <div className="rounded-2xl bg-panel border border-line p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-ink-2">Target Pengguna</label>
                            <textarea value={detail.target_users || ''} onChange={e => patchDetail({ target_users: e.target.value })} placeholder="Siapa pengguna utama? (mis. karyawan HR, manajer, dll)" className={`${inputClass} min-h-[80px]`} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-ink-2">Masalah yang Diselesaikan</label>
                            <textarea value={detail.problem || ''} onChange={e => patchDetail({ problem: e.target.value })} placeholder="Pain point pengguna & bagaimana aplikasi menyelesaikannya." className={`${inputClass} min-h-[80px]`} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-ink-2">Manfaat</label>
                        <textarea value={detail.benefits || ''} onChange={e => patchDetail({ benefits: e.target.value })} placeholder="Manfaat bagi pengguna, organisasi, dan administrator." className={`${inputClass} min-h-[70px]`} />
                    </div>

                    {/* Fitur Utama (list) */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-ink-2">Fitur Utama</label>
                        <div className="space-y-2">
                            {features.map((f, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={f.name} onChange={e => { const next = [...features]; next[i] = { ...next[i], name: e.target.value }; patchDetail({ features: next }); }} placeholder="Nama fitur" className={`${inputClass} flex-1`} />
                                    <input value={f.note || ''} onChange={e => { const next = [...features]; next[i] = { ...next[i], note: e.target.value }; patchDetail({ features: next }); }} placeholder="Penjelasan singkat (opsional)" className={`${inputClass} flex-1`} />
                                    <button onClick={() => patchDetail({ features: features.filter((_, x) => x !== i) })} className="press rounded-lg bg-elevated hover:bg-line px-3 text-ink-3 hover:text-danger transition-colors shrink-0" aria-label="Hapus fitur"><X className="w-4 h-4" strokeWidth={2} /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => patchDetail({ features: [...features, { name: '' }] })} className="press text-[13px] font-medium text-accent hover:text-accent-2 transition-colors">+ Tambah fitur</button>
                    </div>

                    {/* Keunggulan (chips) */}
                    <div className="space-y-2">
                        <label className="text-[13px] font-medium text-ink-2">Keunggulan</label>
                        <div className="space-y-2">
                            {advantages.map((a, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={a} onChange={e => { const next = [...advantages]; next[i] = e.target.value; patchDetail({ advantages: next }); }} placeholder="mis. Berbasis cloud, Real-time, Aman" className={`${inputClass} flex-1`} />
                                    <button onClick={() => patchDetail({ advantages: advantages.filter((_, x) => x !== i) })} className="press rounded-lg bg-elevated hover:bg-line px-3 text-ink-3 hover:text-danger transition-colors shrink-0" aria-label="Hapus"><X className="w-4 h-4" strokeWidth={2} /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => patchDetail({ advantages: [...advantages, ''] })} className="press text-[13px] font-medium text-accent hover:text-accent-2 transition-colors">+ Tambah keunggulan</button>
                    </div>
                </div>
            </section>

            {/* Developer & Tim */}
            <section className="space-y-4 mt-8">
                <h2 className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide">Tim Pengembang</h2>
                <div className="rounded-2xl bg-panel border border-line p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {team.map((m, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-xl bg-elevated p-3">
                                <button
                                    onClick={() => fileRefs.current[`team-${i}`]?.click()}
                                    disabled={uploadingTeam !== null}
                                    className="relative w-14 h-14 rounded-full overflow-hidden bg-panel ring-1 ring-white/10 grid place-items-center shrink-0 group"
                                    aria-label="Unggah foto"
                                >
                                    {m.photo_url ? (
                                        <img src={m.photo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-ink-3" strokeWidth={1.5} />
                                    )}
                                    <span className="absolute inset-0 bg-black/50 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {uploadingTeam === i ? <Loader2 className="w-4 h-4 animate-spin text-white" strokeWidth={2} /> : <Upload className="w-4 h-4 text-white" strokeWidth={2} />}
                                    </span>
                                </button>
                                <input ref={el => { fileRefs.current[`team-${i}`] = el; }} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadTeamPhoto(i, f); e.target.value = ''; }} />
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <input value={m.name} onChange={e => { const next = [...team]; next[i] = { ...next[i], name: e.target.value }; patchDetail({ team: next }); }} placeholder="Nama" className={`${inputClass} py-2`} />
                                    <input value={m.role} onChange={e => { const next = [...team]; next[i] = { ...next[i], role: e.target.value }; patchDetail({ team: next }); }} placeholder="Peran (mis. Lead Developer)" className={`${inputClass} py-2`} />
                                </div>
                                <button onClick={() => patchDetail({ team: team.filter((_, x) => x !== i) })} className="press rounded-lg bg-panel hover:bg-line px-2.5 py-2 text-ink-3 hover:text-danger transition-colors shrink-0 self-start" aria-label="Hapus anggota"><X className="w-4 h-4" strokeWidth={2} /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => patchDetail({ team: [...team, { name: '', role: '' }] })} className="press text-[13px] font-medium text-accent hover:text-accent-2 transition-colors">+ Tambah anggota tim</button>
                </div>
            </section>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 12, x: '-50%' }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-24 lg:bottom-8 left-1/2 z-[200] flex items-center gap-3 rounded-xl bg-panel border border-line shadow-billboard px-4 py-3.5 min-w-[300px] max-w-md"
                    >
                        {toast.ok ? <Check className="w-5 h-5 shrink-0 text-good" strokeWidth={2.5} /> : <AlertCircle className="w-5 h-5 shrink-0 text-danger" strokeWidth={2} />}
                        <p className="flex-1 text-[13px] leading-snug">{toast.msg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
