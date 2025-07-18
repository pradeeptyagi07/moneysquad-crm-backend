import mongoose, { Schema, Document } from "mongoose";

export interface IPartnerPayout extends Document {
  lead_Id: mongoose.Types.ObjectId;
  partner_Id: mongoose.Types.ObjectId;
  leadId: string;
  partner: {
    name: string;
    partnerId: string;
  };
  associate: {
    name: string;
    associateDisplayId: string;
  };
  applicant: {
    name: string;
    business: string;
  };
  lender: {
    name: string;
    loanType: string;
  };
  disbursedId: mongoose.Types.ObjectId;
  disbursedAmount: number;
  payoutStatus: "pending" | "paid" | "rejected";
  payoutStatusUpdatedAt?: Date;
  warning: boolean;
  remark: string;
  commissionRemark?: string;
  commission?: number;
}

const PartnerPayoutSchema: Schema<IPartnerPayout> = new Schema(
  {
    leadId: {
      type: String,
      required: true,
    },
    lead_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CombinedUser",
    },
    partner_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CombinedUser",
    },
    partner: {
      name: { type: String, required: true },
      partnerId: { type: String },
    },
    associate: {
      name: { type: String },
      associateDisplayId: { type: String },
    },
    applicant: {
      name: { type: String },
      business: { type: String },
    },
    lender: {
      name: { type: String },
      loanType: { type: String },
    },
    disbursedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisbursedForm",
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    payoutStatusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    warning: {
      type: Boolean,
      default: false,
    },
    remark: {
      type: String
    },
    commissionRemark: {
      type: String
    },
    commission: {
      type: Number,
    },
    disbursedAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPartnerPayout>("PartnerPayout", PartnerPayoutSchema);