# EquipShare

Community equipment rental marketplace for KFUPM students and freelancers in Saudi Arabia.

## Project Description

EquipShare is a peer-to-peer equipment rental platform built for the KFUPM community. It enables students and freelancers to rent premium equipment at affordable rates, build community trust through verified user profiles, and manage equipment availability seamlessly. The platform features a modern, responsive interface with secure payment processing (Stripe), equipment photo verification, and dispute resolution.

### Key Features
- **Equipment Marketplace** — Browse and filter equipment by category, price, location, and availability
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

### Admin Account
| Field | Value |
|-------|-------|
| Email | `moathhaimmour2003@gmail.com` |
| Password | `Moath2003@` |

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
- Node.js v18+
- npm v8+
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
cd EquipShareBk
npm install
```

### Environment Variables

Create a `.env` file inside `EquipShareBk/` (reference `.env.example`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/equipshare

# JWT
JWT_ACCESS_SECRET=your_access_secret_at_least_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# URLs
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:5000

# SMTP (Gmail — use an App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM_NAME=EquipShare
SMTP_FROM_EMAIL=your_gmail@gmail.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Azure Blob Storage (for photo uploads)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=equipshare-uploads
```

### Running the Backend

```bash
npm run dev      # Development with hot reload
npm run build    # Compile TypeScript
npm start        # Run compiled output
```

Server starts at `http://localhost:5000`

---

## API Documentation

Full interactive documentation available at:
**[https://equipshare-api.ambitiousdune-c1462722.eastus.azurecontainerapps.io/api/docs](https://equipshare-api.ambitiousdune-c1462722.eastus.azurecontainerapps.io/api/docs)**

### Authentication

All protected routes require a Bearer token:

```
Authorization: Bearer <accessToken>
```

---

### Auth

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ali Hassan",
  "email": "ali@example.com",
  "password": "SecurePass123!",
  "phone": "0501234567"
}
```
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ali@example.com",
  "password": "SecurePass123!"
}
```
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Ali Hassan",
      "email": "ali@example.com",
      "roles": ["Renter", "Lender"]
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Ali Hassan",
    "email": "ali@example.com",
    "roles": ["Renter", "Lender"],
    "verified": true,
    "rating": 4.8,
    "reviewCount": 12,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Refresh Access Token
```http
POST /api/auth/refresh
```
> Uses the HttpOnly refresh-token cookie set at login.
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGci..." }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

---

### Listings

#### Get All Listings
```http
GET /api/listings?category=Camera&minPrice=50&maxPrice=500&page=1&limit=10
```
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
        "title": "Sony A7III Camera",
        "category": "Camera",
        "dailyRate": 150,
        "location": "KFUPM Campus",
        "images": ["https://..."],
        "ownerId": { "_id": "...", "name": "Sara Al-Otaibi", "rating": 4.9 }
      }
    ],
    "total": 45,
    "page": 1,
    "pages": 5
  }
}
```

#### Create Listing
```http
POST /api/listings
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "DJI Drone Mavic 3",
  "description": "Professional drone with 4K camera, excellent condition.",
  "category": "Drone",
  "dailyRate": 200,
  "location": "Dhahran",
  "images": ["https://..."]
}
```
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "title": "DJI Drone Mavic 3",
    "dailyRate": 200,
    "isActive": true,
    "createdAt": "2025-04-30T12:00:00.000Z"
  }
}
```

#### Get Listing by ID
```http
GET /api/listings/:id
```

#### Update Listing
```http
PUT /api/listings/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "dailyRate": 180 }
```

#### Delete Listing
```http
DELETE /api/listings/:id
Authorization: Bearer <accessToken>
```

---

### Bookings

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "listingId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "startDate": "2025-05-10",
  "endDate": "2025-05-13"
}
```
```json
{
  "success": true,
  "data": {
    "bookingId": "64f1a2b3c4d5e6f7a8b9c0d4",
    "clientSecret": "pi_3Abc123_secret_xyz",
    "totalAmount": 495,
    "subtotal": 450,
    "serviceFee": 45,
    "totalDays": 3
  }
}
```
> `clientSecret` is used to authorise a Stripe card hold. The card is **not charged** until the lender approves.

#### Get My Rentals (as Renter)
```http
GET /api/bookings/my-renting
Authorization: Bearer <accessToken>
```

#### Get My Bookings (as Lender)
```http
GET /api/bookings/my-lending
Authorization: Bearer <accessToken>
```

#### Approve Booking
```http
PUT /api/bookings/:id/approve
Authorization: Bearer <accessToken>
```
```json
{ "success": true, "message": "Booking approved and payment captured." }
```

#### Decline Booking
```http
PUT /api/bookings/:id/decline
Authorization: Bearer <accessToken>
```

#### Cancel Booking
```http
PUT /api/bookings/:id/cancel
Authorization: Bearer <accessToken>
```

#### Upload Pre-Rental Photos (Lender)
```http
POST /api/bookings/:id/handover/pre-rental
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photos: [file1, file2, file3]   (minimum 3 required)
```

#### Confirm Receipt Photos (Renter)
```http
POST /api/bookings/:id/handover/received
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photos: [file1, file2]
```

---

### Reviews

#### Submit a Review
```http
POST /api/reviews
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bookingId": "64f1a2b3c4d5e6f7a8b9c0d4",
  "rating": 5,
  "comment": "Great equipment, excellent condition!"
}
```

#### Get Reviews for a Listing
```http
GET /api/reviews/listing/:listingId
```
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Great equipment!",
      "reviewerId": { "name": "Ali Hassan", "rating": 4.7 },
      "createdAt": "2025-04-20T08:00:00.000Z"
    }
  ]
}
```

---

### Disputes

#### File a Dispute
```http
POST /api/disputes
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bookingId": "64f1a2b3c4d5e6f7a8b9c0d4",
  "description": "Equipment returned with damage not present at pickup."
}
```

#### Get My Disputes
```http
GET /api/disputes/my
Authorization: Bearer <accessToken>
```

#### Get All Disputes (Admin)
```http
GET /api/disputes
Authorization: Bearer <accessToken>
```

#### Resolve Dispute (Admin)
```http
PUT /api/disputes/:id/resolve
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "ruling": "RefundRenter",
  "rulingNote": "Evidence confirms damage occurred during rental.",
  "refundAmount": 150
}
```

---

### Reports

#### File a Report
```http
POST /api/reports
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "listingId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "reason": "FakePhotos",
  "description": "The listing photos do not match the actual equipment."
}
```
> Valid reasons: `Scam` | `FakePhotos` | `InappropriateContent` | `Overpriced` | `MisleadingDescription` | `Other`

#### Get My Reports
```http
GET /api/reports/my
Authorization: Bearer <accessToken>
```

#### Get All Reports (Admin)
```http
GET /api/reports
Authorization: Bearer <accessToken>
```

#### Resolve Report (Admin)
```http
PUT /api/reports/:id/resolve
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "adminAction": "ListingRemoved",
  "adminNote": "Listing removed after verifying fraudulent photos."
}
```

---

### Earnings

#### Get Earnings Summary
```http
GET /api/earnings/summary
Authorization: Bearer <accessToken>
```
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

#### Get Earnings Transactions
```http
GET /api/earnings/transactions
Authorization: Bearer <accessToken>
```

#### Request Payout
```http
POST /api/earnings/payout
Authorization: Bearer <accessToken>
```
> Minimum balance of SAR 50 required.

---

### Circles

#### Get All Circles
```http
GET /api/circles
```

#### Create Circle (Admin)
```http
POST /api/circles
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "KFUPM Students",
  "description": "Verified KFUPM students and faculty members.",
  "eligibilityCriteria": "Must have a valid KFUPM email address.",
  "emailDomainRule": "kfupm.edu.sa"
}
```

#### Join a Circle
```http
POST /api/circles/:id/join
Authorization: Bearer <accessToken>
```

#### Leave a Circle
```http
POST /api/circles/:id/leave
Authorization: Bearer <accessToken>
```

---

## Error Responses

All errors follow a consistent structure:

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
| `429` | Too Many Requests |
| `500` | Internal Server Error |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Tailwind CSS, Axios |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access + refresh tokens), HttpOnly cookies |
| Payments | Stripe (card hold + manual capture) |
| Storage | Azure Blob Storage (photo uploads) |
| Email | SMTP via Nodemailer |
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
