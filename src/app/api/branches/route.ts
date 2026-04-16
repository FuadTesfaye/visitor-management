import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const branches = await prisma.branch.findMany();
    return NextResponse.json({ branches });
  } catch (error) {
    console.error('[API] Error fetching branches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
