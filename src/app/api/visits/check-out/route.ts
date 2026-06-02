import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const getUserFromHeaders = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const locationId = request.headers.get('x-user-location-id');
  if (!userId) return null;
  return { userId, role, locationId };
};

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromHeaders(request);
    
    if (!user || user.role !== 'security') {
      return NextResponse.json({ error: 'Unauthorized: Security role required' }, { status: 403 });
    }

    const { visitId, method, identifier } = await request.json();

    let targetRequest = null;

    if (visitId) {
      targetRequest = await prisma.visitRequest.findUnique({ where: { id: visitId } });
    }

    if (!targetRequest && identifier) {
      if (method === 'code') {
        targetRequest = await prisma.visitRequest.findFirst({ where: { visitCode: identifier.toUpperCase() } });
      } else if (method === 'fayda') {
        targetRequest = await prisma.visitRequest.findFirst({
          where: { faydaNumber: identifier, status: 'checked-in' },
          orderBy: { requestedDateTime: 'desc' }
        });
      } else if (method === 'qr') {
        targetRequest = await prisma.visitRequest.findFirst({ where: { qrToken: identifier } });
      }
    }

    if (!targetRequest) {
      return NextResponse.json({ error: 'Visit request not found' }, { status: 404 });
    }

    if (user.locationId && targetRequest.locationId !== user.locationId) {
      return NextResponse.json({ error: 'This visitor is registered for a different location' }, { status: 403 });
    }

    if (targetRequest.status !== 'checked-in') {
      return NextResponse.json({ error: `Cannot check out visitor with status: ${targetRequest.status}` }, { status: 400 });
    }

    const existingLog = await prisma.visitLog.findFirst({
      where: { 
        visitRequestId: targetRequest.id,
        checkOutTime: null 
      }
    });
    
    if (!existingLog) {
      return NextResponse.json({ error: 'No active check-in found for this visitor' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.visitLog.update({
        where: { id: existingLog.id },
        data: { checkOutTime: now }
      }),
      prisma.visitRequest.update({
        where: { id: targetRequest.id },
        data: { 
          status: 'checked-out',
          checkedOutAt: now,
          checkedOutBy: user.userId,
        }
      })
    ]);

    return NextResponse.json({ 
      message: `✓ ${targetRequest.visitorName} checked out successfully`,
      visitor: {
        name: targetRequest.visitorName,
        department: targetRequest.departmentName,
      }
    });
    
  } catch (error) {
    console.error('[API] Check-out error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
