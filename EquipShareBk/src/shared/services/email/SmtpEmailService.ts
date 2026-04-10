import nodemailer from "nodemailer";
import { env } from "@config/env";
import {
  IEmailService,
  VerificationEmailPayload,
  BookingRequestEmailPayload,
  BookingApprovedEmailPayload,
  BookingRejectedEmailPayload,
  HandoverPromptEmailPayload,
  ReviewPromptEmailPayload,
  DisputeFiledEmailPayload,
  DisputeResolvedEmailPayload,
  ReportReceivedEmailPayload,
  ListingWarningEmailPayload,
  ListingRemovedEmailPayload,
} from "./IEmailService";

export class SmtpEmailService implements IEmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(env.SMTP_USER && env.SMTP_PASS
      ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }
      : {}),
  });

  async sendVerificationEmail({
    to,
    name,
    verificationUrl,
  }: VerificationEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: "Verify your EquipShare account",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a;">Welcome to EquipShare, ${name}!</h2>
            <p style="color: #555;">Please verify your email address to activate your account. This link expires in <strong>24 hours</strong>.</p>
            <a href="${verificationUrl}"
               style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
              Verify Email
            </a>
            <p style="color:#888;margin-top:24px;font-size:13px;">
              Or copy this link into your browser:<br/>
              <span style="word-break:break-all;">${verificationUrl}</span>
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#aaa;font-size:12px;">If you did not create an account, you can safely ignore this email.</p>
          </body>
        </html>
      `,
    });
  }

  async sendBookingRequestEmail({
    to,
    lenderName,
    renterName,
    listingTitle,
    startDate,
    endDate,
    totalAmount,
    bookingId,
  }: BookingRequestEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `New Booking Request — ${listingTitle}`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1a1a1a;">Hi ${lenderName}, you have a new booking request!</h2>
          <p><strong>${renterName}</strong> wants to rent <strong>${listingTitle}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;border:1px solid #eee;">Dates</td><td style="padding:8px;border:1px solid #eee;">${startDate} → ${endDate}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;">Total</td><td style="padding:8px;border:1px solid #eee;">SAR ${totalAmount.toFixed(2)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;">Booking ID</td><td style="padding:8px;border:1px solid #eee;">${bookingId}</td></tr>
          </table>
          <p>Log in to EquipShare to approve or reject this request.</p>
        </body>`,
    });
  }

  async sendBookingApprovedEmail({
    to,
    renterName,
    listingTitle,
    startDate,
    endDate,
    subtotal,
    serviceFee,
    totalAmount,
  }: BookingApprovedEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `Booking Approved — ${listingTitle}`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#16a34a;">Your booking has been approved!</h2>
          <p>Hi ${renterName}, great news — your rental of <strong>${listingTitle}</strong> is confirmed.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;border:1px solid #eee;">Dates</td><td style="padding:8px;border:1px solid #eee;">${startDate} → ${endDate}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;">Subtotal</td><td style="padding:8px;border:1px solid #eee;">SAR ${subtotal.toFixed(2)}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee;">Service Fee (10%)</td><td style="padding:8px;border:1px solid #eee;">SAR ${serviceFee.toFixed(2)}</td></tr>
            <tr style="font-weight:bold;"><td style="padding:8px;border:1px solid #eee;">Total Charged</td><td style="padding:8px;border:1px solid #eee;">SAR ${totalAmount.toFixed(2)}</td></tr>
          </table>
          <p style="color:#555;">Your payment has been processed. Enjoy your rental!</p>
        </body>`,
    });
  }

  async sendBookingRejectedEmail({
    to,
    renterName,
    listingTitle,
    reason,
  }: BookingRejectedEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `Booking Rejected — ${listingTitle}`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#dc2626;">Your booking request was rejected</h2>
          <p>Hi ${renterName}, unfortunately your request to rent <strong>${listingTitle}</strong> was declined.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p style="color:#16a34a;"><strong>No payment was taken.</strong> Your card hold has been fully released.</p>
          <p>Browse other listings on EquipShare.</p>
        </body>`,
    });
  }

  async sendHandoverPromptEmail({
    to,
    renterName,
    listingTitle,
  }: HandoverPromptEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `Action Required — Confirm receipt of ${listingTitle}`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1a1a1a;">Please confirm you received the equipment</h2>
          <p>Hi ${renterName}, the lender has photographed and handed over <strong>${listingTitle}</strong>.</p>
          <p>Please open the EquipShare app, go to your active booking, and upload photos confirming receipt of the equipment in its current condition.</p>
          <p style="color:#555;font-size:13px;">These photos protect both you and the lender in case of any disputes.</p>
        </body>`,
    });
  }

  async sendReviewPromptEmail({
    to,
    renterName,
    listingTitle,
  }: ReviewPromptEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `How was your rental of ${listingTitle}?`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1a1a1a;">Your rental has ended — leave a review!</h2>
          <p>Hi ${renterName}, we hope your rental of <strong>${listingTitle}</strong> went well.</p>
          <p>Help the community by rating your experience. It only takes a minute.</p>
          <p>Log in to EquipShare → Rental History → Leave a Review.</p>
        </body>`,
    });
  }

  async sendDisputeFiledEmail({
    to,
    recipientName,
    disputeId,
    listingTitle,
    filedByName,
    description,
  }: DisputeFiledEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `Dispute Filed — Ticket #${disputeId}`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#c0392b;">A dispute has been filed</h2>
          <p>Hi ${recipientName},</p>
          <p><strong>${filedByName}</strong> has filed a dispute regarding the booking for <strong>${listingTitle}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Ticket ID</td><td style="padding:8px;">#${disputeId}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Description</td><td style="padding:8px;">${description.substring(0, 200)}${description.length > 200 ? "..." : ""}</td></tr>
          </table>
          <p>Our admin team will review the evidence and reach a decision. You will be notified once a ruling is made.</p>
          <p style="color:#555;font-size:13px;">If you have additional evidence, please contact support with the ticket ID.</p>
        </body>`,
    });
  }

  async sendDisputeResolvedEmail({
    to,
    recipientName,
    disputeId,
    listingTitle,
    ruling,
    rulingNote,
    refundAmount,
  }: DisputeResolvedEmailPayload): Promise<void> {
    const rulingLabel: Record<string, string> = {
      RenterResponsible: "Renter Responsible",
      LenderResponsible: "Lender Responsible",
      NoFaultFound: "No Fault Found",
    };
    const refundRow =
      refundAmount !== undefined
        ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Refund Issued</td><td style="padding:8px;">SAR ${refundAmount.toFixed(2)}</td></tr>`
        : "";

    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `Dispute Resolved — Ticket #${disputeId}`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#27ae60;">Dispute Resolved</h2>
          <p>Hi ${recipientName}, the dispute for <strong>${listingTitle}</strong> has been resolved.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Ticket ID</td><td style="padding:8px;">#${disputeId}</td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Ruling</td><td style="padding:8px;"><strong>${rulingLabel[ruling] ?? ruling}</strong></td></tr>
            <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Admin Note</td><td style="padding:8px;">${rulingNote}</td></tr>
            ${refundRow}
          </table>
          <p style="color:#555;font-size:13px;">This decision is final. If you have questions, please contact support with the ticket ID.</p>
        </body>`,
    });
  }

  async sendReportReceivedEmail({
    to,
    reporterName,
    listingTitle,
    reportId,
  }: ReportReceivedEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `Report Received — We're reviewing "${listingTitle}"`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1a1a1a;">Thank you for your report</h2>
          <p>Hi ${reporterName}, we've received your report about <strong>${listingTitle}</strong>.</p>
          <p>Our moderation team will review it and take appropriate action. Your report reference is <strong>#${reportId}</strong>.</p>
          <p style="color:#555;font-size:13px;">We take platform safety seriously. Thank you for helping keep EquipShare trustworthy.</p>
        </body>`,
    });
  }

  async sendListingWarningEmail({
    to,
    lenderName,
    listingTitle,
    reason,
  }: ListingWarningEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `Warning — Your listing "${listingTitle}" has been flagged`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#e67e22;">Platform Policy Warning</h2>
          <p>Hi ${lenderName},</p>
          <p>Your listing <strong>${listingTitle}</strong> has been reviewed by our moderation team and found to violate platform policies.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please update your listing to comply with our policies. Repeated violations may result in listing removal or account suspension.</p>
          <p style="color:#555;font-size:13px;">If you believe this is an error, please contact support.</p>
        </body>`,
    });
  }

  async sendListingRemovedEmail({
    to,
    lenderName,
    listingTitle,
    reason,
  }: ListingRemovedEmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject: `Your listing "${listingTitle}" has been removed`,
      html: `
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#c0392b;">Listing Removed</h2>
          <p>Hi ${lenderName},</p>
          <p>Your listing <strong>${listingTitle}</strong> has been removed from EquipShare for violating our platform policies.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If you believe this decision was made in error, please contact our support team.</p>
          <p style="color:#555;font-size:13px;">EquipShare reserves the right to remove content that endangers the community or violates our terms of service.</p>
        </body>`,
    });
  }
}
