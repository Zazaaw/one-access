"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Application } from "@/lib/types/iam";
import { heroBackground } from "@/lib/constants/appVisuals";
import { parseYouTubeId, youTubeEmbedUrl } from "@/lib/youtube";

/**
 * Full-bleed hero backdrop for an app.
 * Priority: YouTube video (if set & valid) > artwork/poster image > category gradient.
 *
 * Behaviour:
 *  - The image/gradient shows first; the video fades in after a short delay (default 3s)
 *    so the hero doesn't jump straight into a video.
 *  - Video plays muted, looped, chromeless (Apple TV trailer-background). A speaker button
 *    lets the viewer unmute (browsers block autoplay WITH sound, so it must start muted).
 *  - Disabled under prefers-reduced-motion (falls back to the image/gradient).
 * Only a validated 11-char video id ever reaches the iframe src.
 */
export function HeroMedia({ app, animateKey, videoDelayMs = 3000 }: { app: Application; animateKey?: string | number; videoDelayMs?: number }) {
    const reduce = useReducedMotion();
    const videoId = reduce ? null : parseYouTubeId(app.artwork_video_url);
    // If there's no still image to show first, don't bother delaying the video.
    const hasStill = Boolean(app.artwork_url || app.poster_url);
    const delay = hasStill ? videoDelayMs : 0;

    const [showVideo, setShowVideo] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [muted, setMuted] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Reveal the video after the delay
    useEffect(() => {
        if (!videoId) return;
        const t = setTimeout(() => setShowVideo(true), delay);
        return () => clearTimeout(t);
    }, [videoId, delay]);

    // Control audio via the YouTube iframe postMessage API (no extra script needed)
    const postToPlayer = (func: string) => {
        iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func, args: [] }),
            "*"
        );
    };
    const toggleMute = () => {
        if (muted) { postToPlayer("unMute"); postToPlayer("setVolume"); setMuted(false); }
        else { postToPlayer("mute"); setMuted(true); }
    };

    return (
        <motion.div
            key={animateKey}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 overflow-hidden"
        >
            {/* Base image / gradient (shows first, and stays as the frame while the video loads) */}
            <div className="absolute inset-0" style={{ background: heroBackground(app) }} />

            {videoId && showVideo && (
                <div className={`absolute inset-0 transition-opacity duration-[1200ms] ${videoReady ? 'opacity-100' : 'opacity-0'}`}>
                    {/* 16:9 iframe scaled to cover the container without letterboxing. enablejsapi=1 lets us toggle audio. */}
                    <iframe
                        ref={iframeRef}
                        title=""
                        aria-hidden="true"
                        tabIndex={-1}
                        onLoad={() => setVideoReady(true)}
                        src={`${youTubeEmbedUrl(videoId)}&enablejsapi=1`}
                        allow="autoplay; encrypted-media"
                        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full border-0"
                    />
                </div>
            )}

            {/* Unmute / mute control (only once the video is actually playing) */}
            {videoId && showVideo && videoReady && (
                <button
                    onClick={toggleMute}
                    aria-label={muted ? "Nyalakan suara" : "Bisukan"}
                    className="absolute bottom-5 right-5 lg:bottom-6 lg:right-8 z-20 grid place-items-center w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white ring-1 ring-white/15 hover:bg-black/65 transition-colors"
                >
                    {muted ? <VolumeX className="w-5 h-5" strokeWidth={2} /> : <Volume2 className="w-5 h-5" strokeWidth={2} />}
                </button>
            )}
        </motion.div>
    );
}
