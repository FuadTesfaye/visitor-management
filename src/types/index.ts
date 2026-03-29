export type UserRole = 'visitor' | 'approver' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  departmentId?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface VisitRequest {
  id: string;
  visitorId: string;
  visitorName: string;
  faydaNumber: string;
  departmentId: string;
  departmentName: string;
  purpose: string;
  requestedDateTime: Date;
  status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
  qrToken?: string;
  qrExpiration?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
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
  departmentId?: string;
}
