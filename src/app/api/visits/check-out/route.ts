import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { VisitRequestModel } from '@/models/VisitRequest';
import { VisitLogModel } from '@/models/VisitLog';

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
    await dbConnect();
    const user = getUserFromHeaders(request);
    
    // Only security admin can check out visitors
    if (!user || user.role !== 'security') {
      return NextResponse.json({ error: 'Unauthorized: Security role required' }, { status: 403 });
    }

    const { visitId, method, identifier } = await request.json();

    let targetRequest = null;

    if (visitId) {
      targetRequest = await VisitRequestModel.findById(visitId);
    }

    if (!targetRequest && identifier) {
      if (method === 'code') {
        targetRequest = await VisitRequestModel.findOne({ visitCode: identifier });
      } else if (method === 'fayda') {
        targetRequest = await VisitRequestModel.findOne({ faydaNumber: identifier })
          .sort({ requestedDateTime: -1 });
      }
    }

    if (!targetRequest) {
      return NextResponse.json({ error: 'Visit request not found' }, { status: 404 });
    }

    // Security check: Must be for THIS branch
    if (targetRequest.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Visitor belongs to another branch' }, { status: 403 });
    }

    // Must be checked in
    if (targetRequest.status !== 'checked-in') {
      return NextResponse.json({ error: `Cannot check out visitor with status: ${targetRequest.status}` }, { status: 400 });
    }

    // Find active log
    const existingLog = await VisitLogModel.findOne({ 
      visitRequestId: targetRequest._id,
      checkOutTime: null 
    });
    
    if (!existingLog) {
      return NextResponse.json({ error: 'No active check-in found for this visitor' }, { status: 400 });
    }

    // Update log
    existingLog.checkOutTime = new Date();
    await existingLog.save();
    
    // Update status to checked-out
    targetRequest.status = 'checked-out';
    await targetRequest.save();

    return NextResponse.json({ 
      message: 'Visitor successfully checked out',
      data: existingLog
    });
    
  } catch (error) {
    console.error('[API] Check-out error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
