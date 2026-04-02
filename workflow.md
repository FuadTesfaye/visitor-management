# Visitor Management System (VMS) Workflow

This document outlines the complete operational workflow and role-based actions within the Visitor Management System.

## 👤 User Roles and Responsibilities

The system relies on five distinct actors to manage the lifecycle of a visitor's request safely and securely.

### 1. Visitor
- **Capabilities:** Can self-register and request visits digitally ahead of time.
- **Interaction:** Receives an SMS with a 6-digit access code once their visit is approved by the corresponding department.

### 2. Staff / Receptionist
- **Capabilities:** Acts as the initial point of contact for walk-in visitors or call-ins.
- **Interaction:** Enters the visitor's details (Name, Fayda ID, Phone Number) into the dashboard and generates a `walk-in` visit request directed towards the intended department.

### 3. Department Head
- **Capabilities:** Controls access to their specific department.
- **Interaction:** Views all `pending` requests targeted for their department. They can either **Approve** or **Reject** the visit. 
- **Automated Workflow:** If they approve a request, the system automatically generates an access token and fires an API request to `smsethiopia.et` to send a confirmation SMS to the visitor containing a 6-digit access code.

### 4. Security
- **Capabilities:** Controls physical entry and exit at the respective branch.
- **Interaction (Check-in):** Greets the visitor and searches for their request using the 6-digit SMS code or their Fayda Number. Only visits marked as `approved` for the *matching branch* will be valid. Completing this action logs the Check-in Time.
- **Interaction (Check-out):** When the visitor leaves, security updates the log with a Check-out Time effectively closing the lifecycle.

### 5. Super Admin
- **Capabilities:** Full system oversight.
- **Interaction:** Can view all departments, all branches, and all global visit requests without restrictions.

---

## 🔄 The Visit Lifecycle (Step-by-Step)

The end-to-end journey of a visitor coming into the building follows a strict sequential process:

### Phase 1: Initiation
There are two ways a visit can be initiated.
- **Call-in / Walk-in:** The visitor arrives or calls over the phone. The Receptionist logs into their Staff dashboard, enters the visitor's details and required department, and submits the form.
- **Digital (Future iteration):** A visitor applies for a visit beforehand using a self-serve portal.

### Phase 2: Authorization
> [!NOTE]  
> All new requests are created with a `pending` status.
- The request immediately appears on the targeted **Department Head's** dashboard.
- The Head reviews the requested time, purpose, and visitor details.
- **If Rejected:** The status updates to `rejected` and the flow terminates.
- **If Approved:** 
  1. The status updates to `approved`.
  2. The system generates a cryptographic QR token and a 6-digit random `visitCode`.
  3. The system securely calls the SMS API to send the 6-digit code to the visitor's mobile number.

### Phase 3: Physical Access
> [!IMPORTANT]  
> The Security personnel can only view requests destined for their specific building (Branch).
- The visitor arrives at the branch gates and provides the 6-digit code (or Fayda Number) to **Security**.
- Security inputs the code in their dashboard to query the MongoDB Database.
- The system validates that the visit is (a) Approved, (b) At the correct branch, and (c) Not expired.
- The Guard clicks **Check In**, updating the status to `checked-in` and writing a `VisitLog` document with a timestamp.

### Phase 4: Departure
- The visitor finishes their business and exits the facility.
- **Security** inputs their code one final time to pull up their active pass.
- The Guard clicks **Check Out**, updating the status to `checked-out` and finalizing the `VisitLog` timestamp.

---

## 🛠 Flow Architecture Summary

1. **Frontend:** Built with Next.js App Router providing individual dashboard interfaces (e.g., `/staff/dashboard`, `/head/dashboard`, `/security/dashboard`).
2. **Backend Services:** Standardized Route Handlers (`src/app/api/...`) enforce strict role-based access control checking JWT tokens stored in HTTP-only cookies.
3. **Database:** Operations read and write to **MongoDB Atlas**, structured using Mongoose schemas.
4. **Third-party Gateways:** SMS delivery is processed via external API calls (`axios` to `smsethiopia.et`).
