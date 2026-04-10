# EquipShare Demo Setup for Testing

## Project Overview
**EquipShare** is a community-based equipment rental marketplace for KFUPM students and Saudi Arabian freelancers. Users can rent high-value equipment (cameras, drones, laptops) from peers instead of expensive commercial rental services.

---

## Quick Start (3 Steps)

### 1. Start the Server
```bash
cd c:\Users\alsha\Desktop\EquipShare
npm start
```
- App opens at **http://localhost:3003**
- React development server auto-compiles changes
- Hot reload enabled (changes appear instantly)

### 2. Access the App
Open any browser and go to: **http://localhost:3003**

### 3. Login with Demo Account
- **User Account**: demo@example.com / TestPass123
- **Admin Account**: admin@equipshare.com / AdminPass123

---

## System Requirements

### Technology Stack
- **Frontend**: React 19.2.4 with Hooks
- **Routing**: React Router v7.14.0
- **Styling**: Tailwind CSS with KFUPM brand colors
- **State**: React Context API (AuthContext)
- **Data**: Local Storage (no backend required)

---

## All Implemented Features

### 12 Functional Requirements (100% Complete)

#### Lender Features (4/4)
- **FR-L1**: Equipment Listing Creation
  - Upload minimum 2 photos
  - Set category, description, price, availability
  - Mark blocked dates on calendar
  - Save as draft or publish immediately

- **FR-L2**: Booking Request Approval
  - View pending rental requests from renters
  - See renter's trust rating and rental history
  - Approve (payment charged) or reject (payment released)

- **FR-L3**: Visual Handshake — Equipment Handover Documentation
  - Upload minimum 3 pre-rental photos with auto-timestamps
  - Accept renter's return photos with timestamps
  - Photos stored immutably for dispute resolution

- **FR-L4**: Earnings Dashboard
  - Total earnings, pending payouts, monthly breakdown
  - Transaction history with date/listing filters
  - Request payout to registered payment account

#### User Features (4/4)
- **FR-R1**: User Registration & Account Creation
  - Sign up with email, phone, password (strength validation)
  - Email verification flow
  - Account status = Verified

- **FR-R2**: Advanced Search & Discovery
  - Keyword search (camera, laptop, drone, etc.)
  - Multi-filters: category, price range ($20-$1000), availability dates, location radius
  - Trusted circle membership filter
  - Sorting: newest, cheapest, highest rated

- **FR-R3**: Secure Booking & Payment
  - Select dates from availability calendar
  - Dynamic cost calculation: (daily_rate × days) + 10% service fee
  - Payment checkout (mock Stripe integration)
  - Payment hold until lender approval, then charged
  - Booking confirmation with receipt

- **FR-R4**: Review & Rating Submission
  - After rental completion: Leave 1-5 star rating
  - Write comments about equipment condition and lender reliability
  - Reviews visible on lender profile and listing page

#### Admin Features (4/4)
- **FR-A1**: User Identity Verification
  - Review pending identity documents (National ID, Student ID)
  - View applicant name, email, submission date
  - Approve → User marked "Verified", can rent/lend
  - Reject → User notified with reason, must resubmit

- **FR-A2**: Trusted Circle Management
  - Create named circles (e.g., "KFUPM Alumni", "Freelancers Network")
  - Set membership criteria (e.g., organization domain)
  - View member list (names, emails, join dates)
  - Remove or suspend members for violations
  - Deactivate circles

- **FR-A3**: Dispute Mediation
  - View open disputes with context (booking details, lender/renter info)
  - Review visual handshake evidence (pre/post rental photos)
  - See communication log between parties
  - Preview financial impact for each ruling:
    - **Renter Responsible**: Renter pays damage fee
    - **Lender Responsible**: Renter receives full refund
    - **Split Decision**: Both pay 50/50
  - Submit ruling → System executes charges/refunds + notifications

- **FR-A4**: Content Moderation
  - View flagged listings (color-coded by severity: 3/7/12 flags)
  - Preview flagged listing content
  - See user reports and reasons
  - Take action: Dismiss, Issue Warning, or Remove
  - All actions logged with timestamp + user for audit trail

---

## Sample Data Included

### Users (10+ Test Accounts)
```
LENDERS:
- Ahmed Al-Dosari (ahmed.dosari@kfupm.edu.sa) / Password: LenderPass123
- Sarah Al-Ali (sarah.ali@kfupm.edu.sa) / Password: LenderPass123
- Mohammad Al-Shammari (mohammad.shammari@kfupm.edu.sa) / Password: LenderPass123

USERS:
- Fatima Al-Qahtani (fatima.qahtani@kfupm.edu.sa) / Password: UserPass123
- Omar Al-Otaibi (omar.otaibi@kfupm.edu.sa) / Password: UserPass123
- Demo User (demo@example.com) / Password: TestPass123

ADMIN:
- Platform Admin (admin@equipshare.com) / Password: AdminPass123
```

### Equipment Listings (15+ Items)
```
PHOTOGRAPHY
- Canon EOS 5D Mark IV - $150/day Available
- Sony A6700 Mirrorless - $110/day Available
- Professional Lighting Kit - $85/day Available

ACTION CAMERAS
- GoPro Hero 11 - $75/day Available

AUDIO
- Sony WH-1000XM5 Headphones - $30/day Available

COMPUTERS
- MacBook Pro 14 - $120/day Available
- iPad Pro 12.9 - $60/day Available

DRONES
- DJI Air 3S - $200/day Currently Unavailable (Apr 15-30)

[And more...]
```

### Bookings (5 Test Scenarios)
1. **Approved Booking** → Ready for handover
2. **Pending Booking** → Awaiting lender approval
3. **Completed Booking** → With pre/post handshake photos + reviews
4. **Rejected Booking** → With rejection reason
5. **In-Progress Booking** → With pre-rental photos submitted

### Admin Data
- **3 Pending Verifications** → Photo ID documents to approve/reject
- **2 Active Trusted Circles** → KFUPM Alumni, KFUPM Students (with members)
- **2 Open Disputes** → With visual evidence (handshake photos) + financial impact
- **3 Flagged Listings** → Various severity levels for moderation

---

## Testing Flows

### Complete User Journey (20 minutes)
1. **Signup** → Create new user account
2. **Browse** → Search marketplace for equipment
3. **Book** → Request equipment rental with dates
4. **Checkout** → Complete mock payment
5. **Dashboard** → View rental status
6. **Handshake** → Upload pre-rental photos
7. **Return** → Simulate return with photos
8. **Review** → Leave 5-star rating

### Admin Workflow (15 minutes)
1. **Login** → admin@equipshare.com
2. **Verify Users** → Approve 1 identity document
3. **Manage Circles** → View members, remove 1
4. **Mediate Dispute** → Review evidence, rule "Renter Responsible"
5. **Moderate Content** → Remove 1 flagged listing

### Lender Flow (10 minutes)
1. **Create Account** → Sign up (test email validation)
2. **Create Listing** → Upload camera with 2+ photos, set price/dates
3. **My Listings** → View created listing
4. **Booking Requests** → Approve pending request
5. **Earnings** → View monthly revenue chart

---

## How to Test Each Feature

### Search & Filter (2 minutes)
1. Go to Marketplace
2. Search: "camera" → See Canon, Sony listings
3. Filter by Category: Photography → Show only cameras
4. Filter by Price Range: $50-$150 → Adjust price slider
5. Filter by Date: Select Apr 15-17 → Show available dates
6. Click "Trusted Circles Only" → See members-only listings

### Booking Flow (3 minutes)
1. Click on "Canon EOS 5D Mark IV"
2. Select dates (Apr 11-13, 2026) = 2 days
3. See calculation: 150 × 2 + 10% = $330 total
4. Click "Book Now"
5. Go to Checkout (should see "Booking Approved" if lender already approved)
6. Upload payment mock: 4242 4242 4242 4242
7. Confirm → Booking marked "completed"

### Upload Handshake Photos (2 minutes)
1. In Dashboard → Active rental
2. Click "Start Handover"
3. Upload 3 test images (any JPG/PNG from computer)
4. Photos auto-timestamp
5. Click "Submit" → Photos stored
6. After rental: Upload return photos
7. Both sets visible to admin for disputes

### Admin Dispute Resolution (3 minutes)
1. Login as admin@equipshare.com
2. Go to Admin Dashboard → Disputes tab
3. Click "Review Evidence & Make Ruling"
4. See pre/post photos side-by-side
5. See communication log between renter/lender
6. Select ruling: "Lender Responsible" (full refund)
7. See financial impact: "-$330 from lender, +$300 to renter + $30 fee"
8. Click "Submit Ruling"
9. Check Admin Audit Trail → Action logged

### User Verification (2 minutes)
1. Admin Dashboard → Verifications tab
2. View 3 pending users with ID photos
3. Review: Name, Email, Document Type
4. Click "Approve" for Ahmed Al-Dosari
5. Alert: "User verified and account activated!"
6. Go to Admin → Users list should show verified badge

### Trusted Circle Management (2 minutes)
1. Admin Dashboard → Circles tab
2. Click existing circle: "KFUPM Alumni"
3. Click "View Members" → See 5+ members
4. Click "Suspend" on one member (violation handling)
5. Create new circle: name "Photography Enthusiasts"
6. Set eligibility: "Instagram followers > 1000"
7. Click "Create Circle"

### Content Moderation (2 minutes)
1. Admin Dashboard → Moderation tab
2. See 3 flagged listings with severity badges (3/7/12 flags)
3. Click "View Listing" on highest-flagged item
4. Read user reports and reason
5. Click "Remove Listing" → Lender gets email notification
6. Check Audit Trail → Action logged with timestamp

---

## Responsive Design Testing

### Desktop (1920px)
- 3 cards per row in listings
- Full sidebar filters visible
- Desktop navigation bar

### Tablet (768px) 
- 2 cards per row
- Filters collapse into "Show Filters" toggle
- Responsive menu

### Mobile (375px)
- 1 card per row, full width
- Hamburger menu for navigation
- Toast notifications for feedback
- Forms optimized for touch

---

## Data Persistence

### LocalStorage Keys
```
equipshare_users           → All registered users + roles
equipshare_user            → Currently logged-in user
equipshare_listings        → All equipment listings
equipshare_bookings        → Rental bookings + status
equipshare_reviews         → User reviews and ratings
admin_pendingVerifications → Users awaiting approval
admin_trustedCircles       → Verified member groups
admin_disputes             → Open/resolved conflicts
admin_flaggedListings      → Content moderation queue
admin_circleMembers        → Members in each circle
admin_auditLogs            → Admin action history
```





