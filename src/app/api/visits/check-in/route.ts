import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Utility to verify session from headers
const getUserFromHeaders = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const branchId = request.headers.get('x-user-branch-id');
  if (!userId) return null;
  return { userId, role, branchId };
};

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromHeaders(request);
    
    // Only security admin can check in visitors
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
        targetRequest = await prisma.visitRequest.findFirst({ where: { visitCode: identifier } });
      } else if (method === 'fayda') {
        // Find most recent active one
        targetRequest = await prisma.visitRequest.findFirst({
          where: { faydaNumber: identifier },
          orderBy: { requestedDateTime: 'desc' }
        });
      }
    }

    if (!targetRequest) {
      return NextResponse.json({ error: 'Visit request not found' }, { status: 404 });
    }

    // Security check: Must be for THIS branch
    if (targetRequest.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Visitor belongs to another branch' }, { status: 403 });
    }

    // Must be approved
    if (targetRequest.status !== 'approved') {
      return NextResponse.json({ error: `Cannot check in visitor with status: ${targetRequest.status}` }, { status: 400 });
    }

    // Ensure they aren't already checked-in
    const existingLog = await prisma.visitLog.findFirst({
      where: { 
        visitRequestId: targetRequest.id,
        checkOutTime: null 
      }
    });
    
    if (existingLog) {
      return NextResponse.json({ error: 'Visitor is already checked in' }, { status: 400 });
    }

    // Expiration check
    if (targetRequest.qrExpiration && targetRequest.qrExpiration < new Date()) {
       return NextResponse.json({ error: 'Visit pass has expired' }, { status: 400 });
    }

    // Create log & Update status to checked-in using transaction
    const [log, _updatedRequest] = await prisma.$transaction([
      prisma.visitLog.create({
        data: {
          visitRequestId: targetRequest.id,
          checkInTime: new Date(),
          processedBy: user.userId,
        }
      }),
      prisma.visitRequest.update({
        where: { id: targetRequest.id },
        data: { status: 'checked-in' }
      })
    ]);

    return NextResponse.json({ 
      message: 'Visitor successfully checked in',
      data: log
    });
    
  } catch (error) {
    console.error('[API] Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
