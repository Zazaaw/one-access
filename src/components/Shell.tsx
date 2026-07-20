"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutGrid,
    Layers,
    Users,
    Settings,
    LogOut,
    Search,
    PanelLeft,
    Loader2,
    ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
    { icon: LayoutGrid, label: "Beranda", href: "/dashboard" },
    { icon: Layers, label: "Katalog", href: "/app-catalog" },
    { icon: Users, label: "Hak Akses", href: "/access-rights" },
    { icon: Settings, label: "Pengaturan", href: "/settings" },
];

export function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout, isLoading } = useAuth();
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [sidebar, setSidebar] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen(open => !open);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Restore sidebar preference
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSidebar(localStorage.getItem('oneaccess-nav') === 'sidebar');
    }, []);

    const toggleSidebar = () => {
        setSidebar(prev => {
            const next = !prev;
            localStorage.setItem('oneaccess-nav', next ? 'sidebar' : 'pill');
            return next;
        });
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const initials = user?.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U';

    return (
        <div className="min-h-[100dvh] bg-stage text-ink">
            {/* ================= SIDEBAR MODE ================= */}
            {sidebar && (
                <aside className="hidden lg:flex fixed left-0 top-0 z-50 h-full w-64 flex-col bg-panel/95 backdrop-blur-xl border-r border-line">
                    <div className="flex items-center gap-2 px-4 h-14 shrink-0">
                        <button
                            onClick={toggleSidebar}
                            aria-label="Sembunyikan sidebar"
                            className="p-2 rounded-lg text-ink-2 hover:text-ink hover:bg-elevated transition-colors"
                        >
                            <PanelLeft className="w-5 h-5" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="px-3 pb-2">
                        <button
                            onClick={() => setPaletteOpen(true)}
                            className="w-full flex items-center gap-3 rounded-xl bg-elevated px-3.5 py-2.5 text-ink-3 hover:text-ink-2 transition-colors"
                        >
                            <Search className="w-4 h-4" strokeWidth={2} />
                            <span className="text-[14px]">Cari</span>
                            <kbd className="ml-auto font-mono text-[11px]">⌘K</kbd>
                        </button>
                    </div>

                    <nav className="px-3 py-2 space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors ${isActive
                                        ? 'bg-elevated text-ink'
                                        : 'text-ink-2 hover:text-ink hover:bg-elevated/60'}`}
                                >
                                    <item.icon className="w-[18px] h-[18px]" strokeWidth={2} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto p-3 border-t border-line flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-elevated text-ink flex items-center justify-center text-[11px] font-semibold overflow-hidden ring-1 ring-white/10 shrink-0">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user?.display_name || "Profil"} className="w-full h-full object-cover" />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium truncate">{user?.display_name}</p>
                            <p className="text-[11px] font-mono text-ink-3 truncate tnum">{user?.nik_sap}</p>
                        </div>
                        <ThemeToggle />
                        <button
                            onClick={() => logout()}
                            disabled={isLoading}
                            aria-label="Logout"
                            className="p-1.5 rounded-lg text-ink-2 hover:text-danger hover:bg-elevated transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <LogOut className="w-4 h-4" strokeWidth={2} />}
                        </button>
                    </div>
                </aside>
            )}

            {/* ================= PILL NAVBAR MODE (floating, centered) ================= */}
            {/* Rendered as an overlay; on mobile it's always the pill/dock regardless of sidebar */}
            <header className={`fixed top-0 inset-x-0 z-40 pointer-events-none ${sidebar ? 'lg:pl-64' : ''}`}>
                {/* scrim that fades in on scroll */}
                <div className={`absolute inset-0 transition-colors duration-300 ${scrolled ? 'bg-stage/70 backdrop-blur-xl border-b border-line' : 'bg-gradient-to-b from-black/40 to-transparent'}`} />

                <div className="relative h-14 px-4 lg:px-6 flex items-center">
                    {/* sidebar toggle (only in pill mode, desktop) */}
                    {!sidebar && (
                        <button
                            onClick={toggleSidebar}
                            aria-label="Tampilkan sidebar"
                            className="pointer-events-auto hidden lg:grid place-items-center w-9 h-9 rounded-full bg-panel/70 backdrop-blur-md text-ink-2 hover:text-ink hover:bg-panel transition-colors mr-3"
                        >
                            <PanelLeft className="w-4.5 h-4.5" strokeWidth={2} />
                        </button>
                    )}

                    {/* Floating pill, centered */}
                    {!sidebar && (
                        <nav className="pointer-events-auto absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-0.5 rounded-full bg-panel/70 backdrop-blur-2xl ring-1 ring-white/10 shadow-poster p-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition-colors ${isActive
                                            ? 'bg-ink text-stage'
                                            : 'text-ink-2 hover:text-ink'}`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <button
                                onClick={() => setPaletteOpen(true)}
                                aria-label="Cari"
                                className={`rounded-full w-8 h-8 grid place-items-center transition-colors text-ink-2 hover:text-ink`}
                            >
                                <Search className="w-4 h-4" strokeWidth={2} />
                            </button>
                        </nav>
                    )}

                    {/* Mobile brand (both modes) */}
                    <Link href="/dashboard" className="pointer-events-auto lg:hidden flex items-center gap-2">
                        <span className="grid place-items-center w-8 h-8 rounded-lg bg-accent text-stage">
                            <ShieldCheck className="w-4.5 h-4.5" strokeWidth={2} />
                        </span>
                        <span className="font-display font-extrabold tracking-tight text-[15px]">OneAccess</span>
                    </Link>

                    {/* Right cluster (pill mode) */}
                    {!sidebar && (
                        <div className="pointer-events-auto ml-auto hidden lg:flex items-center gap-1.5">
                            <ThemeToggle className="bg-panel/70 backdrop-blur-md hover:bg-panel" />
                            <div className="w-9 h-9 rounded-full bg-panel/70 backdrop-blur-md ring-1 ring-white/10 text-ink flex items-center justify-center text-[11px] font-semibold overflow-hidden">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user?.display_name || "Profil"} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                            <button
                                onClick={() => logout()}
                                disabled={isLoading}
                                aria-label="Logout"
                                className="w-9 h-9 grid place-items-center rounded-full bg-panel/70 backdrop-blur-md text-ink-2 hover:text-danger transition-colors disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <LogOut className="w-4 h-4" strokeWidth={2} />}
                            </button>
                        </div>
                    )}

                    {/* Mobile right cluster */}
                    <div className="pointer-events-auto ml-auto lg:hidden flex items-center gap-1">
                        <button onClick={() => setPaletteOpen(true)} aria-label="Cari" className="p-2 rounded-full text-ink-2 hover:text-ink">
                            <Search className="w-5 h-5" strokeWidth={2} />
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* ================= CONTENT ================= */}
            <main className={`pb-28 lg:pb-16 transition-[padding] duration-300 ${sidebar ? 'lg:pl-64' : ''}`}>
                {children}
            </main>

            {/* Mobile bottom dock */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-line bg-stage/95 backdrop-blur-xl">
                <div className="grid grid-cols-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${isActive ? 'text-accent' : 'text-ink-3'}`}
                            >
                                <item.icon className="w-5 h-5" strokeWidth={1.75} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </div>
    );
}
