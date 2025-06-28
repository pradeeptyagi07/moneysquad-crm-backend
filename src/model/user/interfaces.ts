import { Document } from "mongoose";

export type UserRole = "admin" | "partner" | "manager" | "user" | "associate";
export type UserStatus =
  | "active"
  | "inactive"
  | "approved"
  | "rejected"
  | "disbursed"
  | "login"
  | "pending"
  | "closed"
  | "expired"
  | "new lead";

  export type UserCommissionPlab = "gold" | "platinum" | "dimond" | "n/a";

export interface IOtp {
  code: string;
  expiresAt: Date;
}

export interface ICombinedUser extends Document {
  firstName?: string;
  lastName?: string;
  email: string;
  mobile: string;
  location?: string;
  role: UserRole;
  password: string;
  status: UserStatus;
  managerId?: string;
  associateOf?: string;

  partnerId?: string;
  basicInfo?: any;
  personalInfo?: any;
  addressDetails?: any;
  bankDetails?: any;
  documents?: any;
  commissionPlan?: UserCommissionPlab;

  partner_Lead_Id?: string;
  assignedTo?: string;
  assocaite_Id?: string;
  leadId?: string;
  manager_assigned?: string;
  applicantProfile?: string;
  applicantName?: string;
  businessName?: string;
  applicant?: {
    name: string;
    profile?: string;
    mobile: string;
    email?: string;
    pincode?: string;
  };
  pincode: {
    pincode: string;
    state: string;
    city: string;
  };
  loan: {
    type: string;
    amount: number;
  };
  lenderType?: string;
  assocaite_Lead_Id?: string;
  associateDisplayId?: string;

  comments?: string;
  otp?: IOtp;
  createdAt?: Date;
  updatedAt?: Date;
}
