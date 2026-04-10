import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import * as disputeService from "./dispute.service";

export const fileDispute = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputeService.fileDispute(req.user!.sub, req.body);
  res
    .status(201)
    .json(ApiResponse.success(dispute, "Dispute filed successfully"));
});

export const getDispute = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputeService.getDispute(
    String(req.params.id),
    req.user!.sub,
    req.user!.role,
  );
  res.json(ApiResponse.success(dispute, "Dispute fetched"));
});

export const getMyDisputes = asyncHandler(
  async (req: Request, res: Response) => {
    const disputes = await disputeService.getMyDisputes(req.user!.sub);
    res.json(ApiResponse.success(disputes, "Your disputes"));
  },
);

export const listDisputes = asyncHandler(
  async (req: Request, res: Response) => {
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const disputes = await disputeService.listDisputes(status);
    res.json(ApiResponse.success(disputes, "All disputes"));
  },
);

export const markUnderReview = asyncHandler(
  async (req: Request, res: Response) => {
    const dispute = await disputeService.markUnderReview(String(req.params.id));
    res.json(ApiResponse.success(dispute, "Dispute marked as Under Review"));
  },
);

export const resolveDispute = asyncHandler(
  async (req: Request, res: Response) => {
    await disputeService.resolveDispute(
      req.user!.sub,
      String(req.params.id),
      req.body,
    );
    res.json(ApiResponse.success(null, "Dispute resolved"));
  },
);
