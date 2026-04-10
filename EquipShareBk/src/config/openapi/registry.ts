import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export { z };

export const registry = new OpenAPIRegistry();

// ── Shared response helpers ────────────────────────────────────────────────

export const ApiSuccess = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });

export const ApiError = z
  .object({
    success: z.literal(false),
    message: z.string(),
    code: z.string(),
    data: z.null(),
  })
  .openapi("ApiError");

// ── Shared entity schemas ──────────────────────────────────────────────────

export const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["Admin", "User"]),
    avatar: z.string().url().optional(),
  })
  .openapi("User");

export const AuthResponseSchema = z
  .object({
    accessToken: z.string(),
    user: UserSchema,
  })
  .openapi("AuthResponse");

export const RegisterResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("RegisterResponse");

// ── Security scheme ────────────────────────────────────────────────────────

registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
