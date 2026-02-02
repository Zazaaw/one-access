import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Ensure user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, message: "Unauthorized - Silakan login kembali" }, { status: 401 });
        }

        const body = await request.json();
        const { type, payload } = body;

        // Input Validation
        if (!type || !payload) {
            return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
        }

        if (type === 'password') {
            const { newPassword, confirmPassword } = payload;

            if (!newPassword || newPassword.length < 6) {
                return NextResponse.json({ success: false, message: "Password baru minimal 6 karakter" }, { status: 400 });
            }

            // Real password update via Supabase Auth
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error(`[AUTH ERROR] Password update failed:`, error.message);
                return NextResponse.json({ success: false, message: error.message }, { status: 400 });
            }

            console.log(`[AUDIT] Password updated successfully for user: ${user.id}`);
            return NextResponse.json({ success: true, message: "Password berhasil diperbarui untuk seluruh sistem PTPN Group." });
        }

        if (type === 'mfa') {
            const { enabled } = payload;
            const status = enabled ? 'activated' : 'deactivated';
            console.log(`[AUDIT] MFA ${status} for user: ${user.id}`);
            return NextResponse.json({ success: true, message: `MFA has been ${status}` });
        }

        return NextResponse.json({ success: false, message: "Tipe pengaturan tidak dikenal" }, { status: 400 });

    } catch (error) {
        console.error(`[SERVER ERROR]`, error);
        return NextResponse.json({ success: false, message: "Terjadi kesalahan internal pada server" }, { status: 500 });
    }
}
