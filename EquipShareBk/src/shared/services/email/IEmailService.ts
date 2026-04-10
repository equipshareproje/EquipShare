export interface VerificationEmailPayload {
  to: string;
  name: string;
  verificationUrl: string;
}

export interface IEmailService {
  sendVerificationEmail(payload: VerificationEmailPayload): Promise<void>;
}
