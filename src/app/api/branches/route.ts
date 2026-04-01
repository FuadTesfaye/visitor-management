import { NextResponse } from 'next/server';
import { branches } from '@/lib/data-store';

export async function GET() {
  return NextResponse.json({ branches });
}
