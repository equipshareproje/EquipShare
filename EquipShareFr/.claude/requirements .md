# EquipShare
## Community-Based Equipment Rental Marketplace
### Milestone 3: Requirements & Wireframes

**Team Members:** Ibrahim Alshayea | Moath Haimur | Naif Alenizi

---

## 1. Project Motivation

EquipShare addresses a critical gap faced by students and local professionals: the high cost and low accessibility of specialized equipment needed for short-term, project-based tasks. A student requiring a professional-grade camera for a class project, or a freelancer needing specialized tools for a single job, currently faces a difficult choice. Either pay an unaffordable purchase price or simply go without. University equipment offices are often overbooked, commercial rental services are impersonal and expensive, and informal peer lending lacks the trust infrastructure needed for high-value items. This creates a financial barrier that stifles creativity and innovation within communities that could otherwise thrive.

This problem is worth solving because access to tools should never be the reason a good idea fails. When a student cannot afford a camera, a project goes unfinished. When a startup cannot rent a specialized sensor, a prototype never gets built. The inability to access equipment does not just inconvenience individuals — it suppresses innovation, widens the gap between students with financial means and those without, and leaves high-value assets sitting idle in closets while peers go without.

The communities most affected are precisely those with the most potential: university students working on academic and extracurricular projects, early-career freelancers building their first professional portfolio, and grassroots creators who cannot justify the full cost of ownership for tools they need only occasionally. Beyond individual users, the broader community benefits too — owners earn passive income from assets they already own, institutions see richer student project outcomes, and the local economy benefits from more efficient resource utilization.

EquipShare is worth building because it transforms an existing inefficiency — expensive gear sitting unused — into a shared resource that unlocks opportunity for an entire community.

---

## 2. Target User Categories

| User Type | Characteristics | Role & Responsibilities | Platform Interaction |
|-----------|----------------|------------------------|----------------------|
| **Lender (Owner)** | Individuals or students who own specialized, high-value equipment that sits idle. Typically tech-savvy, trust-conscious, and financially motivated. | Lists equipment for rent, sets pricing and availability, reviews rental requests, approves/rejects renters, documents equipment condition, and tracks earnings. | Uses dashboard to manage listings and bookings. Uses the Visual Handshake to upload pre-rental condition photos. Monitors earnings in real-time. |
| **Renter** | Students, freelancers, and project-based professionals seeking short-term access to specific tools without the cost of ownership. Budget-conscious and deadline-driven. | Searches and filters equipment listings, makes secure bookings, completes payments, participates in Visual Handshake, and leaves reviews. | Browses marketplace, joins Trusted Circles, completes checkout flow, confirms item receipt via photo upload, and accesses rental history. |
| **Platform Admin** | Internal team moderators with elevated system access. Technically proficient, responsible, and empowered to intervene in platform operations to maintain safety and integrity. | Verifies user identity, manages Trusted Circles, moderates listings, resolves disputes, oversees financial transactions, and handles support tickets. | Accesses admin dashboard to monitor platform-wide activity, review flagged content, arbitrate disputes using chat logs and photo evidence, and manage financial reporting. |

---

## 3. Requirements Modeling

### 3a. Functional Requirements

#### Lender (Owner) Functionalities

##### FR-L1: Equipment Listing Creation
*The lender creates a new equipment listing that is visible to renters in the marketplace.*

1. Lender logs into the platform using verified credentials.
2. Lender navigates to "My Listings" and clicks "Add New Listing."
3. The system presents a listing form with fields: equipment name, category, description, technical specifications, condition, and daily rental price.
4. Lender uploads a minimum of 2 photos from their device.
5. Lender sets available and blocked dates on the integrated availability calendar.
6. Lender clicks "Submit Listing." The system validates all required fields (non-empty name, price > 0, at least one photo).
7. If validation fails, inline error messages are displayed on the relevant fields.
8. If validation passes, the listing is stored and appears as "Active" in the marketplace. The system displays a success confirmation.

##### FR-L2: Booking Request Approval
*The lender reviews incoming rental requests and decides to approve or reject them.*

1. System sends a real-time notification to the lender when a renter submits a booking request.
2. Lender navigates to "Booking Requests" and selects the pending request.
3. The system displays the renter's profile, including: trust rating, rental history summary, and Trusted Circle membership status.
4. Lender selects "Approve" or "Reject."
5. If approved: the system locks the dates, notifies the renter, and initiates payment hold.
6. If rejected: the lender may optionally provide a reason; the renter is notified and the payment hold is released.

##### FR-L3: Visual Handshake — Equipment Handover Documentation
*The lender documents the equipment's condition before handing it over to the renter to prevent post-rental disputes.*

1. On the rental start date, the lender navigates to the active booking in the app.
2. Lender taps "Start Handover" to open the Visual Handshake module.
3. Lender photographs all sides of the equipment. The system requires a minimum of 3 photos and auto-timestamps each image.
4. Lender submits the photos. The system stores them as the "pre-rental" evidence record linked to the booking ID.
5. The renter is prompted to confirm receipt and add their own "received" photos.
6. Both photo sets are stored immutably and are accessible to Admins for dispute resolution.

##### FR-L4: Earnings Dashboard
*The lender monitors their income and manages payout settings.*

1. Lender navigates to "Earnings Dashboard."
2. System displays: total earnings to date, pending payouts, per-transaction history, and a summary chart by month.
3. Lender can filter transaction history by date range or listing.
4. Lender clicks "Request Payout" to initiate a transfer to their registered payment account.
5. System validates that the balance meets the minimum payout threshold and confirms the request.

---

#### Renter Functionalities

##### FR-R1: User Registration & Account Creation
*A new user creates a personal account on the EquipShare platform.*

1. User visits the EquipShare homepage and clicks "Sign Up."
2. System displays the registration form requesting: full name, email address, password, and phone number.
3. User fills in the form. The system validates: password strength (min 8 chars, 1 uppercase, 1 number), unique email address, and valid phone format.
4. If validation fails, specific inline error messages are shown next to the relevant fields.
5. If validation passes, the system securely stores user credentials (hashed password) and sends a verification email.
6. User clicks the activation link in the email. The system marks the account as "Verified" and redirects to a welcome screen.

##### FR-R2: Advanced Search & Discovery
*The renter searches for available equipment that meets their specific needs.*

1. Renter navigates to the marketplace homepage.
2. System displays a search bar and filter panel with options: category (dropdown), price range (slider), proximity (location radius), availability (date range picker), and Trusted Circle only (toggle).
3. Renter enters a keyword and/or applies filters, then clicks "Search."
4. System returns a paginated list of matching, available listings with thumbnail, price, rating, and distance.
5. Renter clicks on a listing to view the full detail page including all photos, specs, lender profile, reviews, and availability calendar.
6. If no results found, system displays "No items found" and suggests broadening filter criteria.

##### FR-R3: Secure Booking & Payment
*The renter selects a listing and completes a booking with secure payment.*

1. On the equipment detail page, Renter selects their desired rental dates from the availability calendar.
2. System dynamically calculates and displays the total cost (daily rate × number of days + platform service fee).
3. Renter clicks "Request to Book." System checks for date conflicts; if a conflict exists, it displays an error and blocks progression.
4. Renter proceeds to the secure payment page and enters payment details. System processes payment and places a hold (does not charge until lender approves).
5. The system sends a booking request notification to the lender.
6. Upon lender approval, the payment hold is converted to a charge, and a booking confirmation with a digital receipt is sent to the renter.

##### FR-R4: Review & Rating Submission
*After a rental is completed, the renter submits a review to build community trust.*

1. After the rental end date, the system prompts the renter to leave a review.
2. Renter navigates to "Rental History" and clicks "Leave a Review" on the completed rental.
3. System displays a review form with: 1–5 star rating, equipment condition field, lender reliability field, and optional text comments.
4. Renter submits the review. System validates that a star rating has been selected.
5. Review is published on the lender's public profile and the listing page. The lender's average rating is recalculated.

---

#### Platform Admin Functionalities

##### FR-A1: User Identity Verification
*The admin reviews and approves user identity documents to maintain a trusted, safe community.*

1. Admin logs into the admin dashboard.
2. Admin navigates to "Pending Verifications" which displays a queue of users who have submitted identity documents.
3. Admin selects a pending user and reviews their submitted document (e.g., national ID, student ID).
4. Admin clicks "Approve" or "Reject" with an optional rejection reason.
5. If approved: user account status is updated to "Verified"; a notification is sent to the user confirming their verified status.
6. If rejected: user is notified with the reason and instructed to resubmit.

##### FR-A2: Trusted Circle Management
*The admin creates and manages community groups (Trusted Circles) for specific institutions.*

1. Admin navigates to "Community Management" and clicks "Create New Circle."
2. Admin enters circle details: name (e.g., "KFUPM Students"), description, and eligibility criteria (e.g., university email domain).
3. System saves the circle and makes it joinable by eligible users on their profile settings page.
4. Admin can view the member list of any circle, remove members for violations, or deactivate the circle entirely.

##### FR-A3: Dispute Mediation
*The admin resolves conflicts between lenders and renters using platform evidence.*

1. A user files a dispute by navigating to the relevant booking and clicking "File a Dispute," providing a description.
2. System creates a dispute ticket visible on the Admin's "Disputes" dashboard with a status of "Open."
3. Admin opens the dispute ticket and reviews: the full conversation log between lender and renter, the Visual Handshake photos from both parties, and booking details.
4. Admin makes a ruling: "Renter Responsible," "Lender Responsible," or "No Fault Found."
5. System executes the ruling (e.g., partial refund, damage fee deduction) and notifies both parties. Ticket status is updated to "Resolved."

##### FR-A4: Content Moderation
*The admin reviews and removes listings that violate platform policies.*

1. Any user can flag a listing as suspicious or policy-violating by clicking "Report Listing."
2. System creates a moderation flag visible on the Admin dashboard.
3. Admin reviews the flagged listing and the report details.
4. Admin selects an action: "Dismiss Report" (no violation found), "Issue Warning" (send warning to lender), or "Remove Listing" (take listing offline immediately).
5. All moderation actions are logged in the audit trail for accountability.

---

### 3b. Non-Functional Requirements

| Category | Requirement | Description & Metric | Justification |
|----------|-------------|----------------------|---------------|
| Performance | Page Load Time | All main pages must load within 2 seconds under a load of up to 500 concurrent users. | A slow marketplace kills engagement. Users abandon sessions after 3s load time. |
| Performance | Search Response | Search and filter results must be returned within 1 second of query submission. | Core user action — delays directly reduce booking conversion rates. |
| Performance | Image Upload | Equipment and handshake photo uploads (up to 5MB each) must complete within 5 seconds on a standard broadband connection. | The Visual Handshake is time-critical at physical equipment handover. |
| Security | Authentication | All user sessions must use JWT-based authentication with tokens expiring after 24 hours. HTTPS is mandatory for all endpoints. | Protects user accounts and sensitive financial data from unauthorized access. |
| Security | Data Encryption | All payment card data must be tokenized via a PCI-DSS compliant payment processor. The platform must never store raw card numbers. | Financial safety is non-negotiable and required by payment industry standards. |
| Security | Photo Immutability | Visual Handshake photos must be stored in a write-once storage system with server-side timestamps. No user can modify or delete submitted evidence. | Ensures the integrity of dispute resolution evidence. |
| Usability | Intuitive Navigation | First-time users must be able to complete a booking within 5 minutes without external guidance. UI will follow established design patterns. | The platform targets students who may not be tech-savvy; complexity is a barrier to adoption. |
| Usability | Accessibility | The application must conform to WCAG 2.1 Level AA standards, including keyboard navigation and screen reader compatibility. | Ensures equitable access for users with disabilities. |
| Usability | Responsive Design | The web application must display correctly and be fully functional on screens from 320px (mobile) to 2560px (desktop) width. | Users will access the platform from phones during on-campus handovers. |
| Reliability | System Uptime | The platform must maintain a minimum 99.5% uptime SLA, measured monthly. | A marketplace that is down loses transactions and erodes user trust permanently. |
| Scalability | User Growth | The system architecture must support horizontal scaling to accommodate user growth up to 10,000 registered users without architectural changes. | The platform targets university communities with potential for rapid viral growth. |
| Compatibility | Browser Support | The application must function correctly on the latest two major versions of Chrome, Safari, Firefox, and Edge. | Ensures maximum audience reach across standard student devices. |
| Constraints | Technology Stack | Frontend: React.js. Backend: Node.js / Express. Database: PostgreSQL. Cloud Storage: AWS S3 (for photos). Payment: Stripe API. | Standardized, well-documented stack facilitates team development and future maintenance. |
| Constraints | Regulatory | The platform must comply with Saudi Arabia's Personal Data Protection Law (PDPL), including user consent for data collection and the right to request data deletion. | Legal compliance is mandatory for operating within the Kingdom. |

---

## 4. Wireframe Development

**Figma Prototype URL:**
[EquipShare Mid-Fi Wireframes](https://www.figma.com/community/file/1609773945338630741/equipshare-mid-fi-wireframes)
