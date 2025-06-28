// models/otp.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 },
  },
  { timestamps: false }
);

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);