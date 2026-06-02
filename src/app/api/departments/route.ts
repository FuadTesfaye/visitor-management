import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const locationId = request.nextUrl.searchParams.get('locationId');
    
    let query = {};
    if (locationId) {
      query = { where: { locationId } };
    }
    
    const departments = await prisma.department.findMany(query);
    return NextResponse.json({ departments });
  } catch (error) {
    console.error('[API] Error fetching departments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
