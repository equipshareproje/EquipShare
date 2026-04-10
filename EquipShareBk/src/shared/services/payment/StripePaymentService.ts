import Stripe from "stripe";
import { env } from "@config/env";
import { IPaymentService, CreatePaymentHoldResult } from "./IPaymentService";

export class StripePaymentService implements IPaymentService {
  private _stripe: InstanceType<typeof Stripe> | null = null;

  private get stripe(): InstanceType<typeof Stripe> {
    if (!this._stripe) {
      this._stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-03-25.dahlia",
      });
    }
    return this._stripe;
  }

  async createHold(options: {
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  }): Promise<CreatePaymentHoldResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: options.amount,
      currency: options.currency,
      capture_method: "manual", // authorize only — do NOT charge yet
      metadata: options.metadata,
    });

    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret!,
    };
  }

  async captureHold(paymentIntentId: string): Promise<void> {
    await this.stripe.paymentIntents.capture(paymentIntentId);
  }

  async cancelHold(paymentIntentId: string): Promise<void> {
    await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  async issueRefund(
    paymentIntentId: string,
    amountInHalalas: number,
  ): Promise<void> {
    await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountInHalalas,
    });
  }
}
