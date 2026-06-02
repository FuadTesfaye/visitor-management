import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Utility to verify session from headers
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
    
    // Only security can check in visitors
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
        targetRequest = await prisma.visitRequest.findFirst({ 
          where: { visitCode: identifier.toUpperCase() } 
        });
      } else if (method === 'fayda') {
        // Find most recent approved one
        targetRequest = await prisma.visitRequest.findFirst({
          where: { 
            faydaNumber: identifier,
            status: 'approved'
          },
          orderBy: { requestedDateTime: 'desc' }
        });
        // Fallback to any recent if no approved found
        if (!targetRequest) {
          targetRequest = await prisma.visitRequest.findFirst({
            where: { faydaNumber: identifier },
            orderBy: { requestedDateTime: 'desc' }
          });
        }
      } else if (method === 'qr') {
        // QR scan — the token is embedded in the QR code
        targetRequest = await prisma.visitRequest.findFirst({
          where: { qrToken: identifier }
        });
      } else if (method === 'otp') {
        // 6-digit SMS OTP — find the most recent approved visit with this OTP
        targetRequest = await prisma.visitRequest.findFirst({
          where: {
            smsOtp: identifier.trim(),
            status: 'approved'
          },
          orderBy: { requestedDateTime: 'desc' }
        });
      } else if (method === 'name') {
        // Name search — find by visitor name (most recent approved)
        targetRequest = await prisma.visitRequest.findFirst({
          where: {
            visitorName: { contains: identifier },
            status: 'approved'
          },
          orderBy: { requestedDateTime: 'desc' }
        });
      }
    }

    if (!targetRequest) {
      return NextResponse.json({ error: 'Visit request not found. Please check the code, Fayda ID, or name.' }, { status: 404 });
    }

    // Security check: Must be for THIS location
    if (user.locationId && targetRequest.locationId !== user.locationId) {
      return NextResponse.json({ error: 'This visitor is registered for a different location' }, { status: 403 });
    }

    // Must be approved
    if (targetRequest.status !== 'approved') {
      if (targetRequest.status === 'checked-in') {
        return NextResponse.json({ error: 'Visitor is already checked in' }, { status: 400 });
      }
      if (targetRequest.status === 'checked-out') {
        return NextResponse.json({ error: 'This visit has already been completed' }, { status: 400 });
      }
      if (targetRequest.status === 'rejected') {
        return NextResponse.json({ error: 'This visit request was rejected' }, { status: 400 });
      }
      if (targetRequest.status === 'pending') {
        return NextResponse.json({ error: 'This visit request is still pending approval' }, { status: 400 });
      }
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
       return NextResponse.json({ error: 'Visit pass has expired. Please contact the department head to re-approve.' }, { status: 400 });
    }

    const now = new Date();

    // Create log & Update status to checked-in using transaction
    const [log] = await prisma.$transaction([
      prisma.visitLog.create({
        data: {
          visitRequestId: targetRequest.id,
          checkInTime: now,
          processedBy: user.userId,
        }
      }),
      prisma.visitRequest.update({
        where: { id: targetRequest.id },
        data: { 
          status: 'checked-in',
          checkedInAt: now,
          checkedInBy: user.userId,
        }
      })
    ]);

    return NextResponse.json({ 
      message: `✓ ${targetRequest.visitorName} checked in successfully`,
      visitor: {
        name: targetRequest.visitorName,
        department: targetRequest.departmentName,
        purpose: targetRequest.purpose,
        visitCode: targetRequest.visitCode,
      },
      data: log
    });
    
  } catch (error) {
    console.error('[API] Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
