# Visitor Management System

A full-stack Visitor Management System built with Next.js (App Router) using in-memory data storage for MVP purposes.

## Features

- **Role-based Authentication**: Visitor, Department Approver, and System Admin roles
- **Visit Request Management**: Visitors can submit visit requests with Fayda number validation
- **Approval Workflow**: Department approvers can approve/reject requests with QR code generation
- **QR Code System**: Generate QR tokens for approved visitors with expiration
- **Check-in/Check-out**: Admin can scan QR codes or manually enter tokens for visitor management
- **Real-time Dashboard**: Role-specific dashboards with relevant information

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Authentication**: JWT tokens with HTTP-only cookies
- **Storage**: In-memory JavaScript objects/arrays (MVP)
- **QR Generation**: qrcode library
- **Password Hashing**: bcryptjs

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts

The system comes with pre-configured test accounts (password: `password` for all):

- **Visitor**: visitor@test.com
- **Approver**: approver@test.com (HR Department)
- **Admin**: admin@test.com

## Workflow Demo

1. **Login as Visitor** (`visitor@test.com`):
   - Submit a visit request with 14-digit Fayda number
   - Select department and purpose
   - Choose visit date/time

2. **Login as Approver** (`approver@test.com`):
   - View pending requests for your department
   - Approve or reject requests
   - QR code is generated upon approval

3. **Login as Admin** (`admin@test.com`):
   - Use QR Scanner page to check in visitors
   - For demo: copy QR token from approval response and use manual token entry
   - View active visitors and check them out

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── visits/         # Visit management
│   │   ├── scan/           # QR scanning
│   │   └── departments/    # Department data
│   ├── visitor/            # Visitor pages
│   ├── approver/           # Approver pages
│   ├── admin/              # Admin pages
│   └── login/              # Login page
├── lib/
│   ├── auth.ts             # Authentication utilities
│   ├── data-store.ts       # In-memory data storage
│   └── qr.ts               # QR code generation
└── types/
    └── index.ts            # TypeScript type definitions
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Visit Management
- `POST /api/visits/create` - Create visit request
- `GET /api/visits/list` - List visit requests (role-filtered)
- `POST /api/visits/approve` - Approve visit request
- `POST /api/visits/reject` - Reject visit request

### QR Scanning
- `POST /api/scan/checkin` - Check in visitor with QR token
- `POST /api/scan/checkout` - Check out visitor

### Utilities
- `GET /api/departments` - Get departments list
- `GET /api/visitors/active` - Get active visitors (admin only)

## Data Model

The system uses in-memory storage with the following entities:

- **Users**: id, email, password, name, role, departmentId
- **Departments**: id, name
- **VisitRequests**: id, visitorId, visitorName, faydaNumber, departmentId, purpose, requestedDateTime, status, qrToken, qrExpiration
- **VisitLogs**: id, visitRequestId, checkInTime, checkOutTime, processedBy

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens stored in HTTP-only cookies
- Role-based access control via middleware
- Input validation for Fayda numbers (14 digits)
- QR tokens expire after 24 hours

## Limitations (MVP)

- Data resets on server restart (in-memory storage)
- No persistent database
- Basic QR scanning (manual token entry for demo)
- Simple authentication (no password reset, etc.)
- No email notifications

## Future Enhancements

- Add persistent database (PostgreSQL/MongoDB)
- Implement real QR code scanning with camera
- Add email notifications for approvals
- Implement visitor pre-registration
- Add reporting and analytics
- Multi-tenant support
- Advanced security features
