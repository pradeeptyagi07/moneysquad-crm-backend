import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  bankImage: { type: String },
  offerHeadline: { type: String, required: true },
  offerValidity: { type: Date, required: true },
  loanType: { type: String, required: true },
  interestRate: { type: Number, required: true },
  processingFee: { type: Number, required: true },
  isFeatured: { type: Boolean, default: false },
  keyFeatures: { type: [String] },
  eligibility: {
    minAge: { type: Number },
    maxAge: { type: Number },
    minIncome: { type: Number },
    employmentType: { type: String },
    minCreditScore: { type: Number },
  },
  isDeleted: { type: Boolean, default: false },
  processingFeeType: { type: String, required: true },
}, { timestamps: true });

export const Offer = mongoose.model('Offer', offerSchema);
