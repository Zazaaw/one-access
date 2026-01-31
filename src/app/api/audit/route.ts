import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subject_id, app_id, action, metadata } = body;

        const supabase = await createAdminClient();

        const { error } = await supabase
            .from('hr_audit_logs')
            .insert({
                subject_id,
                app_id: app_id === 'IAM' ? null : app_id, // Handle IAM specifically if needed
                action,
                metadata,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('Audit DB Error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
}
