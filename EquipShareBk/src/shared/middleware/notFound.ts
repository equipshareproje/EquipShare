import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";

export const notFound = (req: Request, res: Response): void => {
  res
    .status(404)
    .json(ApiResponse.error(`Route ${req.originalUrl} not found`, "NOT_FOUND"));
};
