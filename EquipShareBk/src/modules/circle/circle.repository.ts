import { Types } from "mongoose";
import { CircleModel, ICircle } from "./circle.schema";
import { UserModel } from "../auth/auth.schema";

export interface CreateCircleDto {
  name: string;
  description: string;
  eligibilityCriteria: string;
  emailDomainRule?: string;
  createdById: string;
}

export const createCircle = (dto: CreateCircleDto) =>
  CircleModel.create({
    ...dto,
    createdById: new Types.ObjectId(dto.createdById),
  });

export const findAllActive = () =>
  CircleModel.find({ isActive: true }).sort({ name: 1 }).lean();

export const findById = (id: string) => CircleModel.findById(id).lean();

export const findMembers = (circleId: string) =>
  UserModel.find({ trustedCircle: circleId })
    .select("_id name email avatar rating reviewCount")
    .lean();

export const incrementMemberCount = (circleId: string) =>
  CircleModel.findByIdAndUpdate(circleId, { $inc: { memberCount: 1 } });

export const decrementMemberCount = (circleId: string) =>
  CircleModel.findByIdAndUpdate(circleId, {
    $inc: { memberCount: -1 },
    $max: { memberCount: 0 },
  });

export const deactivate = (circleId: string) =>
  CircleModel.findByIdAndUpdate(
    circleId,
    { isActive: false },
    { new: true },
  ).lean();
