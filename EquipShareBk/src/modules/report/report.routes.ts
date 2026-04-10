import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { fileReportSchema, resolveReportSchema } from "./report.validation";
import * as reportController from "./report.controller";

const router = Router();

// Any authenticated user — file a report
router.post(
  "/",
  authenticate,
  validate(fileReportSchema),
  reportController.fileReport,
);

// Any authenticated user — view their own reports
router.get("/my", authenticate, reportController.getMyReports);

// Admin — list all reports (?status=Open&listingId=...)
router.get("/", authenticate, authorize("Admin"), reportController.listReports);

// Admin — get single report detail with audit log
router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  reportController.getReport,
);

// Admin — mark as UnderReview
router.put(
  "/:id/status",
  authenticate,
  authorize("Admin"),
  reportController.markUnderReview,
);

// Admin — resolve with action (Dismiss / WarnLender / RemoveListing)
router.put(
  "/:id/resolve",
  authenticate,
  authorize("Admin"),
  validate(resolveReportSchema),
  reportController.resolveReport,
);

export default router;
