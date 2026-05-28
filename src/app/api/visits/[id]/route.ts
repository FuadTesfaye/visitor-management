import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateQRToken } from '@/lib/qr';
import { sendSMS, generateOTP } from '@/lib/sms';

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

function generateVisitCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VIS-${num}`;
}

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
    const requestData = await prisma.visitRequest.findUnique({
      where: { id: resParams.id }
    });
    
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

    const req = await prisma.visitRequest.findUnique({ where: { id: resParams.id } });
    
    if (!req) {
      return NextResponse.json({ error: 'Visit request not found' }, { status: 404 });
    }

    if (req.status !== 'pending') {
      return NextResponse.json({ error: `Request is already ${req.status}` }, { status: 400 });
    }

    let updatedReq;

    // Update status
    if (status === 'approved') {
      const now = new Date();
      // Expiration: 48 hours from approval
      const expiration = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      
      const token = generateQRToken();
      const visitCode = generateVisitCode();
      
      const otp = generateOTP(); // 6-digit numeric OTP for feature phones

      updatedReq = await prisma.visitRequest.update({
        where: { id: resParams.id },
        data: {
          status: 'approved',
          qrToken: token,
          visitCode: visitCode,
          smsOtp: otp,
          qrExpiration: expiration,
          approvedBy: user.userId,
          approvedAt: now
        }
      });

      // Send SMS asynchronously — don't block the response
      const smsText =
        `TRACON VISIT APPROVED\n` +
        `Dept: ${req.departmentName}\n` +
        `OTP: ${otp}\n` +
        `Code: ${visitCode}\n` +
        `Show OTP or code to security.`;
      sendSMS(req.phone, smsText).catch(console.error);

    } else if (status === 'rejected') {
      updatedReq = await prisma.visitRequest.update({
        where: { id: resParams.id },
        data: {
          status: 'rejected',
          rejectedBy: user.userId,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || 'No reason provided'
        }
      });
    }

    return NextResponse.json({ 
      message: `Visit request ${status} successfully`,
      data: updatedReq 
    });
    
  } catch (error) {
    console.error('[API] Error updating visit status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
