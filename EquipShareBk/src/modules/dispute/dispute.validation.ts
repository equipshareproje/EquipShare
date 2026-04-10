import { z } from "zod";
import { DISPUTE_RULINGS } from "./dispute.schema";

export const fileDisputeSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be at most 2000 characters"),
  evidenceUrls: z.array(z.string().url()).max(10).optional(),
});

export const resolveDisputeSchema = z
  .object({
    ruling: z.enum(DISPUTE_RULINGS),
    rulingNote: z
      .string()
      .min(10, "Ruling note must be at least 10 characters")
      .max(1000),
    refundAmount: z.number().positive().optional(),
  })
  .refine(
    (d) => d.ruling !== "LenderResponsible" || d.refundAmount !== undefined,
    {
      message: "refundAmount is required when ruling is LenderResponsible",
      path: ["refundAmount"],
    },
  );
