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
}
