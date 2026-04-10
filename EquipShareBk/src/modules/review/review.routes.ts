import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { validate } from "../../shared/middleware/validate";
import * as reviewController from "./review.controller";
import { createReviewSchema } from "./review.validation";

const router = Router();

// POST /api/reviews
router.post(
  "/",
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview,
);

// GET /api/reviews/user/:userId
router.get("/user/:userId", reviewController.getReviewsByUser);

// GET /api/reviews/listing/:listingId
router.get("/listing/:listingId", reviewController.getReviewsByListing);

export default router;
