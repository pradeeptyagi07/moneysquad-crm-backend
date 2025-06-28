import mongoose from 'mongoose';

const loanTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export const LoanType = mongoose.model('LoanType', loanTypeSchema);
