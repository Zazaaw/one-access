import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { app_id, justification } = body;

    if (!app_id || !justification) {
        return NextResponse.json({ error: 'Missing app_id or justification' }, { status: 400 });
    }

    // 2. Get Subject ID
    const { data: subject } = await supabase.from('subjects').select('id').eq('auth_id', user.id).single();
    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    // 3. Insert Request
    const { data, error } = await supabase
        .from('access_requests')
        .insert({
            subject_id: subject.id,
            app_id: app_id,
            justification: justification,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        console.error('Request submission error:', error);
        if (error.code === '42P01') {
            return NextResponse.json({ error: 'Sistem sedang sinkronisasi. Harap hubungi Admin IT untuk aktivasi skema database.' }, { status: 501 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Audit Log
    try {
        await supabase.from('hr_audit_logs').insert({
            subject_id: subject.id,
            action: 'request_access',
            app_id: app_id,
            metadata: { justification }
        });
    } catch (e) { }

    return NextResponse.json(data);
}

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: subject } = await supabase.from('subjects').select('id').eq('auth_id', user.id).single();
    if (!subject) return NextResponse.json([]);

    const { data, error } = await supabase
        .from('access_requests')
        .select(`
            *,
            iam_applications (app_name)
        `)
        .eq('subject_id', subject.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
