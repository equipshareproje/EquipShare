import { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError";
import { ApiResponse } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json(ApiResponse.error(err.message, err.code));
    return;
  }

  logger.error(err);

  res.status(500).json({
    success: false,
    message: (err as Error).message || "Internal server error",
    code: "SERVER_ERROR",
    stack: (err as Error).stack,
    data: null,
  });
};
