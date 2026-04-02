import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { DepartmentModel } from '@/models/Department';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const branchId = request.nextUrl.searchParams.get('branchId');
    
    let query = {};
    if (branchId) {
      query = { branchId };
    }
    
    const departments = await DepartmentModel.find(query).lean();
    return NextResponse.json({ departments });
  } catch (error) {
    console.error('[API] Error fetching departments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
