import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/AppError";
import { JwtPayload } from "../../shared/types/express.d";
import * as authRepository from "./auth.repository";
import { RegisterDto, LoginDto, AuthResponseDto } from "./auth.dto";

const signAccessToken = (user: {
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

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

const refreshTokenExpiresAt = (): Date => {
  const ms = parseDuration(env.JWT_REFRESH_EXPIRES);
  return new Date(Date.now() + ms);
};

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

export const register = async (dto: RegisterDto): Promise<AuthResponseDto> => {
  const existing = await authRepository.findByEmail(dto.email);
  if (existing) {
    throw new AppError("Email already in use", 409, "CONFLICT");
  }

  const passwordHash = await bcrypt.hash(dto.password, 12);
  const user = await authRepository.createUser({
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    passwordHash,
  });

  const accessToken = signAccessToken(user);
  return {
    accessToken,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
};

export const login = async (
  dto: LoginDto,
): Promise<AuthResponseDto & { refreshToken: string }> => {
  const user = await authRepository.findByEmail(dto.email);
  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new AppError("Account is deactivated", 403, "FORBIDDEN");
  }

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const accessToken = signAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  await authRepository.createRefreshToken(
    String(user._id),
    refreshTokenExpiresAt(),
    rawRefreshToken,
  );

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
};

export const refresh = async (
  rawToken: string,
): Promise<{ accessToken: string }> => {
  const storedToken = await authRepository.findRefreshToken(rawToken);
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "TOKEN_INVALID",
    );
  }

  await authRepository.revokeRefreshToken(String(storedToken._id));

  const user = await authRepository.findById(String(storedToken.userId));
  if (!user || !user.isActive) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  const accessToken = signAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  await authRepository.createRefreshToken(
    String(user._id),
    refreshTokenExpiresAt(),
    rawRefreshToken,
  );

  return { accessToken };
};

export const logout = async (rawToken: string): Promise<void> => {
  const storedToken = await authRepository.findRefreshToken(rawToken);
  if (storedToken) {
    await authRepository.revokeRefreshToken(String(storedToken._id));
  }
};

export const getMe = async (userId: string) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  return user;
};
