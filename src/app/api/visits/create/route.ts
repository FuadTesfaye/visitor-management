import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { visitRequests, departments } from '@/lib/data-store';
import { VisitRequest } from '@/types';

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

    const { visitorName, faydaNumber, departmentId, purpose, requestedDateTime } = await request.json();

    // Validation
    if (!visitorName || !faydaNumber || !departmentId || !purpose || !requestedDateTime) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate Fayda number (14 digits)
    if (!/^\d{14}$/.test(faydaNumber)) {
      return NextResponse.json(
        { error: 'Fayda number must be exactly 14 digits' },
        { status: 400 }
      );
    }

    // Validate department exists
    const department = departments.find(dept => dept.id === departmentId);
    if (!department) {
      return NextResponse.json(
        { error: 'Invalid department' },
        { status: 400 }
      );
    }

    // Create visit request
    const visitRequest: VisitRequest = {
      id: uuidv4(),
      visitorId: userId,
      visitorName,
      faydaNumber,
      departmentId,
      departmentName: department.name,
      purpose,
      requestedDateTime: new Date(requestedDateTime),
      status: 'pending',
    };

    visitRequests.push(visitRequest);

    return NextResponse.json({
      message: 'Visit request submitted successfully',
      visitRequest: {
        id: visitRequest.id,
        visitorName: visitRequest.visitorName,
        departmentName: visitRequest.departmentName,
        purpose: visitRequest.purpose,
        requestedDateTime: visitRequest.requestedDateTime,
        status: visitRequest.status,
      },
    });
  } catch (error) {
    console.error('Create visit request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
