import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import { AppError } from "../../shared/errors/AppError";
import { env } from "../../config/env";
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
  res.status(201).json(ApiResponse.success(result, result.message));
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

  const { accessToken, refreshToken } = await authService.refresh(rawToken);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
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

const verifyEmailHtml = (success: boolean, message: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${success ? "Email Verified" : "Verification Failed"} — EquipShare</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #f4f6f8; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; }
    .card { background: #fff; border-radius: 12px; padding: 48px 40px;
            max-width: 440px; width: 100%; text-align: center;
            box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 1.5rem; color: #1a202c; margin-bottom: 12px; }
    p  { color: #4a5568; line-height: 1.6; margin-bottom: 28px; }
    a  { display: inline-block; padding: 12px 28px; border-radius: 8px;
         text-decoration: none; font-weight: 600; font-size: .95rem;
         background: ${success ? "#38a169" : "#e53e3e"}; color: #fff; }
    a:hover { opacity: .9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "❌"}</div>
    <h1>${success ? "Email Verified!" : "Verification Failed"}</h1>
    <p>${message}</p>
    <a href="/">Back to EquipShare</a>
  </div>
</body>
</html>`;

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    return res
      .status(400)
      .send(verifyEmailHtml(false, "No verification token was provided."));
  }
  try {
    await authService.verifyEmail(token);
    res
      .status(200)
      .send(
        verifyEmailHtml(
          true,
          "Your email address has been confirmed. You can now sign in to EquipShare.",
        ),
      );
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "The link is invalid or has expired.";
    res.status(400).send(verifyEmailHtml(false, msg));
  }
});

export const resendVerification = asyncHandler(
  async (req: Request, res: Response) => {
    await authService.resendVerification(req.body.email);
    res.json(
      ApiResponse.success(
        null,
        "If that email exists, a verification link has been sent.",
      ),
    );
  },
);
