import { NextRequest, NextResponse } from 'next/server';
import { visitLogs, visitRequests, findVisitRequestById, findVisitRequestByToken } from '@/lib/data-store';

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

    const visitRequestId = visitRequest.id;

    // Find active check-in log
    const activeLog = visitLogs.find(log => 
      log.visitRequestId === visitRequestId && !log.checkOutTime
    );

    if (!activeLog) {
      return NextResponse.json(
        { error: 'No active check-in found for this visitor' },
        { status: 404 }
      );
    }

    // Update check-out time and status
    activeLog.checkOutTime = new Date();
    visitRequest.status = 'checked-out';

    return NextResponse.json({
      message: 'Check-out successful',
      visitor: {
        name: visitRequest?.visitorName,
        department: visitRequest?.departmentName,
        checkInTime: activeLog.checkInTime,
        checkOutTime: activeLog.checkOutTime,
      },
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
