import { Schema, model, Document, Types } from "mongoose";

export interface ICircle extends Document {
  name: string;
  description: string;
  eligibilityCriteria: string;
  emailDomainRule?: string;
  isActive: boolean;
  memberCount: number;
  createdById: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const circleSchema = new Schema<ICircle>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    eligibilityCriteria: { type: String, required: true, trim: true },
    emailDomainRule: { type: String, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    memberCount: { type: Number, default: 0 },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

circleSchema.index({ isActive: 1 });

export const CircleModel = model<ICircle>("Circle", circleSchema);
