import { User, Department, VisitRequest, VisitLog } from '@/types';

// In-memory data stores
export let users: User[] = [
  {
    id: '1',
    email: 'visitor@test.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    name: 'Test Visitor',
    role: 'visitor',
  },
  {
    id: '2',
    email: 'approver@test.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    name: 'Test Approver',
    role: 'approver',
    departmentId: '1',
  },
  {
    id: '3',
    email: 'admin@test.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    name: 'Test Admin',
    role: 'admin',
  },
];

export let departments: Department[] = [
  { id: '1', name: 'Human Resources' },
  { id: '2', name: 'Finance' },
  { id: '3', name: 'IT Department' },
  { id: '4', name: 'Operations' },
];

export let visitRequests: VisitRequest[] = [];

export let visitLogs: VisitLog[] = [];

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

export const findVisitRequestById = (id: string): VisitRequest | undefined => {
  return visitRequests.find(request => request.id === id);
};

export const findVisitRequestByToken = (token: string): VisitRequest | undefined => {
  return visitRequests.find(request => request.qrToken === token);
};

export const getActiveVisitors = (): VisitRequest[] => {
  return visitRequests.filter(request => 
    request.status === 'approved' && 
    request.qrToken && 
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
