"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ShieldCheck,
    BarChart3,
    Users,
    Layers,
    Activity,
    Globe,
    Database,
    Scale,
    Briefcase,
    CornerDownLeft,
    Loader2,
    type LucideIcon
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Application } from "@/lib/types/iam";
import { launchAppWithSSO } from "@/lib/launch";
import { useAuth } from "@/context/AuthContext";
import { categoryGradient } from "@/lib/constants/appVisuals";

const IconMap: Record<string, LucideIcon> = {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase
};

export function CommandPalette({ open, onClose }: { open: boolean, onClose: () => void }) {
    const { user } = useAuth();
    const [apps, setApps] = useState<Application[] | null>(null);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const wasOpen = useRef(false);

    useEffect(() => {
        if (open && apps === null) {
            fetch('/api/my-apps')
                .then(res => res.json())
                .then(data => setApps(Array.isArray(data) ? data : []))
                .catch(() => setApps([]));
        }
        if (open) {
            const t = setTimeout(() => inputRef.current?.focus(), 30);
            wasOpen.current = true;
            return () => clearTimeout(t);
        }
        if (wasOpen.current) {
            wasOpen.current = false;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery("");
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveIndex(0);
        }
    }, [open, apps]);

    const filtered = (apps || []).filter(app =>
        app.app_name.toLowerCase().includes(query.toLowerCase()) ||
        app.category.toLowerCase().includes(query.toLowerCase())
    );

    const handleQueryChange = (value: string) => {
        setQuery(value);
        setActiveIndex(0);
    };

    const handleLaunch = useCallback((app: Application) => {
        onClose();
        launchAppWithSSO(app, user?.subject_id);
    }, [onClose, user?.subject_id]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
            else if (e.key === 'Enter' && filtered[activeIndex]) { e.preventDefault(); handleLaunch(filtered[activeIndex]); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, filtered, activeIndex, onClose, handleLaunch]);

    useEffect(() => {
        const el = listRef.current?.querySelector('[data-active="true"]');
        el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[12dvh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.99 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-lg rounded-2xl bg-panel border border-line shadow-billboard overflow-hidden"
                        role="dialog" aria-modal="true" aria-label="Cari aplikasi"
                    >
                        <div className="flex items-center gap-3 px-4 border-b border-line">
                            <Search className="w-5 h-5 text-ink-3 shrink-0" strokeWidth={2} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                placeholder="Cari aplikasi..."
                                className="w-full bg-transparent py-3.5 text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
                            />
                        </div>

                        <div ref={listRef} className="max-h-[44dvh] overflow-y-auto p-1.5">
                            {apps === null ? (
                                <div className="flex items-center justify-center gap-2.5 py-10 text-ink-3">
                                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                                    <span className="text-[13px]">Memuat aplikasi Anda...</span>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="py-10 text-center space-y-1">
                                    <p className="text-[14px] font-medium text-ink">Tidak ada hasil</p>
                                    <p className="text-[13px] text-ink-3">Coba kata kunci lain.</p>
                                </div>
                            ) : (
                                filtered.map((app, i) => {
                                    const Icon = IconMap[app.icon_name] || Layers;
                                    const isActive = i === activeIndex;
                                    return (
                                        <button
                                            key={app.id}
                                            data-active={isActive}
                                            onMouseEnter={() => setActiveIndex(i)}
                                            onClick={() => handleLaunch(app)}
                                            className={`w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${isActive ? 'bg-elevated' : ''}`}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white shrink-0"
                                                style={{ background: categoryGradient(app.category) }}
                                            >
                                                <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-medium text-ink truncate">{app.app_name}</p>
                                                <p className="text-[12px] text-ink-3 truncate">{app.category}</p>
                                            </div>
                                            {isActive && (
                                                <span className="flex items-center gap-1 shrink-0 text-[12px] font-medium text-accent">
                                                    buka <CornerDownLeft className="w-3.5 h-3.5" strokeWidth={2} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-ink-3">
                            <span className="flex items-center gap-1.5"><kbd className="rounded bg-elevated px-1.5 py-0.5 font-mono">↑↓</kbd> navigasi</span>
                            <span className="flex items-center gap-1.5"><kbd className="rounded bg-elevated px-1.5 py-0.5 font-mono">↵</kbd> buka</span>
                            <span className="flex items-center gap-1.5"><kbd className="rounded bg-elevated px-1.5 py-0.5 font-mono">esc</kbd> tutup</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
