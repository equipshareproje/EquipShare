import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/errors/AppError";
import * as authService from "./auth.service";

const REFRESH_COOKIE = "refreshToken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.success(result, "Registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken, ...rest } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.json(ApiResponse.success(rest, "Logged in successfully"));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  if (!rawToken) {
    throw new AppError("No refresh token", 401, "UNAUTHORIZED");
  }
  const { accessToken } = await authService.refresh(rawToken);
  res.json(ApiResponse.success({ accessToken }, "Token refreshed"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  if (rawToken) {
    await authService.logout(rawToken);
  }
  res.clearCookie(REFRESH_COOKIE);
  res.json(ApiResponse.success(null, "Logged out successfully"));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.sub);
  res.json(ApiResponse.success(user, "User fetched"));
});
