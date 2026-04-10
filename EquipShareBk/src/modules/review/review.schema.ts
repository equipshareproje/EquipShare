import { Schema, model, Document, Types } from "mongoose";

export interface IReview extends Document {
  bookingId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  revieweeId: Types.ObjectId;
  listingId: Types.ObjectId;
  starRating: number;
  equipmentCondition: number;
  lenderReliability: number;
  comment?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    starRating: { type: Number, required: true, min: 1, max: 5 },
    equipmentCondition: { type: Number, required: true, min: 1, max: 5 },
    lenderReliability: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

reviewSchema.index({ revieweeId: 1 });
reviewSchema.index({ listingId: 1 });

export const ReviewModel = model<IReview>("Review", reviewSchema);
