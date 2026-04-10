import { Schema, model, Document, Types } from "mongoose";

export const PAYOUT_STATUSES = [
  "Pending",
  "Processing",
  "Paid",
  "Failed",
] as const;

export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export interface IPayoutRequest extends Document {
  lenderId: Types.ObjectId;
  amount: number; // SAR
  status: PayoutStatus;
  requestedAt: Date;
  processedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const payoutSchema = new Schema<IPayoutRequest>(
  {
    lenderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: PAYOUT_STATUSES, default: "Pending" },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true },
);

payoutSchema.index({ lenderId: 1, status: 1 });

export const PayoutModel = model<IPayoutRequest>("Payout", payoutSchema);
