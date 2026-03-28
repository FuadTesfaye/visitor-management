import { NextRequest, NextResponse } from 'next/server';
import { visitRequests, findVisitRequestById } from '@/lib/data-store';

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

    const { visitRequestId, rejectionReason } = await request.json();

    if (!visitRequestId) {
      return NextResponse.json(
        { error: 'Visit request ID is required' },
        { status: 400 }
      );
    }

    const visitRequest = findVisitRequestById(visitRequestId);
    if (!visitRequest) {
      return NextResponse.json(
        { error: 'Visit request not found' },
        { status: 404 }
      );
    }

    if (visitRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Visit request is not pending' },
        { status: 400 }
      );
    }

    // Update visit request
    visitRequest.status = 'rejected';
    visitRequest.rejectedBy = userId;
    visitRequest.rejectedAt = new Date();
    visitRequest.rejectionReason = rejectionReason || 'No reason provided';

    return NextResponse.json({
      message: 'Visit request rejected successfully',
      visitRequest: {
        id: visitRequest.id,
        visitorName: visitRequest.visitorName,
        departmentName: visitRequest.departmentName,
        status: visitRequest.status,
        rejectedAt: visitRequest.rejectedAt,
        rejectionReason: visitRequest.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Reject visit request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
