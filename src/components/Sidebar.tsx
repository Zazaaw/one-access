"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutGrid,
    Layers,
    Users,
    Settings,
    LogOut,
    ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const menuItems = [
        { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
        { icon: Layers, label: "App Catalog", href: "/app-catalog" },
        { icon: Users, label: "Access Rights", href: "/access-rights" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-20 lg:w-72 bg-slate-900/40 backdrop-blur-3xl border-r border-slate-800/50 z-50 flex flex-col pt-10">
            <div className="px-8 mb-16 flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="hidden lg:block">
                        <h1 className="text-xl font-black tracking-tight leading-none text-white">OneAccess</h1>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1">Enterprise Gateway</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1.5">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'}`}
                        >
                            <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                            <span className="hidden lg:block font-bold text-sm tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="px-6 py-10 space-y-2 border-t border-slate-800/50">
                <Link
                    href="/settings"
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-all"
                >
                    <Settings className="w-5 h-5 shrink-0" />
                    <span className="hidden lg:block font-bold text-sm tracking-wide">Settings</span>
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-rose-500/60 hover:bg-rose-500/5 hover:text-rose-400 transition-all"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="hidden lg:block font-bold text-sm tracking-wide">Logout</span>
                </button>
            </div>
        </aside>
    );
}
