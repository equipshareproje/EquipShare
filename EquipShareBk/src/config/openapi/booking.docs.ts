import { registry, ApiSuccess, ApiError, z } from "./registry";

// ── Booking shared schema ──────────────────────────────────────────────────

const BookingSchema = z
  .object({
    _id: z.string(),
    renterId: z.string(),
    ownerId: z.string(),
    listingId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    totalDays: z.number(),
    dailyPrice: z.number(),
    serviceFeeRate: z.number().openapi({ example: 0.1 }),
    subtotal: z.number(),
    serviceFee: z.number(),
    totalAmount: z.number(),
    status: z.enum([
      "Pending",
      "Approved",
      "Rejected",
      "Active",
      "Completed",
      "Cancelled",
    ]),
    rejectionReason: z.string().optional(),
    stripe: z.object({
      chargeStatus: z.enum(["hold", "captured", "released"]),
    }),
    handover: z.object({
      preRentalPhotos: z.array(z.string()),
      receivedPhotos: z.array(z.string()),
      status: z.enum(["pending", "lender_done", "completed"]),
    }),
    createdAt: z.string(),
  })
  .openapi("Booking");

// ── Booking endpoints ──────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/bookings",
  tags: ["Bookings"],
  summary: "Create a booking request",
  description: `**Payment flow:**
1. Call this endpoint → get back \`clientSecret\`
2. On the frontend, call \`stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })\`
3. The card is **held** (reserved) but **NOT charged yet**
4. When the lender approves, the hold is captured (money taken)
5. If rejected, the hold is cancelled (no charge)`,
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              listingId: z
                .string()
                .openapi({ example: "664f1a2b3c4d5e6f7a8b9c0d" }),
              startDate: z
                .string()
                .openapi({ example: "2026-06-01T00:00:00.000Z" }),
              endDate: z
                .string()
                .openapi({ example: "2026-06-05T00:00:00.000Z" }),
            })
            .openapi("CreateBookingBody"),
        },
      },
    },
  },
  responses: {
    201: {
      description:
        "Booking created. Use clientSecret to confirm the card hold via Stripe.js on the frontend.",
      content: {
        "application/json": {
          schema: ApiSuccess(
            z
              .object({
                bookingId: z.string(),
                clientSecret: z.string().openapi({
                  description:
                    "Pass this to stripe.confirmCardPayment() on the frontend",
                }),
              })
              .openapi("CreateBookingResponse"),
          ),
        },
      },
    },
    409: {
      description: "Date conflict — dates already booked",
      content: { "application/json": { schema: ApiError } },
    },
    404: {
      description: "Listing not found",
      content: { "application/json": { schema: ApiError } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/bookings/my/renting",
  tags: ["Bookings"],
  summary: "My bookings as renter",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Renter's bookings",
      content: {
        "application/json": { schema: ApiSuccess(z.array(BookingSchema)) },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/bookings/my/lending",
  tags: ["Bookings"],
  summary: "Incoming booking requests (lender view)",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Lender's incoming requests",
      content: {
        "application/json": { schema: ApiSuccess(z.array(BookingSchema)) },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/bookings/{id}",
  tags: ["Bookings"],
  summary: "Get booking detail",
  description: "Only accessible by the renter or the lender of that booking.",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Booking detail",
      content: { "application/json": { schema: ApiSuccess(BookingSchema) } },
    },
    403: {
      description: "Not your booking",
      content: { "application/json": { schema: ApiError } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/bookings/{id}/approve",
  tags: ["Bookings"],
  summary: "Approve a booking (lender only)",
  description:
    "Captures the Stripe payment hold. Money is charged NOW. Locks the dates on the listing. Sends confirmation email to renter.",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Booking approved, payment captured",
      content: { "application/json": { schema: ApiSuccess(z.null()) } },
    },
    403: {
      description: "Not your listing",
      content: { "application/json": { schema: ApiError } },
    },
    409: {
      description: "Booking is no longer Pending",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/bookings/{id}/reject",
  tags: ["Bookings"],
  summary: "Reject a booking (lender only)",
  description:
    "Cancels the Stripe payment hold. No money taken. Sends rejection email to renter.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z
            .object({ reason: z.string().max(500).optional() })
            .openapi("RejectBookingBody"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Booking rejected, hold released",
      content: { "application/json": { schema: ApiSuccess(z.null()) } },
    },
    403: {
      description: "Not your listing",
      content: { "application/json": { schema: ApiError } },
    },
    409: {
      description: "Booking is no longer Pending",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/bookings/{id}/handover/pre-rental",
  tags: ["Bookings"],
  summary: "Upload pre-rental handover photos (lender only)",
  description:
    "Lender uploads at least **3 photos** of the equipment before handover. Field name: `photos` (multiple files). After upload, renter receives an email prompt to confirm receipt.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "multipart/form-data": {
          schema: z
            .object({ photos: z.array(z.any().openapi({ format: "binary" })) })
            .openapi("PreRentalPhotosBody"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Photos uploaded",
      content: {
        "application/json": {
          schema: ApiSuccess(
            z
              .object({ urls: z.array(z.string().url()) })
              .openapi("HandoverPhotosResponse"),
          ),
        },
      },
    },
    400: {
      description: "Fewer than 3 photos",
      content: { "application/json": { schema: ApiError } },
    },
    409: {
      description: "Booking must be Approved",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/bookings/{id}/handover/received",
  tags: ["Bookings"],
  summary: "Upload received-condition photos (renter only)",
  description:
    "Renter uploads photos confirming they received the equipment. Field name: `photos`. After this, booking status becomes **Active**.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "multipart/form-data": {
          schema: z
            .object({ photos: z.array(z.any().openapi({ format: "binary" })) })
            .openapi("ReceivedPhotosBody"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Photos uploaded. Booking is now Active.",
      content: {
        "application/json": {
          schema: ApiSuccess(
            z
              .object({ urls: z.array(z.string().url()) })
              .openapi("ReceivedPhotosResponse"),
          ),
        },
      },
    },
    409: {
      description: "Lender must upload pre-rental photos first",
      content: { "application/json": { schema: ApiError } },
    },
  },
});
