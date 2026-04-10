import { z } from "zod";

export const createCircleSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(10).max(500),
    eligibilityCriteria: z.string().trim().min(10).max(500),
    emailDomainRule: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^\.[a-z]{2,}(\.[a-z]{2,})*$/, {
        message: "Must be a domain suffix like .kaust.edu.sa",
      })
      .optional(),
  }),
});
