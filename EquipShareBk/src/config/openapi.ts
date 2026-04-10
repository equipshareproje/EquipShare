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

// ── Generate spec ──────────────────────────────────────────────────────────

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "EquipShare API",
      version: "1.0.0",
      description: "Equipment rental marketplace API — KFUPM",
    },
    servers: [{ url: env.BASE_URL }],
  });
};
