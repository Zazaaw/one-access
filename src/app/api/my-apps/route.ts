import { NextResponse } from 'next/server';
import { ALL_APPLICATIONS } from '@/lib/constants/apps';

// Mock authorized apps for a specific subject
const MOCK_ASSIGNMENTS: Record<string, string[]> = {
    "admin-id": ["app-1", "app-2", "app-3", "app-4"],
    "user-id": ["app-2", "app-3"]
};

export async function GET(request: Request) {
    // Simulate Auth Check
    const subjectId = "admin-id";

    const authorizedAppIds = MOCK_ASSIGNMENTS[subjectId] || [];
    const myApps = ALL_APPLICATIONS.filter(app => authorizedAppIds.includes(app.id));

    return NextResponse.json(myApps);
}
