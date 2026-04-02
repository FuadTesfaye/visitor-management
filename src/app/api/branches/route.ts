import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { BranchModel } from '@/models/Branch';

export async function GET() {
  try {
    await dbConnect();
    const branches = await BranchModel.find({}).lean();
    return NextResponse.json({ branches });
  } catch (error) {
    console.error('[API] Error fetching branches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
