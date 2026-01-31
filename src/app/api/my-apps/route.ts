import { NextResponse } from 'next/server';
import { ALL_APPLICATIONS } from '@/lib/constants/apps';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get the internal subject ID for the authenticated user
    const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (subjectError || !subject) {
        console.error('Subject not found for auth user:', user.id);
        return NextResponse.json([]);
    }

    // 2. Fetch real assignments from subject_app_roles
    const { data: assignments, error: dbError } = await supabase
        .from('subject_app_roles')
        .select('app_id')
        .eq('subject_id', subject.id)
        .eq('is_active', true);

    if (dbError) {
        console.error('DB Error fetching app assignments:', dbError);
        return NextResponse.json([]);
    }

    const assignedIds = assignments.map(a => a.app_id);

    // 3. Filter the catalog based on DB assignments
    const myApps = ALL_APPLICATIONS.filter(app => assignedIds.includes(app.id));

    return NextResponse.json(myApps);
}
