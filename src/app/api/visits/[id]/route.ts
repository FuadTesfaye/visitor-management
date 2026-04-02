import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { VisitRequestModel } from '@/models/VisitRequest';
import { generateQRToken } from '@/lib/qr';
import { sendSMS } from '@/lib/sms';

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
    await dbConnect();
    const user = getUserFromHeaders(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resParams = await params;
    const requestData = await VisitRequestModel.findById(resParams.id).lean();
    
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
    await dbConnect();
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

    const req = await VisitRequestModel.findById(resParams.id);
    
    if (!req) {
      return NextResponse.json({ error: 'Visit request not found' }, { status: 404 });
    }

    // Update status
    if (status === 'approved') {
      const now = new Date();
      // Expiration: 24 hours from approval
      const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const token = generateQRToken();
      const visitCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      req.status = 'approved';
      req.qrToken = token;
      req.visitCode = visitCode;
      req.qrExpiration = expiration;
      req.approvedBy = user.userId;
      req.approvedAt = now;

      await req.save();

      // Trigger SMS asynchronously
      const smsText = `Your visit to ${req.departmentName} has been approved. Your access code is ${visitCode}. Please present this code to security.`;
      sendSMS(req.phone, smsText).catch(console.error);

    } else if (status === 'rejected') {
      req.status = 'rejected';
      req.rejectedBy = user.userId;
      req.rejectedAt = new Date();
      req.rejectionReason = rejectionReason || 'No reason provided';
      
      await req.save();
    }

    return NextResponse.json({ 
      message: `Visit request ${status} successfully`,
      data: req 
    });
    
  } catch (error) {
    console.error('[API] Error updating visit status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
