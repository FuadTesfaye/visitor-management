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

    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ locations });
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

    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 });
    }

    const location = await prisma.location.create({ data: { name: name.trim() } });
    return NextResponse.json({ location }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
