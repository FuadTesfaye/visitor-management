import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { determineRouting } from '@/lib/routing';
import { notifyApproverOfNewRequest } from '@/lib/notifications';

// Utility to verify session from headers
const getUserFromHeaders = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const locationId = request.headers.get('x-user-location-id');
  const departmentId = request.headers.get('x-user-department-id');
  
  if (!userId) return null;
  return { userId, role, locationId, departmentId };
};

function generateVisitCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VIS-${num}`;
}

function generateQRToken() {
  return `QR-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromHeaders(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      visitorName, 
      faydaNumber, 
      phone,
      departmentId, 
      hostEmployeeId,
      purpose,
      date,
      time,
      walkIn
    } = body;

    // Validate Fayda Number (exactly 14 digits)
    if (!/^\d{14}$/.test(faydaNumber)) {
      return NextResponse.json({ error: 'Fayda ID must be exactly 14 digits' }, { status: 400 });
    }

    if (!visitorName || !phone || !purpose || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!departmentId && !hostEmployeeId) {
      return NextResponse.json({ error: 'Either departmentId or hostEmployeeId is required' }, { status: 400 });
    }

    // Determine routing using the new engine
    let routingData;
    try {
      routingData = await determineRouting({ departmentId, hostEmployeeId });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Routing failed' }, { status: 400 });
    }

    let hostName: string | null = null;
    if (hostEmployeeId) {
      const host = await prisma.user.findUnique({ where: { id: hostEmployeeId } });
      hostName = host?.name || null;
    }

    // Combine date and time
    const requestedDateTime = new Date(`${date}T${time}`);

    // Walk-in created by Staff/Security/Reception
    const isOffline = ['staff', 'security', 'receptionist'].includes(user.role || '');
    const isWalkIn = walkIn === true && user.role === 'security';

    // For immediate walk-in (security registers and immediately checks in)
    if (isWalkIn) {
      const visitCode = generateVisitCode();
      const qrToken = generateQRToken();
      const now = new Date();
      const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const [newRequest, log] = await prisma.$transaction(async (tx) => {
        const req = await tx.visitRequest.create({
          data: {
            visitorId: uuidv4(), // Physical identifier
            visitorName,
            faydaNumber,
            phone,
            locationId: routingData.locationId,
            locationName: routingData.locationName,
            departmentId: routingData.departmentId,
            departmentName: routingData.departmentName,
            hostEmployeeId,
            hostEmployeeName: hostName,
            purpose,
            requestedDateTime: now,
            status: 'checked-in',
            visitType: 'walk-in',
            walkIn: true,
            visitCode,
            qrToken,
            qrExpiration: expiration,
            submittedBy: user.userId,
            approvedBy: user.userId, // Auto-approved by security
            approvedAt: now,
            checkedInAt: now,
            checkedInBy: user.userId,
          }
        });

        const visitLog = await tx.visitLog.create({
          data: {
            visitRequestId: req.id,
            checkInTime: now,
            processedBy: user.userId,
          }
        });

        return [req, visitLog];
      });

      return NextResponse.json({
        message: 'Walk-in visitor registered and checked in successfully',
        visitCode,
        visitParam: newRequest.id,
        checkedIn: true,
      }, { status: 201 });
    }

    // Normal flow: create pending request
    const newRequest = await prisma.visitRequest.create({
      data: {
        visitorId: uuidv4(), // Physical identifier
        visitorName,
        faydaNumber,
        phone,
        locationId: routingData.locationId,
        locationName: routingData.locationName,
        departmentId: routingData.departmentId,
        departmentName: routingData.departmentName,
        hostEmployeeId,
        hostEmployeeName: hostName,
        purpose,
        requestedDateTime,
        status: 'pending',
        visitType: isOffline ? 'walk-in' : 'digital',
        walkIn: false,
        submittedBy: isOffline ? user.userId : null,
      }
    });

    // Notify Approver (Head)
    if (routingData.approverId) {
      const approver = await prisma.user.findUnique({ where: { id: routingData.approverId } });
      if (approver) {
        await notifyApproverOfNewRequest(approver.id, visitorName, approver.phone);
      }
    }

    return NextResponse.json({ 
      message: 'Visit request submitted successfully',
      visitParam: newRequest.id
    }, { status: 201 });
    
  } catch (error) {
    console.error('[API] Error creating visit request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromHeaders(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query: any = {};

    // Filter based on role
    if (user.role === 'staff' || user.role === 'receptionist') {
      // Staff sees requests they submitted OR requests where they are the host
      query.OR = [
        { submittedBy: user.userId },
        { hostEmployeeId: user.userId }
      ];
    }
    else if (user.role === 'head') {
      // Department head sees all requests for their department
      if (user.departmentId) {
        query.departmentId = user.departmentId;
      }
    }
    else if (user.role === 'security') {
      // Security sees approved + checked-in for their location
      query = {
        status: { in: ['approved', 'checked-in'] },
        locationId: user.locationId,
      };
    }
    else if (user.role === 'superadmin') {
      // Super admin sees all, no query filter
    }

    const result = await prisma.visitRequest.findMany({
      where: query,
      orderBy: { requestedDateTime: 'desc' }
    });

    return NextResponse.json({ data: result });
    
  } catch (error) {
    console.error('[API] Error fetching visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
