import { AppError } from "../../shared/errors/AppError";
import { UserModel } from "../auth/auth.schema";
import { BookingModel } from "../booking/booking.schema";
import * as reviewRepository from "./review.repository";

export interface CreateReviewDto {
  bookingId: string;
  starRating: number;
  equipmentCondition: number;
  lenderReliability: number;
  comment?: string;
}

export const createReview = async (
  reviewerId: string,
  dto: CreateReviewDto,
) => {
  const booking = await BookingModel.findById(dto.bookingId);
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (String(booking.renterId) !== reviewerId) {
    throw new AppError(
      "Only the renter can review this booking",
      403,
      "FORBIDDEN",
    );
  }
  if (booking.status !== "Completed") {
    throw new AppError(
      "Booking must be Completed before leaving a review",
      409,
      "CONFLICT",
    );
  }

  const existing = await reviewRepository.findByBooking(dto.bookingId);
  if (existing)
    throw new AppError(
      "You have already reviewed this booking",
      409,
      "CONFLICT",
    );

  const review = await reviewRepository.createReview({
    bookingId: dto.bookingId as never,
    reviewerId: reviewerId as never,
    revieweeId: String(booking.ownerId) as never,
    listingId: String(booking.listingId) as never,
    starRating: dto.starRating,
    equipmentCondition: dto.equipmentCondition,
    lenderReliability: dto.lenderReliability,
    comment: dto.comment,
  });

  // Recalculate lender's average rating
  const lender = await UserModel.findById(booking.ownerId).select(
    "rating reviewCount",
  );
  if (lender) {
    const newCount = lender.reviewCount + 1;
    const newAvg =
      Math.round(
        ((lender.rating * lender.reviewCount + dto.starRating) / newCount) * 10,
      ) / 10;
    await UserModel.findByIdAndUpdate(booking.ownerId, {
      rating: newAvg,
      reviewCount: newCount,
    });
  }

  return review;
};

export const getReviewsByUser = (userId: string) =>
  reviewRepository.findByReviewee(userId);

export const getReviewsByListing = (listingId: string) =>
  reviewRepository.findByListing(listingId);
