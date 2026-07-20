import { NextResponse } from 'next/server';
import { ALL_APPLICATIONS } from '@/lib/constants/apps';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get the internal subject ID for the authenticated user
    const { data: subject, error: subjectError } = await adminSupabase
        .from('subjects')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (subjectError || !subject) {
        console.error('Subject not found for auth user:', user.id);
        return NextResponse.json([]);
    }

    // 2. Fetch real assignments from subject_app_roles AND application details from iam_applications
    const { data: assignments, error: dbError } = await adminSupabase
        .from('subject_app_roles')
        .select(`
            app_id,
            iam_applications (
                id,
                app_name,
                app_description,
                app_code,
                app_category,
                poster_url,
                artwork_url,
                artwork_video_url,
                logo_url,
                creator_name,
                publisher_name,
                app_version,
                app_detail
            )
        `)
        .eq('subject_id', subject.id)
        .eq('is_active', true);

    if (dbError) {
        console.error('DB Error fetching app assignments:', dbError);
        return NextResponse.json([]);
    }

    // 3. Map DB assignments to ALL_APPLICATIONS config (merging DB data with UI config)
    // We use the static config for Icons, Categories, and Launch URLs (which might be env dependent),
    // but we prefer the DB for Name and Description to ensure alignment with IAM.
    const myApps = assignments.map((assignment: any) => {
        const dbApp = assignment.iam_applications;
        // Find the matching UI config by ID (preferred) or App Code
        const uiConfig = ALL_APPLICATIONS.find(app =>
            app.id === dbApp.id || app.app_code === dbApp.app_code
        );

        if (!uiConfig) return null;

        return {
            ...uiConfig,
            // Override with DB values to be the "Single Source of Truth"
            app_name: dbApp.app_name,
            description: dbApp.app_description,
            id: dbApp.id, // Ensure ID matches DB
            // Presentation fields set via /kelola
            category: dbApp.app_category || 'Enterprise',
            poster_url: dbApp.poster_url || undefined,
            artwork_url: dbApp.artwork_url || undefined,
            artwork_video_url: dbApp.artwork_video_url || undefined,
            logo_url: dbApp.logo_url || undefined,
            creator: dbApp.creator_name || undefined,
            publisher: dbApp.publisher_name || undefined,
            version: dbApp.app_version || undefined,
            detail: dbApp.app_detail || undefined,
        };
    }).filter(app => app !== null);

    return NextResponse.json(myApps.filter((app: any) => app.app_code !== 'ONEACCESS'));
}
