import { PaginationMeta } from "../types/pagination";

export const ApiResponse = {
  success: <T>(data: T, message = "Success", meta?: PaginationMeta) => ({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  }),

  error: (message: string, code: string) => ({
    success: false,
    message,
    code,
    data: null,
  }),

  validationError: (errors: Record<string, string[] | undefined>) => ({
    success: false,
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    errors,
    data: null,
  }),
};
