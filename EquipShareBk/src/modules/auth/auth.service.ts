import { env } from "../../config/env";
import { AppError } from "../../shared/errors/AppError";
import { emailService } from "../../shared/services/email";
import * as authRepository from "./auth.repository";
import {
  RegisterDto,
  LoginDto,
  RegisterResponseDto,
  AuthResponseDto,
} from "./auth.dto";
import {
  signAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  hashToken,
  refreshTokenExpiresAt,
  verificationTokenExpiresAt,
} from "./helpers/token.helper";
import { hashPassword, comparePassword } from "./helpers/password.helper";

export const register = async (
  dto: RegisterDto,
): Promise<RegisterResponseDto> => {
  const existing = await authRepository.findByEmail(dto.email);
  if (existing) {
    throw new AppError("Email already in use", 409, "CONFLICT");
  }

  const passwordHash = await hashPassword(dto.password);

  const user = await authRepository.createUser({
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    passwordHash,
  });

  const rawToken = generateVerificationToken();
  const tokenHash = hashToken(rawToken);
  await authRepository.saveVerificationToken(
    String(user._id),
    tokenHash,
    verificationTokenExpiresAt(),
  );

  const verificationUrl = `${env.BASE_URL}/api/auth/verify-email?token=${rawToken}`;
  try {
    await emailService.sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl,
    });
  } catch (emailError) {
    // Roll back: delete the user so they can retry registration cleanly
    await authRepository.deleteUserById(String(user._id));
    throw new AppError(
      "Failed to send verification email. Please try again later.",
      503,
      "EMAIL_SEND_FAILED",
    );
  }

  return {
    message:
      "Registration successful. Please check your email to verify your account.",
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

  if (!user.verified) {
    throw new AppError(
      "Please verify your email before logging in",
      403,
      "EMAIL_NOT_VERIFIED",
    );
  }

  const valid = await comparePassword(dto.password, user.passwordHash);
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
): Promise<{ accessToken: string; refreshToken: string }> => {
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

  return { accessToken, refreshToken: rawRefreshToken };
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

export const verifyEmail = async (rawToken: string): Promise<void> => {
  const tokenHash = hashToken(rawToken);
  const user = await authRepository.findByVerificationToken(tokenHash);
  if (!user) {
    throw new AppError(
      "Invalid or expired verification link",
      400,
      "TOKEN_INVALID",
    );
  }
  await authRepository.setVerified(String(user._id));
};

export const resendVerification = async (email: string): Promise<void> => {
  const user = await authRepository.findByEmail(email);
  // Return silently to prevent email enumeration
  if (!user || user.verified) return;

  const rawToken = generateVerificationToken();
  const tokenHash = hashToken(rawToken);
  await authRepository.saveVerificationToken(
    String(user._id),
    tokenHash,
    verificationTokenExpiresAt(),
  );

  const verificationUrl = `${env.BASE_URL}/api/auth/verify-email?token=${rawToken}`;
  await emailService.sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
  });
};
