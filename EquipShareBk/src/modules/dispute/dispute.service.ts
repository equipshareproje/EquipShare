import { AppError } from "../../shared/errors/AppError";
import { paymentService } from "../../shared/services/payment";
import { emailService } from "../../shared/services/email";
import * as disputeRepository from "./dispute.repository";
import * as bookingRepository from "../booking/booking.repository";
import { UserModel } from "../auth/auth.schema";
import { ListingModel } from "../listing/listing.schema";
import { DisputeRuling } from "./dispute.schema";

export interface FileDisputeDto {
  bookingId: string;
  description: string;
  evidenceUrls?: string[];
}

export interface ResolveDisputeDto {
  ruling: DisputeRuling;
  rulingNote: string;
  refundAmount?: number; // SAR — required when ruling is LenderResponsible
}

export const fileDispute = async (userId: string, dto: FileDisputeDto) => {
  const booking = await bookingRepository.findById(dto.bookingId);
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

  // extract ids from possibly-populated fields
  const toId = (f: unknown) =>
    (f as { _id?: unknown })?._id
      ? String((f as { _id: unknown })._id)
      : String(f);

  const isRenter = toId(booking.renterId) === userId;
  const isOwner = toId(booking.ownerId) === userId;

  if (!isRenter && !isOwner)
    throw new AppError("Not authorised", 403, "FORBIDDEN");

  if (!["Active", "Completed"].includes(booking.status))
    throw new AppError(
      "Disputes can only be filed on Active or Completed bookings",
      409,
      "CONFLICT",
    );

  const existing = await disputeRepository.findOpenByBooking(dto.bookingId);
  if (existing)
    throw new AppError(
      "An open dispute already exists for this booking",
      409,
      "CONFLICT",
    );

  const filedByRole = isRenter ? "Renter" : "Lender";

  const dispute = await disputeRepository.createDispute({
    bookingId: dto.bookingId as never,
    filedById: userId as never,
    filedByRole,
    description: dto.description,
    evidenceUrls: dto.evidenceUrls ?? [],
  });

  // Fetch both parties for notification
  const filer = await UserModel.findById(userId).select("name email");

  // Get listingId from populated or raw booking
  const listingId = (booking.listingId as { _id?: unknown })?._id
    ? String((booking.listingId as { _id: unknown })._id)
    : String(booking.listingId);

  const listing =
    await ListingModel.findById(listingId).select("title ownerId");

  const renterId = toId(booking.renterId);
  const ownerId = toId(booking.ownerId);

  const [renter, owner] = await Promise.all([
    UserModel.findById(renterId).select("name email"),
    UserModel.findById(ownerId).select("name email"),
  ]);

  const disputeId = String(dispute._id);
  const listingTitle = listing?.title ?? "Unknown listing";

  if (filer && renter && owner) {
    // Notify both parties
    await Promise.all([
      emailService.sendDisputeFiledEmail({
        to: renter.email,
        recipientName: renter.name,
        disputeId,
        listingTitle,
        filedByName: filer.name,
        description: dto.description,
      }),
      emailService.sendDisputeFiledEmail({
        to: owner.email,
        recipientName: owner.name,
        disputeId,
        listingTitle,
        filedByName: filer.name,
        description: dto.description,
      }),
    ]);
  }

  return dispute;
};

export const getDispute = async (
  disputeId: string,
  userId: string,
  userRoles: string[],
) => {
  const dispute = await disputeRepository.findById(disputeId);
  if (!dispute) throw new AppError("Dispute not found", 404, "NOT_FOUND");

  if (!userRoles.includes("Admin")) {
    const toId = (f: unknown) =>
      (f as { _id?: unknown })?._id
        ? String((f as { _id: unknown })._id)
        : String(f);
    const isFiledByMe = toId(dispute.filedById) === userId;
    if (!isFiledByMe) throw new AppError("Not authorised", 403, "FORBIDDEN");
  }

  return dispute;
};

export const getMyDisputes = (userId: string) =>
  disputeRepository.findInvolvedDisputes(userId);

export const listDisputes = (status?: string) =>
  disputeRepository.findAll({ status });

export const markUnderReview = async (disputeId: string) => {
  const dispute = await disputeRepository.findById(disputeId);
  if (!dispute) throw new AppError("Dispute not found", 404, "NOT_FOUND");
  if (dispute.status !== "Open")
    throw new AppError("Dispute is not Open", 409, "CONFLICT");

  return disputeRepository.updateDispute(disputeId, { status: "UnderReview" });
};

export const resolveDispute = async (
  adminId: string,
  disputeId: string,
  dto: ResolveDisputeDto,
) => {
  const dispute = await disputeRepository.findById(disputeId);
  if (!dispute) throw new AppError("Dispute not found", 404, "NOT_FOUND");
  if (dispute.status === "Resolved")
    throw new AppError("Dispute is already resolved", 409, "CONFLICT");

  if (dto.ruling === "LenderResponsible" && dto.refundAmount === undefined)
    throw new AppError(
      "refundAmount is required when ruling is LenderResponsible",
      400,
      "VALIDATION_ERROR",
    );

  // Get booking with paymentIntentId for potential refund
  const bookingId = (dispute.bookingId as { _id?: unknown })?._id
    ? String((dispute.bookingId as { _id: unknown })._id)
    : String(dispute.bookingId);

  const booking = await bookingRepository.findByIdWithSecret(bookingId);
  if (!booking) throw new AppError("Booking not found", 404, "NOT_FOUND");

  // Execute Stripe refund if lender is responsible
  if (dto.ruling === "LenderResponsible" && dto.refundAmount !== undefined) {
    const amountInHalalas = Math.round(dto.refundAmount * 100);
    await paymentService.issueRefund(
      booking.stripe.paymentIntentId,
      amountInHalalas,
    );
  }

  await disputeRepository.updateDispute(disputeId, {
    status: "Resolved",
    ruling: dto.ruling,
    rulingNote: dto.rulingNote,
    refundAmount: dto.refundAmount,
    resolvedById: adminId as never,
    resolvedAt: new Date(),
  });

  // Notify both parties
  const listingId = (booking.listingId as { _id?: unknown })?._id
    ? String((booking.listingId as { _id: unknown })._id)
    : String(booking.listingId);

  const listing = await ListingModel.findById(listingId).select("title");
  const [renter, owner] = await Promise.all([
    UserModel.findById(booking.renterId).select("name email"),
    UserModel.findById(booking.ownerId).select("name email"),
  ]);

  const listingTitle = listing?.title ?? "Unknown listing";

  if (renter && owner) {
    await Promise.all([
      emailService.sendDisputeResolvedEmail({
        to: renter.email,
        recipientName: renter.name,
        disputeId,
        listingTitle,
        ruling: dto.ruling,
        rulingNote: dto.rulingNote,
        refundAmount: dto.refundAmount,
      }),
      emailService.sendDisputeResolvedEmail({
        to: owner.email,
        recipientName: owner.name,
        disputeId,
        listingTitle,
        ruling: dto.ruling,
        rulingNote: dto.rulingNote,
        refundAmount: dto.refundAmount,
      }),
    ]);
  }
};
