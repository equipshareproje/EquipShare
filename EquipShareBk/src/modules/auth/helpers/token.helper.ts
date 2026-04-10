import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@config/env";
import { JwtPayload } from "@shared/types/express.d";

export const signAccessToken = (user: {
  _id: unknown;
  email: string;
  role: string;
}): string => {
  const payload: JwtPayload = {
    sub: String(user._id),
    email: user.email,
    role: user.role as "Admin" | "User",
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (): string =>
  crypto.randomBytes(64).toString("hex");

export const generateVerificationToken = (): string =>
  crypto.randomBytes(32).toString("hex");

export const hashToken = (raw: string): string =>
  crypto.createHash("sha256").update(raw).digest("hex");

const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * multipliers[unit];
};

export const refreshTokenExpiresAt = (): Date => {
  const ms = parseDuration(env.JWT_REFRESH_EXPIRES);
  return new Date(Date.now() + ms);
};

export const verificationTokenExpiresAt = (): Date =>
  new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
