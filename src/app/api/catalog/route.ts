import { NextResponse } from 'next/server';
import { ALL_APPLICATIONS } from '@/lib/constants/apps';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();

    // Fetch all active applications from IAM DB
    const { data: dbApps, error } = await supabase
        .from('iam_applications')
        .select('id, app_code, app_name, app_description, app_type')
        .eq('is_active', true)
        .order('app_name');

    if (error || !dbApps) {
        console.error("Error fetching catalog from DB:", error);
        // Fallback to static config if DB fails
        return NextResponse.json(ALL_APPLICATIONS);
    }

    // Merge DB data with local config (for icons, launch_url, category)
    const mergedCatalog = dbApps.map(dbApp => {
        // Find matching config using ID (preferred) or App Code
        // We'll normalize app_code comparison to be safe
        const uiConfig = ALL_APPLICATIONS.find(app =>
            app.id === dbApp.id ||
            app.app_code === dbApp.app_code ||
            (app.app_code === 'HC_EXEC' && dbApp.app_code === 'HC_CMD') || // Handle known mismatch
            (app.app_code === 'STRAT' && dbApp.app_code === 'STRATEGIC') || // Handle known mismatch
            (app.app_code === 'HCIS' && dbApp.app_code === 'IHCMIS') // Handle known mismatch
        );

        if (uiConfig) {
            return {
                ...uiConfig,
                id: dbApp.id, // Ensure we use the real DB ID
                app_name: dbApp.app_name, // Use DB Name
                description: dbApp.app_description, // Use DB Description
                app_code: dbApp.app_code // Use DB Code
            };
        }

        // If no UI config found, return a generic entry so it at least shows up
        return {
            id: dbApp.id,
            app_code: dbApp.app_code,
            app_name: dbApp.app_name,
            launch_url: '#', // No launch URL known
            icon_name: 'Layers', // Default icon
            description: dbApp.app_description,
            category: 'Uncategorized',
            is_pwa: false
        };
    });

    return NextResponse.json(mergedCatalog);
}
