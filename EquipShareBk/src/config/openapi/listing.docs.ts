import { registry, ApiSuccess, ApiError, z } from "./registry";

// ── Listing shared schema ──────────────────────────────────────────────────

const ListingSchema = z
  .object({
    _id: z.string(),
    ownerId: z.string(),
    title: z.string(),
    category: z.string(),
    description: z.string(),
    specifications: z.string().optional(),
    condition: z.string(),
    dailyPrice: z.number(),
    photos: z.array(z.string().url()),
    status: z.enum(["Active", "Inactive", "Deleted"]),
    blockedDates: z.array(z.string()),
    rating: z.number(),
    reviewCount: z.number(),
    createdAt: z.string(),
  })
  .openapi("Listing");

// ── Listing endpoints ──────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/listings/upload-photo",
  tags: ["Listings"],
  summary: "Upload a single listing photo",
  description:
    "Upload one image (multipart/form-data, field name: `photo`, max 10 MB). Returns the Azure Blob URL. Collect URLs, then POST to `/api/listings` with the `photos` array.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z
            .object({ photo: z.any().openapi({ format: "binary" }) })
            .openapi("UploadPhotoBody"),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Photo uploaded",
      content: {
        "application/json": {
          schema: ApiSuccess(
            z.object({ url: z.string().url() }).openapi("UploadPhotoResponse"),
          ),
        },
      },
    },
    400: {
      description: "No file provided",
      content: { "application/json": { schema: ApiError } },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/listings",
  tags: ["Listings"],
  summary: "Create a new listing",
  description:
    "Creates an equipment listing. Upload photos first via `/api/listings/upload-photo`, then include the returned URLs in the `photos` array here.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              title: z
                .string()
                .min(3)
                .max(100)
                .openapi({ example: "Nikon D7500 DSLR Camera" }),
              category: z.enum([
                "Power Tools",
                "Hand Tools",
                "Cameras & Photography",
                "Audio & Video",
                "Vehicles",
                "Construction",
                "Outdoor & Sports",
                "Electronics",
                "Other",
              ]),
              description: z.string().min(10).max(2000),
              specifications: z.string().max(1000).optional(),
              condition: z.enum(["New", "Like New", "Good", "Fair"]),
              dailyPrice: z.number().positive().openapi({ example: 150 }),
              photos: z
                .array(z.string().url())
                .min(1)
                .openapi({
                  example: [
                    "https://storage.blob.core.windows.net/listings/abc.jpg",
                  ],
                }),
              blockedDates: z.array(z.string().datetime()).optional(),
            })
            .openapi("CreateListingBody"),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Listing created",
      content: { "application/json": { schema: ApiSuccess(ListingSchema) } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ApiError } },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/listings",
  tags: ["Listings"],
  summary: "Browse marketplace (public)",
  description:
    "Returns paginated active listings. All query params are optional. Pass a Bearer token to enable `trustedCircleOnly` filtering.",
  request: {
    query: z.object({
      category: z
        .string()
        .optional()
        .openapi({ example: "Cameras & Photography" }),
      condition: z.string().optional().openapi({ example: "Good" }),
      minPrice: z.coerce.number().optional().openapi({ example: 50 }),
      maxPrice: z.coerce.number().optional().openapi({ example: 500 }),
      search: z.string().optional().openapi({ example: "camera tripod" }),
      availableFrom: z.string().optional().openapi({
        description: "ISO date — exclude listings with blocked dates in range",
        example: "2026-06-01T00:00:00.000Z",
      }),
      availableTo: z.string().optional().openapi({
        example: "2026-06-05T00:00:00.000Z",
      }),
      trustedCircleOnly: z.enum(["true", "false"]).optional().openapi({
        description:
          "When true (and token present), returns only listings from lenders in your Trusted Circles",
        example: "false",
      }),
      page: z.coerce.number().default(1).openapi({ example: 1 }),
      limit: z.coerce.number().default(12).openapi({ example: 12 }),
    }),
  },
  responses: {
    200: {
      description: "Paginated listings",
      content: {
        "application/json": {
          schema: ApiSuccess(
            z
              .object({
                listings: z.array(ListingSchema),
                meta: z.object({
                  total: z.number(),
                  page: z.number(),
                  limit: z.number(),
                  totalPages: z.number(),
                }),
              })
              .openapi("MarketplaceResponse"),
          ),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/listings/my",
  tags: ["Listings"],
  summary: "Get my listings",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Owner's listings",
      content: {
        "application/json": { schema: ApiSuccess(z.array(ListingSchema)) },
      },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/listings/{id}",
  tags: ["Listings"],
  summary: "Get single listing (public)",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Listing detail",
      content: { "application/json": { schema: ApiSuccess(ListingSchema) } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/listings/{id}",
  tags: ["Listings"],
  summary: "Update listing (owner only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              title: z.string().optional(),
              category: z.string().optional(),
              description: z.string().optional(),
              condition: z.string().optional(),
              dailyPrice: z.number().optional(),
              photos: z.array(z.string().url()).optional(),
              status: z.enum(["Active", "Inactive"]).optional(),
              blockedDates: z.array(z.string().datetime()).optional(),
            })
            .openapi("UpdateListingBody"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated listing",
      content: { "application/json": { schema: ApiSuccess(ListingSchema) } },
    },
    403: {
      description: "Not your listing",
      content: { "application/json": { schema: ApiError } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/listings/{id}",
  tags: ["Listings"],
  summary: "Delete listing (owner only, soft-delete)",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Listing deleted",
      content: { "application/json": { schema: ApiSuccess(z.null()) } },
    },
    403: {
      description: "Not your listing",
      content: { "application/json": { schema: ApiError } },
    },
  },
});
