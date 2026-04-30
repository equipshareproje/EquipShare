import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    starRating: z.coerce.number().int().min(1).max(5),
    equipmentCondition: z.coerce.number().int().min(1).max(5),
    lenderReliability: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  }),
});
