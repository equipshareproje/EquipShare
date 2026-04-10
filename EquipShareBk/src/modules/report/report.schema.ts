import { Schema, model, Document, Types } from "mongoose";

export const REPORT_REASONS = [
  "Scam",
  "FakePhotos",
  "InappropriateContent",
  "Overpriced",
  "MisleadingDescription",
  "Other",
] as const;

export const MODERATION_ACTIONS = [
  "Dismiss",
  "WarnLender",
  "RemoveListing",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

export interface IAuditEntry {
  action: string;
  performedById: Types.ObjectId;
  note?: string;
  timestamp: Date;
}

export interface IReport extends Document {
  listingId: Types.ObjectId;
  reportedById: Types.ObjectId;
  reason: ReportReason;
  description: string;
  status: "Open" | "UnderReview" | "Resolved";
  adminAction?: ModerationAction;
  adminNote?: string;
  resolvedById?: Types.ObjectId;
  resolvedAt?: Date;
  auditLog: IAuditEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const auditEntrySchema = new Schema<IAuditEntry>(
  {
    action: { type: String, required: true },
    performedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String },
    timestamp: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const reportSchema = new Schema<IReport>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    reportedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["Open", "UnderReview", "Resolved"],
      default: "Open",
    },
    adminAction: { type: String, enum: MODERATION_ACTIONS },
    adminNote: { type: String, maxlength: 500 },
    resolvedById: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
    auditLog: { type: [auditEntrySchema], default: [] },
  },
  { timestamps: true },
);

reportSchema.index({ listingId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reportedById: 1 });

export const ReportModel = model<IReport>("Report", reportSchema);
