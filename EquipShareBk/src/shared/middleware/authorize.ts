import { AppError } from "../errors/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const authorize = (...roles: string[]) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401, "UNAUTHORIZED");
    }
    if (!req.user.roles?.some((r) => roles.includes(r))) {
      throw new AppError("Insufficient permissions", 403, "FORBIDDEN");
    }
    next();
  });
