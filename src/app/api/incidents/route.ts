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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const incidents = await prisma.incidentReport.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ incidents });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromHeaders(request);
    if (!user || user.role !== 'security') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const newIncident = await prisma.incidentReport.create({
      data: {
        title,
        description,
        branchId: 'default-branch', // Hardcoded for demo
        reportedBy: user.userId,
        status: 'open'
      }
    });

    return NextResponse.json({ incident: newIncident }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
