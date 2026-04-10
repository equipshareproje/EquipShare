import { z } from "zod";
import { LISTING_CATEGORIES, LISTING_CONDITIONS } from "./listing.schema";

export const createListingSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    category: z.enum(LISTING_CATEGORIES),
    description: z.string().min(10).max(2000),
    specifications: z.string().max(1000).optional(),
    condition: z.enum(LISTING_CONDITIONS),
    dailyPrice: z.coerce.number().positive(),
    photos: z.array(z.string().url()).min(1, "At least one photo is required"),
    blockedDates: z.array(z.string().datetime()).optional(),
  }),
});

export const updateListingSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    category: z.enum(LISTING_CATEGORIES).optional(),
    description: z.string().min(10).max(2000).optional(),
    specifications: z.string().max(1000).optional(),
    condition: z.enum(LISTING_CONDITIONS).optional(),
    dailyPrice: z.coerce.number().positive().optional(),
    photos: z.array(z.string().url()).min(1).optional(),
    blockedDates: z.array(z.string().datetime()).optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
  }),
});

export const marketplaceQuerySchema = z.object({
  query: z.object({
    category: z.enum(LISTING_CATEGORIES).optional(),
    condition: z.enum(LISTING_CONDITIONS).optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    search: z.string().optional(),
    availableFrom: z.string().datetime().optional(),
    availableTo: z.string().datetime().optional(),
    trustedCircleOnly: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
});
