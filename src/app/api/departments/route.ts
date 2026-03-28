import { NextRequest, NextResponse } from 'next/server';
import { departments } from '@/lib/data-store';

export async function GET() {
  try {
    return NextResponse.json({
      departments: departments.map(dept => ({
        id: dept.id,
        name: dept.name,
      })),
    });
  } catch (error) {
    console.error('Get departments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
