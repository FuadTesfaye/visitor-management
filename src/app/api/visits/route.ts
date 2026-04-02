import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/db';
import { VisitRequestModel } from '@/models/VisitRequest';
import { DepartmentModel } from '@/models/Department';

// Utility to verify session from headers
const getUserFromHeaders = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const branchId = request.headers.get('x-user-branch-id');
  const departmentId = request.headers.get('x-user-department-id');
  
  if (!userId) return null;
  return { userId, role, branchId, departmentId };
};

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromHeaders(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      visitorName, 
      faydaNumber, 
      phone,
      branchId,
      departmentId, 
      purpose, 
      date,
      time 
    } = body;

    // Validate Fayda Number (exactly 14 digits)
    if (!/^\d{14}$/.test(faydaNumber)) {
      return NextResponse.json({ error: 'Fayda ID must be exactly 14 digits' }, { status: 400 });
    }

    if (!branchId || !departmentId || !visitorName || !phone || !purpose || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const targetDept = await DepartmentModel.findById(departmentId).lean();
    if (!targetDept) {
      return NextResponse.json({ error: 'Invalid department' }, { status: 400 });
    }

    // Combine date and time
    const requestedDateTime = new Date(`${date}T${time}`);

    // Walk-in created by Staff vs Digital created by Visitor
    const isOffline = user.role === 'staff';

    const newRequest = new VisitRequestModel({
      visitorId: user.role === 'visitor' ? user.userId : uuidv4(),
      visitorName,
      faydaNumber,
      phone,
      branchId,
      departmentId,
      departmentName: targetDept.name,
      purpose,
      requestedDateTime,
      status: 'pending',
      visitType: isOffline ? 'walk-in' : 'digital',
      submittedBy: isOffline ? user.userId : null,
    });

    await newRequest.save();

    return NextResponse.json({ 
      message: 'Visit request submitted successfully',
      visitParam: newRequest._id.toString()
    }, { status: 201 });
    
  } catch (error) {
    console.error('[API] Error creating visit request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = getUserFromHeaders(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query: any = {};

    // Filter based on role
    if (user.role === 'visitor') {
      query.visitorId = user.userId;
    } 
    else if (user.role === 'staff') {
      // Staff might want to see requests they submitted
      query.submittedBy = user.userId;
    }
    else if (user.role === 'head') {
      // Department head sees all requests for their department
      if (user.departmentId) {
        query.departmentId = user.departmentId;
      }
    }
    else if (user.role === 'security') {
      // Security sees all APPROVED requests for their branch that are active today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query = {
        status: { $in: ['approved', 'checked-in'] },
        branchId: user.branchId,
        requestedDateTime: {
          $gte: today,
          $lt: tomorrow
        }
      };
    }
    else if (user.role === 'superadmin') {
      // Super admin sees all, no query filter
    }

    const result = await VisitRequestModel.find(query)
      .sort({ requestedDateTime: -1 })
      .lean();

    return NextResponse.json({ data: result });
    
  } catch (error) {
    console.error('[API] Error fetching visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
