export type UserRole = 'staff' | 'head' | 'security' | 'superadmin' | 'receptionist';

export interface Location {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  headId: string;
  locationId: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  position?: string;
  locationId?: string;
  departmentId?: string;
  createdAt?: Date;
}

export interface VisitRequest {
  id: string;
  visitorId: string;
  visitorName: string;
  faydaNumber: string;
  phone: string;
  locationId: string;
  locationName: string;
  departmentId: string;
  departmentName: string;
  hostEmployeeId?: string;
  hostEmployeeName?: string;
  purpose: string;
  requestedDateTime: Date;
  status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
  visitType: 'digital' | 'walk-in';
  walkIn?: boolean;
  visitCode?: string;
  smsOtp?: string;
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
  position?: string;
  locationId?: string;
  departmentId?: string;
}
