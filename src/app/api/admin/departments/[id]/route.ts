import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const getUserFromHeaders = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  if (!userId) return null;
  return { userId, role };
};

type Params = { id: string };

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = getUserFromHeaders(request);
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { name, locationId } = await request.json();

    const department = await prisma.department.update({ 
      where: { id }, 
      data: { 
        ...(name && { name: name.trim() }),
        ...(locationId && { locationId })
      } 
    });
    return NextResponse.json({ department });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = getUserFromHeaders(request);
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
