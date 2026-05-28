import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';

// Utility to verify session from headers
const getUserFromHeaders = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const branchId = request.headers.get('x-user-branch-id');
  const departmentId = request.headers.get('x-user-department-id');
  
  if (!userId) return null;
  return { userId, role, branchId, departmentId };
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
      branchId,
      departmentId, 
      purpose,
      personToMeet,
      date,
      time,
      walkIn
    } = body;

    // Validate Fayda Number (exactly 14 digits)
    if (!/^\d{14}$/.test(faydaNumber)) {
      return NextResponse.json({ error: 'Fayda ID must be exactly 14 digits' }, { status: 400 });
    }

    if (!branchId || !departmentId || !visitorName || !phone || !purpose || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const targetDept = await prisma.department.findUnique({
      where: { id: departmentId }
    });
    
    if (!targetDept) {
      return NextResponse.json({ error: 'Invalid department' }, { status: 400 });
    }

    const targetBranch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    // Combine date and time
    const requestedDateTime = new Date(`${date}T${time}`);

    // Walk-in created by Staff or Security vs Digital created by Visitor
    const isOffline = user.role === 'staff' || user.role === 'security';
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
            visitorId: uuidv4(),
            visitorName,
            faydaNumber,
            phone,
            branchId,
            branchName: targetBranch?.name || '',
            departmentId,
            departmentName: targetDept.name,
            personToMeet: personToMeet || null,
            purpose,
            requestedDateTime: now,
            status: 'checked-in',
            visitType: 'walk-in',
            walkIn: true,
            visitCode,
            qrToken,
            qrExpiration: expiration,
            submittedBy: user.userId,
            approvedBy: user.userId,
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
        visitorId: user.role === 'visitor' ? user.userId : uuidv4(),
        visitorName,
        faydaNumber,
        phone,
        branchId,
        branchName: targetBranch?.name || '',
        departmentId,
        departmentName: targetDept.name,
        personToMeet: personToMeet || null,
        purpose,
        requestedDateTime,
        status: 'pending',
        visitType: isOffline ? 'walk-in' : 'digital',
        walkIn: false,
        submittedBy: isOffline ? user.userId : null,
      }
    });

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
    if (user.role === 'visitor') {
      query.visitorId = user.userId;
    } 
    else if (user.role === 'staff') {
      // Staff sees all requests they submitted
      query.submittedBy = user.userId;
    }
    else if (user.role === 'head') {
      // Department head sees all requests for their department in their branch
      if (user.departmentId) {
        query.departmentId = user.departmentId;
      }
      if (user.branchId) {
        query.branchId = user.branchId;
      }
    }
    else if (user.role === 'security') {
      // Security sees approved + checked-in for their branch (no date filter - they need to see all active)
      query = {
        status: { in: ['approved', 'checked-in'] },
        branchId: user.branchId,
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
