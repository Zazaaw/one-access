import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Uploads an app asset (poster / artwork / logo) to the app-assets bucket.
 * Re-checks super_admin-on-this-app before accepting the file (RLS is off).
 */

const KINDS = ['poster', 'artwork', 'logo', 'team'] as const;
type Kind = typeof KINDS[number];

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = await createAdminClient();
    const { data: subject } = await admin.from('subjects').select('id').eq('auth_id', user.id).single();
    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const appId = form.get('app_id') as string | null;
    const kind = form.get('kind') as Kind | null;

    if (!file || !appId || !kind || !KINDS.includes(kind)) {
        return NextResponse.json({ error: 'Missing file, app_id, or kind' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Ukuran gambar maksimal 5MB.' }, { status: 400 });
    }

    // Authorization: super_admin on this app
    const { data: roles } = await admin
        .from('subject_app_roles')
        .select('app_id, iam_roles!inner(role_code)')
        .eq('subject_id', subject.id)
        .eq('app_id', appId)
        .eq('is_active', true)
        .in('iam_roles.role_code', ['super_admin', 'admin']);
    if (!roles || roles.length === 0) {
        return NextResponse.json({ error: 'Anda tidak punya izin mengelola aplikasi ini.' }, { status: 403 });
    }

    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    // poster/artwork/logo: fixed path (re-upload overwrites).
    // team: unique path per photo since an app has many team members.
    const path = kind === 'team'
        ? `${appId}/team/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        : `${appId}/${kind}.${ext}`;

    const { error: uploadError } = await admin.storage
        .from('app-assets')
        .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = admin.storage.from('app-assets').getPublicUrl(path);
    // Cache-bust so the new image shows immediately after re-upload
    const url = `${publicUrl}?v=${Date.now()}`;
    return NextResponse.json({ url });
}
