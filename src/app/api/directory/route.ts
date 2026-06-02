import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['staff', 'head']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
        locationId: true
      },
      orderBy: { name: 'asc' }
    });

    // Fetch locations and departments separately since relations aren't defined in schema
    const locations = await prisma.location.findMany();
    const departments = await prisma.department.findMany();

    const directory = users.map(user => ({
      ...user,
      department: departments.find(d => d.id === user.departmentId) || null,
      location: locations.find(b => b.id === user.locationId) || null
    }));

    return NextResponse.json({ directory });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
