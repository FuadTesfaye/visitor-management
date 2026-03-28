import { NextRequest, NextResponse } from 'next/server';
import { visitRequests, findVisitRequestById } from '@/lib/data-store';
import { generateQRToken, generateQRCode, getQRExpirationTime } from '@/lib/qr';

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

    // Generate QR token and code
    const qrToken = generateQRToken();
    const qrExpiration = getQRExpirationTime(24); // 24 hours expiration
    const qrCodeDataURL = await generateQRCode(qrToken);

    // Update visit request
    visitRequest.status = 'approved';
    visitRequest.qrToken = qrToken;
    visitRequest.qrExpiration = qrExpiration;
    visitRequest.approvedBy = userId;
    visitRequest.approvedAt = new Date();

    return NextResponse.json({
      message: 'Visit request approved successfully',
      visitRequest: {
        id: visitRequest.id,
        visitorName: visitRequest.visitorName,
        departmentName: visitRequest.departmentName,
        status: visitRequest.status,
        approvedAt: visitRequest.approvedAt,
        qrExpiration: visitRequest.qrExpiration,
      },
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error('Approve visit request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
