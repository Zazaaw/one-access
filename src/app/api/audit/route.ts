import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subject_id, app_id, action, metadata } = body;

        // In production, insert into 'audit_logs' table in Supabase
        console.log(`[AUDIT LOG] ${new Date().toISOString()}: Subject ${subject_id} performed ${action} on App ${app_id}`, metadata);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
}
