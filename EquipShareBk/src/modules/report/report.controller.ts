import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import * as reportService from "./report.service";

export const fileReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.fileReport(req.user!.sub, req.body);
  res
    .status(201)
    .json(ApiResponse.success(report, "Report submitted successfully"));
});

export const getReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.getReport(String(req.params.id));
  res.json(ApiResponse.success(report, "Report fetched"));
});

export const getMyReports = asyncHandler(
  async (req: Request, res: Response) => {
    const reports = await reportService.getMyReports(req.user!.sub);
    res.json(ApiResponse.success(reports, "Your reports"));
  },
);

export const listReports = asyncHandler(async (req: Request, res: Response) => {
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const listingId =
    typeof req.query.listingId === "string" ? req.query.listingId : undefined;
  const reports = await reportService.listReports(status, listingId);
  res.json(ApiResponse.success(reports, "All reports"));
});

export const markUnderReview = asyncHandler(
  async (req: Request, res: Response) => {
    const report = await reportService.markReportUnderReview(
      req.user!.sub,
      String(req.params.id),
    );
    res.json(ApiResponse.success(report, "Report marked as Under Review"));
  },
);

export const resolveReport = asyncHandler(
  async (req: Request, res: Response) => {
    await reportService.resolveReport(
      req.user!.sub,
      String(req.params.id),
      req.body,
    );
    res.json(ApiResponse.success(null, "Report resolved"));
  },
);
