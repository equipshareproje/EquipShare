import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ApiResponse } from "../../shared/utils/apiResponse";
import * as circleService from "./circle.service";

export const createCircle = asyncHandler(
  async (req: Request, res: Response) => {
    const circle = await circleService.createCircle(req.user!.sub, req.body);
    return res.status(201).json(ApiResponse.success(circle, "Circle created"));
  },
);

export const listCircles = asyncHandler(
  async (_req: Request, res: Response) => {
    const circles = await circleService.listCircles();
    return res.json(ApiResponse.success(circles));
  },
);

export const getCircle = asyncHandler(async (req: Request, res: Response) => {
  const circle = await circleService.getCircle(req.params.id as string);
  return res.json(ApiResponse.success(circle));
});

export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await circleService.getMembers(req.params.id as string);
  return res.json(ApiResponse.success(members));
});

export const joinCircle = asyncHandler(async (req: Request, res: Response) => {
  await circleService.joinCircle(req.user!.sub, req.params.id as string);
  return res.json(ApiResponse.success(null, "Successfully joined the circle"));
});

export const leaveCircle = asyncHandler(
  async (req: Request, res: Response) => {
    await circleService.leaveCircle(req.user!.sub, req.params.id as string);
    return res.json(ApiResponse.success(null, "Successfully left the circle"));
  },
);

export const removeMember = asyncHandler(
  async (req: Request, res: Response) => {
    await circleService.removeMember(req.params.id as string, req.params.userId as string);
    return res.json(ApiResponse.success(null, "Member removed from circle"));
  },
);

export const deactivateCircle = asyncHandler(
  async (req: Request, res: Response) => {
    const circle = await circleService.deactivateCircle(req.params.id as string);
    return res.json(ApiResponse.success(circle, "Circle deactivated"));
  },
);
