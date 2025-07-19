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
            default: false,
            required: function () {
                return this.role === "partner";
            },
        },
        agreementAcceptedLogs: [
        {
            timestamp: { type: Date },
            ip: { type: String }
        }],
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
