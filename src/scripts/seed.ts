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
    await prisma.location.deleteMany({});
    console.log('✓ Cleared existing data');

    // Locations
    const loc1 = await prisma.location.create({ data: { name: 'First Floor' } });
    const loc2 = await prisma.location.create({ data: { name: 'Second Floor' } });
    const loc3 = await prisma.location.create({ data: { name: 'CEO Office' } });
    const loc4 = await prisma.location.create({ data: { name: 'Coffee Laboratory' } });
    console.log('✓ Locations seeded');

    // Users (all passwords: "password")
    const defaultPassword = await bcrypt.hash('password', 10);

    // Create Heads first so we can attach them to Departments
    const itHead = await prisma.user.create({
      data: { email: 'head-it@test.com', password: defaultPassword, name: 'Elias Omer Ali', role: 'head', position: 'IT Manager', locationId: loc2.id }
    });
    
    const financeHead = await prisma.user.create({
      data: { email: 'head-finance@test.com', password: defaultPassword, name: 'Dawit Tadesse', role: 'head', position: 'Finance Director', locationId: loc1.id }
    });

    const coffeeHead = await prisma.user.create({
      data: { email: 'head-coffee@test.com', password: defaultPassword, name: 'Sara Haile', role: 'head', position: 'Coffee Operations Head', locationId: loc4.id }
    });

    // Departments
    const deptIt = await prisma.department.create({ data: { name: 'IT', headId: itHead.id, locationId: loc2.id } });
    const deptFinance = await prisma.department.create({ data: { name: 'Finance', headId: financeHead.id, locationId: loc1.id } });
    const deptCoffee = await prisma.department.create({ data: { name: 'Coffee Operations', headId: coffeeHead.id, locationId: loc4.id } });
    console.log('✓ Departments seeded');

    // Update Heads with their Department IDs
    await prisma.user.update({ where: { id: itHead.id }, data: { departmentId: deptIt.id } });
    await prisma.user.update({ where: { id: financeHead.id }, data: { departmentId: deptFinance.id } });
    await prisma.user.update({ where: { id: coffeeHead.id }, data: { departmentId: deptCoffee.id } });

    // Create Staff
    const itStaff = await prisma.user.create({
      data: { email: 'staff-it@test.com', password: defaultPassword, name: 'IT Helpdesk', role: 'staff', position: 'Support Engineer', locationId: loc2.id, departmentId: deptIt.id }
    });

    const coffeeStaff = await prisma.user.create({
      data: { email: 'staff-coffee@test.com', password: defaultPassword, name: 'Coffee Quality Manager', role: 'staff', position: 'Quality Assurance', locationId: loc4.id, departmentId: deptCoffee.id }
    });

    // Security & Admins
    await prisma.user.create({
      data: { email: 'security@test.com', password: defaultPassword, name: 'Kebede Worku', role: 'security', locationId: loc1.id }
    });

    await prisma.user.create({
      data: { email: 'superadmin@test.com', password: defaultPassword, name: 'Super Admin', role: 'superadmin' }
    });
    
    await prisma.user.create({
      data: { email: 'reception@test.com', password: defaultPassword, name: 'Front Desk', role: 'receptionist', locationId: loc1.id }
    });

    console.log('✓ Users seeded');

    // Sample visit requests
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const today = new Date();
    today.setHours(14, 0, 0, 0);

    const qrToken1 = generateQRToken();
    const visitCode1 = generateVisitCode();

    // 1. Visit routed to Department
    await prisma.visitRequest.create({
      data: {
        visitorId: 'fayda-12345678901234',
        visitorName: 'Abebe Kebede',
        faydaNumber: '12345678901234',
        phone: '0912345678',
        locationId: loc4.id,
        locationName: loc4.name,
        departmentId: deptCoffee.id,
        departmentName: deptCoffee.name,
        purpose: 'Supplier meeting',
        requestedDateTime: today,
        status: 'approved',
        visitType: 'digital',
        visitCode: visitCode1,
        qrToken: qrToken1,
        qrExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
        approvedBy: coffeeHead.id,
        approvedAt: new Date(),
        submittedBy: itStaff.id, // e.g., submitted by another staff member
      }
    });

    // 2. Visit routed to Specific Employee
    await prisma.visitRequest.create({
      data: {
        visitorId: 'fayda-98765432109876',
        visitorName: 'Yohannes Girma',
        faydaNumber: '98765432109876',
        phone: '0987654321',
        locationId: loc2.id,
        locationName: loc2.name,
        departmentId: deptIt.id,
        departmentName: deptIt.name,
        hostEmployeeId: itStaff.id,
        hostEmployeeName: itStaff.name,
        purpose: 'Network maintenance',
        requestedDateTime: tomorrow,
        status: 'pending',
        visitType: 'digital',
        submittedBy: 'walk-in', 
      }
    });

    // 3. Checked-in Walk-in visitor
    const checkedInVisit = await prisma.visitRequest.create({
      data: {
        visitorId: 'walk-in-002',
        visitorName: 'Meron Habtamu',
        faydaNumber: '11223344556677',
        phone: '0911223344',
        locationId: loc1.id,
        locationName: loc1.name,
        departmentId: deptFinance.id,
        departmentName: deptFinance.name,
        purpose: 'Audit review meeting',
        requestedDateTime: today,
        status: 'checked-in',
        visitType: 'walk-in',
        visitCode: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
        qrToken: generateQRToken(),
        qrExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
        approvedBy: financeHead.id,
        approvedAt: new Date(),
        checkedInAt: new Date(Date.now() - 30 * 60 * 1000),
        checkedInBy: 'security@test.com',
        walkIn: true,
      }
    });

    await prisma.visitLog.create({
      data: {
        visitRequestId: checkedInVisit.id,
        checkInTime: new Date(Date.now() - 30 * 60 * 1000),
        processedBy: 'security@test.com',
      }
    });

    console.log('✓ Sample visits seeded');
    console.log('');
    console.log('✅ Database seeding completed!');
    console.log('');
    console.log('Test accounts (password: "password"):');
    console.log(`  staff-it@test.com      → staff (IT Helpdesk)`);
    console.log(`  head-it@test.com       → head (IT Manager)`);
    console.log(`  head-finance@test.com  → head (Finance Director)`);
    console.log(`  security@test.com      → security`);
    console.log(`  reception@test.com     → receptionist`);
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
