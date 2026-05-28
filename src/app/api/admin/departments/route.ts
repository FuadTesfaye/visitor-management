import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const getUserFromHeaders = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  if (!userId) return null;
  return { userId, role };
};

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromHeaders(request);
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    const departments = await prisma.department.findMany({
      where: branchId ? { branchId } : {},
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ departments });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromHeaders(request);
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, branchId } = await request.json();
    if (!name || !name.trim() || !branchId) {
      return NextResponse.json({ error: 'Department name and branch are required' }, { status: 400 });
    }

    const department = await prisma.department.create({ 
      data: { name: name.trim(), branchId } 
    });
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
