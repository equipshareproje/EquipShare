export interface CreatePaymentHoldResult {
  paymentIntentId: string;
  clientSecret: string;
}

export interface IPaymentService {
  createHold(options: {
    amount: number; // in smallest currency unit (halalas)
    currency: string;
    metadata: Record<string, string>;
  }): Promise<CreatePaymentHoldResult>;

  captureHold(paymentIntentId: string): Promise<void>;

  cancelHold(paymentIntentId: string): Promise<void>;
}
