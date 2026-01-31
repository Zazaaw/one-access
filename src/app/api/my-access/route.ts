import { NextResponse } from 'next/server';
import { ALL_APPLICATIONS } from '@/lib/constants/apps';

// Mock assignments with roles and scopes
const MOCK_ACCESS = [
    {
        app_id: "app-1",
        role: "System Administrator",
        scope: "Global / PTPN Group",
        status: "Active",
        valid_until: "Indefinite"
    },
    {
        app_id: "app-2",
        role: "Executive Viewer",
        scope: "Corporate Level",
        status: "Active",
        valid_until: "2026-12-31"
    },
    {
        app_id: "app-3",
        role: "Employee Basic",
        scope: "Holding Staff",
        status: "Active",
        valid_until: "Indefinite"
    }
];

export async function GET() {
    const data = MOCK_ACCESS.map(access => {
        const app = ALL_APPLICATIONS.find(a => a.id === access.app_id);
        return {
            ...access,
            app_name: app?.app_name || "Unknown App",
            icon_name: app?.icon_name || "ShieldCheck"
        };
    });

    return NextResponse.json(data);
}
