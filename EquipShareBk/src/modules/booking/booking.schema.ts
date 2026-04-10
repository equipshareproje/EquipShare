import { Schema, model, Document, Types } from "mongoose";

export const BOOKING_STATUSES = [
  "Pending",
  "Approved",
  "Rejected",
  "Active",
  "Completed",
  "Cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface IBooking extends Document {
  renterId: Types.ObjectId;
  ownerId: Types.ObjectId;
  listingId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  dailyPrice: number;
  serviceFeeRate: number;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  status: BookingStatus;
  rejectionReason?: string;
  stripe: {
    paymentIntentId: string;
    clientSecret: string;
    chargeStatus: "hold" | "captured" | "released";
  };
  handover: {
    preRentalPhotos: string[];
    preRentalAt?: Date;
    receivedPhotos: string[];
    receivedAt?: Date;
    status: "pending" | "lender_done" | "completed";
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    renterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    dailyPrice: { type: Number, required: true },
    serviceFeeRate: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "Pending" },
    rejectionReason: { type: String },
    stripe: {
      paymentIntentId: { type: String, required: true },
      clientSecret: { type: String, required: true, select: false },
      chargeStatus: {
        type: String,
        enum: ["hold", "captured", "released"],
        default: "hold",
      },
    },
    handover: {
      preRentalPhotos: [{ type: String }],
      preRentalAt: { type: Date },
      receivedPhotos: [{ type: String }],
      receivedAt: { type: Date },
      status: {
        type: String,
        enum: ["pending", "lender_done", "completed"],
        default: "pending",
      },
    },
  },
  { timestamps: true },
);

bookingSchema.index({ renterId: 1 });
bookingSchema.index({ ownerId: 1 });
bookingSchema.index({ listingId: 1 });
bookingSchema.index({ status: 1, startDate: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

export const BookingModel = model<IBooking>("Booking", bookingSchema);
