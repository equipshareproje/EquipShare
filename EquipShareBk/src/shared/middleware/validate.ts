import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape } from "zod";
import { ApiResponse } from "../utils/apiResponse";

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      res.status(400).json(ApiResponse.validationError(errors));
      return;
    }
    req.body = result.data;
    next();
  };
