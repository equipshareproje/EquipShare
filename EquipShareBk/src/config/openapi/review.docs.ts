import { registry, ApiSuccess, ApiError, z } from "./registry";

// ── Review shared schema ───────────────────────────────────────────────────

const ReviewSchema = z
  .object({
    _id: z.string(),
    bookingId: z.string(),
    reviewerId: z.object({
      _id: z.string(),
      name: z.string(),
      avatar: z.string().optional(),
    }),
    revieweeId: z.string(),
    listingId: z.object({ _id: z.string(), title: z.string() }),
    starRating: z.number().openapi({ example: 5 }),
    equipmentCondition: z.number().openapi({ example: 4 }),
    lenderReliability: z.number().openapi({ example: 5 }),
    comment: z.string().optional(),
    createdAt: z.string(),
  })
  .openapi("Review");

// ── Review endpoints ───────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/reviews",
  tags: ["Reviews"],
  summary: "Submit a review (renter only)",
  description:
    "Only the renter of a **Completed** booking can submit a review. One review per booking.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              bookingId: z.string(),
              starRating: z
                .number()
                .int()
                .min(1)
                .max(5)
                .openapi({ example: 5 }),
              equipmentCondition: z
                .number()
                .int()
                .min(1)
                .max(5)
                .openapi({ example: 4 }),
              lenderReliability: z
                .number()
                .int()
                .min(1)
                .max(5)
                .openapi({ example: 5 }),
              comment: z
                .string()
                .max(1000)
                .optional()
                .openapi({ example: "Great camera, very clean!" }),
            })
            .openapi("CreateReviewBody"),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Review created. Lender rating recalculated.",
      content: { "application/json": { schema: ApiSuccess(ReviewSchema) } },
    },
    409: {
      description: "Already reviewed or booking not Completed",
      content: { "application/json": { schema: ApiError } },
    },
    403: {
      description: "Not the renter of this booking",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/reviews/user/{userId}",
  tags: ["Reviews"],
  summary: "Get reviews for a user (lender profile, public)",
  request: { params: z.object({ userId: z.string() }) },
  responses: {
    200: {
      description: "Reviews for user",
      content: {
        "application/json": { schema: ApiSuccess(z.array(ReviewSchema)) },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/reviews/listing/{listingId}",
  tags: ["Reviews"],
  summary: "Get reviews for a listing (public)",
  request: { params: z.object({ listingId: z.string() }) },
  responses: {
    200: {
      description: "Reviews for listing",
      content: {
        "application/json": { schema: ApiSuccess(z.array(ReviewSchema)) },
      },
    },
  },
});
