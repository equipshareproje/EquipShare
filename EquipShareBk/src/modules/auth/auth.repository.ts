import { UserModel, RefreshTokenModel, IUser } from "./auth.schema";
import { RegisterDto } from "./auth.dto";
import crypto from "crypto";
import { Types } from "mongoose";

export const findByEmail = (email: string) =>
  UserModel.findOne({ email }).select("+passwordHash");

export const findById = (id: string) => UserModel.findById(id);

export const createUser = (
  data: Omit<RegisterDto, "password"> & { passwordHash: string },
) => UserModel.create(data);

export const createRefreshToken = async (
  userId: string,
  expiresAt: Date,
  rawToken: string,
) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return RefreshTokenModel.create({
    tokenHash,
    userId: new Types.ObjectId(userId),
    expiresAt,
  });
};

export const findRefreshToken = async (rawToken: string) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return RefreshTokenModel.findOne({ tokenHash, isRevoked: false }).select(
    "+tokenHash",
  );
};

export const revokeRefreshToken = (id: string) =>
  RefreshTokenModel.findByIdAndUpdate(id, { isRevoked: true });

export const revokeAllUserTokens = (userId: string) =>
  RefreshTokenModel.updateMany(
    { userId: new Types.ObjectId(userId), isRevoked: false },
    { isRevoked: true },
  );

export const saveVerificationToken = (
  userId: string,
  tokenHash: string,
  expiry: Date,
) =>
  UserModel.findByIdAndUpdate(userId, {
    verificationToken: tokenHash,
    verificationTokenExpiry: expiry,
  });

export const findByVerificationToken = (tokenHash: string) =>
  UserModel.findOne({
    verificationToken: tokenHash,
    verificationTokenExpiry: { $gt: new Date() },
  }).select("+verificationToken");

export const deleteUserById = (userId: string) =>
  UserModel.findByIdAndDelete(userId);

export const addCircle = (userId: string, circleId: string) =>
  UserModel.findByIdAndUpdate(userId, { $addToSet: { trustedCircle: circleId } });

export const removeCircle = (userId: string, circleId: string) =>
  UserModel.findByIdAndUpdate(userId, { $pull: { trustedCircle: circleId } });

export const setVerified = (userId: string) =>
  UserModel.findByIdAndUpdate(userId, {
    verified: true,
    $unset: { verificationToken: "", verificationTokenExpiry: "" },
  });
