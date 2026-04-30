import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { createCircleSchema } from "./circle.validation";
import * as circleController from "./circle.controller";

const router = Router();

// Public
router.get("/", circleController.listCircles);
router.get("/:id", circleController.getCircle);

// Authenticated users
router.post("/:id/join", authenticate, circleController.joinCircle);
router.post("/:id/leave", authenticate, circleController.leaveCircle);

// Admin only
router.post(
  "/",
  authenticate,
  authorize("Admin"),
  validate(createCircleSchema),
  circleController.createCircle,
);
router.get(
  "/:id/members",
  authenticate,
  authorize("Admin"),
  circleController.getMembers,
);
router.delete(
  "/:id/members/:userId",
  authenticate,
  authorize("Admin"),
  circleController.removeMember,
);
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("Admin"),
  circleController.deactivateCircle,
);

export default router;
