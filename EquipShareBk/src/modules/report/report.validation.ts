import { z } from "zod";
import { REPORT_REASONS, MODERATION_ACTIONS } from "./report.schema";

export const fileReportSchema = z.object({
  body: z.object({
    listingId: z.string().min(1, "listingId is required"),
    reason: z.enum(REPORT_REASONS),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(1000, "Description must be at most 1000 characters"),
  }),
});

export const resolveReportSchema = z.object({
  body: z.object({
    action: z.enum(MODERATION_ACTIONS),
    note: z.string().max(500).optional(),
  }),
});
