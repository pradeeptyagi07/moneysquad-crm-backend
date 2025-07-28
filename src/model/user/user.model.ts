import mongoose, { Schema } from "mongoose";
import { ICombinedUser } from "./interfaces";
import {
    otpSchema,
    basicInfoSchema,
    personalInfoSchema,
    addressDetailsSchema,
    bankDetailsSchema,
    documentsSchema,
    leadLoanSchema,
    addressSchema,
} from "./subSchemas";

const { ObjectId } = Schema.Types;

export const LoanTypeIdMap = {
  "PL-Term Loan": "683e8b66048df4368f97003b",
  "PL-Overdraft": "683e8b6b048df4368f97003d",
  "BL-Term Loan": "683e8b70048df4368f97003f",
  "BL-Overdraft": "683e8b75048df4368f970041",
  "SEPL-Term Loan": "683e8b7a048df4368f970043",
  "SEPL-Overdraft": "683e8b80048df4368f970045",
} as const;

export type LoanType = keyof typeof LoanTypeIdMap;



const combinedUserSchema = new Schema<ICombinedUser>(
    {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, required: true },
        mobile: { type: String, required: true },
        location: { type: String },
        role: {
            type: String,
            enum: ["admin", "partner", "manager", "lead", "associate"],
            required: true,
        },
        password: { type: String, required: true },
        status: {
            type: String,
            enum: ["active", "inactive", "approved", "rejected", "disbursed", "login", "pending", "closed", "expired", "new lead"],
            default: "active",
        },
        otp: otpSchema,

        managerId: { type: String },

        partnerId: { type: String },
        basicInfo: { type: basicInfoSchema },
        personalInfo: { type: personalInfoSchema },
        addressDetails: { type: addressDetailsSchema },
        bankDetails: { type: bankDetailsSchema },
        documents: { type: documentsSchema },
        commissionPlan: {
            type: String,
            enum: [],
            default: "n/a"
        },
      agreementAccepted: {
                type: Boolean,
                required: function () {
                return this.role === "partner";
            },
        },
        agreementAcceptedLogs: {
            type: [
                {
                    timestamp: { type: Date },
                    ip: { type: String }
                }
            ],
            default: undefined, // explicitly avoid defaulting to []
        }
        ,
        partner_Lead_Id: { type: ObjectId, ref: "CombinedUser" },
        assocaite_Lead_Id: { type: ObjectId, ref: "CombinedUser" },
        applicantProfile: { type: String },
        applicantName: { type: String },
        businessName: { type: String },
        pincode: { type: addressSchema },
        loan: {
            type: leadLoanSchema
        },
        assignedTo: { type: ObjectId, ref: "CombinedUser" },
        assocaite_Id: { type: ObjectId, ref: "CombinedUser" },
        leadId: { type: String},
        lenderType: { type: String },
        comments: { type: String },

        associateOf: {
            type: ObjectId,
            ref: "CombinedUser",
            required: function () {
                return this.role === "associate";
            },
        },

        associateDisplayId: { type: String},
    },
    { timestamps: true }
);

export const CombinedUser = mongoose.model<ICombinedUser>("CombinedUser", combinedUserSchema);
