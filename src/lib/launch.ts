import { Application } from "@/lib/types/iam";

/**
 * Opens an application with SSO tokens attached and writes a launch audit log.
 * Shared by Dashboard, App Catalog, and the Command Palette.
 */
export async function launchAppWithSSO(app: Application, subjectId?: string) {
    let finalUrl = app.launch_url;

    // SSO: Append tokens if a session is available
    try {
        const supabase = await import('@/lib/supabase/client').then(m => m.createClient());
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token && session?.refresh_token) {
            const separator = app.launch_url.includes('?') ? '&' : '?';
            const tokens = `access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
            finalUrl = `${app.launch_url}${separator}${tokens}`;
        }
    } catch (err) {
        console.warn("Failed to attach SSO tokens:", err);
    }

    if (subjectId) {
        try {
            await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject_id: subjectId,
                    app_id: app.id,
                    action: 'launch',
                    metadata: { app_name: app.app_name, url: app.launch_url }
                })
            });
        } catch (e) {
            console.error("Audit logging failed", e);
        }
    }

    window.open(finalUrl, '_blank');
}
