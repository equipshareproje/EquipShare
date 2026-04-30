import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import * as earningsController from "./earnings.controller";

const router = Router();

// All earnings routes require authentication as Lender
router.use(authenticate, authorize("Lender"));

// GET /api/earnings/summary
router.get("/summary", earningsController.getSummary);

// GET /api/earnings/transactions
router.get("/transactions", earningsController.getTransactions);

// POST /api/earnings/payout
router.post("/payout", earningsController.requestPayout);

// GET /api/earnings/payouts
router.get("/payouts", earningsController.getPayoutHistory);

export default router;
