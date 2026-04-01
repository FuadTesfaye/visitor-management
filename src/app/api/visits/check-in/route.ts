import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { visitRequests, visitLogs, findVisitRequestByCode, findVisitRequestByFayda } from '@/lib/data-store';
import { VisitLog } from '@/types';

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

    let targetRequest = visitRequests.find(v => v.id === visitId);

    if (!targetRequest && identifier) {
      if (method === 'code') {
        targetRequest = findVisitRequestByCode(identifier);
      } else if (method === 'fayda') {
        targetRequest = findVisitRequestByFayda(identifier);
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
    const existingLog = visitLogs.find(l => l.visitRequestId === targetRequest.id);
    if (existingLog && !existingLog.checkOutTime) {
      return NextResponse.json({ error: 'Visitor is already checked in' }, { status: 400 });
    }

    // Expiration check
    if (targetRequest.qrExpiration && targetRequest.qrExpiration < new Date()) {
       return NextResponse.json({ error: 'Visit pass has expired' }, { status: 400 });
    }

    // Create log
    const log: VisitLog = {
      id: uuidv4(),
      visitRequestId: targetRequest.id,
      checkInTime: new Date(),
      processedBy: user.userId,
    };

    visitLogs.push(log);
    
    // Update status to checked-in
    targetRequest.status = 'checked-in';

    return NextResponse.json({ 
      message: 'Visitor successfully checked in',
      data: log
    });
    
  } catch (error) {
    console.error('[API] Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
