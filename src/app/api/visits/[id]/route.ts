import { NextRequest, NextResponse } from 'next/server';
import { visitRequests } from '@/lib/data-store';
import { generateQRToken } from '@/lib/qr';
import { VisitRequest } from '@/types';

type Params = {
  id: string;
};

// Utility to verify session from headers
const getUserFromHeaders = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  if (!userId) return null;
  return { userId, role };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = getUserFromHeaders(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resParams = await params;
    const requestData = visitRequests.find(r => r.id === resParams.id);
    
    if (!requestData) {
      return NextResponse.json({ error: 'Visit request not found' }, { status: 404 });
    }

    return NextResponse.json({ data: requestData });
    
  } catch (error) {
    console.error('[API] Error fetching visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = getUserFromHeaders(request);
    if (!user || user.role !== 'head') { // only head approves/rejects
      return NextResponse.json({ error: 'Unauthorized: Approver role required' }, { status: 403 });
    }

    const resParams = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const requestIndex = visitRequests.findIndex(r => r.id === resParams.id);
    
    if (requestIndex === -1) {
      return NextResponse.json({ error: 'Visit request not found' }, { status: 404 });
    }

    const req = visitRequests[requestIndex];

    // Update status
    if (status === 'approved') {
      const now = new Date();
      // Expiration: 24 hours from approval
      const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const token = generateQRToken();
      
      visitRequests[requestIndex] = {
        ...req,
        status: 'approved',
        qrToken: token,
        visitCode: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit random code
        qrExpiration: expiration,
        approvedBy: user.userId,
        approvedAt: now,
      };
    } else if (status === 'rejected') {
      visitRequests[requestIndex] = {
        ...req,
        status: 'rejected',
        rejectedBy: user.userId,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'No reason provided',
      };
    }

    return NextResponse.json({ 
      message: `Visit request ${status} successfully`,
      data: visitRequests[requestIndex] 
    });
    
  } catch (error) {
    console.error('[API] Error updating visit status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
