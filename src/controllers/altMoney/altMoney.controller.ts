import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utils/responseHandler";
import {
  AIEngineInterest,
  ContactFormData,
  LoanInquiryFormData,
  sendAIEngineInterestEmail,
  sendEnquiryEmail,
  sendLoanInquiryEmail,
} from "../../services/altMoney/altMoney.services";

export const altMoneyController = {
  async sendEnquiryMessage(req: Request, res: Response) {
    try {
      const {
        fullName,
        workEmail,
        phoneNumber,
        companyName,
        industry,
        inquiryType,
        fundingRequirement,
        additionalDetails,
      } = req.body;

      const data: ContactFormData = {
        fullName,
        workEmail,
        phoneNumber,
        companyName,
        industry,
        inquiryType,
        fundingRequirement,
        additionalDetails,
      };

      await sendEnquiryEmail(data);
      successResponse(res, null, "Message sent successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  },

  async sendLoanInquiryMessage(req: Request, res: Response) {
    try {
      const {
        loanType,
        subLoanType,
        loanAmountRequired,
        businessName,
        annualTurnover,
        fullName,
        mobileNumber,
        emailAddress,
        city,
      } = req.body;

      const data: LoanInquiryFormData = {
        loanType,
        subLoanType,
        loanAmountRequired,
        businessName,
        annualTurnover,
        fullName,
        mobileNumber,
        emailAddress,
        city,
      };

      await sendLoanInquiryEmail(data);
      successResponse(res, null, "Loan inquiry submitted successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  },

  async sendAIEngineInterest(req: Request, res: Response) {
    try {
      const { fullName, email, phoneNumber, businessName } = req.body;

      const data: AIEngineInterest = {
        fullName,
        email,
        phoneNumber,
        businessName,
      };

      await sendAIEngineInterestEmail(data);
      successResponse(res, null, "AI Engine interest submitted successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  },
};
