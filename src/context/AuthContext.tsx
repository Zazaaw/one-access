"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Subject } from "@/lib/types/iam";

interface AuthContextType {
    user: Subject | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Subject | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate session check
        const checkSession = async () => {
            setTimeout(() => {
                // Mocking an authenticated session
                setUser({
                    subject_id: "admin-id",
                    display_name: "Dr. R. Turino Januar Budyanto",
                    subject_type: "executive",
                    nik_sap: "4000095"
                });
                setIsLoading(false);
            }, 1000);
        };

        checkSession();
    }, []);

    const login = () => {
        // In prod: supabase.auth.signInWithOAuth(...)
        window.location.href = "/dashboard";
    };

    const logout = () => {
        // In prod: supabase.auth.signOut()
        setUser(null);
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
