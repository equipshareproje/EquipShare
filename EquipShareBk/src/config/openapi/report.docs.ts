import { registry, ApiSuccess, ApiError, z } from "./registry";

// ── Report shared schema ───────────────────────────────────────────────────

const ReportSchema = z
  .object({
    _id: z.string(),
    listingId: z.object({
      _id: z.string(),
      title: z.string(),
      status: z.string(),
    }),
    reportedById: z.object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
    }),
    reason: z.enum([
      "Scam",
      "FakePhotos",
      "InappropriateContent",
      "Overpriced",
      "MisleadingDescription",
      "Other",
    ]),
    description: z.string(),
    status: z.enum(["Open", "UnderReview", "Resolved"]),
    adminAction: z.enum(["Dismiss", "WarnLender", "RemoveListing"]).optional(),
    adminNote: z.string().optional(),
    auditLog: z.array(
      z.object({
        action: z.string(),
        performedById: z.string(),
        note: z.string().optional(),
        timestamp: z.string(),
      }),
    ),
    createdAt: z.string(),
  })
  .openapi("Report");

// ── Report endpoints ───────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/reports",
  tags: ["Reports"],
  summary: "File a report on a listing",
  description:
    "Any authenticated user can report a listing. One open report per user per listing.",
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
              reason: z.enum([
                "Scam",
                "FakePhotos",
                "InappropriateContent",
                "Overpriced",
                "MisleadingDescription",
                "Other",
              ]),
              description: z.string().min(20).max(1000).openapi({
                example:
                  "The photos appear to be stock images, not the actual equipment.",
              }),
            })
            .openapi("FileReportBody"),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Report submitted. Reporter receives a confirmation email.",
      content: { "application/json": { schema: ApiSuccess(ReportSchema) } },
    },
    409: {
      description: "Open report already exists for this listing",
      content: { "application/json": { schema: ApiError } },
    },
    400: {
      description: "Cannot report your own listing",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/reports/my",
  tags: ["Reports"],
  summary: "Get my submitted reports",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Reports submitted by the current user",
      content: {
        "application/json": { schema: ApiSuccess(z.array(ReportSchema)) },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/reports",
  tags: ["Reports"],
  summary: "List all reports (Admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z.enum(["Open", "UnderReview", "Resolved"]).optional(),
      listingId: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "All reports",
      content: {
        "application/json": { schema: ApiSuccess(z.array(ReportSchema)) },
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
  path: "/api/reports/{id}",
  tags: ["Reports"],
  summary: "Get report detail with audit log (Admin only)",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Full report with full audit trail",
      content: { "application/json": { schema: ApiSuccess(ReportSchema) } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/reports/{id}/status",
  tags: ["Reports"],
  summary: "Mark report as UnderReview (Admin only)",
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Status updated. Audit entry appended.",
      content: { "application/json": { schema: ApiSuccess(ReportSchema) } },
    },
    409: {
      description: "Report is not Open",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/reports/{id}/resolve",
  tags: ["Reports"],
  summary: "Take moderation action (Admin only)",
  description: `Admin resolves the report with one of three actions:
- **Dismiss** — no violation found; no email to lender
- **WarnLender** — sends a policy warning email to the lender; listing stays active
- **RemoveListing** — immediately soft-deletes the listing (\`status = "Deleted"\`); sends removal email to lender

All actions are permanently logged in the \`auditLog\` array on the report.`,
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z
            .object({
              action: z.enum(["Dismiss", "WarnLender", "RemoveListing"]),
              note: z.string().max(500).optional().openapi({
                example: "Listing photos confirmed as stock images.",
              }),
            })
            .openapi("ResolveReportBody"),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Report resolved. Action executed.",
      content: { "application/json": { schema: ApiSuccess(z.null()) } },
    },
    409: {
      description: "Report already resolved",
      content: { "application/json": { schema: ApiError } },
    },
  },
});
