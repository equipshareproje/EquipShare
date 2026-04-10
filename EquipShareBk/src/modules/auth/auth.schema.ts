import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  avatar?: string;
  roles: string[];
  bio?: string;
  verified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  trustedCircle: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshToken extends Document {
  tokenHash: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String },
    avatar: { type: String },
    roles: { type: [String], default: () => ["Renter"] },
    bio: { type: String, maxlength: 500 },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    trustedCircle: [{ type: String }],
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true, select: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const UserModel = model<IUser>("User", userSchema);
export const RefreshTokenModel = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);
