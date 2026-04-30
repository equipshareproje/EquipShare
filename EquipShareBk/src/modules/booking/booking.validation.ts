import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    listingId: z.string().min(1),
    startDate: z
      .string()
      .datetime({
        message: "startDate must be ISO 8601 (e.g. 2026-05-01T00:00:00.000Z)",
      }),
    endDate: z
      .string()
      .datetime({
        message: "endDate must be ISO 8601 (e.g. 2026-05-05T00:00:00.000Z)",
      }),
  }),
});

export const rejectBookingSchema = z.object({
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});
