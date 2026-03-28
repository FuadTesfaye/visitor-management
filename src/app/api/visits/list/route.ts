import { NextRequest, NextResponse } from 'next/server';
import { visitRequests, findUserById } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userDepartmentId = request.headers.get('x-user-department-id');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let filteredRequests;

    if (userRole === 'visitor') {
      // Visitors can only see their own requests
      filteredRequests = visitRequests.filter(req => req.visitorId === userId);
    } else if (userRole === 'approver') {
      // Approvers can only see requests for their department
      if (!userDepartmentId) {
        return NextResponse.json(
          { error: 'Approver must be assigned to a department' },
          { status: 400 }
        );
      }
      filteredRequests = visitRequests.filter(req => req.departmentId === userDepartmentId);
    } else if (userRole === 'admin') {
      // Admins can see all requests
      filteredRequests = visitRequests;
    } else {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Sort by requested date (newest first)
    filteredRequests.sort((a, b) => new Date(b.requestedDateTime).getTime() - new Date(a.requestedDateTime).getTime());

    return NextResponse.json({
      visitRequests: filteredRequests.map(req => ({
        id: req.id,
        visitorName: req.visitorName,
        faydaNumber: req.faydaNumber,
        departmentName: req.departmentName,
        purpose: req.purpose,
        requestedDateTime: req.requestedDateTime,
        status: req.status,
        qrToken: req.qrToken,
        qrExpiration: req.qrExpiration,
        approvedAt: req.approvedAt,
        rejectedAt: req.rejectedAt,
        rejectionReason: req.rejectionReason,
      })),
    });
  } catch (error) {
    console.error('List visit requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
