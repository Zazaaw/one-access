"use client";

import { ChevronRight } from "lucide-react";
import { useRef, Children } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Apple TV "shelf": a titled horizontal row that scrolls, bleeding to the screen edge.
 * On first scroll into view the title and posters reveal with a gentle spring stagger.
 * Arrow buttons appear on hover (desktop); touch/trackpad users just swipe.
 */
export function Shelf({
    title,
    action,
    children,
}: {
    title: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    const trackRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    const nudge = (dir: 1 | -1) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
    };

    const items = Children.toArray(children);

    return (
        <section className="group/shelf">
            <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between gap-4 mb-4 px-6 lg:px-14"
            >
                <h2 className="font-display text-[19px] lg:text-[22px] font-bold tracking-tight">{title}</h2>
                <div className="flex items-center gap-1.5">
                    {action}
                    <button
                        onClick={() => nudge(-1)}
                        aria-label="Geser kiri"
                        className="hidden lg:grid place-items-center w-8 h-8 rounded-full bg-panel/80 text-ink-2 hover:text-ink hover:bg-elevated opacity-0 group-hover/shelf:opacity-100 transition-all active:scale-90"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" strokeWidth={2.25} />
                    </button>
                    <button
                        onClick={() => nudge(1)}
                        aria-label="Geser kanan"
                        className="hidden lg:grid place-items-center w-8 h-8 rounded-full bg-panel/80 text-ink-2 hover:text-ink hover:bg-elevated opacity-0 group-hover/shelf:opacity-100 transition-all active:scale-90"
                    >
                        <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
                    </button>
                </div>
            </motion.div>

            {/*
              overflow-x:auto forces overflow-y to clip too, which would cut off the
              poster hover pop-out. We give the scroll track generous vertical padding
              (with matching negative margins so layout spacing is unchanged) so the
              scaled/tilted poster has room to breathe inside the clipped box.
            */}
            <motion.div
                ref={trackRef}
                initial={reduce ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                className="no-scrollbar shelf-hover flex gap-3.5 lg:gap-4 overflow-x-auto snap-x scroll-px-6 lg:scroll-px-14 px-6 lg:px-14 -my-6 py-6"
            >
                {items.map((child, i) => (
                    <motion.div
                        key={i}
                        variants={reduce ? undefined : {
                            hidden: { opacity: 0, y: 22, scale: 0.96 },
                            show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 26 } },
                        }}
                        className="shrink-0 relative hover:z-20 focus-within:z-20"
                    >
                        {child}
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
