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
        branchId: true
      },
      orderBy: { name: 'asc' }
    });

    // Fetch branches and departments separately since relations aren't defined in schema
    const branches = await prisma.branch.findMany();
    const departments = await prisma.department.findMany();

    const directory = users.map(user => ({
      ...user,
      department: departments.find(d => d.id === user.departmentId) || null,
      branch: branches.find(b => b.id === user.branchId) || null
    }));

    return NextResponse.json({ directory });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
