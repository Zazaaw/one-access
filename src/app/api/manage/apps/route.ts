import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseYouTubeId } from '@/lib/youtube';

/**
 * App-presentation management API for OneAccess.
 *
 * SECURITY NOTE: iam_applications has RLS DISABLED, so the database will NOT
 * stop anyone from writing. Every write here therefore re-verifies, server-side,
 * that the caller holds an ACTIVE super_admin role on the exact app being edited.
 * The service-role client is only used AFTER that check passes.
 */

const EDITABLE_FIELDS = ['app_description', 'poster_url', 'artwork_url', 'logo_url', 'creator_name', 'publisher_name', 'artwork_video_url', 'app_category', 'app_detail'] as const;
const VALID_CATEGORIES = new Set(['Enterprise', 'Personal']);

async function getCallerSubjectId(): Promise<{ subjectId: string } | { error: NextResponse }> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

    const admin = await createAdminClient();
    const { data: subject } = await admin.from('subjects').select('id').eq('auth_id', user.id).single();
    if (!subject) return { error: NextResponse.json({ error: 'Subject not found' }, { status: 404 }) };
    return { subjectId: subject.id };
}

/** Roles allowed to manage an app's presentation. */
const MANAGER_ROLES = ['super_admin', 'admin'];

/** Returns the set of app_ids where this subject holds an ACTIVE manager role. */
async function superAdminAppIds(subjectId: string): Promise<Set<string>> {
    const admin = await createAdminClient();
    const { data } = await admin
        .from('subject_app_roles')
        .select('app_id, is_active, iam_roles!inner(role_code)')
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .in('iam_roles.role_code', MANAGER_ROLES);
    return new Set((data || []).map((r: { app_id: string }) => r.app_id));
}

// GET -> apps the caller can manage (super_admin), with current presentation fields
export async function GET() {
    const caller = await getCallerSubjectId();
    if ('error' in caller) return caller.error;

    const appIds = await superAdminAppIds(caller.subjectId);
    if (appIds.size === 0) return NextResponse.json([]);

    const admin = await createAdminClient();
    const { data, error } = await admin
        .from('iam_applications')
        .select('id, app_code, app_name, app_description, app_category, poster_url, artwork_url, logo_url, creator_name, publisher_name, artwork_video_url, app_detail')
        .in('id', Array.from(appIds));

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// PATCH -> update presentation fields for one app the caller manages
export async function PATCH(request: Request) {
    const caller = await getCallerSubjectId();
    if ('error' in caller) return caller.error;

    const body = await request.json();
    const { app_id, ...rest } = body as { app_id?: string } & Record<string, unknown>;
    if (!app_id) return NextResponse.json({ error: 'Missing app_id' }, { status: 400 });

    // Authorization: must be super_admin on THIS specific app
    const appIds = await superAdminAppIds(caller.subjectId);
    if (!appIds.has(app_id)) {
        return NextResponse.json({ error: 'Anda tidak punya izin mengelola aplikasi ini.' }, { status: 403 });
    }

    // Whitelist only editable fields (never let app_code/id/is_active through)
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of EDITABLE_FIELDS) {
        if (key in rest) {
            const v = rest[key];
            const empty = typeof v === 'string' && v.trim() === '';

            // Video: accept only a valid YouTube URL/id; store a clean canonical URL.
            if (key === 'artwork_video_url' && !empty) {
                const id = parseYouTubeId(typeof v === 'string' ? v : '');
                if (!id) {
                    return NextResponse.json({ error: 'URL video harus tautan YouTube yang valid.' }, { status: 400 });
                }
                update[key] = `https://youtu.be/${id}`;
                continue;
            }

            // Category: only allow the two known values.
            if (key === 'app_category') {
                if (empty || !VALID_CATEGORIES.has(v as string)) {
                    return NextResponse.json({ error: 'Kategori harus Enterprise atau Personal.' }, { status: 400 });
                }
                update[key] = v;
                continue;
            }

            // Detail: must be a plain object (stored as JSONB). Team photo urls are
            // already app-assets URLs uploaded via the guarded upload route.
            if (key === 'app_detail') {
                if (v && typeof v === 'object' && !Array.isArray(v)) {
                    update[key] = v;
                }
                continue;
            }

            update[key] = empty ? null : v;
        }
    }

    const admin = await createAdminClient();
    const { data, error } = await admin
        .from('iam_applications')
        .update(update)
        .eq('id', app_id)
        .select('id, app_code, app_name, app_description, app_category, poster_url, artwork_url, logo_url, creator_name, publisher_name, artwork_video_url, app_detail')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
