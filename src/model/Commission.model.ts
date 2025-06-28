import mongoose from 'mongoose';

const SheetEntrySchema = new mongoose.Schema({
  lenderName: String,
  termLoan: Number,
  overdraft: Number,
  remark: String,
});

const SheetSchema = new mongoose.Schema({
  sheetType: {
    type: String,
    enum: ['Salaried Individual Cases', 'Business (SENP) Cases', 'Professional (SEP-Dr_CA_others)'],
  },
  entries: [SheetEntrySchema],
});

const CommissionSchema = new mongoose.Schema({
  commissionType: {
    type: String,
    enum: ['gold', 'platinum', 'diamond'],
    required: true,
    unique: true,
  },
  sheets: [SheetSchema],
});

export default mongoose.model('Commission', CommissionSchema);