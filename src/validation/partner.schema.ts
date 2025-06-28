import { z } from "zod";

export const createPartnerSchema = z.object({
  basicInfo: z.object({
    fullName: z.string().min(1),
    mobile: z.string().min(10),
    email: z.string().email(),
    registeringAs: z.string().min(1),
    teamStrength: z.string().optional()
  }),
  personalInfo: z.object({
    experienceInSellingLoans: z.string().optional(),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date",
    }),
    currentProfession: z.string().min(1),
    emergencyContactNumber: z.string().min(10),
    focusProduct: z.string().min(1),
    roleSelection: z.string().min(1),
  }),
  addressDetails: z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().min(1),
    pincode: z.string().min(5),
    addressType: z.string().min(1),
  }),
  bankDetails: z.object({
    accountType: z.string().min(1),
    accountHolderName: z.string().min(1),
    bankName: z.string().min(1),
    accountNumber: z.string().min(5),
    ifscCode: z.string().min(5),
    branchName: z.string().min(1),
    relationshipWithAccountHolder: z.string(),
    isGstBillingApplicable: z.string().optional()
  }),
});


export const editPartnerSchema = z.object({
  basicInfo: z.object({
    fullName: z.string().optional(),
    mobile: z.string().min(10).optional(),
    email: z.string().email().optional(),
  }).optional(),
  personalInfo: z.object({
    currentProfession: z.string().min(1).optional(),
    focusProduct: z.string().min(1).optional(),
    roleSelection: z.string().min(1).optional(),
  }).optional(),
  commission: z.string().optional()
})
