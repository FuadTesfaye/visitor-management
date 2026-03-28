import { NextRequest, NextResponse } from 'next/server';
import { getCheckedInVisitors } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (!userRole || userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const activeVisitors = getCheckedInVisitors();

    return NextResponse.json({
      activeVisitors: activeVisitors.map(visitor => ({
        id: visitor.id,
        visitorName: visitor.visitorName,
        departmentName: visitor.departmentName,
        purpose: visitor.purpose,
        checkInTime: visitor.log?.checkInTime,
      })),
    });
  } catch (error) {
    console.error('Get active visitors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
