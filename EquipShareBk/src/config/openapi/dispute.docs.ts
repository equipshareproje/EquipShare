import { registry, ApiSuccess, ApiError, z } from "./registry";

// ── Dispute shared schema ──────────────────────────────────────────────────

const DisputeSchema = z
  .object({
    _id: z.string(),
    bookingId: z.string(),
    filedById: z.object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
    }),
    filedByRole: z.enum(["Renter", "Lender"]),
    description: z.string(),
    evidenceUrls: z.array(z.string()),
    status: z.enum(["Open", "UnderReview", "Resolved"]),
    ruling: z
      .enum(["RenterResponsible", "LenderResponsible", "NoFaultFound"])
      .optional(),
    rulingNote: z.string().optional(),
    refundAmount: z.number().optional(),
    resolvedById: z.string().optional(),
    resolvedAt: z.string().optional(),
    createdAt: z.string(),
  })
  .openapi("Dispute");

// ── Dispute endpoints ──────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/disputes",
  tags: ["Disputes"],
  summary: "File a dispute on a booking",
  description:
    "Either the renter or lender of an **Active** or **Completed** booking can file a dispute. Only one open dispute is allowed per booking at a time.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              bookingId: z
                .string()
                .openapi({ example: "664f1a2b3c4d5e6f7a8b9c0d" }),
              description: z.string().min(20).max(2000).openapi({
                example:
                  "The equipment was returned with significant damage not present during handover.",
              }),
              evidenceUrls: z
                .array(z.string().url())
                .max(10)
                .optional()
                .openapi({
                  description: "Optional Azure Blob URLs of evidence photos",
                }),
            })
            .openapi("FileDisputeBody"),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Dispute filed. Both parties notified by email.",
      content: { "application/json": { schema: ApiSuccess(DisputeSchema) } },
    },
    409: {
      description: "Open dispute already exists or booking status invalid",
      content: { "application/json": { schema: ApiError } },
    },
    403: {
      description: "Not a party to this booking",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/disputes/my",
  tags: ["Disputes"],
  summary: "Get my disputes",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Disputes filed by the current user",
      content: {
        "application/json": { schema: ApiSuccess(z.array(DisputeSchema)) },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/disputes",
  tags: ["Disputes"],
  summary: "List all disputes (Admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z.enum(["Open", "UnderReview", "Resolved"]).optional(),
    }),
  },
  responses: {
    200: {
      description: "All disputes",
      content: {
        "application/json": { schema: ApiSuccess(z.array(DisputeSchema)) },
      },
    },
    403: {
      description: "Admin only",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/disputes/{id}",
  tags: ["Disputes"],
  summary: "Get dispute detail",
  description:
    "Admin can view any dispute. Regular users can only view disputes they filed.",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Dispute detail",
      content: { "application/json": { schema: ApiSuccess(DisputeSchema) } },
    },
    403: {
      description: "Not authorised",
      content: { "application/json": { schema: ApiError } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/disputes/{id}/status",
  tags: ["Disputes"],
  summary: "Mark dispute as UnderReview (Admin only)",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Status updated to UnderReview",
      content: { "application/json": { schema: ApiSuccess(DisputeSchema) } },
    },
    409: {
      description: "Dispute is not Open",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/disputes/{id}/resolve",
  tags: ["Disputes"],
  summary: "Resolve a dispute with a ruling (Admin only)",
  description: `Admin makes a ruling and the system executes it:
- **RenterResponsible** — no refund issued
- **LenderResponsible** — Stripe refund for \`refundAmount\` SAR is issued immediately (required field)
- **NoFaultFound** — no financial action

Both parties receive an email with the ruling and admin note.`,
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              ruling: z.enum([
                "RenterResponsible",
                "LenderResponsible",
                "NoFaultFound",
              ]),
              rulingNote: z.string().min(10).max(1000).openapi({
                example:
                  "Evidence shows damage was pre-existing based on handover photos.",
              }),
              refundAmount: z.number().positive().optional().openapi({
                description:
                  "Required when ruling is LenderResponsible. Amount in SAR.",
              }),
            })
            .openapi("ResolveDisputeBody"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Dispute resolved. Emails sent.",
      content: { "application/json": { schema: ApiSuccess(z.null()) } },
    },
    400: {
      description: "refundAmount required for LenderResponsible ruling",
      content: { "application/json": { schema: ApiError } },
    },
    409: {
      description: "Dispute already resolved",
      content: { "application/json": { schema: ApiError } },
    },
  },
});
