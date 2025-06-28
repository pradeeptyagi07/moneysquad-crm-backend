import mongoose, { Schema } from "mongoose";

const changeRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "CombinedUser", required: true },
    requestType: { type: String, enum: ["bankDetails", "documents"], required: true },
    previousData: { type: Schema.Types.Mixed, required: true },
    currentData: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approveMessage: { type: String },
    rejectMessage: { type: String },
    reason: { type: String },
  },
  { timestamps: true }
);

export const ChangeRequestModel = mongoose.model("ChangeRequest", changeRequestSchema);