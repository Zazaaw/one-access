"use client";

import { Search, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: (q: string) => void }) {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 bg-[#020617]/60 backdrop-blur-2xl border-b border-slate-800/30 px-8 lg:px-12 py-5 flex items-center justify-between">
            <div className="flex-1 max-w-2xl relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search services or apps..."
                    className="w-full bg-slate-900/50 border border-slate-800/50 pl-12 pr-6 py-3 rounded-2xl text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-6 ml-6">
                <button className="p-3 bg-slate-900/50 border border-slate-800/50 rounded-xl text-slate-400 hover:text-white transition-all hover:border-slate-700">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 pl-6 border-l border-slate-800/50">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">{user?.display_name}</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">NIK: {user?.nik_sap}</p>
                    </div>
                    <div className="w-11 h-11 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-900/20 overflow-hidden relative">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{user?.display_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}</span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
