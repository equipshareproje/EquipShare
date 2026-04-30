import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import * as earningsService from "./earnings.service";
import { TransactionFilters } from "./earnings.repository";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await earningsService.getSummary(req.user!.sub);
  res.json(ApiResponse.success(summary, "Earnings summary fetched"));
});

export const getTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const filters: TransactionFilters = {
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      listingId: req.query.listingId as string | undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };
    const result = await earningsService.getTransactions(
      req.user!.sub,
      filters,
    );
    res.json(ApiResponse.success(result, "Transactions fetched"));
  },
);

export const requestPayout = asyncHandler(
  async (req: Request, res: Response) => {
    const payout = await earningsService.requestPayout(req.user!.sub);
    res
      .status(201)
      .json(ApiResponse.success(payout, "Payout request submitted"));
  },
);

export const getPayoutHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const payouts = await earningsService.getPayoutHistory(req.user!.sub);
    res.json(ApiResponse.success(payouts, "Payout history fetched"));
  },
);
