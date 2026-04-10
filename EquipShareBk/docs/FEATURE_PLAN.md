# EquipShare — Feature Implementation Plan

## FR-L2 · FR-L3 · FR-R3 · FR-R4

> **Stack:** Node.js + Express + MongoDB + Stripe + Nodemailer (SMTP)  
> **New modules:** `booking/` · `review/`  
> **New shared services:** `payment/` (Stripe) · extended `email/`

---

## 1. Big Picture — Complete Flow

The full lifecycle of a rental has **5 phases**:

```
PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5
 Browse     Book      Approve   Handover   Review
```

---

### PHASE 1 — Browse & Cost Preview

> No payment yet. Just showing the renter what it will cost.

```
Renter                         System
  │                               │
  │─── GET /api/listings ────────▶│
  │◀── List of active listings ───│
  │                               │
  │─── Select dates (frontend) ───│  (no API call yet, pure frontend calc)
  │◀── Show: subtotal             │
  │         + 10% service fee     │
  │         = total               │
```

---

### PHASE 2 — Request to Book (Payment HOLD placed)

> The renter's card is **reserved** but NOT charged yet.
> Think of it like a hotel pre-authorization — the money is blocked on the card but hasn't left.

```
Renter                         System                      Lender
  │                               │                           │
  │─── POST /api/bookings ───────▶│                           │
  │    { listingId,               │                           │
  │      startDate, endDate,      │                           │
  │      stripePaymentMethodId }  │                           │
  │                               │── 1. Check date conflicts │
  │                               │── 2. Calculate total      │
  │                               │── 3. Stripe: create       │
  │                               │      PaymentIntent with   │
  │                               │      capture_method:      │
  │                               │      "manual"             │
  │                               │      → card RESERVED      │
  │                               │      → NOT charged yet    │
  │                               │── 4. Save Booking         │
  │                               │      status = "Pending"   │
  │                               │── 5. Email lender ───────▶│
  │◀── { clientSecret } ─────────│      "New request!"       │
  │                               │                           │
  │  (Frontend confirms card      │                           │
  │   using clientSecret via      │                           │
  │   Stripe.js — still a HOLD)   │                           │
```

**At this point:** Renter's card has a hold. No money moved. Booking is `status: Pending`.

---

### PHASE 3A — Lender Approves (Payment CAPTURED)

> Only now does the money actually leave the renter's card.

```
Renter                         System                      Lender
  │                               │                           │
  │                               │◀── POST /:id/approve ─────│
  │                               │                           │
  │                               │── Stripe: CAPTURE         │
  │                               │   (money leaves card NOW) │
  │                               │── Booking → "Approved"    │
  │                               │── Lock dates on listing   │
  │◀── Email: "Approved!          │                           │
  │    Receipt attached" ─────────│                           │
```

**At this point:** Money has moved. Booking is `status: Approved`. Dates are blocked on the listing.

---

### PHASE 3B — Lender Rejects (Hold RELEASED, no charge)

> Card hold is cancelled. Renter is never charged.

```
Renter                         System                      Lender
  │                               │                           │
  │                               │◀── POST /:id/reject ──────│
  │                               │    { reason? }            │
  │                               │                           │
  │                               │── Stripe: CANCEL          │
  │                               │   (hold released, $0 taken│
  │                               │── Booking → "Rejected"    │
  │◀── Email: "Rejected.          │                           │
  │    Reason: ..."  ─────────────│                           │
  │    "No payment was taken"     │                           │
```

**At this point:** No money moved. Card hold is gone. Booking is `status: Rejected`.

---

### PHASE 4 — Handover (Visual Handshake)

> Happens on the rental start date. Both sides photograph the equipment to prevent disputes.

```
Renter                         System                      Lender
  │                               │                           │
  │                               │    [Rental start date]    │
  │                               │                           │
  │                               │◀── POST /:id/handover/  ──│
  │                               │         pre-rental        │
  │                               │    (uploads min 3 photos) │
  │                               │── Store to Azure Blob:    │
  │                               │   handovers/{id}/pre/     │
  │                               │── handover.status =       │
  │                               │   "lender_done"           │
  │◀── Email: "Please confirm     │                           │
  │    receipt + upload your      │                           │
  │    own photos" ───────────────│                           │
  │                               │                           │
  │─── POST /:id/handover/ ──────▶│                           │
  │         received              │                           │
  │    (uploads photos of         │                           │
  │     equipment received)       │                           │
  │                               │── Store to Azure Blob:    │
  │                               │   handovers/{id}/received/│
  │                               │── handover.status =       │
  │                               │   "completed"             │
  │                               │── Booking → "Active"      │
```

**Why both sides photograph?**
If the lender claims the equipment was returned damaged, admins can compare:

- `pre/` photos = condition when handed over
- `received/` photos = condition when renter received it

Both sets are **immutable** (never deleted, Azure Blob).

---

### PHASE 5 — Review

> After the rental end date. The renter rates the lender.

```
Renter                         System
  │                               │
  │   [Rental end date passes]    │
  │◀── Email: "How was it?        │
  │    Leave a review" ───────────│
  │                               │
  │─── POST /api/reviews ────────▶│
  │    { bookingId,               │
  │      starRating: 1-5,         │
  │      equipmentCondition: 1-5, │
  │      lenderReliability: 1-5,  │
  │      comment? }               │
  │                               │── Guard: booking must be  │
  │                               │   "Completed"             │
  │                               │── Guard: no review exists │
  │                               │   yet for this booking    │
  │                               │── Save Review             │
  │                               │── Recalculate lender avg: │
  │                               │   newAvg = (oldAvg×count  │
  │                               │   + newRating)/(count+1)  │
  │                               │── Update User.rating      │
  │◀── 201 Created ───────────────│── Update User.reviewCount │
```

**Guards prevent abuse:**

- Review only allowed if `booking.status === "Completed"`
- Only the renter of that specific booking can post
- One review per booking (unique index on `bookingId`)

---

### Full Status Lifecycle

```
                    ┌─────────┐
                    │ PENDING │  ← created on booking request
                    └────┬────┘
           ┌─────────────┴─────────────┐
           ▼                           ▼
      ┌──────────┐               ┌──────────┐
      │ APPROVED │               │ REJECTED │  ← hold released
      └────┬─────┘               └──────────┘
           │
           ▼  (handover completed)
       ┌────────┐
       │ ACTIVE │
       └───┬────┘
           │
           ▼  (end date passes)
      ┌───────────┐
      │ COMPLETED │  ← review now allowed
      └───────────┘
```

---

## 2. New MongoDB Schemas

### 2a. Booking Schema

```
Booking {
  renterId:          ObjectId  (ref User)
  ownerId:           ObjectId  (ref User)
  listingId:         ObjectId  (ref Listing)

  startDate:         Date
  endDate:           Date
  totalDays:         Number
  dailyPrice:        Number    (snapshot at booking time)
  serviceFeeRate:    Number    (snapshot, e.g. 0.10 = 10%)
  subtotal:          Number    (dailyPrice × totalDays)
  serviceFee:        Number    (subtotal × serviceFeeRate)
  totalAmount:       Number    (subtotal + serviceFee)

  status:            enum → "Pending" | "Approved" | "Rejected"
                            | "Active" | "Completed" | "Cancelled"

  rejectionReason:   String?   (optional, set on reject)

  stripe: {
    paymentIntentId: String    (created on "Request to Book")
    chargeId:        String?   (set after capture)
    status:          enum → "hold" | "captured" | "released"
  }

  handover: {
    preRentalPhotos:  String[]    (lender uploads, min 3)
    preRentalAt:      Date?
    receivedPhotos:   String[]    (renter uploads)
    receivedAt:       Date?
    status:           enum → "pending" | "lender_done" | "completed"
  }

  createdAt / updatedAt
}
```

**Indexes:**

```
{ renterId: 1 }
{ ownerId: 1 }
{ listingId: 1 }
{ status: 1, startDate: 1 }
{ startDate: 1, endDate: 1 }   ← date conflict queries
```

---

### 2b. Review Schema

```
Review {
  bookingId:         ObjectId  (ref Booking) — unique, one review per booking
  reviewerId:        ObjectId  (ref User)    — the renter
  revieweeId:        ObjectId  (ref User)    — the lender

  listingId:         ObjectId  (ref Listing)

  starRating:        Number    (1–5, integer)
  equipmentCondition: Number   (1–5, integer)
  lenderReliability: Number    (1–5, integer)
  comment:           String?   (max 1000 chars, optional)

  createdAt
}
```

**Indexes:**

```
{ revieweeId: 1 }       ← fetch lender's profile reviews
{ listingId: 1 }        ← fetch listing reviews
{ bookingId: 1 }        ← unique constraint (one review per booking)
```

---

## 3. Stripe Integration — Payment Flow

### Setup

```
npm install stripe
```

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   ← for future webhook use
PLATFORM_SERVICE_FEE_RATE=0.10    ← 10% platform fee
```

### How Stripe PaymentIntent Works in EquipShare

```
Step 1 — Renter clicks "Request to Book"
─────────────────────────────────────────
  Backend creates:
    stripe.paymentIntents.create({
      amount: totalAmount * 100,          ← in smallest currency unit (halalas)
      currency: "sar",
      capture_method: "manual",           ← HOLD, do not charge yet
      metadata: { bookingId, renterId }
    })
  Returns: { client_secret }
  Frontend: stripe.confirmCardPayment(client_secret)
  → PaymentIntent status: "requires_capture" (hold placed)

Step 2 — Lender Approves
──────────────────────────
  Backend calls:
    stripe.paymentIntents.capture(paymentIntentId)
  → PaymentIntent status: "succeeded" (money taken)

Step 3 — Lender Rejects
──────────────────────────
  Backend calls:
    stripe.paymentIntents.cancel(paymentIntentId)
  → PaymentIntent status: "canceled" (hold released, no charge)
```

### Why `capture_method: "manual"`?

This is the industry-standard approach for marketplace platforms. The card is authorized (funds reserved) but NOT charged until the lender approves. This prevents charging renters for rejected bookings.

---

## 4. Email Notifications (SMTP — Nodemailer)

> Instead of WebSockets for real-time, email is used as the notification channel.

### New email methods to add to `IEmailService`:

| Method                     | Trigger                            | Recipient |
| -------------------------- | ---------------------------------- | --------- |
| `sendBookingRequestEmail`  | Renter submits booking             | Lender    |
| `sendBookingApprovedEmail` | Lender approves                    | Renter    |
| `sendBookingRejectedEmail` | Lender rejects                     | Renter    |
| `sendHandoverPromptEmail`  | Lender completes pre-rental photos | Renter    |
| `sendReviewPromptEmail`    | Rental end date passes             | Renter    |

---

## 5. New API Endpoints

### Booking (`/api/bookings`)

| Method | Route                      | Auth            | Description                      |
| ------ | -------------------------- | --------------- | -------------------------------- |
| `POST` | `/`                        | Renter          | Create booking + Stripe hold     |
| `GET`  | `/my/renting`              | Renter          | My bookings as renter            |
| `GET`  | `/my/lending`              | Lender          | Incoming requests                |
| `GET`  | `/:id`                     | Owner or Renter | Booking detail                   |
| `POST` | `/:id/approve`             | Lender (owner)  | Approve → capture Stripe         |
| `POST` | `/:id/reject`              | Lender (owner)  | Reject → cancel Stripe hold      |
| `POST` | `/:id/handover/pre-rental` | Lender (owner)  | Upload pre-rental photos (min 3) |
| `POST` | `/:id/handover/received`   | Renter          | Upload received photos           |

### Reviews (`/api/reviews`)

| Method | Route                 | Auth   | Description                                 |
| ------ | --------------------- | ------ | ------------------------------------------- |
| `POST` | `/`                   | Renter | Submit review for completed booking         |
| `GET`  | `/user/:userId`       | Public | Get all reviews for a user (lender profile) |
| `GET`  | `/listing/:listingId` | Public | Get all reviews for a listing               |

---

## 6. New Files to Create

```
src/modules/booking/
  booking.schema.ts
  booking.dto.ts
  booking.validation.ts
  booking.repository.ts
  booking.service.ts
  booking.controller.ts
  booking.routes.ts

src/modules/review/
  review.schema.ts
  review.validation.ts
  review.repository.ts
  review.service.ts
  review.controller.ts
  review.routes.ts

src/shared/services/payment/
  IPaymentService.ts
  StripePaymentService.ts
  index.ts
```

---

## 7. Business Logic Details

### FR-R3 — Create Booking

```
1. Validate startDate < endDate, both in future
2. Load listing → verify status === "Active"
3. Check date conflicts:
   - No existing Booking with status Approved/Active overlapping [startDate, endDate]
   - startDate not in listing.blockedDates
4. Calculate:
   totalDays   = dateDiff(startDate, endDate) in days
   subtotal    = listing.dailyPrice × totalDays
   serviceFee  = subtotal × PLATFORM_SERVICE_FEE_RATE
   totalAmount = subtotal + serviceFee
5. Create Stripe PaymentIntent (manual capture)
6. Create Booking document (status: "Pending")
7. Email lender: "New booking request from {renterName}"
8. Return { bookingId, clientSecret } to frontend
```

### FR-L2 — Approve Booking

```
1. Load booking → verify ownerId === req.user.sub
2. Verify booking.status === "Pending"
3. Stripe: capture(paymentIntentId)
4. Update booking → status: "Approved", stripe.status: "captured"
5. Add dates to listing.blockedDates (lock the calendar)
6. Email renter: "Your booking is approved! Here is your receipt."
```

### FR-L2 — Reject Booking

```
1. Load booking → verify ownerId === req.user.sub
2. Verify booking.status === "Pending"
3. Stripe: cancel(paymentIntentId)
4. Update booking → status: "Rejected", rejectionReason, stripe.status: "released"
5. Email renter: "Your booking was rejected. Reason: {reason}. No payment taken."
```

### FR-L3 — Visual Handshake

```
Pre-rental (Lender):
  1. booking.status must be "Approved"
  2. Accept min 3 photos via multipart upload → Azure Blob (folder: handovers/{bookingId}/pre)
  3. Save URLs + timestamp to booking.handover.preRentalPhotos
  4. Set booking.handover.status = "lender_done"
  5. Email renter: "Please confirm receipt and upload your photos"

Received (Renter):
  1. booking.handover.status must be "lender_done"
  2. Accept photos (no minimum) → Azure Blob (folder: handovers/{bookingId}/received)
  3. Save to booking.handover.receivedPhotos
  4. Set booking.handover.status = "completed"
  5. Set booking.status = "Active"
```

### FR-R4 — Submit Review

```
1. Load booking → verify renterId === req.user.sub
2. booking.status must be "Completed" (set by a future cron or manually)
3. Verify no existing review for this bookingId (unique constraint)
4. Create Review document
5. Recalculate lender's average rating:
   newAvg = ((oldAvg × oldCount) + newRating) / (oldCount + 1)
   Update User: rating = newAvg, reviewCount++
6. Optionally recalculate listing.rating too
```

---

## 8. Date Conflict Query Logic

```typescript
// Find bookings that overlap with [startDate, endDate]
BookingModel.findOne({
  listingId,
  status: { $in: ["Approved", "Active"] },
  $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
});
// If result exists → conflict → throw 409
```

---

## 9. Implementation Order

```
Step 1 — Payment service
  ├── Install stripe package
  ├── Add STRIPE env vars to env.ts + .env
  ├── IPaymentService.ts (interface)
  ├── StripePaymentService.ts
  └── payment/index.ts (singleton)

Step 2 — Extend email service
  └── Add 5 new email methods to IEmailService + SmtpEmailService

Step 3 — Booking module
  ├── booking.schema.ts
  ├── booking.repository.ts
  ├── booking.service.ts  (core logic + Stripe + email calls)
  ├── booking.validation.ts
  ├── booking.controller.ts
  └── booking.routes.ts

Step 4 — Register booking in modules/index.ts

Step 5 — Review module
  ├── review.schema.ts
  ├── review.repository.ts
  ├── review.service.ts
  ├── review.validation.ts
  ├── review.controller.ts
  └── review.routes.ts

Step 6 — Register review in modules/index.ts

Step 7 — TypeScript check + push
```

---

## 10. Stripe Keys Setup

1. Sign up at [stripe.com](https://stripe.com) → Dashboard → Developers → API Keys
2. Use **test keys** (prefix `sk_test_` / `pk_test_`) during development
3. Frontend needs the **publishable key** (`pk_test_...`) to call `stripe.confirmCardPayment()`
4. Backend needs the **secret key** (`sk_test_...`) — never expose this

```env
STRIPE_SECRET_KEY=sk_test_...
PLATFORM_SERVICE_FEE_RATE=0.10
```

---

## 11. Security Notes

- **Never** expose `STRIPE_SECRET_KEY` to the frontend
- Stripe PaymentIntent `client_secret` is safe to send to frontend (it can only confirm, not capture)
- Handover photos stored under `handovers/{bookingId}/pre` and `handovers/{bookingId}/received` in Azure — separate from listing photos
- Reviews are gated: only the renter of a **Completed** booking can submit — no spam reviews
- Stripe capture must happen **server-side only** (lender approval endpoint)
