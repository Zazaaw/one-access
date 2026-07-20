"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Animates a number counting up to `value` once, when it first mounts.
 * Respects reduced-motion (renders the final value immediately).
 */
export function CountUp({ value, duration = 900, className }: { value: number; duration?: number; className?: string }) {
    const reduce = useReducedMotion();
    const [display, setDisplay] = useState(reduce ? value : 0);
    const startedRef = useRef(false);

    useEffect(() => {
        // Jump straight to the value when animation isn't wanted / already ran.
        if (reduce || startedRef.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisplay(value);
            return;
        }
        startedRef.current = true;

        let raf = 0;
        let startTs = 0;
        const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
        const step = (ts: number) => {
            if (!startTs) startTs = ts;
            const p = Math.min((ts - startTs) / duration, 1);
            setDisplay(Math.round(ease(p) * value));
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [value, duration, reduce]);

    return <span className={className}>{display}</span>;
}
