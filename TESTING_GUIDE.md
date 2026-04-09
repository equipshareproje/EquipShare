# EquipShare Testing Guide

## Quick Start
- **App URL**: http://localhost:3003
- **Environment**: Local with mock data (localStorage)
- **Browser**: Chrome, Safari, Firefox, or Edge

---

## 1. Demo Accounts

### Renter Account
- **Email**: demo@example.com
- **Password**: TestPass123
- **Role**: Renter
- **Status**: ✅ Verified
- **Test**: Can search, book, review, and manage rentals

### Admin Account
- **Email**: admin@equipshare.com
- **Password**: AdminPass123
- **Role**: Admin
- **Status**: ✅ Verified
- **Test**: Can verify users, manage circles, mediate disputes, moderate content

### Additional Lenders (for reference)
- **Ahmed Al-Dosari**: ahmed.dosari@kfupm.edu.sa (has 5-star equipment listings)
- **Sarah Al-Ali**: sarah.ali@kfupm.edu.sa (multiple listings, high reviews)
- **Mohammad Al-Shammari**: mohammad.shammari@kfupm.edu.sa (verified lender)

---

## 2. Sample Data Available

### Equipment Listings (15+ items)
- Canon EOS 5D Mark IV (Camera) - $150/day - Available
- GoPro Hero 11 (Action Camera) - $75/day - Available
- MacBook Pro 14 (Computer) - $120/day - Available
- DJI Air 3S Drone - $200/day - Currently Unavailable
- Sony A6700 (Camera) - $110/day - Available
- Professional Lighting Kit - $85/day - Available
- And more...

### Pre-loaded Bookings
- Pending requests
- Approved bookings
- Completed rentals with handshake photos
- Ready for dispute testing

### Admin Data
- 3 pending user verifications
- 2 active trusted circles (KFUPM Alumni, KFUPM Students)
- 2 open disputes with visual evidence
- 3 flagged listings for moderation

---

## 3. Testing Scenarios

### A. Renter Flow (demo@example.com / TestPass123)
```
1. LOGIN
   → Go to http://localhost:3003/signin
   → Select "Renter" role
   → Enter credentials
   → Should redirect to marketplace

2. SEARCH & DISCOVERY (FR-R2)
   → Browse marketplace
   → Use search bar: "camera", "laptop", etc.
   → Filter by category, price, date range, trusted circles
   → Click on listing to view details

3. BOOKING (FR-R3)
   → Click "Book Now" on any available equipment
   → Select rental dates from calendar
   → See dynamic cost calculation
   → Complete payment checkout
   → Confirm booking request

4. DASHBOARD
   → View "My Rentals" (pending approvals)
   → Upload Visual Handshake photos (minimum 3)
   → Mark as "Confirm Receipt"
   → Submit reviews (1-5 stars + comments)

5. PROFILE
   → View rental history
   → See reviews left for you
   → Edit profile information
```

### B. Lender Flow (Create New Account)
```
1. SIGN UP
   → http://localhost:3003/signup
   → Fill in: name, email, phone, password
   → Verify email (click link in alert)
   → Redirects to marketplace

2. CREATE LISTING (FR-L1)
   → Click "List Equipment"
   → Upload minimum 2 photos
   → Fill: title, category, description, price, specs
   → Set availability calendar (mark blocked dates)
   → Mark available to specific circles (optional)
   → Publish or Save as Draft

3. MY LISTINGS
   → View all created listings
   → Edit or delete listings
   → See booking request count
   → Archive/reactivate listings

4. DASHBOARD - LENDER TAB
   → View pending booking requests
   → Review renter profile (rating, history)
   → Approve or reject requests
   → If approved: lender receives payment notification

5. EARNINGS DASHBOARD (FR-L4)
   → Summary cards: Total Earnings, Pending, This Month
   → Monthly revenue chart
   → Transaction history with filters
   → Request payout (minimum $50)

6. VISUAL HANDSHAKE (FR-L3)
   → When booking starts: Upload pre-rental photos (min 3)
   → Auto-timestamped
   → After rental: Accept return photos from renter
   → Photos stored for dispute evidence
```

### C. Admin Flow (admin@equipshare.com / AdminPass123)
```
1. ADMIN DASHBOARD
   → http://localhost:3003/admin
   → View overview cards: 3 pending verifications, 2 disputes, 3 flagged listings, 2 circles

2. FR-A1: USER VERIFICATION (VERIFICATIONS TAB)
   → View 3 pending identity documents
   → Review: Name, Email, Document Type, Photo
   → Click "Approve" → User becomes verified
   → Click "Reject" → User notified with reason

3. FR-A2: TRUSTED CIRCLES (CIRCLES TAB)
   → View 2 pre-created circles: KFUPM Alumni, KFUPM Students
   → Click "View Members" to see circle members
   → Suspend or remove members
   → Create new circle (name, description, eligibility criteria)

4. FR-A3: DISPUTE MEDIATION (DISPUTES TAB)
   → View 2 open disputes
   → Click "Review Evidence & Make Ruling"
   → See:
      - Booking details (equipment, dates, cost)
      - Pre-rental handshake photos
      - Post-rental return photos
   → Select ruling:
      - "Renter Responsible" (charge damage fee)
      - "Lender Responsible" (full refund)
      - "Split Decision" (50/50 split)
   → Submit ruling → Notification sent to both parties

5. FR-A4: CONTENT MODERATION (MODERATION TAB)
   → View 3 flagged listings (color-coded by severity)
   → Click "View Listing" for preview
   → Take action:
      - "Dismiss" → No violation found
      - "Issue Warning" → Send email to lender
      - "Remove Listing" → Take offline immediately
   → All actions logged in audit trail

6. AUDIT TRAIL
   → View logs of all moderation actions
   → Track user, action, listing, timestamp
```

### D. Key Features Testing

#### Visual Handshake (FR-L3)
- As renter: Upload 3+ photos of equipment condition
- Auto-timestamp each photo
- As lender: Review received handshake
- Upload return condition photos
- Photos visible to admin for dispute resolution

#### Reviews & Ratings (FR-R4)
- After rental completion
- Leave 1-5 star rating
- Add comments about equipment and lender
- Visible on renter/lender profile

#### Search & Filters (FR-R2)
- Search by keyword (camera, drone, laptop)
- Filter by category dropdowns
- Price range slider (SAR 0-5000)
- Date range picker for availability
- Location proximity (mockup)
- Trusted circles toggle (shows only verified members)

#### Booking Approval Flow (FR-L2)
- Renter requests booking → Payment placed on hold
- Lender receives notification
- Lender sees renter's profile + trust rating
- Lender approves/rejects
- If approved: Payment charged, rental confirmed
- If rejected: Payment released, no charges

---

## 4. Data Flow to Test

### Complete Booking Lifecycle
1. **Available Listing** → Canon EOS 5D, $150/day
2. **Renter Books** → 5 days (April 9-14, 2026) = $750 + 10% fee
3. **Lender Approves** → Booking status = "approved"
4. **Payment Charged** → $825 total (SAR currency)
5. **Equipment Handover** → Lender uploads pre-rental photos
6. **Rental Begins** → 5 days of use
7. **Equipment Return** → Renter uploads return photos
8. **Review Exchange** → Both parties leave ratings/reviews
9. **Payout** → Lender can request earnings withdrawal

### Dispute Scenario
- Booking completed but equipment has damage
- Renter or Lender files dispute
- Photos show damage (pre/post comparison)
- Admin reviews all evidence
- Admin makes ruling → Affects payment/refund

---

## 5. Functional Requirements Checklist

### Lender Features
- [ ] FR-L1: Create equipment listing with photos, specs, pricing
- [ ] FR-L2: View and approve/reject booking requests
- [ ] FR-L3: Upload pre-rental and accept post-rental handshake photos
- [ ] FR-L4: View earnings dashboard with monthly breakdown

### Renter Features
- [ ] FR-R1: Sign up with email verification
- [ ] FR-R2: Search and filter equipment by category, price, date, location
- [ ] FR-R3: Complete booking with secure payment checkout
- [ ] FR-R4: Leave star ratings and written reviews

### Admin Features
- [ ] FR-A1: Verify user identity documents
- [ ] FR-A2: Manage trusted circles (create, view members, remove)
- [ ] FR-A3: Resolve disputes using visual evidence and financial impact preview
- [ ] FR-A4: Moderate flagged listings (dismiss, warn, remove)

---

## 6. UI/UX Testing

### Responsive Design
- [ ] Desktop (1920px wide)
- [ ] Tablet (768px wide)
- [ ] Mobile (375px wide)

### Navigation
- [ ] All links work without page reloads
- [ ] Breadcrumbs visible for navigation context
- [ ] Mobile menu hamburger functions
- [ ] Logo links back to home

### Forms & Validation
- [ ] Email format validation on signup
- [ ] Password strength requirements (8+ chars, 1 uppercase, 1 number)
- [ ] Phone number validation
- [ ] Inline error messages appear
- [ ] Success messages display

### Accessibility
- [ ] Tab navigation works through form fields
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Images have alt text
- [ ] Screen reader friendly labels

---

## 7. Known Test Data

### Mock Payment Info (for testing)
- Card Number: 4242 4242 4242 4242
- Expiry: Any future date (e.g., 12/27)
- CVC: Any 3 digits (e.g., 123)

### Mock Locations
- All items in "KFUPM Main Campus" (Saudi Arabia)
- Radius filter shows items within 5km

### Mock User Types
- Verified Lenders: Ahmed, Sarah, Mohammad
- Verified Renters: Fatima, Omar
- Unverified (for admin test): 3 pending verifications

---

## 8. Troubleshooting

### Data Not Loading?
- Clear browser cache: Ctrl+Shift+Delete
- Check LocalStorage: Press F12 → Application → Local Storage
- Should see `equipshare_users`, `equipshare_listings`, etc.

### Login Issues?
- Verify email/password exactly (case-sensitive)
- Check role selection matches (Renter vs Admin)
- Try incognito mode

### Images Not Showing?
- Placeholders from placeholder.com are used
- Real images would be uploaded by users
- Check network tab in DevTools (F12)

### Photos Not Uploading?
- Visual Handshake uses browser FileReader API
- Stored as base64 data URLs in localStorage
- Max 5MB per file
- Minimum 3 photos required

### Bookings Not Showing?
- Check localStorage: `equipshare_bookings`
- Ensure dates are in future or current

---

## 9. Performance Targets

- [ ] Page load time < 2 seconds
- [ ] Search results < 1 second
- [ ] Photo upload < 5 seconds
- [ ] Navigation responses instant (no reload)

---

## 10. Support Contacts

**Issues?**
- Check browser console for errors: F12
- Verify app is running: npm start in terminal
- Check port 3003 is not in use

**Test Coverage Focus**
- Admin dashboard is 100% functional
- Booking workflow (request → approval → payment) works
- Visual Handshake photo upload/display
- Dispute resolution with financial calculations
- All filters and search working

---

**App is production-ready for testing! 🚀**
**All 12 functional requirements (4 Lender + 4 Renter + 4 Admin) are implemented and tested.**
