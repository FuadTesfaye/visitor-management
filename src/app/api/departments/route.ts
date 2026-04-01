import { NextRequest, NextResponse } from 'next/server';
import { departments } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  const branchId = request.nextUrl.searchParams.get('branchId');
  
  if (branchId) {
    const filtered = departments.filter(d => d.branchId === branchId);
    return NextResponse.json({ departments: filtered });
  }

  return NextResponse.json({ departments });
}
