import { AppError } from "../../shared/errors/AppError";
import { paymentService } from "../../shared/services/payment";
import { emailService } from "../../shared/services/email";
import { storageService } from "../../shared/services/storage";
import { env } from "../../config/env";
import * as bookingRepository from "./booking.repository";
import * as listingRepository from "../listing/listing.repository";
import { UserModel } from "../auth/auth.schema";
import { ListingModel } from "../listing/listing.schema";

export interface CreateBookingDto {
  listingId: string;
  startDate: string;
  endDate: string;
}

const diffDays = (start: Date, end: Date) =>
  Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

const formatDate = (d: Date) => d.toISOString().split("T")[0];

export const createBooking = async (
  renterId: string,
  dto: CreateBookingDto,
) => {
  const startDate = new Date(dto.startDate);
  const endDate = new Date(dto.endDate);
  const now = new Date();

  if (startDate <= now)
    throw new AppError(
      "Start date must be in the future",
      400,
      "VALIDATION_ERROR",
    );
  if (endDate <= startDate)
    throw new AppError(
      "End date must be after start date",
      400,
      "VALIDATION_ERROR",
    );

  const listing = await listingRepository.findById(dto.listingId);

  if (!listing || listing.status !== "Active") {
    throw new AppError("Listing not found or not available", 404, "NOT_FOUND");
  }

  if (String(listing.ownerId) === renterId) {
    throw new AppError(
      "You cannot book your own listing",
      400,
      "VALIDATION_ERROR",
    );
  }

  const conflict = await bookingRepository.hasDateConflict(
    dto.listingId,
    startDate,
    endDate,
  );

  if (conflict) {
    throw new AppError("These dates are not available", 409, "DATE_CONFLICT");
  }

  const totalDays = diffDays(startDate, endDate);
  const serviceFeeRate = env.PLATFORM_SERVICE_FEE_RATE;
  const subtotal = listing.dailyPrice * totalDays;
  const serviceFee = Math.round(subtotal * serviceFeeRate * 100) / 100;
  const totalAmount = subtotal + serviceFee;
  const amountInHalalas = Math.round(totalAmount * 100);

  const renter = await UserModel.findById(renterId).select("name email");
  if (!renter) throw new AppError("User not found", 404, "NOT_FOUND");

  const owner = await UserModel.findById(listing.ownerId).select("name email");
  if (!owner) throw new AppError("Owner not found", 404, "NOT_FOUND");

  const { paymentIntentId, clientSecret } = await paymentService.createHold({
    amount: amountInHalalas,
    currency: "sar",
    metadata: { renterId, listingId: dto.listingId },
  });

  const booking = await bookingRepository.createBooking({
    renterId: renterId as never,
    ownerId: String(listing.ownerId) as never,
    listingId: dto.listingId as never,
    startDate,
    endDate,
    totalDays,
    dailyPrice: listing.dailyPrice,
    serviceFeeRate,
    subtotal,
    serviceFee,
    totalAmount,
    stripe: { paymentIntentId, clientSecret, chargeStatus: "hold" },
    handover: { preRentalPhotos: [], receivedPhotos: [], status: "pending" },
  });

  await emailService.sendBookingRequestEmail({
    to: owner.email,
    lenderName: owner.name,
    renterName: renter.name,
    listingTitle: listing.title,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    totalAmount,
    bookingId: String(booking._id),
  });

  return { bookingId: String(booking._id), clientSecret };
};

export const getBooking = async (bookingId: string, userId: string) => {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

  // renterId / ownerId may be populated objects — extract _id in either case
  const toId = (field: unknown) =>
    (field as { _id?: unknown })?._id
      ? String((field as { _id: unknown })._id)
      : String(field);

  if (toId(booking.renterId) !== userId && toId(booking.ownerId) !== userId) {
    throw new AppError("Not authorised", 403, "FORBIDDEN");
  }
  return booking;
};

export const getMyRentingBookings = (renterId: string) =>
  bookingRepository.findByRenter(renterId);

export const getMyLendingBookings = (ownerId: string) =>
  bookingRepository.findByOwner(ownerId);

export const approveBooking = async (bookingId: string, ownerId: string) => {
  const booking = await bookingRepository.findByIdWithSecret(bookingId);
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (String(booking.ownerId) !== ownerId)
    throw new AppError("Not authorised", 403, "FORBIDDEN");
  if (booking.status !== "Pending")
    throw new AppError("Booking is no longer pending", 409, "CONFLICT");

  await paymentService.captureHold(booking.stripe.paymentIntentId);

  await bookingRepository.updateBooking(bookingId, {
    status: "Approved",
    "stripe.chargeStatus": "captured" as never,
  });

  // Lock the dates on the listing
  const dates: Date[] = [];
  const curr = new Date(booking.startDate);
  while (curr <= booking.endDate) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }
  await ListingModel.findByIdAndUpdate(booking.listingId, {
    $addToSet: { blockedDates: { $each: dates } },
  });

  const renter = await UserModel.findById(booking.renterId).select(
    "name email",
  );
  const listing = await listingRepository.findById(String(booking.listingId));
  if (renter && listing) {
    await emailService.sendBookingApprovedEmail({
      to: renter.email,
      renterName: renter.name,
      listingTitle: listing.title,
      startDate: formatDate(booking.startDate),
      endDate: formatDate(booking.endDate),
      subtotal: booking.subtotal,
      serviceFee: booking.serviceFee,
      totalAmount: booking.totalAmount,
    });
  }
};

export const rejectBooking = async (
  bookingId: string,
  ownerId: string,
  reason?: string,
) => {
  const booking = await bookingRepository.findByIdWithSecret(bookingId);
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (String(booking.ownerId) !== ownerId)
    throw new AppError("Not authorised", 403, "FORBIDDEN");
  if (booking.status !== "Pending")
    throw new AppError("Booking is no longer pending", 409, "CONFLICT");

  await paymentService.cancelHold(booking.stripe.paymentIntentId);

  await bookingRepository.updateBooking(bookingId, {
    status: "Rejected",
    rejectionReason: reason,
    "stripe.chargeStatus": "released" as never,
  });

  const renter = await UserModel.findById(booking.renterId).select(
    "name email",
  );
  const listing = await listingRepository.findById(String(booking.listingId));
  if (renter && listing) {
    await emailService.sendBookingRejectedEmail({
      to: renter.email,
      renterName: renter.name,
      listingTitle: listing.title,
      reason,
    });
  }
};

export const uploadPreRentalPhotos = async (
  bookingId: string,
  ownerId: string,
  files: Express.Multer.File[],
) => {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (String(booking.ownerId) !== ownerId)
    throw new AppError("Not authorised", 403, "FORBIDDEN");
  if (booking.status !== "Approved")
    throw new AppError(
      "Booking must be Approved for handover",
      409,
      "CONFLICT",
    );
  if (files.length < 3)
    throw new AppError(
      "Minimum 3 photos required for handover",
      400,
      "VALIDATION_ERROR",
    );

  const urls = await Promise.all(
    files.map((f) =>
      storageService.uploadFile({
        buffer: f.buffer,
        originalName: f.originalname,
        mimeType: f.mimetype,
        folder: `handovers/${bookingId}/pre`,
      }),
    ),
  );

  await bookingRepository.updateBooking(bookingId, {
    "handover.preRentalPhotos": urls as never,
    "handover.preRentalAt": new Date() as never,
    "handover.status": "lender_done" as never,
  });

  const renter = await UserModel.findById(booking.renterId).select(
    "name email",
  );
  const listing = await listingRepository.findById(String(booking.listingId));
  if (renter && listing) {
    await emailService.sendHandoverPromptEmail({
      to: renter.email,
      renterName: renter.name,
      listingTitle: listing.title,
      bookingId,
    });
  }

  return { urls };
};

export const uploadReceivedPhotos = async (
  bookingId: string,
  renterId: string,
  files: Express.Multer.File[],
) => {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");
  if (String(booking.renterId) !== renterId)
    throw new AppError("Not authorised", 403, "FORBIDDEN");
  if (booking.handover.status !== "lender_done") {
    throw new AppError(
      "Lender must complete pre-rental photos first",
      409,
      "CONFLICT",
    );
  }

  const urls = await Promise.all(
    files.map((f) =>
      storageService.uploadFile({
        buffer: f.buffer,
        originalName: f.originalname,
        mimeType: f.mimetype,
        folder: `handovers/${bookingId}/received`,
      }),
    ),
  );

  await bookingRepository.updateBooking(bookingId, {
    "handover.receivedPhotos": urls as never,
    "handover.receivedAt": new Date() as never,
    "handover.status": "completed" as never,
    status: "Active",
  });

  return { urls };
};
