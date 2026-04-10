# Implementation Plan — FR-L4, FR-R2, FR-A2

> **Date:** 2026-04-10  
> **Branch:** `back-end`  
> **Status:** Pre-implementation (planning only)

---

## Overview

Three new features to implement:

| ID    | Title                       | Actor           | Complexity |
| ----- | --------------------------- | --------------- | ---------- |
| FR-L4 | Earnings Dashboard          | Lender          | Medium     |
| FR-R2 | Advanced Search & Discovery | Renter / Public | Low–Medium |
| FR-A2 | Trusted Circle Management   | Admin / User    | High       |

---

## FR-L4 — Earnings Dashboard

### What the system must do

1. Display total earnings to date (captured bookings where `ownerId = me`)
2. Display pending payouts (approved/active bookings not yet paid out)
3. Display per-transaction history (one row per completed booking), filterable by **date range** and **listing**
4. Display monthly summary (aggregated earnings grouped by calendar month)
5. Lender clicks "Request Payout" → system validates balance ≥ minimum threshold, records a payout request, returns confirmation

### Data model

**New collection: `payouts`**

```
IPayoutRequest
  _id
  lenderId          ObjectId → User
  amount            Number           (SAR — total of included transactions)
  status            "Pending" | "Processing" | "Paid" | "Failed"
  requestedAt       Date
  processedAt?      Date
  note?             String
```

No new fields needed on `Booking` — earnings are derived from captured bookings (`stripe.chargeStatus = "captured"` + `status ∈ {Approved, Active, Completed}`).

### Business rules

- Minimum payout threshold: **50 SAR** (constant `MIN_PAYOUT_SAR`)
- A lender may not submit a new payout request while one is already `Pending` or `Processing`
- Payout amount = sum of `totalAmount` of all **Completed** bookings owned by the lender that have **not** been included in a prior `Paid` payout

### API endpoints

| Method | Path                         | Auth   | Description                                                                                 |
| ------ | ---------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `GET`  | `/api/earnings/summary`      | Lender | Total earnings, pending payout balance, monthly breakdown                                   |
| `GET`  | `/api/earnings/transactions` | Lender | Paginated transaction history — query: `startDate`, `endDate`, `listingId`, `page`, `limit` |
| `POST` | `/api/earnings/payout`       | Lender | Request a payout — validates threshold                                                      |
| `GET`  | `/api/earnings/payouts`      | Lender | List own payout requests                                                                    |

### New files

```
src/modules/earnings/
  earnings.schema.ts       IPayoutRequest model
  earnings.repository.ts   Mongoose queries
  earnings.service.ts      Business logic
  earnings.validation.ts   Zod schemas (none needed for GET; payout body is empty)
  earnings.controller.ts   Req/res wiring
  earnings.routes.ts       Router
src/config/openapi/earnings.docs.ts
```

### Service function signatures

```typescript
getSummary(lenderId: string): Promise<{
  totalEarnings: number;
  pendingPayoutBalance: number;
  monthlyBreakdown: { month: string; amount: number }[];
}>

getTransactions(lenderId: string, filters: {
  startDate?: Date;
  endDate?: Date;
  listingId?: string;
  page: number;
  limit: number;
}): Promise<{ transactions: TransactionRow[]; meta: PaginationMeta }>

requestPayout(lenderId: string): Promise<IPayoutRequest>

getPayoutHistory(lenderId: string): Promise<IPayoutRequest[]>
```

### Email

- Add `PayoutRequestedEmailPayload` + `sendPayoutRequestedEmail()` to `IEmailService` / `SmtpEmailService`
- Send confirmation email to lender on successful payout request

---

## FR-R2 — Advanced Search & Discovery

### What the system must do

1. Accept keyword (`search`), `category`, price range (`minPrice`, `maxPrice`), availability date range (`availableFrom`, `availableTo`), `condition`, `trustedCircleOnly` toggle
2. Return paginated active listings with thumbnail, `dailyPrice`, `rating`, distance (no geolocation in DB — distance field omitted for now, or returned as `null`)
3. Show "No items found" message (handled by empty `listings: []` array in response)

### Scope

This is a **query enhancement** to the existing `GET /api/listings` endpoint. No new collection. No new route. Just extend the existing listing query logic.

### Current state of `GET /api/listings`

- Supports: `category`, `condition`, `minPrice`, `maxPrice`, `search`, `page`, `limit`
- Missing: `availableFrom` / `availableTo` (date availability filter), `trustedCircleOnly`

### Changes required

**`listing.repository.ts`** — `findListings()`:

- Add `availableFrom` / `availableTo`: exclude listings whose `blockedDates` array overlaps the requested range
- Add `trustedCircleOnly`: when `true`, filter to listings whose `ownerId` is in the requesting user's `trustedCircle` array (requires `userId` to be passed in)

**`listing.service.ts`** — `getListings()`:

- Accept `availableFrom`, `availableTo`, `trustedCircleOnly`, `userId` (optional — passed from auth context when present)

**`listing.controller.ts`** — parse new query params, pass `userId` from `req.user?.id`

**`listing.routes.ts`** — make `authenticate` middleware optional (already public route; pass user if present using a soft-auth middleware)

**`listing.validation.ts`** — extend `GetListingsQuery` schema with new fields

### New shared middleware

```
src/shared/middleware/optionalAuthenticate.ts
```

Sets `req.user` if a valid Bearer token is present, but does **not** throw if absent.  
Used on the public marketplace route so that `trustedCircleOnly` can reference the caller's circle.

### No new files except:

- `src/shared/middleware/optionalAuthenticate.ts`
- Updated OpenAPI docs in `src/config/openapi/listing.docs.ts`

### API change (same endpoint, extended)

```
GET /api/listings
  + availableFrom   ISO date string (optional)
  + availableTo     ISO date string (optional)
  + trustedCircleOnly  "true" | "false" (optional, ignored unless token present)
```

---

## FR-A2 — Trusted Circle Management

### What the system must do

1. Admin creates a Circle (name, description, eligibility criteria — stored as a plain text field, e.g. email domain rule)
2. System saves circle; eligible users can join from their profile page
3. Admin can view member list of any circle, remove a member, or deactivate the circle
4. Users joining a circle get its ID added to their `trustedCircle: string[]` field on `IUser`

### Data model

**New collection: `circles`**

```
ICircle
  _id
  name              String (unique, required)
  description       String
  eligibilityCriteria  String   (plain text — e.g. "Must have @kfupm.edu.sa email")
  emailDomainRule   String?     (optional — if set, enforced on join: user email must end with this)
  isActive          Boolean (default true)
  memberCount       Number (denormalised, incremented on join/remove)
  createdById       ObjectId → User (Admin)
  createdAt         Date
  updatedAt         Date
```

**`IUser.trustedCircle`** already exists as `string[]` (stores circle IDs as strings).

### Business rules

- Only `Admin` can create, deactivate, or remove members
- Any authenticated user can **join** a circle if:
  - Circle `isActive = true`
  - User is not already a member
  - If `emailDomainRule` is set, user's `email` must end with that domain
- Any authenticated user can **leave** a circle they belong to
- Deactivating a circle does **not** remove existing members (it hides it from joinable list)

### API endpoints

| Method   | Path                               | Auth          | Description              |
| -------- | ---------------------------------- | ------------- | ------------------------ |
| `POST`   | `/api/circles`                     | Admin         | Create a circle          |
| `GET`    | `/api/circles`                     | Public        | List all active circles  |
| `GET`    | `/api/circles/:id`                 | Public        | Get circle detail        |
| `GET`    | `/api/circles/:id/members`         | Admin         | List members of a circle |
| `POST`   | `/api/circles/:id/join`            | Authenticated | Join a circle            |
| `POST`   | `/api/circles/:id/leave`           | Authenticated | Leave a circle           |
| `DELETE` | `/api/circles/:id/members/:userId` | Admin         | Remove a member          |
| `PATCH`  | `/api/circles/:id/deactivate`      | Admin         | Deactivate circle        |

### New files

```
src/modules/circle/
  circle.schema.ts         ICircle model
  circle.repository.ts     CRUD + member queries
  circle.service.ts        Business logic (join/leave/remove/deactivate)
  circle.validation.ts     Zod schemas
  circle.controller.ts     Req/res wiring
  circle.routes.ts         Router
src/config/openapi/circle.docs.ts
```

### Service function signatures

```typescript
createCircle(adminId: string, dto: CreateCircleDto): Promise<ICircle>

listCircles(): Promise<ICircle[]>

getCircle(circleId: string): Promise<ICircle>

getMembers(circleId: string): Promise<IUser[]>

joinCircle(userId: string, circleId: string): Promise<void>

leaveCircle(userId: string, circleId: string): Promise<void>

removeMember(circleId: string, targetUserId: string): Promise<void>

deactivateCircle(circleId: string): Promise<void>
```

### User repository changes

- `addCircle(userId, circleId)`: push to `trustedCircle`
- `removeCircle(userId, circleId)`: pull from `trustedCircle`

### Email

- No email required by spec. Optionally: send welcome email on successful join (out of scope for now)

---

## Implementation Order

1. **FR-R2** — smallest change (extends existing endpoint, one new middleware file)
2. **FR-L4** — new module, new schema, straightforward aggregation queries
3. **FR-A2** — largest scope (new module + user repo changes + integration with FR-R2 `trustedCircleOnly` filter)

---

## Modules / Files Touched

### New files (total: 18 + 3 openapi docs)

```
src/shared/middleware/optionalAuthenticate.ts      (FR-R2)

src/modules/earnings/earnings.schema.ts            (FR-L4)
src/modules/earnings/earnings.repository.ts        (FR-L4)
src/modules/earnings/earnings.service.ts           (FR-L4)
src/modules/earnings/earnings.validation.ts        (FR-L4)
src/modules/earnings/earnings.controller.ts        (FR-L4)
src/modules/earnings/earnings.routes.ts            (FR-L4)

src/modules/circle/circle.schema.ts               (FR-A2)
src/modules/circle/circle.repository.ts           (FR-A2)
src/modules/circle/circle.service.ts              (FR-A2)
src/modules/circle/circle.validation.ts           (FR-A2)
src/modules/circle/circle.controller.ts           (FR-A2)
src/modules/circle/circle.routes.ts               (FR-A2)

src/config/openapi/earnings.docs.ts               (FR-L4)
src/config/openapi/listing.docs.ts  (MODIFIED)    (FR-R2)
src/config/openapi/circle.docs.ts                 (FR-A2)
```

### Modified files

```
src/modules/listing/listing.repository.ts          add availability + circle filter
src/modules/listing/listing.service.ts             new params
src/modules/listing/listing.controller.ts          parse new query params
src/modules/listing/listing.routes.ts              optionalAuthenticate middleware
src/modules/listing/listing.validation.ts          extend query schema

src/modules/auth/auth.repository.ts               addCircle / removeCircle helpers
  (or a new user.repository.ts — TBD on inspection)

src/shared/services/email/IEmailService.ts        PayoutRequested payload + method
src/shared/services/email/SmtpEmailService.ts     implement sendPayoutRequestedEmail

src/modules/index.ts                              register earningsRouter + circleRouter
src/config/openapi/index.ts                       import earnings.docs + circle.docs
```

---

## Constants

```typescript
// earnings
export const MIN_PAYOUT_SAR = 50;

// circle
// none — eligibility is evaluated at runtime from emailDomainRule field
```

---

## TypeScript Check

After each feature, run `npx tsc --noEmit` before moving to the next.

## Commit Strategy

One commit per feature:

1. `feat(listing): FR-R2 — advanced search with availability + trusted-circle filter`
2. `feat(earnings): FR-L4 — lender earnings dashboard + payout request`
3. `feat(circle): FR-A2 — trusted circle management`
