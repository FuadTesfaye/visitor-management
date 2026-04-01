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
}

export interface VisitRequest {
  id: string;
  visitorId: string; // The user ID if registered, or generated for walk-in
  visitorName: string;
  faydaNumber: string;
  phone: string;
  branchId: string;
  departmentId: string;
  departmentName: string;
  purpose: string;
  requestedDateTime: Date;
  status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
  visitType: 'digital' | 'walk-in';
  visitCode?: string; // Short code for access
  submittedBy?: string; // staff user ID if created on behalf
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
  branchId?: string;
  departmentId?: string;
}
