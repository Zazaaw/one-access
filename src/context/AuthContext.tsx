"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Subject } from '@/lib/types/iam';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logoutAction } from '@/lib/actions/auth';

interface AuthContextType {
    user: Subject | null;
    isLoading: boolean;
    login: (email: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Subject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            console.log("Auth: Initializing...");
            try {
                // Check active session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth: Session error", error);
                    throw error;
                }

                if (session?.user) {
                    console.log("Auth: Session found", session.user.id);

                    // Set basic user info immediately to stop "no user" redirects
                    const basicUser: Subject = {
                        subject_id: session.user.id,
                        display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || "User",
                        subject_type: 'employee',
                        nik_sap: session.user.user_metadata?.nik || "N/A"
                    };
                    if (mounted) setUser(basicUser);

                    // 1. Immediate Redirect if on root
                    if (window.location.pathname === '/') {
                        window.location.href = '/dashboard';
                        return;
                    }

                    // 2. Fetch full profile from DB in background
                    fetchProfile(session.user);
                } else {
                    console.log("Auth: No session");
                    if (mounted) setUser(null);
                }
            } catch (error) {
                console.error("Auth: Init error", error);
                if (mounted) setUser(null);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        // Failsafe timeout
        const timeoutId = setTimeout(() => {
            if (isLoading && mounted) {
                console.warn("Auth: Force stop loading");
                setIsLoading(false);
            }
        }, 5000);

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth: State change", event);

            if (session?.user) {
                // Set basic user info immediately
                const basicUser: Subject = {
                    subject_id: session.user.id,
                    display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || "User",
                    subject_type: 'employee',
                    nik_sap: session.user.user_metadata?.nik || "N/A"
                };
                if (mounted) setUser(basicUser);

                // Fetch full profile in background
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    fetchProfile(session.user);
                }

                const isAtRoot = window.location.pathname === '/' || window.location.pathname === '';
                const shouldRedirect = (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && isAtRoot;

                if (shouldRedirect) {
                    console.log("Auth: Redirecting from root to /dashboard");
                    window.location.href = '/dashboard';
                }
            } else {
                if (mounted) setUser(null);
                if (event === 'SIGNED_OUT') window.location.href = '/';
            }

            if (mounted) setIsLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [router]); // Removed supabase from deps as it's stable

    const fetchProfile = async (authUser: any) => {
        try {
            // Fetch authoritative profile data from 'subjects' table
            const { data: profile, error } = await supabase
                .from('subjects')
                .select('*')
                .eq('auth_id', authUser.id)
                .single();

            if (error || !profile) {
                // Fallback to metadata if DB record not found
                const subject: Subject = {
                    subject_id: authUser.id,
                    display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || "User",
                    subject_type: (authUser.user_metadata?.role as any) || 'Employee',
                    nik_sap: authUser.user_metadata?.nik || authUser.email?.split('@')[0] || "N/A",
                    avatar_url: authUser.user_metadata?.avatar_url
                };
                setUser(subject);
            } else {
                const subject: Subject = {
                    subject_id: authUser.id,
                    display_name: profile.display_name,
                    subject_type: profile.subject_type as any,
                    nik_sap: profile.nik_sap,
                    avatar_url: profile.avatar_url
                };
                setUser(subject);
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
        }
    };

    const login = async (email: string) => {
        // Deprecated: Component calls supabase.auth.signInWithPassword directly.
        console.log("Login triggered");
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await logoutAction();
        } catch (error) {
            console.error("Logout action error:", error);
            // Fallback for client-side ensure
            await supabase.auth.signOut();
            window.location.href = '/';
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
