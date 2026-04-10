import { AppError } from "../errors/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const authorize = (...roles: string[]) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401, "UNAUTHORIZED");
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError("Insufficient permissions", 403, "FORBIDDEN");
    }
    next();
  });
