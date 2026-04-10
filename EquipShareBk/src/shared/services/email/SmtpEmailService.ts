import nodemailer from "nodemailer";
import { env } from "@config/env";
import { IEmailService, VerificationEmailPayload } from "./IEmailService";

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
}
