import { Schema } from "mongoose";

export const otpSchema = new Schema(
  {
    code: { type: String },
    expiresAt: { type: Date },
  },
  { _id: false }
);

export const basicInfoSchema = new Schema({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  registeringAs: { type: String, required: true },
  teamStrength: { type: String }
});

export const personalInfoSchema = new Schema({
  dateOfBirth: { type: Date },
  currentProfession: { type: String },
  emergencyContactNumber: { type: String },
  focusProduct: { type: String },
  roleSelection: { type: String },
  experienceInSellingLoans: { type: String }
});

export const addressDetailsSchema = new Schema({
  addressLine1: { type: String },
  addressLine2: { type: String },
  landmark: { type: String },
  city: { type: String },
  pincode: { type: String },
  addressType: { type: String },
});

export const bankDetailsSchema = new Schema({
  accountType: { type: String },
  accountHolderName: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  branchName: { type: String },
  relationshipWithAccountHolder: { type: String },
  isGstBillingApplicable: { type: String },
});

export const documentsSchema = new Schema({
  profilePhoto: { type: String },
  panCard: { type: String },
  aadharFront: { type: String },
  aadharBack: { type: String },
  cancelledCheque: { type: String },
  gstCertificate: { type: String },
  aditional: { type: String },
});

export const leadLoanSchema = new Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
});

export const addressSchema = new Schema({
  pincode: { type: String },
  state: { type: String },
  city: { type: String },
});
