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
- **Renter Account**: demo@example.com / TestPass123
- **Admin Account**: admin@equipshare.com / AdminPass123

---

## System Requirements

### Browser Support
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

### Technology Stack
- **Frontend**: React 19.2.4 with Hooks
- **Routing**: React Router v7.14.0
- **Styling**: Tailwind CSS with KFUPM brand colors
- **State**: React Context API (AuthContext)
- **Data**: Local Storage (no backend required)

---

## All Implemented Features

### 12 Functional Requirements (100% Complete)

#### Lender Features (4/4) ✅
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

#### Renter Features (4/4) ✅
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

#### Admin Features (4/4) ✅
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
    - ✅ **Renter Responsible**: Renter pays damage fee
    - ✅ **Lender Responsible**: Renter receives full refund
    - ✅ **Split Decision**: Both pay 50/50
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
- Ahmed Al-Dosari (ahmed.dosari@kfupm.edu.sa) - 4.8★ 
- Sarah Al-Ali (sarah.ali@kfupm.edu.sa) - 4.9★
- Mohammad Al-Shammari (mohammad.shammari@kfupm.edu.sa) - 4.7★

RENTERS:
- Fatima Al-Qahtani
- Omar Al-Rashid
- Demo User (demo@example.com)

ADMIN:
- Platform Admin (admin@equipshare.com)
```

### Equipment Listings (15+ Items)
```
PHOTOGRAPHY
- Canon EOS 5D Mark IV - $150/day ✅ Available
- Sony A6700 Mirrorless - $110/day ✅ Available
- Professional Lighting Kit - $85/day ✅ Available

ACTION CAMERAS
- GoPro Hero 11 - $75/day ✅ Available

AUDIO
- Sony WH-1000XM5 Headphones - $30/day ✅ Available

COMPUTERS
- MacBook Pro 14 - $120/day ✅ Available
- iPad Pro 12.9 - $60/day ✅ Available

DRONES
- DJI Air 3S - $200/day ❌ Currently Unavailable (Apr 15-30)

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

## Color Scheme (KFUPM Brand)

| Component | Color | Code |
|-----------|-------|------|
| Primary Button | Petrol (dark teal) | #003E51 |
| Button Hover | Darker Petrol | #002A38 |
| Accents & Links | Teal | #00879E |
| Background | Off-white | #F4F7F8 |
| Text Primary | Near-black | #0A1F29 |
| Text Secondary | Muted Blue-Gray | #4A6572 |
| Success | Green | #1A7F5A |
| Warning | Amber | #D97706 |
| Error | Red | #DC2626 |

---

## Testing Flows

### Complete User Journey (20 minutes)
1. **Signup** → Create new renter account
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

## Keyboard Shortcuts & Features

### Navigation
- **Mobile Menu**: Hamburger icon (visible on screens < 768px)
- **Tab Navigation**: Use Tab key to navigate form fields
- **Enter Key**: Submit forms

### Accessibility
- ✅ WCAG 2.1 Level AA compliant
- ✅ Keyboard navigation throughout
- ✅ Screen reader labels on all inputs
- ✅ Color contrast sufficient for visibility
- ✅ Images have descriptive alt text

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

### Clear Data (Factory Reset)
Open browser DevTools (F12):
1. Application → Local Storage
2. Right-click each key → Delete
3. Refresh page → App reinitializes with default data

---

## Common Test Scenarios

### Scenario 1: Happy Path (Success Flow)
- Renter: Search → Book → Pay → Handshake → Review = SUCCESS ✅

### Scenario 2: Lender Rejects (Rejection Flow)
- Lender: Receive request → Click Reject → Renter notified = SUCCESS ✅

### Scenario 3: Dispute Resolution (Admin Flow)
- Admin: Review evidence → Rule "Lender Responsible" → Charges applied = SUCCESS ✅

### Scenario 4: Content Moderation (Safety Flow)
- Admin: Flag item → Click "Remove Listing" → Item offline = SUCCESS ✅

### Scenario 5: Trusted Circles (Community Flow)
- Admin: Create circle → Add members → Set eligibility = SUCCESS ✅

---

## Known Limitations (Mock Data)

1. **No Real Backend** → Uses localStorage (data lost on browser clear)
2. **No Payment Processing** → Mock Stripe checkout only
3. **No Email Notifications** → Alerts/toasts display instead
4. **No Photo Upload Validation** → Any image accepted (min 3 photos required)
5. **No SMS Notifications** → In-app notifications only
6. **No Real Geolocation** → All items in "KFUPM Main Campus"

---

## Browser DevTools Tips

### Debug Login Issues
```
F12 → Application → Local Storage → equipshare_users
(Check if demo/admin accounts exist)
```

### Inspect Network Calls
```
F12 → Network tab
(All calls are localStorage, no network requests - this is expected)
```

### Debug Admin Disputes
```
F12 → Application → Local Storage → admin_disputes
(View dispute JSON structure)
```

### Mobile Testing
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Select iPhone 12 or iPad for responsive testing
```

---

## Success Criteria

### All Functional Requirements Working
- [ ] Can search and filter equipment (FR-R2)
- [ ] Can book with payment (FR-R3)
- [ ] Can verify users as admin (FR-A1)
- [ ] Can manage circles as admin (FR-A2)
- [ ] Can mediate disputes as admin (FR-A3)
- [ ] Can moderate content as admin (FR-A4)
- [ ] Can create listings as lender (FR-L1)
- [ ] Can approve bookings as lender (FR-L2)
- [ ] Can upload handshake photos as lender (FR-L3)
- [ ] Can view earnings as lender (FR-L4)
- [ ] Can signup as renter (FR-R1)
- [ ] Can review equipment as renter (FR-R4)

### UI/UX Quality
- [ ] No console errors (F12)
- [ ] All pages responsive (desktop/tablet/mobile)
- [ ] Forms validate inline
- [ ] Navigation works without page reloads
- [ ] Images load
- [ ] Buttons have hover states

### Performance
- [ ] Page loads instantly (localStorage)
- [ ] Search results < 1 second
- [ ] Navigation responsive (no lag)
- [ ] Photos display quickly

---

## Getting Help

### If App Won't Start
```bash
npm install
npm start
```

### If Port 3003 is In Use
```bash
# Find process on port 3003 and kill it
# Or change port in .env
```

### If Data Won't Load
1. Clear Browser Cache (Ctrl+Shift+Delete)
2. Open DevTools (F12)
3. Go to Application → Local Storage
4. Delete all `equipshare_*` keys
5. Refresh page

### If Photos Won't Upload
- Check file size < 5MB
- Use JPG, PNG, or WebP format
- Upload minimum 3 photos
- Check browser console for errors

---

## Feedback to Developers

Please document any bugs or improvements during testing by noting:
1. **What you did** (step-by-step)
2. **What you expected**
3. **What actually happened**
4. **Browser/Device used**
5. **Screenshot/video** (if possible)

---

**Ready to test! All features are implemented and ready for comprehensive QA.** 🚀

Good luck with your testing! Please reach out with any questions.
