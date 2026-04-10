import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import * as reviewService from "./review.service";

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await reviewService.createReview(req.user!.sub, req.body);
    res.status(201).json(ApiResponse.success(review, "Review submitted"));
  },
);

export const getReviewsByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await reviewService.getReviewsByUser(
      String(req.params.userId),
    );
    res.json(ApiResponse.success(reviews, "Reviews fetched"));
  },
);

export const getReviewsByListing = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await reviewService.getReviewsByListing(
      String(req.params.listingId),
    );
    res.json(ApiResponse.success(reviews, "Reviews fetched"));
  },
);
