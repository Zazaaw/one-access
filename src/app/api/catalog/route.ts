import { NextResponse } from 'next/server';
import { ALL_APPLICATIONS } from '@/lib/constants/apps';

export async function GET() {
    // Catalog is public or at least visible to all authenticated users
    return NextResponse.json(ALL_APPLICATIONS);
}
