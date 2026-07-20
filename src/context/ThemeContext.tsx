"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemePref = "light" | "dark" | "system";

interface ThemeContextType {
    /** The user's stored preference. */
    preference: ThemePref;
    /** The theme actually applied right now ("light" | "dark"), resolving "system". */
    resolved: "light" | "dark";
    setPreference: (pref: ThemePref) => void;
    /** Cycle light -> dark -> system -> light. */
    cycle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "oneaccess-theme";

function systemDark(): boolean {
    return typeof window !== "undefined"
        && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

function apply(pref: ThemePref) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const dark = pref === "dark" || (pref === "system" && systemDark());
    // data-theme drives the token overrides in globals.css; keep it authoritative
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.style.colorScheme = dark ? "dark" : "light";
}

function readStored(): ThemePref {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(STORAGE_KEY) as ThemePref | null) || "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Lazy initializers read the stored value at first render (the inline head
    // script already painted the right theme, so there is no flash).
    const [preference, setPreferenceState] = useState<ThemePref>(readStored);
    const [resolved, setResolved] = useState<"light" | "dark">(() => {
        const p = readStored();
        return p === "dark" || (p === "system" && systemDark()) ? "dark" : "light";
    });

    // Keep "system" in sync with OS changes
    useEffect(() => {
        if (preference !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            apply("system");
            setResolved(systemDark() ? "dark" : "light");
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [preference]);

    const setPreference = useCallback((pref: ThemePref) => {
        localStorage.setItem(STORAGE_KEY, pref);
        apply(pref);
        setPreferenceState(pref);
        setResolved(pref === "dark" || (pref === "system" && systemDark()) ? "dark" : "light");
    }, []);

    const cycle = useCallback(() => {
        setPreference(preference === "light" ? "dark" : preference === "dark" ? "system" : "light");
    }, [preference, setPreference]);

    return (
        <ThemeContext.Provider value={{ preference, resolved, setPreference, cycle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}
