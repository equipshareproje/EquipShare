import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { env } from "./env";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// ── Shared schemas ─────────────────────────────────────────────────────────

const ApiSuccess = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });

const ApiError = z
  .object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
    data: z.null(),
  })
  .openapi("ApiError");

const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["Admin", "User"]),
    avatar: z.string().url().optional(),
  })
  .openapi("User");

const AuthResponseSchema = z
  .object({
    accessToken: z.string(),
    user: UserSchema,
  })
  .openapi("AuthResponse");

const RegisterResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("RegisterResponse");

// ── Bearer secuirty scheme ─────────────────────────────────────────────────

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// ── Auth endpoints ─────────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              name: z.string().min(2).max(100),
              email: z.string().email(),
              password: z.string().min(8).max(128),
              phone: z.string().optional(),
            })
            .openapi("RegisterBody"),
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered. Verification email sent.",
      content: {
        "application/json": {
          schema: ApiSuccess(RegisterResponseSchema),
        },
      },
    },
    409: {
      description: "Email already in use",
      content: { "application/json": { schema: ApiError } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              email: z.string().email(),
              password: z.string().min(1),
            })
            .openapi("LoginBody"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Logged in. Refresh token set as HttpOnly cookie.",
      content: {
        "application/json": {
          schema: ApiSuccess(AuthResponseSchema),
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh access token",
  description:
    "Reads `refreshToken` from HttpOnly cookie. Issues a new access token and rotates the refresh token.",
  responses: {
    200: {
      description: "New access token",
      content: {
        "application/json": {
          schema: ApiSuccess(
            z.object({ accessToken: z.string() }).openapi("RefreshResponse"),
          ),
        },
      },
    },
    401: {
      description: "Invalid or expired refresh token",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: ["Auth"],
  summary: "Logout",
  description: "Revokes the refresh token cookie.",
  responses: {
    200: {
      description: "Logged out",
      content: {
        "application/json": {
          schema: ApiSuccess(z.null()),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  tags: ["Auth"],
  summary: "Get current user",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Authenticated user",
      content: {
        "application/json": {
          schema: ApiSuccess(UserSchema),
        },
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
  path: "/api/auth/verify-email",
  tags: ["Auth"],
  summary: "Verify email address",
  description:
    "Validates the one-time token from the verification email. On success redirects to `FRONTEND_URL/verified`; on failure to `FRONTEND_URL/verify-failed`.",
  request: {
    query: z.object({ token: z.string().openapi({ example: "abc123" }) }),
  },
  responses: {
    302: { description: "Redirect to frontend (success or failure path)" },
    400: {
      description: "Missing token",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/resend-verification",
  tags: ["Auth"],
  summary: "Resend verification email",
  description:
    "Always returns 200 to prevent email enumeration. The email is only sent if the address exists and is unverified.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({ email: z.string().email() })
            .openapi("ResendVerificationBody"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Response sent",
      content: {
        "application/json": {
          schema: ApiSuccess(z.null()),
        },
      },
    },
  },
});

// ── Listing shared schemas ─────────────────────────────────────────────────

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
    "Returns paginated active listings. All query params are optional.",
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

// ── Booking shared schemas ─────────────────────────────────────────────────

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

// ── Review endpoints ───────────────────────────────────────────────────────

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

// ── Constants reference ────────────────────────────────────────────────────
// These are NOT endpoints — they are a reference for the frontend so every
// enum, rate, and limit lives in one discoverable place in the docs.

registry.registerPath({
  method: "get",
  path: "/api/constants",
  tags: ["Constants"],
  summary: "Frontend constants reference (not a real endpoint)",
  description: `
This entry is a **documentation-only reference** — there is no actual HTTP endpoint here.
It documents every enum, rate, and business rule that the frontend needs to hard-code or display.

---

### User Roles
| Value | Description |
|-------|-------------|
| \`Renter\` | Can browse listings, create bookings, upload received photos, write reviews |
| \`Lender\` | Can create listings, approve/reject bookings, upload pre-rental handover photos |
| \`Admin\` | Platform administrator |

---

### Listing — Category values
\`Power Tools\` · \`Hand Tools\` · \`Cameras & Photography\` · \`Audio & Video\` · \`Vehicles\` · \`Construction\` · \`Outdoor & Sports\` · \`Electronics\` · \`Other\`

### Listing — Condition values
| Value | Description |
|-------|-------------|
| \`New\` | Brand new, never used |
| \`Like New\` | Used once or twice, no visible wear |
| \`Good\` | Normal wear, fully functional |
| \`Fair\` | Visible wear but still functional |

### Listing — Status values
| Value | Description |
|-------|-------------|
| \`Active\` | Visible on marketplace |
| \`Inactive\` | Hidden by owner |
| \`Deleted\` | Soft-deleted, not visible |

---

### Booking — Status lifecycle
\`\`\`
Pending → Approved → Active → Completed
        ↘ Rejected
\`\`\`
| Value | Meaning |
|-------|---------|
| \`Pending\` | Request submitted, Stripe hold placed, awaiting lender decision |
| \`Approved\` | Lender approved, Stripe payment captured (money taken), dates locked |
| \`Rejected\` | Lender rejected, Stripe hold released (no charge) |
| \`Active\` | Both sides completed handover photos, rental in progress |
| \`Completed\` | Rental end date passed (set by a scheduled job) |
| \`Cancelled\` | Cancelled before approval |

### Booking — Stripe charge status
| Value | Meaning |
|-------|---------|
| \`hold\` | Card authorized but not charged — booking is Pending |
| \`captured\` | Payment taken — booking is Approved |
| \`released\` | Hold cancelled, no charge — booking is Rejected |

### Booking — Handover status
| Value | Meaning |
|-------|---------|
| \`pending\` | Neither side has uploaded photos yet |
| \`lender_done\` | Lender uploaded pre-rental photos (min 3). Waiting for renter. |
| \`completed\` | Renter uploaded received photos. Booking transitions to Active. |

---

### Pricing
| Constant | Value | Description |
|----------|-------|-------------|
| \`PLATFORM_SERVICE_FEE_RATE\` | \`0.10\` (10%) | Applied on top of subtotal |
| Currency | \`SAR\` (Saudi Riyal) | All amounts are in SAR |
| Stripe amount unit | Halalas (× 100) | e.g. 150 SAR → 15000 in Stripe |

**Formula:**
\`\`\`
totalDays   = daysBetween(startDate, endDate)
subtotal    = listing.dailyPrice × totalDays
serviceFee  = subtotal × 0.10
totalAmount = subtotal + serviceFee
\`\`\`

---

### File Upload Limits
| Context | Field name | Min files | Max files | Max size |
|---------|-----------|-----------|-----------|----------|
| Listing photo | \`photo\` | 1 | 1 per call | 10 MB |
| Pre-rental handover | \`photos\` | **3** | 20 | 10 MB each |
| Received handover | \`photos\` | 1 | 20 | 10 MB each |

Upload photos **one at a time** via \`POST /api/listings/upload-photo\`, collect the returned URLs, then include them in the listing create/update body.

---

### Review Rating Fields
All three rating fields are **integers** from **1 to 5**:
- \`starRating\` — overall experience
- \`equipmentCondition\` — how accurate was the condition description?
- \`lenderReliability\` — was the lender on time, responsive, honest?

A review can only be submitted once per booking (\`bookingId\` is unique-indexed).
Only the **renter** of a **Completed** booking may submit a review.

---

### Authentication
- Access token: \`Authorization: Bearer <token>\` header — expires in **15 minutes**
- Refresh token: HttpOnly cookie (\`refreshToken\`) — expires in **7 days**
- Call \`POST /api/auth/refresh\` (no body needed, cookie is sent automatically) to get a new access token.
  `,
  responses: {
    200: {
      description: "Documentation-only — no real response",
      content: {
        "application/json": {
          schema: z
            .object({
              userRoles: z.array(z.enum(["Renter", "Lender", "Admin"])),
              listingCategories: z.array(z.string()),
              listingConditions: z.array(z.string()),
              listingStatuses: z.array(z.string()),
              bookingStatuses: z.array(z.string()),
              bookingChargeStatuses: z.array(z.string()),
              handoverStatuses: z.array(z.string()),
              platformServiceFeeRate: z.number().openapi({ example: 0.1 }),
              currency: z.string().openapi({ example: "SAR" }),
            })
            .openapi("ConstantsReference"),
        },
      },
    },
  },
});

// ── Generate spec ──────────────────────────────────────────────────────────

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "EquipShare API",
      version: "1.0.0",
      description: `
## EquipShare — Equipment Rental Marketplace API

**Base URL:** \`${env.BASE_URL}\`  
**Docs:** \`${env.BASE_URL}/api/docs\`  

---

### Authentication
Most endpoints require a **Bearer token** in the \`Authorization\` header.
Obtain it from \`POST /api/auth/login\`. Tokens expire in 15 min — use \`POST /api/auth/refresh\` with the HttpOnly cookie to renew.

### Tags
| Tag | Description |
|-----|-------------|
| **Auth** | Register, login, logout, email verification, token refresh |
| **Listings** | Create, browse, edit, delete equipment listings |
| **Bookings** | Full rental lifecycle — request, approve/reject, handover |
| **Reviews** | Submit and fetch reviews |
| **Constants** | Frontend reference: all enums, rates, and limits in one place |

### Booking Lifecycle (quick ref)
\`Pending\` → \`Approved\` → \`Active\` → \`Completed\`  
See the **Constants** tag for the full status table and pricing formula.
      `,
    },
    servers: [{ url: env.BASE_URL }],
  });
};
