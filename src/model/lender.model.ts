import mongoose from 'mongoose';

const lenderSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export const Lender = mongoose.model('Lender', lenderSchema);