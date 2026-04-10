import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { JwtPayload } from "../types/express.d";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("No token provided", 401, "UNAUTHORIZED");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401, "TOKEN_INVALID");
  }
});
