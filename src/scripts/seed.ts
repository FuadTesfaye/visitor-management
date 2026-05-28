import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

function generateVisitCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VIS-${num}`;
}

function generateQRToken() {
  return `QR-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

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

    // Users (all passwords: "password")
    const defaultPassword = await bcrypt.hash('password', 10);

    const visitorUser = await prisma.user.create({
      data: {
        email: 'visitor@test.com',
        password: defaultPassword,
        name: 'Abebe Kebede',
        role: 'visitor',
      }
    });

    await prisma.user.createMany({
      data: [
        {
          email: 'staff@test.com',
          password: defaultPassword,
          name: 'Tigist Alemu',
          role: 'staff',
          branchId: branch1.id,
          departmentId: dept1.id,
        },
        {
          email: 'head@test.com',
          password: defaultPassword,
          name: 'Dawit Tadesse',
          role: 'head',
          branchId: branch1.id,
          departmentId: dept1.id,
        },
        {
          email: 'pharma-head@test.com',
          password: defaultPassword,
          name: 'Sara Haile',
          role: 'head',
          branchId: branch1.id,
          departmentId: dept2.id,
        },
        {
          email: 'security@test.com',
          password: defaultPassword,
          name: 'Kebede Worku',
          role: 'security',
          branchId: branch1.id,
        },
        {
          email: 'sales-security@test.com',
          password: defaultPassword,
          name: 'Security Sales Office',
          role: 'security',
          branchId: branch2.id,
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

    // Sample visit requests so security can test immediately
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const today = new Date();
    today.setHours(14, 0, 0, 0);

    const qrToken1 = generateQRToken();
    const visitCode1 = generateVisitCode();
    const qrToken2 = generateQRToken();
    const visitCode2 = generateVisitCode();

    const approvedVisit = await prisma.visitRequest.create({
      data: {
        visitorId: visitorUser.id,
        visitorName: 'Abebe Kebede',
        faydaNumber: '12345678901234',
        phone: '0912345678',
        branchId: branch1.id,
        branchName: 'Head Office (Jemo)',
        departmentId: dept1.id,
        departmentName: 'Coffee Export',
        personToMeet: 'Dawit Tadesse',
        purpose: 'Supplier meeting for coffee export contract',
        requestedDateTime: today,
        status: 'approved',
        visitType: 'digital',
        visitCode: visitCode1,
        qrToken: qrToken1,
        qrExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
        approvedBy: 'seed',
        approvedAt: new Date(),
      }
    });

    // Pending visit from visitor
    await prisma.visitRequest.create({
      data: {
        visitorId: visitorUser.id,
        visitorName: 'Abebe Kebede',
        faydaNumber: '12345678901234',
        phone: '0912345678',
        branchId: branch1.id,
        branchName: 'Head Office (Jemo)',
        departmentId: dept2.id,
        departmentName: 'Pharmaceutical',
        purpose: 'Discuss pharma supply contract',
        requestedDateTime: tomorrow,
        status: 'pending',
        visitType: 'digital',
      }
    });

    // Staff-created approved visit
    await prisma.visitRequest.create({
      data: {
        visitorId: 'walk-in-001',
        visitorName: 'Yohannes Girma',
        faydaNumber: '98765432109876',
        phone: '0987654321',
        branchId: branch1.id,
        branchName: 'Head Office (Jemo)',
        departmentId: dept3.id,
        departmentName: 'HR',
        personToMeet: 'HR Manager',
        purpose: 'Job interview follow-up',
        requestedDateTime: today,
        status: 'approved',
        visitType: 'walk-in',
        visitCode: visitCode2,
        qrToken: qrToken2,
        qrExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
        approvedBy: 'seed',
        approvedAt: new Date(),
        submittedBy: 'staff-seed',
      }
    });

    // Checked-in visitor (currently inside)
    const checkedInVisit = await prisma.visitRequest.create({
      data: {
        visitorId: 'walk-in-002',
        visitorName: 'Meron Habtamu',
        faydaNumber: '11223344556677',
        phone: '0911223344',
        branchId: branch1.id,
        branchName: 'Head Office (Jemo)',
        departmentId: dept4.id,
        departmentName: 'Finance',
        purpose: 'Audit review meeting',
        requestedDateTime: today,
        status: 'checked-in',
        visitType: 'walk-in',
        visitCode: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
        qrToken: generateQRToken(),
        qrExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
        approvedBy: 'seed',
        approvedAt: new Date(),
        checkedInAt: new Date(Date.now() - 30 * 60 * 1000),
        checkedInBy: 'security-seed',
        walkIn: true,
      }
    });

    // Create check-in log for the checked-in visitor
    await prisma.visitLog.create({
      data: {
        visitRequestId: checkedInVisit.id,
        checkInTime: new Date(Date.now() - 30 * 60 * 1000),
        processedBy: 'security-seed',
      }
    });

    // Walk-in for Fuad Tesfaye Nanani in Sales Office (Tikur Anbessa)
    const fuadWalkIn = await prisma.visitRequest.create({
      data: {
        visitorId: 'fuad-walkin-001',
        visitorName: 'Fuad Tesfaye Nanani',
        faydaNumber: '09876544525317',
        phone: '0924113086',
        branchId: branch2.id,
        branchName: 'Sales Office (Tikur Anbessa)',
        departmentId: dept5.id,
        departmentName: 'Real Estate',
        personToMeet: 'Fuad Tesfaye',
        purpose: 'Brief reason for visit',
        requestedDateTime: today,
        status: 'checked-in',
        visitType: 'walk-in',
        visitCode: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
        qrToken: generateQRToken(),
        qrExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
        approvedBy: 'seed',
        approvedAt: new Date(),
        checkedInAt: new Date(Date.now() - 10 * 60 * 1000),
        checkedInBy: 'security-seed',
        walkIn: true,
      }
    });

    await prisma.visitLog.create({
      data: {
        visitRequestId: fuadWalkIn.id,
        checkInTime: new Date(Date.now() - 10 * 60 * 1000),
        processedBy: 'security-seed',
      }
    });

    console.log('✓ Sample visits seeded');
    console.log('');
    console.log('✅ Database seeding completed!');
    console.log('');
    console.log('Test accounts (password: "password"):');
    console.log(`  visitor@test.com       → visitor (Abebe Kebede)`);
    console.log(`  staff@test.com         → staff`);
    console.log(`  head@test.com          → Coffee Export dept head`);
    console.log(`  pharma-head@test.com   → Pharmaceutical dept head`);
    console.log(`  security@test.com      → security (Head Office Jemo)`);
    console.log(`  sales-security@test.com → security (Sales Office Tikur Anbessa)`);
    console.log(`  superadmin@test.com    → super admin`);
    console.log('');
    console.log('Sample approved visit code: ' + visitCode1);
    console.log('Sample approved QR token:   ' + qrToken1);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
