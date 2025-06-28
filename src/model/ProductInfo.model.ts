import mongoose, { Schema, Document } from 'mongoose';

export interface Product {
  type: string;
  interestRate: string;
  processingFees: string;
  loanAmount: string;
  tenure: string;
}

export interface IProductInfo extends Document {
  guides: Product[];
  policies: {
    eligibilityCriteria: Record<string, string[]>;
    eligibilityCalculation: Record<string, string[]>;
  };
  documents: Record<
    string,
    {
      color: string;
      subcategories: Record<string, string[]>;
    }
  >;
}

const ProductSchema = new Schema({
  type: String,
  interestRate: String,
  processingFees: String,
  loanAmount: String,
  tenure: String,
});

const ProductInfoSchema = new Schema<IProductInfo>({
  guides: [ProductSchema],
  policies: {
    eligibilityCriteria: { type: Schema.Types.Mixed },
    eligibilityCalculation: { type: Schema.Types.Mixed },
  },
  documents: {
    type: Schema.Types.Mixed, // Allow flexible structure
  },
});

export const ProductInfoModel = mongoose.model<IProductInfo>('ProductInfo', ProductInfoSchema);