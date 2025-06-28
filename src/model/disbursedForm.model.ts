// models/disbursedForm.model.ts
import mongoose from "mongoose";

const DisbursedFormSchema = new mongoose.Schema(
    {
        leadUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CombinedUser",
            required: true,
            unique: true,
        },
        leadId: {
            type: String
        },
        loanAmount: {
            type: Number
        },
        tenureMonths: {
            type: Number
        },
        interestRatePA: {
            type: Number
        },
        processingFee: {
            type: Number
        },
        insuranceCharges: {
            type: Number
        },
        loanScheme: {
            type: String
        },
        lanNumber: {
            type: String
        },
        actualDisbursedDate: {
            type: Date
        },
    },
    { timestamps: true }
);

const DisbursedForm = mongoose.model("DisbursedForm", DisbursedFormSchema);
export default DisbursedForm;