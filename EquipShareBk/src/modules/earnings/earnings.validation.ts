import { z } from "zod";

// All earnings routes are GET except requestPayout (POST, no body)
// This file holds query schemas for the transaction filter

export const transactionQuerySchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    listingId: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});
