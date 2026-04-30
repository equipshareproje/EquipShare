import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { fileDisputeSchema, resolveDisputeSchema } from "./dispute.validation";
import * as disputeController from "./dispute.controller";

const router = Router();

// Any authenticated user — file a dispute
router.post(
  "/",
  authenticate,
  validate(fileDisputeSchema),
  disputeController.fileDispute,
);

// Any authenticated user — view their own disputes
router.get("/my", authenticate, disputeController.getMyDisputes);

// Admin — list all disputes (optional ?status=Open)
router.get(
  "/",
  authenticate,
  authorize("Admin"),
  disputeController.listDisputes,
);

// Admin or involved party — get single dispute
router.get("/:id", authenticate, disputeController.getDispute);

// Admin — mark as UnderReview
router.put(
  "/:id/status",
  authenticate,
  authorize("Admin"),
  disputeController.markUnderReview,
);

// Admin — resolve dispute with ruling
router.put(
  "/:id/resolve",
  authenticate,
  authorize("Admin"),
  validate(resolveDisputeSchema),
  disputeController.resolveDispute,
);

export default router;
