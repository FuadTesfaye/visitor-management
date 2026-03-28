import { NextRequest, NextResponse } from 'next/server';
import { visitLogs, visitRequests, findVisitRequestById } from '@/lib/data-store';

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

    const { visitRequestId } = await request.json();

    if (!visitRequestId) {
      return NextResponse.json(
        { error: 'Visit request ID is required' },
        { status: 400 }
      );
    }

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

    // Update check-out time
    activeLog.checkOutTime = new Date();

    const visitRequest = findVisitRequestById(visitRequestId);

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
