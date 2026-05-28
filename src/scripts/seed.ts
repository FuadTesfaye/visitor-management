import bcrypt from 'bcryptjs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { PrismaLibSQL } from '@prisma/adapter-better-sqlite3';

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
const db = new Database(dbPath);
const adapter = new PrismaLibSQL(db);
const prisma = new PrismaClient({ adapter });

async function seed() {
  try {
    console.log('🌱 Seeding local SQLite database...');

    // Clear existing data
    await prisma.visitLog.deleteMany({});
    await prisma.visitRequest.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.branch.deleteMany({});
    console.log('✓ Cleared existing data');

    // Branches
    const branch1 = await prisma.branch.create({ data: { name: 'Head Office (Jemo)' } });
    const branch2 = await prisma.branch.create({ data: { name: 'Sales Office (Tikur Anbessa)' } });
    const branch3 = await prisma.branch.create({ data: { name: 'FMCG Shop (Merkato)' } });
    const branch4 = await prisma.branch.create({ data: { name: 'Factory (Dukem)' } });
    console.log('✓ Branches seeded');

    // Departments
    const dept1 = await prisma.department.create({ data: { name: 'Coffee Export', branchId: branch1.id } });
    const dept2 = await prisma.department.create({ data: { name: 'Pharmaceutical', branchId: branch1.id } });
    const dept3 = await prisma.department.create({ data: { name: 'HR', branchId: branch1.id } });
    const dept4 = await prisma.department.create({ data: { name: 'Finance', branchId: branch1.id } });
    const dept5 = await prisma.department.create({ data: { name: 'Real Estate', branchId: branch2.id } });
    const dept6 = await prisma.department.create({ data: { name: 'FMCG', branchId: branch3.id } });
    const dept7 = await prisma.department.create({ data: { name: 'Aluminum', branchId: branch4.id } });
    console.log('✓ Departments seeded');
    // suppress unused vars warnings
    void dept2; void dept3; void dept4; void dept5; void dept6; void dept7;

    // Users (password: "password")
    const defaultPassword = await bcrypt.hash('password', 10);

    await prisma.user.createMany({
      data: [
        {
          email: 'visitor@test.com',
          password: defaultPassword,
          name: 'Test Visitor',
          role: 'visitor',
        },
        {
          email: 'staff@test.com',
          password: defaultPassword,
          name: 'Test Staff',
          role: 'staff',
          branchId: branch1.id,
          departmentId: dept1.id,
        },
        {
          email: 'head@test.com',
          password: defaultPassword,
          name: 'Test Head',
          role: 'head',
          branchId: branch1.id,
          departmentId: dept1.id,
        },
        {
          email: 'security@test.com',
          password: defaultPassword,
          name: 'Test Security',
          role: 'security',
          branchId: branch1.id,
        },
        {
          email: 'superadmin@test.com',
          password: defaultPassword,
          name: 'Super Admin',
          role: 'superadmin',
        },
      ],
    });
    console.log('✓ Users seeded');
    console.log('');
    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('Test accounts (password: "password"):');
    console.log('  visitor@test.com    → visitor');
    console.log('  staff@test.com      → staff');
    console.log('  head@test.com       → department head');
    console.log('  security@test.com   → security');
    console.log('  superadmin@test.com → super admin');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
