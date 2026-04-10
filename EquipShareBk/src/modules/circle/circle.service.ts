import { AppError } from "../../shared/errors/AppError";
import { UserModel } from "../auth/auth.schema";
import { addCircle, removeCircle } from "../auth/auth.repository";
import * as circleRepository from "./circle.repository";
import { CreateCircleDto } from "./circle.repository";

export const createCircle = async (
  adminId: string,
  dto: Omit<CreateCircleDto, "createdById">,
) => {
  const existing = await circleRepository.findAllActive().then((circles) =>
    circles.find(
      (c) => c.name.toLowerCase() === dto.name.toLowerCase(),
    ),
  );
  if (existing) {
    throw new AppError("A circle with this name already exists", 409, "CIRCLE_NAME_TAKEN");
  }
  return circleRepository.createCircle({ ...dto, createdById: adminId });
};

export const listCircles = () => circleRepository.findAllActive();

export const getCircle = async (circleId: string) => {
  const circle = await circleRepository.findById(circleId);
  if (!circle) throw new AppError("Circle not found", 404, "CIRCLE_NOT_FOUND");
  return circle;
};

export const getMembers = async (circleId: string) => {
  const circle = await circleRepository.findById(circleId);
  if (!circle) throw new AppError("Circle not found", 404, "CIRCLE_NOT_FOUND");
  return circleRepository.findMembers(circleId);
};

export const joinCircle = async (userId: string, circleId: string) => {
  const [circle, user] = await Promise.all([
    circleRepository.findById(circleId),
    UserModel.findById(userId).lean(),
  ]);

  if (!circle) throw new AppError("Circle not found", 404, "CIRCLE_NOT_FOUND");
  if (!circle.isActive)
    throw new AppError("This circle is no longer active", 409, "CIRCLE_INACTIVE");
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (user.trustedCircle.includes(circleId))
    throw new AppError("You are already a member of this circle", 409, "ALREADY_A_MEMBER");

  if (circle.emailDomainRule) {
    if (!user.email.endsWith(circle.emailDomainRule)) {
      throw new AppError(
        `Your email must end with ${circle.emailDomainRule} to join this circle`,
        403,
        "EMAIL_DOMAIN_NOT_ALLOWED",
      );
    }
  }

  await Promise.all([
    addCircle(userId, circleId),
    circleRepository.incrementMemberCount(circleId),
  ]);
};

export const leaveCircle = async (userId: string, circleId: string) => {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (!user.trustedCircle.includes(circleId))
    throw new AppError("You are not a member of this circle", 409, "NOT_A_MEMBER");

  await Promise.all([
    removeCircle(userId, circleId),
    circleRepository.decrementMemberCount(circleId),
  ]);
};

export const removeMember = async (circleId: string, userId: string) => {
  const circle = await circleRepository.findById(circleId);
  if (!circle) throw new AppError("Circle not found", 404, "CIRCLE_NOT_FOUND");

  const user = await UserModel.findById(userId).lean();
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (!user.trustedCircle.includes(circleId))
    throw new AppError("This user is not a member of this circle", 409, "NOT_A_MEMBER");

  await Promise.all([
    removeCircle(userId, circleId),
    circleRepository.decrementMemberCount(circleId),
  ]);
};

export const deactivateCircle = async (circleId: string) => {
  const circle = await circleRepository.deactivate(circleId);
  if (!circle) throw new AppError("Circle not found", 404, "CIRCLE_NOT_FOUND");
  return circle;
};
