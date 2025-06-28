import mongoose from "mongoose";

const lenderLoanMatrixSchema = new mongoose.Schema({
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lender",
        required: true,
    },
    loanTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoanType",
        required: true,
    },
    enabled: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});

lenderLoanMatrixSchema.index({ lenderId: 1, loanTypeId: 1 }, { unique: true });

export const LenderLoanMatrix = mongoose.model("LenderLoanMatrix", lenderLoanMatrixSchema);
