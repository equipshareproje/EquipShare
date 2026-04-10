import { Types } from "mongoose";
import { ReportModel, IReport, IAuditEntry } from "./report.schema";

export const createReport = (data: Partial<IReport>) =>
  ReportModel.create(data);

export const findById = (id: string) =>
  ReportModel.findById(id)
    .populate("listingId", "title photos status ownerId")
    .populate("reportedById", "name email")
    .populate("resolvedById", "name email");

export const findByReporter = (userId: string) =>
  ReportModel.find({ reportedById: new Types.ObjectId(userId) })
    .populate("listingId", "title photos status")
    .sort({ createdAt: -1 });

export const findAll = (
  filter: { status?: string; listingId?: string } = {},
) => {
  const query: Record<string, unknown> = {};
  if (filter.status) query.status = filter.status;
  if (filter.listingId) query.listingId = new Types.ObjectId(filter.listingId);
  return ReportModel.find(query)
    .populate("listingId", "title photos status")
    .populate("reportedById", "name email")
    .sort({ createdAt: -1 });
};

export const findOpenByUserAndListing = (userId: string, listingId: string) =>
  ReportModel.findOne({
    reportedById: new Types.ObjectId(userId),
    listingId: new Types.ObjectId(listingId),
    status: { $in: ["Open", "UnderReview"] },
  });

export const updateReport = (
  id: string,
  data: Partial<IReport> | Record<string, unknown>,
) => ReportModel.findByIdAndUpdate(id, data, { new: true });

export const pushAuditEntry = (id: string, entry: IAuditEntry) =>
  ReportModel.findByIdAndUpdate(
    id,
    { $push: { auditLog: entry } },
    { new: true },
  );
