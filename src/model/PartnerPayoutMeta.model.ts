import mongoose, { Schema, Document } from "mongoose";

export interface IPartnerPayoutMeta extends Document {
  partnerId: string;
  month: number;
  year: number;
  gstStatus: string;
  advancesPaid: number;
}

const PartnerPayoutMetaSchema: Schema<IPartnerPayoutMeta> = new Schema(
  {
    partnerId: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    gstStatus: { type: String, default: "Pending" },
    advancesPaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PartnerPayoutMetaSchema.index({ partnerId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<IPartnerPayoutMeta>("PartnerPayoutMeta", PartnerPayoutMetaSchema);