# Tracon Visitor Management System

A full-stack, Enterprise-grade Visitor Management System built with Next.js (App Router), Prisma, and Supabase (PostgreSQL) for persistent data storage. Tailored specifically for **Tracon Trading PLC**, featuring a fully responsive Mobile-First Progressive Web App (PWA) experience.

## Features

- **Role-based Authentication**: Comprehensive control with 6 distinct roles: Visitor, Staff, Head (Department Approver), Reception, Security, and Superadmin.
- **Progressive Web App (PWA)**: Installable as a native-like mobile app with a seamless bottom navigation bar and offline caching.
- **Enterprise Design System**: Tracon-branded styling featuring Deep Navy (`#1c3745`) and Cyan (`#68A4C4`) gradients, backdrop blurs, and glassmorphism.
- **Visit Request Management**: Visitors can submit visit requests with strict 14-digit Fayda number validation and SMS OTP.
- **Approval Workflow**: Department Heads can approve/reject requests.
- **QR Code System**: Generate secure QR passes for approved visitors (embedded with the Tracon logo).
- **Gate Management & Check-in/Check-out**: Security personnel can scan QR codes or manually verify tokens via a mock camera interface.
- **Real-time Dashboards**: Role-specific, deeply branded dashboards featuring relevant statistics, charts, and activity logs.
- **Audit Logs & Monitoring**: Superadmins have full visibility into system usage, incident reporting, and security logs.

## Tech Stack

- **Frontend**: Next.js 16.2.1 (App Router), TypeScript, Tailwind CSS, shadcn/ui, next-pwa
- **Backend**: Next.js API Routes, Server Actions, Edge Middleware
- **Authentication**: JWT tokens with HTTP-only cookies
- **Storage**: Supabase PostgreSQL with Prisma ORM
- **QR Generation**: qrcode.react
- **Password Hashing**: bcryptjs

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the database seed (requires `.env` with Supabase connection string):
```bash
npm run seed
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production (Generates PWA Service Worker):
```bash
npm run build
npm run start
```

## Role Test Accounts

The system seeds with several test accounts (Default password for all seeded accounts: `password`):

- **Visitor**: visitor@test.com
- **Staff**: staff@test.com
- **Head (Approver)**: head@test.com 
- **Reception**: reception@test.com
- **Security**: security@test.com
- **Superadmin**: admin@test.com

## Workflow Demo

1. **Visitor** (`visitor@test.com`): Submits a visit request with Fayda number and targets a specific department.
2. **Head / Approver** (`head@test.com`): Views the pending requests, reviews details, and approves. A QR code pass is generated and sent to the visitor.
3. **Visitor**: Can view their active passes in their portal (`/visitor/passes`).
4. **Security** (`security@test.com`): Scans the QR code (or enters manually) at the gate to Check-in and Check-out the visitor.
5. **Superadmin** (`admin@test.com`): Monitors the whole lifecycle in the analytics dashboard.

## Database Schema (Prisma)

- **User**: Core authentication, role mapping, and branch/department relations.
- **Branch**: Geographic or logical division.
- **Department**: Organizational units under a branch.
- **VisitRequest**: Core entity tracking the entire lifecycle of a visit (pending -> approved -> checked-in -> checked-out).
- **VisitLog**: Audit trail for check-in/out timestamps and processor information.
- **Incident**: Security logging for unauthorized access attempts or rule violations.

## Security Notes

- Passwords are unconditionally hashed via `bcryptjs`.
- JWT tokens are locked in HTTP-only, secure cookies.
- Edge Middleware proxy dynamically enforces Role-Based Access Control (RBAC) to ensure unprivileged users cannot access administrative dashboards.
- QR tokens are securely verified against the database state in real-time.
