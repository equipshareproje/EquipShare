import { Request } from "express";

export interface JwtPayload {
  sub: string; // user _id
  email: string;
  roles: string[];
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
