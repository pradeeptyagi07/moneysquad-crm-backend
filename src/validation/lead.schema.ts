import { z } from "zod";

export const createLeadSchema = z.object({
    applicantName: z.string().min(1),
    applicantProfile: z.string().min(1),
    businessName: z.string().optional(),
    mobile: z.string(),
    email: z.string().email(),
    pincode: z.string().min(5),
    city: z.string(),
    state: z.string(),
    loantType: z.string().min(1),
    loanAmount: z.coerce.number(),
    comments: z.string().optional(),
    assignto: z.string().optional(),
    lenderType: z.string().optional(), //Duplicate lead purpose only
    partnerId: z.string().optional()
});


export const editLeadSchema = z.object({
    applicantName: z.string().optional(),
    applicantProfile: z.string().optional(),
    businessName: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().email().optional(),
    pincode: z.string().min(5).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    loantType: z.string().optional(),
    loanAmount: z.coerce.number().optional(),
    comments: z.string().optional(),
    assignedTo: z.string().optional(),
    lenderType: z.string().optional(),
    partnerId: z.string().optional()
});


export const assignManagerSchema = z.object({
    manager_assigned: z.string().min(1, "Manager ID is required"),
});


export const updateLeadStatusSchema = z.object({
    action: z.enum(["login", "approved", "rejected", "disbursed", "closed", "expired" ,"new lead"], {
        required_error: "Action is required",
    }),
    approvedAmount: z.string().optional(),
    closeReason: z.string().optional(),
    comment: z.string().optional(),
    rejectReason: z.string().optional(),
    rejectImage: z.string().optional(),
});