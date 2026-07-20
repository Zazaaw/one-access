"use client";

import {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase, LayoutGrid,
    type LucideIcon
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion } from "framer-motion";
import { Application } from "@/lib/types/iam";
import { posterBackground, hasPoster } from "@/lib/constants/appVisuals";

const IconMap: Record<string, LucideIcon> = {
    ShieldCheck, BarChart3, Users, Layers, Activity, Globe, Database, Scale, Briefcase
};

/**
 * Apple TV poster tile with tvOS-style focus physics:
 *  - the poster tilts in 3D toward the cursor
 *  - a soft spotlight tracks the cursor across the artwork
 *  - lifts + glows on hover/focus
 * All driven by motion values (no React re-renders → smooth on every frame),
 * and fully disabled under prefers-reduced-motion.
 *
 * layout "portrait" (default, 2:3) is the shelf tile; "landscape" (16:9) is the
 * Continue row. Variants: `rank` (Top-10 numeral) and `progress` (continue bar).
 */
export function PosterCard({
    app,
    authorized = true,
    onClick,
    rank,
    progress,
    badge,
    layout = "portrait",
    width,
    fluid = false,
}: {
    app: Application;
    authorized?: boolean;
    onClick: () => void;
    rank?: number;
    progress?: number;
    badge?: string;
    layout?: "portrait" | "landscape";
    width?: number;
    fluid?: boolean;
}) {
    const Icon = IconMap[app.icon_name] || LayoutGrid;
    const realImg = hasPoster(app);
    const isPortrait = layout === "portrait";
    const defaultWidth = isPortrait ? 176 : 320;
    const w = width ?? defaultWidth;
    const reduce = useReducedMotion();

    // Pointer position within the tile (0..1), springed for smoothness
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const sx = useSpring(px, { stiffness: 220, damping: 22 });
    const sy = useSpring(py, { stiffness: 220, damping: 22 });

    // Tilt: map cursor to a gentle rotation (degrees)
    const rotY = useTransform(sx, [0, 1], [7, -7]);
    const rotX = useTransform(sy, [0, 1], [-7, 7]);
    // Spotlight position as a percentage for a radial-gradient overlay
    const glowX = useTransform(sx, v => `${v * 100}%`);
    const glowY = useTransform(sy, v => `${v * 100}%`);
    const spotlight = useMotionTemplate`radial-gradient(150px 150px at ${glowX} ${glowY}, rgba(255,255,255,0.22), transparent 70%)`;

    const handleMove = (e: React.MouseEvent) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
    };
    const handleLeave = () => {
        px.set(0.5);
        py.set(0.5);
    };

    const poster = (
        <motion.div
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
            className={`relative w-full overflow-hidden rounded-xl shadow-poster ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/poster:scale-[1.06] group-focus-visible/poster:scale-[1.06] group-hover/poster:glow-focus group-focus-visible/poster:glow-focus ${isPortrait ? 'aspect-[2/3]' : 'aspect-video'}`}
        >
            <div className="absolute inset-0" style={{ background: posterBackground(app) }} />

            {/* Cursor-tracking spotlight */}
            {!reduce && (
                <motion.div
                    style={{ background: spotlight }}
                    className="absolute inset-0 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-soft-light"
                    aria-hidden="true"
                />
            )}

            {/* Synthesized artwork overlay (only when no real image) */}
            {!realImg && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/15" />
                    <Icon className="absolute top-3.5 left-3.5 w-6 h-6 text-white/90" strokeWidth={1.5} />
                    <div className={`absolute inset-x-3.5 ${isPortrait ? 'bottom-4' : 'bottom-3.5'}`}>
                        <p className={`font-display font-extrabold tracking-tight text-white leading-[1.05] drop-shadow line-clamp-3 ${isPortrait ? 'text-[16px]' : 'text-[17px]'}`}>
                            {app.app_name}
                        </p>
                    </div>
                </>
            )}

            {/* Always-present corner mark */}
            <span className="absolute top-2 right-2 grid place-items-center w-5 h-5 rounded-[6px] bg-black/45 backdrop-blur-sm ring-1 ring-white/10">
                <ShieldCheck className="w-3 h-3 text-white" strokeWidth={2.25} />
            </span>

            {badge && (
                <span className="absolute top-2 left-2 rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[11px] font-semibold text-white">
                    {badge}
                </span>
            )}

            {!authorized && !badge && (
                <span className="absolute top-2 left-2 rounded-full bg-black/45 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white/90">
                    Perlu akses
                </span>
            )}

            {typeof progress === "number" && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
                    <div className="h-full bg-white" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
            )}
        </motion.div>
    );

    const caption = (
        <div className="pt-2.5 px-0.5">
            <p className="text-[13px] font-semibold tracking-tight leading-tight line-clamp-1 text-ink-2 group-hover/poster:text-ink group-focus-visible/poster:text-ink transition-colors">
                {app.app_name}
            </p>
            <p className="text-[12px] text-ink-3 mt-0.5 line-clamp-1">
                {authorized ? app.category : "Perlu persetujuan"}
            </p>
        </div>
    );

    if (rank) {
        return (
            <button
                onClick={onClick}
                style={fluid ? undefined : { width: w + 56 }}
                className={`group/poster snap-start text-left focus:outline-none flex items-end [perspective:900px] ${fluid ? 'w-full' : 'shrink-0'}`}
            >
                <span className="font-display font-extrabold text-transparent leading-[0.8] select-none tnum text-[128px] lg:text-[150px] [-webkit-text-stroke:2px_var(--color-ink-3)] opacity-40 -mr-6 lg:-mr-8 pb-6 z-0">
                    {rank}
                </span>
                <div className="relative z-10 flex-1 min-w-0" style={fluid ? undefined : { maxWidth: w }}>
                    {poster}
                    {caption}
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            style={fluid ? undefined : { width: w }}
            className={`group/poster snap-start text-left focus:outline-none [perspective:900px] ${fluid ? 'w-full' : 'shrink-0'}`}
        >
            {poster}
            {caption}
        </button>
    );
}
