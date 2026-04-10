export interface VerificationEmailPayload {
  to: string;
  name: string;
  verificationUrl: string;
}

export interface BookingRequestEmailPayload {
  to: string; // lender email
  lenderName: string;
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  bookingId: string;
}

export interface BookingApprovedEmailPayload {
  to: string; // renter email
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
}

export interface BookingRejectedEmailPayload {
  to: string; // renter email
  renterName: string;
  listingTitle: string;
  reason?: string;
}

export interface HandoverPromptEmailPayload {
  to: string; // renter email
  renterName: string;
  listingTitle: string;
  bookingId: string;
}

export interface ReviewPromptEmailPayload {
  to: string; // renter email
  renterName: string;
  listingTitle: string;
  bookingId: string;
}

export interface IEmailService {
  sendVerificationEmail(payload: VerificationEmailPayload): Promise<void>;
  sendBookingRequestEmail(payload: BookingRequestEmailPayload): Promise<void>;
  sendBookingApprovedEmail(payload: BookingApprovedEmailPayload): Promise<void>;
  sendBookingRejectedEmail(payload: BookingRejectedEmailPayload): Promise<void>;
  sendHandoverPromptEmail(payload: HandoverPromptEmailPayload): Promise<void>;
  sendReviewPromptEmail(payload: ReviewPromptEmailPayload): Promise<void>;
}
