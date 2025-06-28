import mongoose, { Document, Schema } from 'mongoose';

export interface IBank extends Document {
  name: string;
}

const BankSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBank>('Bank', BankSchema);