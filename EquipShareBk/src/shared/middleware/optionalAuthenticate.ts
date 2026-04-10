import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { asyncHandler } from "../utils/asyncHandler";
import { JwtPayload } from "../types/express.d";

/**
 * Soft authentication middleware.
 * If a valid Bearer token is present, sets req.user.
 * If no token (or invalid token), continues silently without throwing.
 */
export const optionalAuthenticate = asyncHandler(
  async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
        req.user = payload;
      } catch {
        // Invalid token — ignored; continue as unauthenticated
      }
    }
    next();
  },
);
