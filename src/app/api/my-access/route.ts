import { NextResponse } from 'next/server';
import { ALL_APPLICATIONS } from '@/lib/constants/apps';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Get Subject ID
    const { data: subject } = await supabase.from('subjects').select('id').eq('auth_id', user.id).single();
    if (!subject) return NextResponse.json([]);

    // 3. Fetch Roles
    const { data: roles, error } = await supabase
        .from('subject_app_roles')
        .select(`
            id,
            app_id,
            scope_type,
            scope_name,
            valid_until,
            is_active,
            iam_roles (
                role_name,
                role_code
            )
        `)
        .eq('subject_id', subject.id);

    if (error || !roles) return NextResponse.json([]);

    const data = roles.map((role: any) => {
        const app = ALL_APPLICATIONS.find(a => a.id === role.app_id);
        const roleData = Array.isArray(role.iam_roles) ? role.iam_roles[0] : role.iam_roles;

        return {
            app_name: app?.app_name || "Unknown App",
            icon_name: app?.icon_name || "ShieldCheck",
            role: roleData?.role_name || "Assigned User",
            scope: role.scope_name || (role.scope_type === 'global' ? "Global / Corporate" : "Restricted"),
            status: role.is_active ? "Active" : "Inactive",
            valid_until: role.valid_until ? new Date(role.valid_until).toLocaleDateString('id-ID') : "Indefinite"
        };
    });

    return NextResponse.json(data);
}
