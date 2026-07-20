"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";

const LABEL: Record<string, string> = {
    light: "Tema: terang (klik untuk gelap)",
    dark: "Tema: gelap (klik untuk sistem)",
    system: "Tema: ikuti sistem (klik untuk terang)",
};

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { preference, cycle } = useTheme();
    const [mounted, setMounted] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const Icon = preference === "light" ? Sun : preference === "dark" ? Moon : Monitor;

    return (
        <button
            onClick={cycle}
            aria-label={mounted ? LABEL[preference] : "Ganti tema"}
            title={mounted ? LABEL[preference] : "Ganti tema"}
            className={`p-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-white/10 transition-colors ${className}`}
        >
            {mounted
                ? <Icon className="w-4 h-4" strokeWidth={2} />
                : <span className="block w-4 h-4" aria-hidden="true" />}
        </button>
    );
}
