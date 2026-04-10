import { registry, ApiSuccess, ApiError, z } from "./registry";

// ── Circle shared schemas ──────────────────────────────────────────────────

const CircleSchema = z
  .object({
    _id: z.string(),
    name: z.string().openapi({ example: "KAUST Alumni" }),
    description: z.string().openapi({ example: "Community for KAUST graduates" }),
    eligibilityCriteria: z
      .string()
      .openapi({ example: "Must be a verified KAUST graduate" }),
    emailDomainRule: z.string().optional().openapi({ example: ".kaust.edu.sa" }),
    isActive: z.boolean(),
    memberCount: z.number(),
    createdById: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Circle");

const CircleMemberSchema = z
  .object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string().optional(),
    rating: z.number(),
    reviewCount: z.number(),
  })
  .openapi("CircleMember");

const CreateCircleBody = z
  .object({
    name: z.string().openapi({ example: "KAUST Alumni" }),
    description: z
      .string()
      .openapi({ example: "Exclusive circle for KAUST graduates" }),
    eligibilityCriteria: z
      .string()
      .openapi({ example: "Verified KAUST email address required" }),
    emailDomainRule: z.string().optional().openapi({ example: ".kaust.edu.sa" }),
  })
  .openapi("CreateCircleBody");

// ── Endpoints ──────────────────────────────────────────────────────────────

registry.registerPath({
  method: "post",
  path: "/api/circles",
  tags: ["Circles"],
  summary: "Create a trusted circle (Admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateCircleBody } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Circle created",
      content: { "application/json": { schema: ApiSuccess(CircleSchema) } },
    },
    409: {
      description: "Circle name already taken",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/circles",
  tags: ["Circles"],
  summary: "List all active circles (public)",
  responses: {
    200: {
      description: "Active circle list",
      content: {
        "application/json": { schema: ApiSuccess(z.array(CircleSchema)) },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/circles/{id}",
  tags: ["Circles"],
  summary: "Get a single circle by ID (public)",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Circle details",
      content: { "application/json": { schema: ApiSuccess(CircleSchema) } },
    },
    404: {
      description: "Circle not found",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/circles/{id}/members",
  tags: ["Circles"],
  summary: "List circle members (Admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Members of the circle",
      content: {
        "application/json": {
          schema: ApiSuccess(z.array(CircleMemberSchema)),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/circles/{id}/join",
  tags: ["Circles"],
  summary: "Join a trusted circle",
  description: `Adds the authenticated user to a circle.

**Validations:**
- Circle must be active
- User must not already be a member
- If \`emailDomainRule\` is set on the circle, user's email must match`,
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Successfully joined",
      content: {
        "application/json": { schema: ApiSuccess(z.null()) },
      },
    },
    403: {
      description: "Email domain not allowed",
      content: { "application/json": { schema: ApiError } },
    },
    409: {
      description: "Already a member or circle inactive",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/circles/{id}/leave",
  tags: ["Circles"],
  summary: "Leave a trusted circle",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Successfully left",
      content: { "application/json": { schema: ApiSuccess(z.null()) } },
    },
    409: {
      description: "User is not a member",
      content: { "application/json": { schema: ApiError } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/circles/{id}/members/{userId}",
  tags: ["Circles"],
  summary: "Remove a member from a circle (Admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string(), userId: z.string() }),
  },
  responses: {
    200: {
      description: "Member removed",
      content: { "application/json": { schema: ApiSuccess(z.null()) } },
    },
    404: { description: "Circle or user not found", content: { "application/json": { schema: ApiError } } },
    409: { description: "User is not a member", content: { "application/json": { schema: ApiError } } },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/circles/{id}/deactivate",
  tags: ["Circles"],
  summary: "Deactivate a circle (Admin only)",
  description: "Marks the circle as inactive. Members remain but no new members can join.",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Circle deactivated",
      content: { "application/json": { schema: ApiSuccess(CircleSchema) } },
    },
    404: {
      description: "Circle not found",
      content: { "application/json": { schema: ApiError } },
    },
  },
});
