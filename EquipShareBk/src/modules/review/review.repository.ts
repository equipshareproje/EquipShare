import { Types } from "mongoose";
import { ReviewModel, IReview } from "./review.schema";

export const createReview = (data: Partial<IReview>) =>
  ReviewModel.create(data);

export const findByBooking = (bookingId: string) =>
  ReviewModel.findOne({ bookingId: new Types.ObjectId(bookingId) });

export const findByReviewee = (revieweeId: string) =>
  ReviewModel.find({ revieweeId: new Types.ObjectId(revieweeId) })
    .populate("reviewerId", "name avatar")
    .populate("listingId", "title")
    .sort({ createdAt: -1 });

export const findByListing = (listingId: string) =>
  ReviewModel.find({ listingId: new Types.ObjectId(listingId) })
    .populate("reviewerId", "name avatar")
    .sort({ createdAt: -1 });
