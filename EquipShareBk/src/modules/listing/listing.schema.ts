import { Schema, model, Document, Types } from "mongoose";

export const LISTING_CATEGORIES = [
  "Power Tools",
  "Hand Tools",
  "Cameras & Photography",
  "Audio & Video",
  "Vehicles",
  "Construction",
  "Outdoor & Sports",
  "Electronics",
  "Other",
] as const;

export const LISTING_CONDITIONS = ["New", "Like New", "Good", "Fair"] as const;

export const LISTING_STATUSES = ["Active", "Inactive", "Deleted"] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export interface IListing extends Document {
  ownerId: Types.ObjectId;
  title: string;
  category: ListingCategory;
  description: string;
  specifications?: string;
  condition: ListingCondition;
  dailyPrice: number;
  photos: string[];
  status: ListingStatus;
  blockedDates: Date[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    category: {
      type: String,
      enum: LISTING_CATEGORIES,
      required: true,
    },
    description: { type: String, required: true, maxlength: 2000 },
    specifications: { type: String, maxlength: 1000 },
    condition: {
      type: String,
      enum: LISTING_CONDITIONS,
      required: true,
    },
    dailyPrice: { type: Number, required: true, min: 0.01 },
    photos: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: "At least one photo is required",
      },
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: "Active",
    },
    blockedDates: [{ type: Date }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

listingSchema.index({ ownerId: 1 });
listingSchema.index({ status: 1, category: 1 });
listingSchema.index({ title: "text", description: "text" });

export const ListingModel = model<IListing>("Listing", listingSchema);
