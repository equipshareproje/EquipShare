import { AppError } from "../../shared/errors/AppError";
import { emailService } from "../../shared/services/email";
import * as reportRepository from "./report.repository";
import { UserModel } from "../auth/auth.schema";
import { ListingModel } from "../listing/listing.schema";
import { ModerationAction } from "./report.schema";

export interface FileReportDto {
  listingId: string;
  reason: string;
  description: string;
}

export interface ResolveReportDto {
  action: ModerationAction;
  note?: string;
}

export const fileReport = async (userId: string, dto: FileReportDto) => {
  const listing = await ListingModel.findById(dto.listingId).select(
    "title status ownerId",
  );

  if (!listing || listing.status === "Deleted")
    throw new AppError("Listing not found", 404, "NOT_FOUND");

  if (String(listing.ownerId) === userId)
    throw new AppError(
      "You cannot report your own listing",
      400,
      "VALIDATION_ERROR",
    );

  const existing = await reportRepository.findOpenByUserAndListing(
    userId,
    dto.listingId,
  );
  if (existing)
    throw new AppError(
      "You already have an open report for this listing",
      409,
      "CONFLICT",
    );

  const report = await reportRepository.createReport({
    listingId: dto.listingId as never,
    reportedById: userId as never,
    reason: dto.reason as never,
    description: dto.description,
  });

  const reporter = await UserModel.findById(userId).select("name email");
  if (reporter) {
    await emailService.sendReportReceivedEmail({
      to: reporter.email,
      reporterName: reporter.name,
      listingTitle: listing.title,
      reportId: String(report._id),
    });
  }

  return report;
};

export const getReport = (reportId: string) =>
  reportRepository.findById(reportId).then((r) => {
    if (!r) throw new AppError("Report not found", 404, "NOT_FOUND");
    return r;
  });

export const getMyReports = (userId: string) =>
  reportRepository.findByReporter(userId);

export const listReports = (status?: string, listingId?: string) =>
  reportRepository.findAll({ status, listingId });

export const markReportUnderReview = async (
  adminId: string,
  reportId: string,
) => {
  const report = await reportRepository.findById(reportId);
  if (!report) throw new AppError("Report not found", 404, "NOT_FOUND");
  if (report.status !== "Open")
    throw new AppError("Report is not Open", 409, "CONFLICT");

  await reportRepository.updateReport(reportId, { status: "UnderReview" });
  await reportRepository.pushAuditEntry(reportId, {
    action: "MarkedUnderReview",
    performedById: adminId as never,
    timestamp: new Date(),
  });

  return reportRepository.findById(reportId);
};

export const resolveReport = async (
  adminId: string,
  reportId: string,
  dto: ResolveReportDto,
) => {
  const report = await reportRepository.findById(reportId);
  if (!report) throw new AppError("Report not found", 404, "NOT_FOUND");
  if (report.status === "Resolved")
    throw new AppError("Report is already resolved", 409, "CONFLICT");

  // Get listing and lender
  const listingId = (report.listingId as { _id?: unknown })?._id
    ? String((report.listingId as { _id: unknown })._id)
    : String(report.listingId);

  const listing = await ListingModel.findById(listingId).select(
    "title ownerId status",
  );
  if (!listing) throw new AppError("Listing not found", 404, "NOT_FOUND");

  const lender = await UserModel.findById(listing.ownerId).select("name email");

  // Execute action
  if (dto.action === "RemoveListing") {
    await ListingModel.findByIdAndUpdate(listingId, { status: "Deleted" });
    if (lender) {
      await emailService.sendListingRemovedEmail({
        to: lender.email,
        lenderName: lender.name,
        listingTitle: listing.title,
        reason: dto.note ?? "Violation of platform policies",
      });
    }
  } else if (dto.action === "WarnLender") {
    if (lender) {
      await emailService.sendListingWarningEmail({
        to: lender.email,
        lenderName: lender.name,
        listingTitle: listing.title,
        reason: dto.note ?? "Violation of platform policies",
      });
    }
  }
  // Dismiss — no email to lender

  // Append audit entry
  await reportRepository.pushAuditEntry(reportId, {
    action: dto.action,
    performedById: adminId as never,
    note: dto.note,
    timestamp: new Date(),
  });

  // Resolve the report
  await reportRepository.updateReport(reportId, {
    status: "Resolved",
    adminAction: dto.action,
    adminNote: dto.note,
    resolvedById: adminId as never,
    resolvedAt: new Date(),
  });
};
