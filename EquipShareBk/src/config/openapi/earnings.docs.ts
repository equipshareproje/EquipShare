import { registry, ApiSuccess, ApiError, z } from "./registry";

// ── Earnings shared schemas ────────────────────────────────────────────────

const PayoutSchema = z
  .object({
    _id: z.string(),
    lenderId: z.string(),
    amount: z.number().openapi({ example: 750.0 }),
    status: z.enum(["Pending", "Processing", "Paid", "Failed"]),
    requestedAt: z.string(),
    processedAt: z.string().optional(),
    note: z.string().optional(),
    createdAt: z.string(),
  })
  .openapi("PayoutRequest");

const TransactionSchema = z
  .object({
    bookingId: z.string(),
    listingTitle: z.string(),
    renterName: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    totalDays: z.number(),
    dailyPrice: z.number(),
    subtotal: z.number(),
    serviceFee: z.number(),
    totalAmount: z.number(),
    completedAt: z.string(),
  })
  .openapi("EarningsTransaction");

// ── Earnings endpoints ─────────────────────────────────────────────────────

registry.registerPath({
  method: "get",
  path: "/api/earnings/summary",
  tags: ["Earnings"],
  summary: "Get earnings summary (Lender only)",
  description:
    "Returns total earnings to date, current payout balance (earnings minus paid-out amounts), and a month-by-month breakdown.",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Earnings summary",
      content: {
        "application/json": {
          schema: ApiSuccess(
            z
              .object({
                totalEarnings: z.number().openapi({ example: 2500.0 }),
                pendingPayoutBalance: z.number().openapi({ example: 750.0 }),
                monthlyBreakdown: z.array(
                  z.object({
                    month: z.string().openapi({ example: "2026-03" }),
                    amount: z.number().openapi({ example: 1200.0 }),
                  }),
                ),
              })
              .openapi("EarningsSummary"),
          ),
        },
      },
    },
    401: {
      description: "Not authenticated",
      content: { "application/json": { schema: ApiError } },
    },
    403: {
      description: "Lender role required",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/earnings/transactions",
  tags: ["Earnings"],
  summary: "Get transaction history (Lender only)",
  description:
    "Paginated list of Completed bookings where the caller is the owner. Filterable by date range and listing.",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      startDate: z
        .string()
        .optional()
        .openapi({ example: "2026-01-01T00:00:00.000Z" }),
      endDate: z
        .string()
        .optional()
        .openapi({ example: "2026-12-31T23:59:59.999Z" }),
      listingId: z
        .string()
        .optional()
        .openapi({ example: "664f1a2b3c4d5e6f7a8b9c0d" }),
      page: z.coerce.number().default(1).openapi({ example: 1 }),
      limit: z.coerce.number().default(20).openapi({ example: 20 }),
    }),
  },
  responses: {
    200: {
      description: "Paginated transaction history",
      content: {
        "application/json": {
          schema: ApiSuccess(
            z
              .object({
                transactions: z.array(TransactionSchema),
                meta: z.object({
                  total: z.number(),
                  page: z.number(),
                  limit: z.number(),
                  totalPages: z.number(),
                }),
              })
              .openapi("TransactionsResponse"),
          ),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/earnings/payout",
  tags: ["Earnings"],
  summary: "Request a payout (Lender only)",
  description: `Submits a payout request for the lender's current balance.

**Rules:**
- Balance must be at least **SAR 50** (minimum payout threshold)
- No concurrent payout requests allowed (only one Pending/Processing at a time)
- Amount = total earnings − all previously Paid/Processing payouts

A confirmation email is sent to the lender.`,
  security: [{ bearerAuth: [] }],
  responses: {
    201: {
      description: "Payout request submitted. Confirmation email sent.",
      content: { "application/json": { schema: ApiSuccess(PayoutSchema) } },
    },
    400: {
      description: "Insufficient balance (below SAR 50 minimum)",
      content: { "application/json": { schema: ApiError } },
    },
    409: {
      description: "A payout is already pending or being processed",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/earnings/payouts",
  tags: ["Earnings"],
  summary: "List my payout requests (Lender only)",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Payout request history",
      content: {
        "application/json": { schema: ApiSuccess(z.array(PayoutSchema)) },
      },
    },
  },
});
