import { Schema, model, Document, Types } from "mongoose";

export const DISPUTE_STATUSES = ["Open", "UnderReview", "Resolved"] as const;
export const DISPUTE_RULINGS = [
  "RenterResponsible",
  "LenderResponsible",
  "NoFaultFound",
] as const;

export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];
export type DisputeRuling = (typeof DISPUTE_RULINGS)[number];

export interface IDispute extends Document {
  bookingId: Types.ObjectId;
  filedById: Types.ObjectId;
  filedByRole: "Renter" | "Lender";
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  ruling?: DisputeRuling;
  rulingNote?: string;
  refundAmount?: number;
  resolvedById?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    filedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filedByRole: { type: String, enum: ["Renter", "Lender"], required: true },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
    },
    evidenceUrls: { type: [String], default: [] },
    status: { type: String, enum: DISPUTE_STATUSES, default: "Open" },
    ruling: { type: String, enum: DISPUTE_RULINGS },
    rulingNote: { type: String, maxlength: 1000 },
    refundAmount: { type: Number, min: 0 },
    resolvedById: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

disputeSchema.index({ bookingId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ filedById: 1 });

export const DisputeModel = model<IDispute>("Dispute", disputeSchema);
