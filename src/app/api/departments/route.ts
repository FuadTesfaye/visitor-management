import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get('branchId');
    
    let query = {};
    if (branchId) {
      query = { where: { branchId } };
    }
    
    const departments = await prisma.department.findMany(query);
    return NextResponse.json({ departments });
  } catch (error) {
    console.error('[API] Error fetching departments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
