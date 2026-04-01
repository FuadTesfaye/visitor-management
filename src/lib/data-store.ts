import { User, Branch, Department, VisitRequest, VisitLog } from '@/types';

// In-memory data stores with singleton pattern for HMR persistence
declare global {
  var __vms_users: User[] | undefined;
  var __vms_branches: Branch[] | undefined;
  var __vms_departments: Department[] | undefined;
  var __vms_visitRequests: VisitRequest[] | undefined;
  var __vms_visitLogs: VisitLog[] | undefined;
}

export let branches: Branch[] = globalThis.__vms_branches || [
  { id: '1', name: 'Head Office (Jemo)' },
  { id: '2', name: 'Sales Office (Tikur Anbessa)' },
  { id: '3', name: 'FMCG Shop (Merkato)' },
  { id: '4', name: 'Factory (Dukem)' },
];

export let departments: Department[] = globalThis.__vms_departments || [
  { id: '1', name: 'Coffee Export', branchId: '1' },
  { id: '2', name: 'Pharmaceutical', branchId: '1' },
  { id: '3', name: 'HR', branchId: '1' },
  { id: '4', name: 'Finance', branchId: '1' },
  { id: '5', name: 'Real Estate', branchId: '2' },
  { id: '6', name: 'FMCG', branchId: '3' },
  { id: '7', name: 'Aluminum', branchId: '4' },
];

export let users: User[] = globalThis.__vms_users || [
  {
    id: '1',
    email: 'visitor@test.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Test Visitor',
    role: 'visitor',
  },
  {
    id: '2',
    email: 'staff@test.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Test Staff',
    role: 'staff',
    branchId: '1',
    departmentId: '1',
  },
  {
    id: '3',
    email: 'head@test.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Test Head',
    role: 'head',
    branchId: '1',
    departmentId: '1',
  },
  {
    id: '4',
    email: 'security@test.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Test Security',
    role: 'security',
    branchId: '1',
  },
  {
    id: '5',
    email: 'superadmin@test.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Super Admin',
    role: 'superadmin',
  },
];

export let visitRequests: VisitRequest[] = globalThis.__vms_visitRequests || [];

export let visitLogs: VisitLog[] = globalThis.__vms_visitLogs || [];

if (process.env.NODE_ENV !== 'production') {
  globalThis.__vms_users = users;
  globalThis.__vms_branches = branches;
  globalThis.__vms_departments = departments;
  globalThis.__vms_visitRequests = visitRequests;
  globalThis.__vms_visitLogs = visitLogs;
}

// Helper functions
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const findDepartmentById = (id: string): Department | undefined => {
  return departments.find(dept => dept.id === id);
};

export const findBranchById = (id: string): Branch | undefined => {
  return branches.find(branch => branch.id === id);
};

export const findVisitRequestById = (id: string): VisitRequest | undefined => {
  return visitRequests.find(request => request.id === id);
};

export const findVisitRequestsByDepartmentId = (departmentId: string): VisitRequest[] => {
  return visitRequests.filter(request => request.departmentId === departmentId);
};

export const findVisitRequestByToken = (token: string): VisitRequest | undefined => {
  return visitRequests.find(request => request.qrToken === token);
};

export const findVisitRequestByCode = (code: string): VisitRequest | undefined => {
  return visitRequests.find(request => request.visitCode === code);
};

export const findVisitRequestByFayda = (fayda: string): VisitRequest | undefined => {
  // Return the most recent active/pending one first
  return visitRequests
    .filter(request => request.faydaNumber === fayda)
    .sort((a, b) => b.requestedDateTime.getTime() - a.requestedDateTime.getTime())[0];
};

export const searchActiveVisitsByName = (name: string): VisitRequest[] => {
  let searchName = name.toLowerCase();
  return visitRequests.filter(request => 
    request.visitorName.toLowerCase().includes(searchName) && 
    request.status === 'approved'
  );
};

export const getActiveVisitors = (): VisitRequest[] => {
  return visitRequests.filter(request => 
    request.status === 'approved' && 
    request.qrExpiration && 
    request.qrExpiration > new Date()
  );
};

export const getCheckedInVisitors = (): (VisitRequest & { log?: VisitLog })[] => {
  return visitRequests
    .filter(request => {
      const log = visitLogs.find(log => log.visitRequestId === request.id);
      return request.status === 'approved' && log && !log.checkOutTime;
    })
    .map(request => ({
      ...request,
      log: visitLogs.find(log => log.visitRequestId === request.id),
    }));
};
