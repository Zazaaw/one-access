/**
 * YouTube URL helpers. We ONLY ever store/emit a validated 11-char video id,
 * never a raw user-supplied URL, so nothing arbitrary can reach an <iframe src>.
 */

const ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const ALLOWED_HOSTS = new Set([
    'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be',
]);

/** Extracts a valid YouTube video id from a URL (or a bare id), else null. */
export function parseYouTubeId(input: string | null | undefined): string | null {
    if (!input) return null;
    const raw = input.trim();

    // Bare id
    if (ID_RE.test(raw)) return raw;

    let url: URL;
    try {
        url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    } catch {
        return null;
    }

    const host = url.hostname.toLowerCase();
    if (!ALLOWED_HOSTS.has(host)) return null;

    let id: string | null = null;
    if (host === 'youtu.be' || host === 'www.youtu.be') {
        id = url.pathname.slice(1).split('/')[0];
    } else if (url.pathname === '/watch') {
        id = url.searchParams.get('v');
    } else if (url.pathname.startsWith('/embed/')) {
        id = url.pathname.split('/')[2];
    } else if (url.pathname.startsWith('/shorts/')) {
        id = url.pathname.split('/')[2];
    }

    return id && ID_RE.test(id) ? id : null;
}

/** Background-video embed URL: autoplay, muted, looped, chromeless. Safe (id only). */
export function youTubeEmbedUrl(id: string): string {
    const params = new URLSearchParams({
        autoplay: '1', mute: '1', controls: '0', loop: '1', playlist: id,
        modestbranding: '1', playsinline: '1', rel: '0', showinfo: '0', disablekb: '1',
    });
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/** Thumbnail for previews. Safe (id only). */
export function youTubeThumbnail(id: string): string {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
