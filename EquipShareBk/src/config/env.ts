import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  BASE_URL: z.string().default("http://localhost:5000"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM_NAME: z.string().default("EquipShare"),
  SMTP_FROM_EMAIL: z.string().default("noreply@equipshare.com"),
  AZURE_STORAGE_CONNECTION_STRING: z.string().default(""),
  AZURE_STORAGE_CONTAINER_NAME: z.string().default("listings"),
  STRIPE_SECRET_KEY: z.string().default(""),
  PLATFORM_SERVICE_FEE_RATE: z.coerce.number().default(0.1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
