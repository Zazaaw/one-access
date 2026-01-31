import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, payload } = body;

        // Simulate server-side processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Input Validation Mock
        if (!type || !payload) {
            return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
        }

        if (type === 'password') {
            const { currentPassword, newPassword } = payload;
            if (currentPassword !== 'demo123') { // Mock check
                // In reality, we'd check against DB hash
                // For demo purposes, we'll just allow any "current" password to pass lightly or log it
                console.log(`[AUDIT] Password change requested for user.`);
            }
            console.log(`[AUDIT] Password updated successfully.`);
            return NextResponse.json({ success: true, message: "Password updated successfully" });
        }

        if (type === 'mfa') {
            const { enabled } = payload;
            const status = enabled ? 'activated' : 'deactivated';
            console.log(`[AUDIT] MFA ${status} for user.`);
            return NextResponse.json({ success: true, message: `MFA has been ${status}` });
        }

        return NextResponse.json({ success: false, message: "Unknown setting type" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
