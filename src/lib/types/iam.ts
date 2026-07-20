export type SubjectType = 'employee' | 'executive' | 'commissioner' | 'external';

export interface Subject {
    subject_id: string;
    display_name: string;
    subject_type: SubjectType;
    nik_sap?: string;
    avatar_url?: string;
}

export interface Application {
    id: string;
    app_code: string;
    app_name: string;
    launch_url: string;
    icon_name: string; // We'll use lucide icon names
    description: string;
    category: string;
    is_pwa?: boolean;

    // --- Marquee (Apple TV) presentation & studio metadata ---
    /** Optional 16:9 poster image (shelf tile). Falls back to a generated gradient poster. */
    poster_url?: string;
    /** Optional wide backdrop image (detail-page hero). Falls back to the poster / gradient. */
    artwork_url?: string;
    /** Optional YouTube URL/id played as the hero background (takes priority over artwork_url). */
    artwork_video_url?: string;
    /** Optional square/logo image shown as the app mark on hero and tiles. */
    logo_url?: string;
    /** Optional accent hex to tint the generated poster/hero for this app. */
    accent?: string;
    /** Longer synopsis for the detail page (the short `description` stays the tagline). */
    long_description?: string;
    /** The person/team who built it ("Starring/By" line on the detail page). */
    creator?: string;
    /** Owning division / studio. */
    publisher?: string;
    /** Semantic version string, e.g. "2.4.0". */
    version?: string;
    /** ISO date the app was released/launched. */
    released_at?: string;
    /** Small feature badges shown under the hero (e.g. "SSO", "PWA", "4K"). */
    tags?: string[];
    /** Rich detail (target users, problem, features, benefits, advantages, team). */
    detail?: AppDetail;
}

/** A member shown in the "Developer & Tim" shelf on the detail page. */
export interface TeamMember {
    name: string;
    role: string;
    photo_url?: string;
}

/** The structured content behind poin 3-7 of the app user-manual. */
export interface AppDetail {
    /** 3. Target Pengguna - who the app is for. */
    target_users?: string;
    /** 4. Permasalahan yang Diselesaikan. */
    problem?: string;
    /** 5. Fitur Utama - list of feature names (+ optional short note). */
    features?: { name: string; note?: string }[];
    /** 6. Manfaat Aplikasi. */
    benefits?: string;
    /** 7. Keunggulan / Value Proposition - short bullet points. */
    advantages?: string[];
    /** Developer & Tim. */
    team?: TeamMember[];
}

export interface SubjectAppRole {
    subject_id: string;
    app_id: string;
    role_code: string;
    scope_type: 'global' | 'custom';
    is_active: boolean;
}

export interface AuditLog {
    id: string;
    subject_id: string;
    app_id: string;
    action: 'launch' | 'login' | 'logout';
    timestamp: string;
    metadata?: any;
}
