import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { visitRequests, visitLogs, findVisitRequestByToken } from '@/lib/data-store';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userName = request.headers.get('x-user-name');

    if (!userId || !userName) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { qrToken } = await request.json();

    if (!qrToken) {
      return NextResponse.json(
        { error: 'QR token is required' },
        { status: 400 }
      );
    }

    // Find visit request by QR token
    const visitRequest = findVisitRequestByToken(qrToken);
    if (!visitRequest) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 404 }
      );
    }

    // Validate visit request
    if (visitRequest.status !== 'approved') {
      return NextResponse.json(
        { error: 'Visit request is not approved' },
        { status: 400 }
      );
    }

    if (!visitRequest.qrExpiration || visitRequest.qrExpiration < new Date()) {
      return NextResponse.json(
        { error: 'QR code has expired' },
        { status: 400 }
      );
    }

    // Check if already checked in
    const existingLog = visitLogs.find(log => 
      log.visitRequestId === visitRequest.id && !log.checkOutTime
    );
    if (existingLog) {
      return NextResponse.json(
        { error: 'Visitor already checked in' },
        { status: 400 }
      );
    }

    // Create check-in log
    const visitLog = {
      id: uuidv4(),
      visitRequestId: visitRequest.id,
      checkInTime: new Date(),
      processedBy: userId,
    };

    visitLogs.push(visitLog);

    return NextResponse.json({
      message: 'Check-in successful',
      visitor: {
        name: visitRequest.visitorName,
        department: visitRequest.departmentName,
        purpose: visitRequest.purpose,
        checkInTime: visitLog.checkInTime,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
