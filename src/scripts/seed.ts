import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Ensure the models are registered
import { UserModel } from '../models/User.js';
import { BranchModel } from '../models/Branch.js';
import { DepartmentModel } from '../models/Department.js';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Clear existing data
    await UserModel.deleteMany({});
    await BranchModel.deleteMany({});
    await DepartmentModel.deleteMany({});
    console.log('Cleared existing data');

    // Branches
    const branch1 = await BranchModel.create({ name: 'Head Office (Jemo)' });
    const branch2 = await BranchModel.create({ name: 'Sales Office (Tikur Anbessa)' });
    const branch3 = await BranchModel.create({ name: 'FMCG Shop (Merkato)' });
    const branch4 = await BranchModel.create({ name: 'Factory (Dukem)' });
    console.log('Branches seeded');

    // Departments
    const dept1 = await DepartmentModel.create({ name: 'Coffee Export', branchId: branch1._id.toString() });
    const dept2 = await DepartmentModel.create({ name: 'Pharmaceutical', branchId: branch1._id.toString() });
    const dept3 = await DepartmentModel.create({ name: 'HR', branchId: branch1._id.toString() });
    const dept4 = await DepartmentModel.create({ name: 'Finance', branchId: branch1._id.toString() });
    const dept5 = await DepartmentModel.create({ name: 'Real Estate', branchId: branch2._id.toString() });
    const dept6 = await DepartmentModel.create({ name: 'FMCG', branchId: branch3._id.toString() });
    const dept7 = await DepartmentModel.create({ name: 'Aluminum', branchId: branch4._id.toString() });
    console.log('Departments seeded');

    // Users
    const defaultPassword = await bcrypt.hash('password', 10);

    await UserModel.create([
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
        branchId: branch1._id.toString(),
        departmentId: dept1._id.toString(),
      },
      {
        email: 'head@test.com',
        password: defaultPassword,
        name: 'Test Head',
        role: 'head',
        branchId: branch1._id.toString(),
        departmentId: dept1._id.toString(),
      },
      {
        email: 'security@test.com',
        password: defaultPassword,
        name: 'Test Security',
        role: 'security',
        branchId: branch1._id.toString(),
      },
      {
        email: 'superadmin@test.com',
        password: defaultPassword,
        name: 'Super Admin',
        role: 'superadmin',
      },
    ]);
    console.log('Users seeded');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
