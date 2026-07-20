"use client";

import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <MotionConfig reducedMotion="user">
                <AuthProvider>{children}</AuthProvider>
            </MotionConfig>
        </ThemeProvider>
    );
}
