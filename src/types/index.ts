export type UserRole = 'visitor' | 'staff' | 'head' | 'security' | 'superadmin';

export interface Branch {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  branchId: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  branchId?: string;
  departmentId?: string;
  createdAt?: Date;
}

export interface VisitRequest {
  id: string;
  visitorId: string;
  visitorName: string;
  faydaNumber: string;
  phone: string;
  branchId: string;
  branchName: string;
  departmentId: string;
  departmentName: string;
  personToMeet?: string;
  purpose: string;
  requestedDateTime: Date;
  status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
  visitType: 'digital' | 'walk-in';
  walkIn?: boolean;
  visitCode?: string;
  submittedBy?: string;
  qrToken?: string;
  qrExpiration?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  checkedInAt?: Date;
  checkedInBy?: string;
  checkedOutAt?: Date;
  checkedOutBy?: string;
  createdAt?: Date;
}

export interface VisitLog {
  id: string;
  visitRequestId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  processedBy: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
  departmentId?: string;
}
