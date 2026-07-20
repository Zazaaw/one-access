import { Application } from "@/lib/types/iam";

/*
 * Marquee (Apple TV) poster artwork.
 * Each app can carry its own poster_url / artwork_url. When absent we synthesize a
 * cinematic gradient "poster" per category so tiles read like real Apple TV artwork,
 * with the app wordmark rendered on top by the PosterCard component.
 */

// Two categories only: Enterprise (corporate blue-steel) & Personal (warm green).
export const CATEGORY_ARTWORK: Record<string, string> = {
    Enterprise: "radial-gradient(120% 130% at 22% 6%, #3aa0d6 0%, transparent 52%), radial-gradient(120% 120% at 90% 100%, #10375a 0%, transparent 55%), linear-gradient(150deg, #143b57, #081521)",
    Personal: "radial-gradient(120% 130% at 80% 6%, #58c98d 0%, transparent 52%), radial-gradient(120% 120% at 10% 100%, #175537 0%, transparent 55%), linear-gradient(150deg, #1f6444, #071c12)",
};

export const DEFAULT_ARTWORK = CATEGORY_ARTWORK.Enterprise;

/** The canonical list of categories, for pickers & browse. */
export const APP_CATEGORIES = ['Enterprise', 'Personal'] as const;

export function categoryArtwork(category: string): string {
    return CATEGORY_ARTWORK[category] || DEFAULT_ARTWORK;
}

/** Poster background for a shelf tile: real image if provided, else the category gradient. */
export function posterBackground(app: Application): string {
    if (app.poster_url) return `url("${app.poster_url}") center/cover no-repeat`;
    return categoryArtwork(app.category);
}

/** Wide hero background for the detail page: artwork, then poster, then gradient. */
export function heroBackground(app: Application): string {
    if (app.artwork_url) return `url("${app.artwork_url}") center/cover no-repeat`;
    if (app.poster_url) return `url("${app.poster_url}") center/cover no-repeat`;
    return categoryArtwork(app.category);
}

/** True when the app supplies a real image (so we skip the synthesized wordmark overlay). */
export function hasPoster(app: Application): boolean {
    return Boolean(app.poster_url);
}
export function hasArtwork(app: Application): boolean {
    return Boolean(app.artwork_url || app.poster_url);
}

/**
 * Fills in studio/creator metadata an app hasn't set yet, so the detail page always
 * has a complete "By / Version / Released" block. Per-app values always win - this is
 * exactly what a future creator form would populate.
 */
export function withStudioDefaults(app: Application): Required<
    Pick<Application, "version" | "long_description" | "tags">
> & Application {
    const tags = app.tags ?? [
        "SSO",
        app.is_pwa ? "PWA" : "Web",
        "Enterprise",
    ];
    return {
        ...app,
        // creator & publisher are intentionally NOT defaulted - each app's owner
        // fills these in later via the (future) creator form.
        version: app.version ?? "1.0.0",
        long_description: app.long_description ?? app.description,
        tags,
    };
}

/* Back-compat alias for earlier imports. */
export const categoryGradient = categoryArtwork;
export const CATEGORY_GRADIENT = CATEGORY_ARTWORK;
