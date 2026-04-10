import { Request } from "express";

export interface JwtPayload {
  sub: string; // user _id
  email: string;
  role: "Admin" | "User";
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
