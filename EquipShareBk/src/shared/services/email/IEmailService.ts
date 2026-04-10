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

export interface DisputeFiledEmailPayload {
  to: string;
  recipientName: string;
  disputeId: string;
  listingTitle: string;
  filedByName: string;
  description: string; // first 200 chars shown
}

export interface DisputeResolvedEmailPayload {
  to: string;
  recipientName: string;
  disputeId: string;
  listingTitle: string;
  ruling: "RenterResponsible" | "LenderResponsible" | "NoFaultFound";
  rulingNote: string;
  refundAmount?: number; // in SAR, shown only when LenderResponsible
}

export interface ReportReceivedEmailPayload {
  to: string;
  reporterName: string;
  listingTitle: string;
  reportId: string;
}

export interface ListingWarningEmailPayload {
  to: string;
  lenderName: string;
  listingTitle: string;
  reason: string;
}

export interface ListingRemovedEmailPayload {
  to: string;
  lenderName: string;
  listingTitle: string;
  reason: string;
}

export interface PayoutRequestedEmailPayload {
  to: string;
  lenderName: string;
  amount: number; // SAR
  payoutId: string;
}

export interface IEmailService {
  sendVerificationEmail(payload: VerificationEmailPayload): Promise<void>;
  sendBookingRequestEmail(payload: BookingRequestEmailPayload): Promise<void>;
  sendBookingApprovedEmail(payload: BookingApprovedEmailPayload): Promise<void>;
  sendBookingRejectedEmail(payload: BookingRejectedEmailPayload): Promise<void>;
  sendHandoverPromptEmail(payload: HandoverPromptEmailPayload): Promise<void>;
  sendReviewPromptEmail(payload: ReviewPromptEmailPayload): Promise<void>;
  sendDisputeFiledEmail(payload: DisputeFiledEmailPayload): Promise<void>;
  sendDisputeResolvedEmail(payload: DisputeResolvedEmailPayload): Promise<void>;
  sendReportReceivedEmail(payload: ReportReceivedEmailPayload): Promise<void>;
  sendListingWarningEmail(payload: ListingWarningEmailPayload): Promise<void>;
  sendListingRemovedEmail(payload: ListingRemovedEmailPayload): Promise<void>;
  sendPayoutRequestedEmail(payload: PayoutRequestedEmailPayload): Promise<void>;
}
