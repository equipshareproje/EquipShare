# Project Memory

Instructions here apply to this project and are shared with team members.

## Context

You are a senior React developer building EquipShare — a community-based equipment rental marketplace for university students and freelancers in Saudi Arabia, built for the KFUPM community.

## Tech Stack
- React.js (functional components + hooks only)
- React Router v6 for navigation
- Tailwind CSS for styling
- Axios for API calls
- Mock data / localStorage for prototype (no real backend yet)

## Color System (KFUPM Brand Colors)
- Primary:       #003E51  (KFUPM Petrol — main brand color)
- Primary Dark:  #002A38  (darker shade for hover states)
- Primary Light: #005570  (lighter shade for accents)
- Accent:        #00879E  (teal — for highlights, badges, tags)
- Background:    #FFFFFF  (white — main background)
- Surface:       #F4F7F8  (off-white — cards, inputs)
- Text Primary:  #0A1F29  (near black — headings)
- Text Secondary:#4A6572  (muted — subtitles, captions)
- Border:        #D0DDE2  (light gray-blue — dividers, input borders)
- Success:       #1A7F5A  (green — approvals, verified badges)
- Warning:       #D97706  (amber — pending states)
- Error:         #DC2626  (red — rejections, errors)

## Design Rules
- Mobile-first, fully responsive (320px to 2560px)
- Clean, professional, academic/institutional feel
- Trust-focused UI — this is a peer-to-peer platform, trust signals matter
- WCAG 2.1 Level AA accessibility (aria labels, keyboard nav, screen reader support)
- Use #003E51 as the primary color everywhere blue would normally appear
- White cards on #F4F7F8 backgrounds
- Buttons: bg-[#003E51] text-white hover:bg-[#002A38]
- Links and highlights: text-[#00879E]
- Follow the mid-fi wireframes: https://www.figma.com/community/file/1609773945338630741/equipshare-mid-fi-wireframes

## Project Pages to Build
1. Landing Page — hero section, how it works, featured listings, CTA
2. Auth Pages — Sign Up + Login with inline validation
3. Marketplace — search bar, filters (category, price range, date picker, location radius, Trusted Circle toggle), paginated listing cards
4. Equipment Detail Page — photo gallery, specs, lender profile, reviews, availability calendar, booking button
5. Checkout Flow — date selection, cost calculator (daily rate × days + 10% service fee), payment form (Stripe UI mock)
6. Lender Dashboard — My Listings, Booking Requests (approve/reject), Earnings chart by month
7. Renter Dashboard — Rental History, Leave a Review (1-5 stars + comments)
8. Visual Handshake Module — photo upload (min 3 photos), auto-timestamp display, pre/post rental photo sets
9. Admin Dashboard — Pending Verifications queue, Disputes panel, Content Moderation (flag/remove listings)

## File Structure
src/
  components/   → reusable UI components (Navbar, Footer, Card, Modal, etc.)
  pages/        → one file per page
  context/      → AuthContext for user state
  data/         → mock JSON data for listings, users, bookings
  assets/       → images and icons

## Behavior Rules
- Use React Router for all navigation, no page reloads
- Use useState and useEffect for all interactivity
- All forms must have inline validation with clear error messages
- Use localStorage to persist auth state and mock bookings
- Never use class components
- Keep components small and reusable
- Add comments to explain complex logic

## User Roles
- Lender: can create listings, approve/reject bookings, upload handshake photos, view earnings
- Renter: can search, book, pay, upload receipt photos, leave reviews
- Admin: can verify users, mediate disputes, moderate listings

## When I ask you to build a page or component:
1. Give me the complete file with no placeholders
2. Use realistic mock data
3. Make it fully interactive
4. Make it pixel-close to the Figma wireframes
5. Always use the KFUPM color system above — never use generic blue