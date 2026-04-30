# EquipShare

Community equipment rental marketplace for KFUPM students and freelancers in Saudi Arabia.

## Project Description

EquipShare is a peer-to-peer equipment rental platform built for the KFUPM community. It enables students and freelancers to rent premium equipment at affordable rates, build community trust through verified user profiles, and manage equipment availability seamlessly. The platform features a modern, responsive interface with secure payment processing (Stripe), equipment photo verification, and dispute resolution.

### Key Features
- **Equipment Marketplace** — Browse and filter equipment by category, price, and availability
- **Booking System** — Request-based booking with lender approval and Stripe card-hold payment
- **Visual Handshake** — Photo-based pre/post-rental condition verification
- **Trusted Circles** — Community groups with optional email-domain gating
- **Disputes & Reports** — Renter/lender dispute filing with admin mediation
- **Reviews & Ratings** — 5-star rating system after completed rentals
- **Earnings Dashboard** — Track rental income, service fees, and payout history
- **Admin Panel** — Dispute resolution, report moderation, and circle management

---

## Repository Structure

```
EquipShare/
├── EquipShareFr/     # React frontend (Create React App + Tailwind CSS)
└── EquipShareBk/     # Node.js + Express + TypeScript backend
```

---

## Live API

| Resource | URL |
|----------|-----|
| **Base URL** | `https://equipshare-api.ambitiousdune-c1462722.eastus.azurecontainerapps.io` |
| **Interactive Docs (Swagger)** | [/api/docs](https://equipshare-api.ambitiousdune-c1462722.eastus.azurecontainerapps.io/api/docs) |

---

## Frontend Setup (`EquipShareFr/`)

### Prerequisites
- Node.js v16+
- npm v8+

### Installation

```bash
cd EquipShareFr
npm install
```

### Environment Variables

Create a `.env` file inside `EquipShareFr/`:

```env
REACT_APP_API_BASE_URL=https://equipshare-api.ambitiousdune-c1462722.eastus.azurecontainerapps.io
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
```

### Running the Frontend

```bash
npm start        # Development server at http://localhost:3000
npm run build    # Production build
```

---

## Backend Setup (`EquipShareBk/`)

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | v18+ | Check: `node -v` |
| npm | v8+ | Check: `npm -v` |
| MongoDB | Any | Local, Atlas, or Azure Cosmos DB |

### Step 1 — Install Dependencies

```bash
cd EquipShareBk
npm install
```

### Step 2 — Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# ── Server ────────────────────────────────────────────────────────────────────
NODE_ENV=development          # "development" | "production" | "test"
PORT=5000

# ── Database ──────────────────────────────────────────────────────────────────
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/equipshare
# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/equipshare

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=change_me_must_be_at_least_32_chars_long
JWT_ACCESS_EXPIRES=15m        # Access token lifetime
JWT_REFRESH_EXPIRES=7d        # Refresh token lifetime

# ── URLs ──────────────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:5000

# ── SMTP (Gmail — use an App Password, not your account password) ─────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM_NAME=EquipShare
SMTP_FROM_EMAIL=your_gmail@gmail.com

# ── Stripe ────────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# ── Azure Blob Storage (photo uploads) ────────────────────────────────────────
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=equipshare-uploads

# ── Platform ──────────────────────────────────────────────────────────────────
PLATFORM_SERVICE_FEE_RATE=0.1   # 10% service fee on every booking
```

> **Stripe & Azure** are optional for local development — the server starts without them, but payment and photo-upload endpoints will fail.

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail" and paste the 16-character code as `SMTP_PASS`.

### Step 3 — Run the Backend

```bash
# Development — hot reload, watches src/ for changes
npm run dev

# Production
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled dist/server.js
```

The server binds at **`http://localhost:5000`** and prints a confirmation:

```
[server] EquipShare API running on port 5000
[db]     Connected to MongoDB
```

### Step 4 — Verify It Works

```bash
curl http://localhost:5000/health
# → { "status": "ok" }

# Interactive API docs
open http://localhost:5000/api/docs
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload (nodemon + tsx) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |
| `npm run lint` | Type-check without emitting files |

### Startup Flow

1. `src/server.ts` — binds the HTTP port immediately (so health checks pass during cold starts)
2. Connects to MongoDB asynchronously (server stays up even if DB is slow)
3. Registers all module routes via `src/modules/index.ts`
4. Attaches global error handler and 404 middleware

### Common Issues

| Problem | Fix |
|---------|-----|
| `JWT_ACCESS_SECRET must be at least 32 characters` | Make the secret longer |
| `MongoServerSelectionError` | Check `MONGODB_URI` — ensure the cluster is running and the IP is whitelisted |
| Emails not sending | Verify `SMTP_PASS` is an App Password, not your Google account password |
| `Cannot find module` after `npm start` | Run `npm run build` first |

---

## API Documentation

Full interactive documentation: **[/api/docs](https://equipshare-api.ambitiousdune-c1462722.eastus.azurecontainerapps.io/api/docs)**

### Base URLs

| Environment | Base URL |
|-------------|----------|
| Local | `http://localhost:5000` |
| Production | `https://equipshare-api.ambitiousdune-c1462722.eastus.azurecontainerapps.io` |

### Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Access tokens expire after **15 minutes**. Use `POST /api/auth/refresh` to get a new one — it reads the `refreshToken` HttpOnly cookie set at login.

### Standard Response Envelope

Every response follows the same shape:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": { "body": ["Email is required"] },
  "data": null
}
```

| Status | Meaning |
|--------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorised — missing or expired token |
| `403` | Forbidden — wrong role or unverified email |
| `404` | Not Found |
| `409` | Conflict — e.g. booking dates overlap |
| `429` | Too Many Requests (100 req / 15 min per IP) |
| `500` | Internal Server Error |

---

### Auth

#### Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Ali Hassan",
  "email": "ali@kfupm.edu.sa",
  "password": "SecurePass123",
  "phone": "0501234567"
}
```

Password rules: minimum 8 characters, at least one uppercase letter, one lowercase letter, and one digit.

**Response `201`**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email."
}
```

---

#### Verify Email

```http
GET /api/auth/verify-email?token=<verificationToken>
```

**Response `200`**
```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

---

#### Resend Verification Email

```http
POST /api/auth/resend-verification
Content-Type: application/json
```

```json
{ "email": "ali@kfupm.edu.sa" }
```

**Response `200`**
```json
{
  "success": true,
  "message": "Verification email sent."
}
```

---

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "ali@kfupm.edu.sa",
  "password": "SecurePass123"
}
```

**Response `200`** — sets an HttpOnly `refreshToken` cookie
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Ali Hassan",
      "email": "ali@kfupm.edu.sa",
      "roles": ["Renter"],
      "verified": true,
      "rating": 0,
      "reviewCount": 0
    }
  }
}
```

---

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Ali Hassan",
    "email": "ali@kfupm.edu.sa",
    "roles": ["Renter", "Lender"],
    "verified": true,
    "rating": 4.8,
    "reviewCount": 12,
    "trustedCircle": ["64f1a2b3c4d5e6f7a8b9c0f1"],
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### Refresh Access Token

```http
POST /api/auth/refresh
```

> Uses the HttpOnly `refreshToken` cookie — no body needed.

**Response `200`**
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
}
```

---

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

**Response `200`** — clears the refresh token cookie and revokes it in the database
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### Listings

#### Browse Listings

```http
GET /api/listings?category=Cameras&minPrice=50&maxPrice=500&page=1&limit=10
```

Query parameters (all optional):

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category (see values below) |
| `minPrice` | number | Minimum daily price (SAR) |
| `maxPrice` | number | Maximum daily price (SAR) |
| `condition` | string | `New` \| `Like New` \| `Good` \| `Fair` |
| `page` | number | Page number (default `1`) |
| `limit` | number | Results per page (default `10`) |

Valid categories: `Power Tools` · `Cameras` · `Drones` · `Audio Equipment` · `Lighting` · `Projectors` · `Computers` · `Sports Equipment` · `Other`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
        "title": "Sony A7III Camera",
        "category": "Cameras",
        "condition": "Like New",
        "dailyPrice": 150,
        "photos": ["https://equipshare.blob.core.windows.net/..."],
        "rating": 4.9,
        "reviewCount": 8,
        "ownerId": {
          "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
          "name": "Sara Al-Otaibi",
          "rating": 4.9
        }
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

#### Get My Listings

```http
GET /api/listings/my
Authorization: Bearer <accessToken>
```

**Response `200`** — same shape as Browse Listings, filtered to the authenticated user's listings.

---

#### Get Listing by ID

```http
GET /api/listings/:id
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "title": "Sony A7III Camera",
    "category": "Cameras",
    "description": "Full-frame mirrorless camera in excellent condition. Comes with 28-70mm kit lens.",
    "specifications": "33MP sensor, 4K video, 5-axis IBIS",
    "condition": "Like New",
    "dailyPrice": 150,
    "photos": ["https://equipshare.blob.core.windows.net/..."],
    "status": "Active",
    "blockedDates": [],
    "rating": 4.9,
    "reviewCount": 8,
    "ownerId": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Sara Al-Otaibi",
      "rating": 4.9,
      "reviewCount": 15
    },
    "createdAt": "2025-01-20T08:00:00.000Z"
  }
}
```

---

#### Upload Listing Photo

```http
POST /api/listings/upload-photo
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photo: <file>
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "url": "https://equipshare.blob.core.windows.net/equipshare-uploads/photo-uuid.jpg"
  }
}
```

> Upload photos first, then include the returned URLs in `photos[]` when creating a listing.

---

#### Create Listing

```http
POST /api/listings
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "title": "DJI Mavic 3 Drone",
  "category": "Drones",
  "description": "Professional drone with 4K Hasselblad camera. Excellent condition, all accessories included.",
  "specifications": "4/3 CMOS sensor, 46-min flight time, 15km range",
  "condition": "Like New",
  "dailyPrice": 200,
  "photos": ["https://equipshare.blob.core.windows.net/equipshare-uploads/photo-uuid.jpg"]
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "title": "DJI Mavic 3 Drone",
    "category": "Drones",
    "dailyPrice": 200,
    "status": "Active",
    "createdAt": "2025-04-30T12:00:00.000Z"
  }
}
```

---

#### Update Listing

```http
PUT /api/listings/:id
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "dailyPrice": 180,
  "description": "Updated description."
}
```

**Response `200`** — returns the full updated listing object.

---

#### Delete Listing

```http
DELETE /api/listings/:id
Authorization: Bearer <accessToken>
```

**Response `200`**
```json
{
  "success": true,
  "message": "Listing deleted successfully."
}
```

---

### Bookings

#### Create Booking

```http
POST /api/bookings
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "listingId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "startDate": "2025-05-10",
  "endDate": "2025-05-12"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "listingId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "startDate": "2025-05-10T00:00:00.000Z",
    "endDate": "2025-05-12T00:00:00.000Z",
    "totalDays": 3,
    "dailyPrice": 150,
    "subtotal": 450,
    "serviceFee": 45,
    "totalAmount": 495,
    "status": "Pending",
    "stripe": {
      "clientSecret": "pi_3Abc123_secret_xyz"
    }
  }
}
```

> Use `clientSecret` on the frontend to authorise a Stripe card hold. **The card is not charged** until the lender approves the booking.

---

#### Get My Rentals (as Renter)

```http
GET /api/bookings/my/renting
Authorization: Bearer <accessToken>
```

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
      "listingId": { "_id": "...", "title": "Sony A7III Camera", "photos": ["..."] },
      "startDate": "2025-05-10T00:00:00.000Z",
      "endDate": "2025-05-12T00:00:00.000Z",
      "totalAmount": 495,
      "status": "Approved"
    }
  ]
}
```

---

#### Get My Bookings (as Lender)

```http
GET /api/bookings/my/lending
Authorization: Bearer <accessToken>
```

**Response `200`** — same shape as above, from the lender's perspective.

---

#### Get Booking by ID

```http
GET /api/bookings/:id
Authorization: Bearer <accessToken>
```

**Response `200`** — full booking object including handover status.

---

#### Approve Booking

```http
POST /api/bookings/:id/approve
Authorization: Bearer <accessToken>
```

> Lender only. Captures the Stripe payment hold.

**Response `200`**
```json
{
  "success": true,
  "message": "Booking approved and payment captured."
}
```

---

#### Reject Booking

```http
POST /api/bookings/:id/reject
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{ "reason": "Equipment not available on those dates." }
```

**Response `200`**
```json
{
  "success": true,
  "message": "Booking rejected and payment hold released."
}
```

---

#### Upload Pre-Rental Photos (Lender)

```http
POST /api/bookings/:id/handover/pre-rental
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photos: [file1, file2, file3]
```

> Minimum **3 photos** required. Lender documents equipment condition before handover.

**Response `200`**
```json
{
  "success": true,
  "message": "Pre-rental photos uploaded.",
  "data": {
    "handover": {
      "preRentalPhotos": ["https://..."],
      "preRentalAt": "2025-05-10T09:00:00.000Z",
      "status": "lender_done"
    }
  }
}
```

---

#### Upload Received Photos (Renter)

```http
POST /api/bookings/:id/handover/received
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photos: [file1, file2]
```

> Renter confirms receipt and documents equipment condition at pickup.

**Response `200`**
```json
{
  "success": true,
  "message": "Received photos uploaded. Handover complete.",
  "data": {
    "handover": {
      "receivedPhotos": ["https://..."],
      "receivedAt": "2025-05-10T10:30:00.000Z",
      "status": "completed"
    }
  }
}
```

---

### Reviews

#### Submit a Review

```http
POST /api/reviews
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "bookingId": "64f1a2b3c4d5e6f7a8b9c0d4",
  "starRating": 5,
  "equipmentCondition": 5,
  "lenderReliability": 5,
  "comment": "Great equipment, exactly as described. The lender was very responsive."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `starRating` | 1–5 | Overall rating |
| `equipmentCondition` | 1–5 | Condition of the equipment |
| `lenderReliability` | 1–5 | Lender responsiveness and reliability |
| `comment` | string | Optional, max 1000 chars |

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "bookingId": "64f1a2b3c4d5e6f7a8b9c0d4",
    "starRating": 5,
    "equipmentCondition": 5,
    "lenderReliability": 5,
    "comment": "Great equipment, exactly as described.",
    "createdAt": "2025-05-14T09:00:00.000Z"
  }
}
```

---

#### Get Reviews for a User

```http
GET /api/reviews/user/:userId
```

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
      "starRating": 5,
      "equipmentCondition": 5,
      "lenderReliability": 5,
      "comment": "Great experience!",
      "reviewerId": { "_id": "...", "name": "Ali Hassan" },
      "listingId": { "_id": "...", "title": "Sony A7III Camera" },
      "createdAt": "2025-05-14T09:00:00.000Z"
    }
  ]
}
```

---

#### Get Reviews for a Listing

```http
GET /api/reviews/listing/:listingId
```

**Response `200`** — same shape as above.

---

### Disputes

#### File a Dispute

```http
POST /api/disputes
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "bookingId": "64f1a2b3c4d5e6f7a8b9c0d4",
  "description": "Equipment was returned with a cracked lens that was not present at pickup. I have photos from the handover step as evidence.",
  "evidenceUrls": ["https://equipshare.blob.core.windows.net/..."]
}
```

`description` must be between 20 and 2000 characters.

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "bookingId": "64f1a2b3c4d5e6f7a8b9c0d4",
    "status": "Open",
    "createdAt": "2025-05-15T08:00:00.000Z"
  }
}
```

---

#### Get My Disputes

```http
GET /api/disputes/my
Authorization: Bearer <accessToken>
```

---

#### Get All Disputes (Admin)

```http
GET /api/disputes?status=Open
Authorization: Bearer <accessToken>
```

---

#### Get Dispute by ID (Admin / Involved Party)

```http
GET /api/disputes/:id
Authorization: Bearer <accessToken>
```

---

#### Mark Dispute Under Review (Admin)

```http
PUT /api/disputes/:id/status
Authorization: Bearer <accessToken>
```

---

#### Resolve Dispute (Admin)

```http
PUT /api/disputes/:id/resolve
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "ruling": "LenderResponsible",
  "rulingNote": "Handover photos confirm the damage occurred during the rental period.",
  "refundAmount": 150
}
```

Valid `ruling` values: `RenterResponsible` · `LenderResponsible` · `NoFaultFound`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "status": "Resolved",
    "ruling": "LenderResponsible",
    "rulingNote": "Handover photos confirm the damage occurred during the rental period.",
    "refundAmount": 150,
    "resolvedAt": "2025-05-16T14:00:00.000Z"
  }
}
```

---

### Reports

#### File a Report

```http
POST /api/reports
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "listingId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "reason": "FakePhotos",
  "description": "The listing photos appear to be stock images. The actual equipment looks completely different."
}
```

Valid `reason` values: `Scam` · `FakePhotos` · `InappropriateContent` · `Overpriced` · `MisleadingDescription` · `Other`

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "listingId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "reason": "FakePhotos",
    "status": "Open",
    "createdAt": "2025-05-15T10:00:00.000Z"
  }
}
```

---

#### Get My Reports

```http
GET /api/reports/my
Authorization: Bearer <accessToken>
```

---

#### Get All Reports (Admin)

```http
GET /api/reports
Authorization: Bearer <accessToken>
```

---

#### Get Report by ID (Admin)

```http
GET /api/reports/:id
Authorization: Bearer <accessToken>
```

**Response `200`** — includes `auditLog[]` with a timestamped history of all admin actions on this report.

---

#### Mark Report Under Review (Admin)

```http
PUT /api/reports/:id/status
Authorization: Bearer <accessToken>
```

---

#### Resolve Report (Admin)

```http
PUT /api/reports/:id/resolve
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "adminAction": "RemoveListing",
  "adminNote": "Listing removed after verifying the photos were fraudulent."
}
```

Valid `adminAction` values: `Dismiss` · `WarnLender` · `RemoveListing`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "status": "Resolved",
    "adminAction": "RemoveListing",
    "adminNote": "Listing removed after verifying the photos were fraudulent.",
    "resolvedAt": "2025-05-16T11:00:00.000Z"
  }
}
```

---

### Earnings

> All earnings endpoints require authentication and the **Lender** role.

#### Get Earnings Summary

```http
GET /api/earnings/summary
Authorization: Bearer <accessToken>
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 3200,
    "pendingPayoutBalance": 850,
    "monthlyBreakdown": [
      { "month": "2025-04", "amount": 1200 },
      { "month": "2025-03", "amount": 2000 }
    ]
  }
}
```

---

#### Get Earnings Transactions

```http
GET /api/earnings/transactions
Authorization: Bearer <accessToken>
```

---

#### Get Payout History

```http
GET /api/earnings/payouts
Authorization: Bearer <accessToken>
```

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d8",
      "amount": 500,
      "status": "Paid",
      "requestedAt": "2025-04-01T10:00:00.000Z",
      "processedAt": "2025-04-02T14:00:00.000Z"
    }
  ]
}
```

---

#### Request Payout

```http
POST /api/earnings/payout
Authorization: Bearer <accessToken>
```

> Minimum pending balance of **SAR 50** required.

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d9",
    "amount": 850,
    "status": "Pending",
    "requestedAt": "2025-05-01T09:00:00.000Z"
  }
}
```

---

### Circles

#### Get All Circles

```http
GET /api/circles
```

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0f1",
      "name": "KFUPM Students",
      "description": "Verified KFUPM students and faculty members.",
      "eligibilityCriteria": "Must have a valid KFUPM email address.",
      "emailDomainRule": "kfupm.edu.sa",
      "memberCount": 142,
      "isActive": true
    }
  ]
}
```

---

#### Get Circle by ID

```http
GET /api/circles/:id
```

---

#### Join a Circle

```http
POST /api/circles/:id/join
Authorization: Bearer <accessToken>
```

> If the circle has an `emailDomainRule`, your account email must match that domain.

**Response `200`**
```json
{
  "success": true,
  "message": "Joined circle successfully."
}
```

---

#### Leave a Circle

```http
POST /api/circles/:id/leave
Authorization: Bearer <accessToken>
```

---

#### Create Circle (Admin)

```http
POST /api/circles
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "KFUPM Students",
  "description": "Verified KFUPM students and faculty members.",
  "eligibilityCriteria": "Must have a valid KFUPM email address.",
  "emailDomainRule": "kfupm.edu.sa"
}
```

`emailDomainRule` is optional — omit it for an open circle.

---

#### Get Circle Members (Admin)

```http
GET /api/circles/:id/members
Authorization: Bearer <accessToken>
```

---

#### Remove Member from Circle (Admin)

```http
DELETE /api/circles/:id/members/:userId
Authorization: Bearer <accessToken>
```

---

#### Deactivate Circle (Admin)

```http
PATCH /api/circles/:id/deactivate
Authorization: Bearer <accessToken>
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Tailwind CSS, Axios |
| Backend | Node.js v18, Express.js v5, TypeScript v6 |
| Database | MongoDB (Mongoose) — compatible with Azure Cosmos DB |
| Auth | JWT (15-min access token + 7-day HttpOnly refresh token) |
| Validation | Zod |
| Payments | Stripe (card hold + manual capture) |
| Storage | Azure Blob Storage (photo uploads) |
| Email | Nodemailer via SMTP |
| Logging | Winston |
| API Docs | Scalar UI + Zod-to-OpenAPI |
| Deployment | Azure Container Apps |

---

## Team Members

| Name | Role |
|------|------|
| Ibrahim Alshaya | Frontend Development & API Integration |
| Moath Haimur | Backend Development & Deployment |
| Naif Alenizi | UI Design & Frontend |

---

## Features Implemented

| ID | Feature |
|----|---------|
| FR-L1 | Equipment Listing Creation |
| FR-L2 | Booking Request Approval |
| FR-L3 | Visual Handshake (photo verification) |
| FR-L4 | Earnings Dashboard |
| FR-R1 | User Registration & Email Verification |
| FR-R2 | Advanced Search & Discovery |
| FR-R3 | Secure Booking & Payment (Stripe) |
| FR-R4 | Review & Rating System |
| FR-A1 | Trusted Circle Management |
| FR-A2 | Dispute Mediation |
| FR-A3 | Content Moderation & Reports |
| FR-A4 | Admin Dashboard |
