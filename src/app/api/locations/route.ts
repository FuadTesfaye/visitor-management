import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const locations = await prisma.location.findMany();
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('[API] Error fetching locations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
