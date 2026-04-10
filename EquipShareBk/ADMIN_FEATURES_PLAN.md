# Admin Features Implementation Plan

## FR-A3: Dispute Mediation · FR-A4: Content Moderation

---

## Overview

Both features follow the same architectural pattern already established in the codebase:
`schema → repository → service → validation → controller → routes → openapi docs`

They share a common concept: a **ticket** filed by a user, reviewed by Admin, resolved with an action that triggers email notifications.

---

## 1. FR-A3 — Dispute Mediation

### 1.1 Flow

```
User (Renter or Lender)
  │
  ├─► POST /api/disputes        (file dispute on a booking)
  │       │
  │       └─► Email both parties: "Dispute Filed — ticket #{id} is Open"
  │
Admin
  ├─► GET /api/disputes          (view all disputes, filterable by status)
  ├─► GET /api/disputes/:id      (full detail: booking, handover photos, parties)
  └─► PUT /api/disputes/:id/resolve
          │  body: { ruling, rulingNote, refundAmount? }
          │
          ├─ ruling = "RenterResponsible"
          │     └─► Stripe: no refund. Email renter (liable) + lender (outcome).
          │
          ├─ ruling = "LenderResponsible"
          │     └─► Stripe: issue full/partial refund to renter. Email both parties.
          │
          └─ ruling = "NoFaultFound"
                └─► No Stripe action. Email both parties (no liability).
```

### 1.2 Mongoose Schema — `dispute.schema.ts`

```typescript
// src/modules/dispute/dispute.schema.ts

export const DISPUTE_STATUSES = ["Open", "UnderReview", "Resolved"] as const;
export const DISPUTE_RULINGS = [
  "RenterResponsible",
  "LenderResponsible",
  "NoFaultFound",
] as const;

interface IDispute extends Document {
  bookingId: Types.ObjectId; // ref: Booking
  filedById: Types.ObjectId; // ref: User (renter or lender who filed)
  filedByRole: "Renter" | "Lender";
  description: string; // user's written description
  evidenceUrls: string[]; // optional photo URLs (Azure Blob, same upload flow)
  status: "Open" | "UnderReview" | "Resolved";
  ruling?: "RenterResponsible" | "LenderResponsible" | "NoFaultFound";
  rulingNote?: string; // admin's internal note shown to both parties
  refundAmount?: number; // SAR, only set when LenderResponsible
  resolvedById?: Types.ObjectId; // ref: User (admin)
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**

- `bookingId` — for quick lookup per booking
- `status` — for admin dashboard filter

### 1.3 Repository — `dispute.repository.ts`

```typescript
createDispute(data)              // insert
findById(id)                     // populate booking + parties
findAll(filter: { status? })     // admin list
updateDispute(id, data)          // general update
```

### 1.4 Service Logic — `dispute.service.ts`

#### `fileDispute(userId, dto)`

1. Load the booking — must exist and `status` must be `"Active" | "Completed"`.
2. Caller must be the `renterId` or `ownerId` of that booking.
3. Only one open/under-review dispute per booking allowed (check before creating).
4. Create dispute with `status: "Open"`.
5. Email **both** renter and lender: `sendDisputeFiledEmail(...)`.

#### `resolveDispute(adminId, disputeId, dto)`

1. Load dispute — must be `"Open"` or `"UnderReview"`.
2. Load booking (with `clientSecret` to get `paymentIntentId`).
3. Execute ruling:
   - **`LenderResponsible`**: call `stripe.refunds.create({ payment_intent, amount })`.
     - `refundAmount` is required in body (admin decides partial/full).
   - **`RenterResponsible`** / **`NoFaultFound`**: no Stripe call.
4. Update dispute: `status → "Resolved"`, store `ruling`, `rulingNote`, `refundAmount`, `resolvedById`, `resolvedAt`.
5. Email **both** renter and lender: `sendDisputeResolvedEmail(...)`.

### 1.5 API Endpoints

| Method | Path                        | Auth                    | Description                                   |
| ------ | --------------------------- | ----------------------- | --------------------------------------------- |
| `POST` | `/api/disputes`             | Any auth user           | File a dispute                                |
| `GET`  | `/api/disputes/my`          | Any auth user           | My disputes (filed by me or about my booking) |
| `GET`  | `/api/disputes`             | Admin only              | All disputes (filter: `?status=Open`)         |
| `GET`  | `/api/disputes/:id`         | Admin or involved party | Full dispute detail                           |
| `PUT`  | `/api/disputes/:id/status`  | Admin only              | Change to `UnderReview`                       |
| `PUT`  | `/api/disputes/:id/resolve` | Admin only              | Make ruling + execute                         |

### 1.6 Validation (`dispute.validation.ts`)

```typescript
fileDisputeSchema = z.object({
  bookingId: z.string().min(1),
  description: z.string().min(20).max(2000),
  evidenceUrls: z.array(z.string().url()).max(10).optional(),
});

resolveDisputeSchema = z
  .object({
    ruling: z.enum(["RenterResponsible", "LenderResponsible", "NoFaultFound"]),
    rulingNote: z.string().min(10).max(1000),
    refundAmount: z.number().positive().optional(), // required when LenderResponsible
  })
  .refine(
    (d) => d.ruling !== "LenderResponsible" || d.refundAmount !== undefined,
    { message: "refundAmount required when ruling is LenderResponsible" },
  );
```

### 1.7 Email Notifications

**New payloads to add to `IEmailService`:**

```typescript
// Sent to both parties when dispute is filed
interface DisputeFiledEmailPayload {
  to: string;
  recipientName: string;
  disputeId: string;
  listingTitle: string;
  filedByName: string;
  description: string; // first 200 chars
}

// Sent to both parties when resolved
interface DisputeResolvedEmailPayload {
  to: string;
  recipientName: string;
  disputeId: string;
  listingTitle: string;
  ruling: "RenterResponsible" | "LenderResponsible" | "NoFaultFound";
  rulingNote: string;
  refundAmount?: number; // shown if applicable
}
```

**New methods on `IEmailService`:**

- `sendDisputeFiledEmail(payload: DisputeFiledEmailPayload): Promise<void>`
- `sendDisputeResolvedEmail(payload: DisputeResolvedEmailPayload): Promise<void>`

---

## 2. FR-A4 — Content Moderation

### 2.1 Flow

```
Any authenticated user
  │
  ├─► POST /api/reports          (report a listing)
  │       │
  │       └─► Email reporter: "Report Received — we'll review #{listingTitle}"
  │
Admin
  ├─► GET /api/reports           (all reports, filter by status/action)
  ├─► GET /api/reports/:id       (full detail: listing + reporter + description)
  └─► PUT /api/reports/:id/resolve
          │  body: { action, note? }
          │
          ├─ action = "Dismiss"
          │     └─► status → Dismissed. No email to lender. Optional email to reporter.
          │
          ├─ action = "WarnLender"
          │     └─► Email lender: "Warning — your listing violates platform policy."
          │         Append to auditLog. status → ActionTaken.
          │
          └─ action = "RemoveListing"
                └─► Set listing.status = "Deleted" immediately.
                    Email lender: "Listing removed — policy violation."
                    Append to auditLog. status → ActionTaken.
```

### 2.2 Mongoose Schema — `report.schema.ts`

```typescript
// src/modules/report/report.schema.ts

export const REPORT_REASONS = [
  "Scam",
  "FakePhotos",
  "InappropriateContent",
  "Overpriced",
  "MisleadingDescription",
  "Other",
] as const;

export const MODERATION_ACTIONS = [
  "Dismiss",
  "WarnLender",
  "RemoveListing",
] as const;

interface IAuditEntry {
  action: string;
  performedBy: Types.ObjectId; // admin user id
  note?: string;
  timestamp: Date;
}

interface IReport extends Document {
  listingId: Types.ObjectId; // ref: Listing
  reportedById: Types.ObjectId; // ref: User
  reason: (typeof REPORT_REASONS)[number];
  description: string;
  status: "Open" | "UnderReview" | "Resolved";
  adminAction?: (typeof MODERATION_ACTIONS)[number];
  adminNote?: string;
  resolvedById?: Types.ObjectId;
  resolvedAt?: Date;
  auditLog: IAuditEntry[]; // full history of admin actions on this report
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**

- `listingId` — quick lookup per listing
- `status` — admin dashboard filter
- `reportedById` — user's own reports

### 2.3 Repository — `report.repository.ts`

```typescript
createReport(data)
findById(id)               // populate listing + reporter
findAll(filter: { status?, listingId? })
updateReport(id, data)
pushAuditEntry(id, entry)  // $push to auditLog array
```

### 2.4 Service Logic — `report.service.ts`

#### `fileReport(userId, dto)`

1. Listing must exist and not already be `"Deleted"`.
2. User cannot report their own listing.
3. Prevent duplicate: user has no existing `Open`/`UnderReview` report on same listing.
4. Create report with `status: "Open"`.
5. Email reporter confirmation: `sendReportReceivedEmail(...)`.

#### `resolveReport(adminId, reportId, dto)`

1. Report must exist and not already be `"Resolved"`.
2. Load listing and lender user.
3. Execute action:
   - **`Dismiss`**: update report `status → "Resolved"`, `adminAction → "Dismiss"`.
   - **`WarnLender`**: email lender `sendListingWarningEmail(...)`. Update report.
   - **`RemoveListing`**: set `listing.status = "Deleted"` via `ListingModel.findByIdAndUpdate`. Email lender `sendListingRemovedEmail(...)`. Update report.
4. Push audit entry: `{ action, performedBy: adminId, note, timestamp: now }`.
5. Set `resolvedById`, `resolvedAt`.

### 2.5 API Endpoints

| Method | Path                       | Auth          | Description                                |
| ------ | -------------------------- | ------------- | ------------------------------------------ |
| `POST` | `/api/reports`             | Any auth user | File a report on a listing                 |
| `GET`  | `/api/reports/my`          | Any auth user | My submitted reports                       |
| `GET`  | `/api/reports`             | Admin only    | All reports (`?status=Open&listingId=...`) |
| `GET`  | `/api/reports/:id`         | Admin only    | Full report detail with audit log          |
| `PUT`  | `/api/reports/:id/status`  | Admin only    | Change to `UnderReview`                    |
| `PUT`  | `/api/reports/:id/resolve` | Admin only    | Take action (Dismiss / Warn / Remove)      |

### 2.6 Validation (`report.validation.ts`)

```typescript
fileReportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(REPORT_REASONS),
  description: z.string().min(20).max(1000),
});

resolveReportSchema = z.object({
  action: z.enum(["Dismiss", "WarnLender", "RemoveListing"]),
  note: z.string().max(500).optional(),
});
```

### 2.7 Email Notifications

**New payloads:**

```typescript
// Confirmation sent to the user who submitted the report
interface ReportReceivedEmailPayload {
  to: string;
  reporterName: string;
  listingTitle: string;
  reportId: string;
}

// Warning sent to lender (WarnLender action)
interface ListingWarningEmailPayload {
  to: string;
  lenderName: string;
  listingTitle: string;
  reason: string; // admin note
}

// Removal notice sent to lender (RemoveListing action)
interface ListingRemovedEmailPayload {
  to: string;
  lenderName: string;
  listingTitle: string;
  reason: string;
}
```

**New methods on `IEmailService`:**

- `sendReportReceivedEmail(payload): Promise<void>`
- `sendListingWarningEmail(payload): Promise<void>`
- `sendListingRemovedEmail(payload): Promise<void>`

---

## 3. IPaymentService Extension (for Dispute refunds)

Add one method to `IPaymentService` and `StripePaymentService`:

```typescript
// IPaymentService.ts
issueRefund(paymentIntentId: string, amountInHalalas: number): Promise<void>;

// StripePaymentService.ts
async issueRefund(paymentIntentId: string, amountInHalalas: number) {
  await this.stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountInHalalas,
  });
}
```

---

## 4. File Structure

```
src/
  modules/
    dispute/
      dispute.schema.ts
      dispute.repository.ts
      dispute.service.ts
      dispute.validation.ts
      dispute.controller.ts
      dispute.routes.ts
    report/
      report.schema.ts
      report.repository.ts
      report.service.ts
      report.validation.ts
      report.controller.ts
      report.routes.ts
  shared/
    services/
      email/
        IEmailService.ts          ← +5 new payloads & methods
        SmtpEmailService.ts       ← +5 new HTML email implementations
      payment/
        IPaymentService.ts        ← +issueRefund
        StripePaymentService.ts   ← +issueRefund impl
  config/
    openapi.ts                    ← +Disputes tag, +Reports tag
  modules/
    index.ts                      ← register dispute + report routers
```

---

## 5. Implementation Phases

### Phase 1 — Shared infrastructure

- [ ] Add `issueRefund` to `IPaymentService` + `StripePaymentService`
- [ ] Add 5 new email payloads to `IEmailService`
- [ ] Implement 5 new email methods in `SmtpEmailService`

### Phase 2 — Dispute module

- [ ] `dispute.schema.ts`
- [ ] `dispute.repository.ts`
- [ ] `dispute.service.ts` (`fileDispute`, `resolveDispute`, `getDispute`, `listDisputes`)
- [ ] `dispute.validation.ts`
- [ ] `dispute.controller.ts`
- [ ] `dispute.routes.ts`
- [ ] Register in `modules/index.ts`

### Phase 3 — Report module

- [ ] `report.schema.ts`
- [ ] `report.repository.ts`
- [ ] `report.service.ts` (`fileReport`, `resolveReport`, `getReport`, `listReports`)
- [ ] `report.validation.ts`
- [ ] `report.controller.ts`
- [ ] `report.routes.ts`
- [ ] Register in `modules/index.ts`

### Phase 4 — API Docs + Validation

- [ ] Add Disputes + Reports tags + all endpoints to `openapi.ts`
- [ ] Add new enums/statuses to Constants section
- [ ] `npx tsc --noEmit`

### Phase 5 — Commit & push

---

## 6. Key Design Decisions

| Decision                                                  | Rationale                                                                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Audit log embedded in report**                          | Simple; reports are never high-volume. No need for a separate AuditLog collection.                            |
| **Dispute can only be filed on Active/Completed booking** | Pending/Rejected bookings have no real equipment exchange, so no dispute scenario.                            |
| **One open dispute per booking**                          | Prevents spam. Admin must resolve before a new one can be filed.                                              |
| **One open report per (user, listing) pair**              | Same anti-spam logic.                                                                                         |
| **Admin uses `authorize` middleware with role "Admin"**   | Already implemented in `shared/middleware/authorize.ts`.                                                      |
| **Refund amount set by admin**                            | Admin sees all evidence and decides partial vs full — system does not auto-calculate.                         |
| **Listing is soft-deleted on RemoveListing**              | Consistent with existing listing delete behavior (`status = "Deleted"`). All existing bookings remain intact. |

---

## 7. New Constants for OpenAPI Docs

```
DISPUTE_STATUSES:   Open | UnderReview | Resolved
DISPUTE_RULINGS:    RenterResponsible | LenderResponsible | NoFaultFound
REPORT_REASONS:     Scam | FakePhotos | InappropriateContent | Overpriced | MisleadingDescription | Other
MODERATION_ACTIONS: Dismiss | WarnLender | RemoveListing
```
