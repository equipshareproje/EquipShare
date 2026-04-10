# EquipShare

Community equipment rental marketplace for KFUPM students and freelancers in Saudi Arabia.

## Project Description

EquipShare is a peer-to-peer equipment rental platform built for the KFUPM community. It enables students and freelancers to rent premium equipment at affordable rates, build community trust through verified user profiles, and manage equipment availability seamlessly. The platform features a modern, responsive interface with secure payment processing, equipment verification, and dispute resolution.

### Key Features
- **Equipment Marketplace**: Browse and search equipment by category, price, location, and availability
- **User Verification**: Identity verification system with document upload and admin approval
- **Trusted Circles**: Community verification groups for peer-to-peer trust building
- **Booking System**: Request-based booking with lender approval workflow
- **Visual Handshake**: Photo-based pre/post-rental condition verification
- **Reviews & Ratings**: 5-star rating system with detailed renter/lender feedback
- **Earnings Dashboard**: Track rental income and monthly breakdowns
- **Admin Tools**: User verification, dispute mediation, content moderation

---

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ibshaya/EquipShare.git
   cd EquipShare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000` (or next available port)

4. **Build for production**
   ```bash
   npm run build
   ```

### Project Structure
```
src/
  ├── components/     # Reusable UI components
  ├── pages/          # Page components
  ├── context/        # React Context (AuthContext)
  ├── data/           # Mock JSON data
  └── assets/         # Images and icons
```

---

## Usage Instructions

### Demo Accounts

**Renter Account**
- Email: `demo@example.com`
- Password: `TestPass123`

**Admin Account**
- Email: `admin@equipshare.com`
- Password: `AdminPass123`

### User Flows

#### 1. Browse Equipment (Renter)
1. Click "Browse Marketplace"
2. Use filters: Category, Price Range, Date Availability, Location Radius
3. Click equipment card to view details
4. Select rental dates and book

#### 2. Book Equipment (Renter)
1. Navigate to equipment detail page
2. Select check-in and check-out dates
3. Review booking summary with calculated costs
4. Click "Book Now" to submit request
5. Wait for lender approval (visible in Dashboard)

#### 3. Approve Booking (Lender)
1. Go to Dashboard → "As Lender" tab
2. View "Pending Booking Requests"
3. Click "Approve" to accept booking
4. Renter can proceed to payment

#### 4. Create Equipment Listing (Lender)
1. Click "List Equipment"
2. Add photos, title, category, daily rate
3. Set availability dates
4. Set pricing and terms
5. Publish listing

#### 5. Leave Review (Renter)
1. Go to Dashboard after rental completes
2. Click "Review" on completed rental
3. Rate 1-5 stars and add comments
4. Submit review

#### 6. Admin Functions
1. Navigate to `/admin`
2. **Verifications**: Approve/reject user identity documents
3. **Circles**: Create and manage trusted community groups
4. **Disputes**: Review evidence photos and mediate rental disputes
5. **Moderation**: Flag or remove inappropriate listings

---

## Tech Stack

- **Frontend**: React.js (Functional Components + Hooks)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Requests**: Axios
- **Data Storage**: localStorage (mock backend)
- **Build Tool**: Create React App

---

## Team Members and Roles

| Name | Role | Responsibilities |
|------|------|------------------|
| Ibrahim Alshaya | FullStack Development |  feature implementation and integration |
| Moath Haimur | Backend Development | API and Database design |
| Naif Alenizi | Frontend Development | UI design and bug fixes |

---

## Testing

For comprehensive testing documentation, see `DEMO_SETUP.md`

---

## Features Status

All 12 functional requirements implemented
- FR-L1: Equipment Listing Creation
- FR-L2: Booking Request Approval
- FR-L3: Visual Handshake
- FR-L4: Earnings Dashboard
- FR-R1: User Registration
- FR-R2: Advanced Search & Discovery
- FR-R3: Secure Booking & Payment
- FR-R4: Review & Rating
- FR-A1: User Identity Verification
- FR-A2: Trusted Circle Management
- FR-A3: Dispute Mediation
- FR-A4: Content Moderation

---

## License

This project is built for the KFUPM community.
