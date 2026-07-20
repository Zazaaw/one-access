"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Wraps each route (via app/template.tsx) so navigations get a smooth
 * fade + subtle rise. template.tsx re-mounts on every navigation, so this
 * animates on both enter transitions without needing route-key plumbing.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
    const reduce = useReducedMotion();

    if (reduce) return <>{children}</>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}
