import { Request, Response } from 'express';
import { successResponse, errorResponse } from "../../utils/responseHandler";
import { AIEngineInterest, ContactFormData, LoanInquiryFormData, sendAIEngineInterestEmail, sendEnquiryEmail, sendLoanInquiryEmail } from '../../services/altMoney/altMoney.services';

export const altMoneyController = {

    async sendEnquiryMessage(req: Request, res: Response) {
        try {
            const {
                fullName,
                workEmail,
                phoneNumber,
                companyName,
                annualTurnover,
                industry,
                inquiryType,
                fundingRequirement,
                additionalDetails
            } = req.query;

            const data: ContactFormData = {
                fullName: fullName as string,
                workEmail: workEmail as string,
                phoneNumber: phoneNumber as string,
                companyName: companyName as string,
                annualTurnover: annualTurnover as string,
                industry: industry as string,
                inquiryType: inquiryType as string,
                fundingRequirement: fundingRequirement as string,
                additionalDetails: additionalDetails as string,
            };

            await sendEnquiryEmail(data);

            successResponse(res, null, "Message sent successfully");
        } catch (error) {
            errorResponse(res, error);
        }
    }

    ,
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
                city
            } = req.query;

            const data: LoanInquiryFormData = {
                loanType: loanType as string,
                subLoanType: subLoanType as string,
                loanAmountRequired: loanAmountRequired as string,
                businessName: businessName as string,
                annualTurnover: annualTurnover as string,
                fullName: fullName as string,
                mobileNumber: mobileNumber as string,
                emailAddress: emailAddress as string,
                city: city as string
            };

            await sendLoanInquiryEmail(data);

            successResponse(res, null, "Loan inquiry submitted successfully");
        } catch (error) {
            errorResponse(res, error);
        }
    }
    ,
    async sendAIEngineInterest(req: Request, res: Response) {
        try {
            const {
                fullName,
                email,
                phoneNumber,
                businessName
            } = req.query;

            const data: AIEngineInterest = {
                fullName: fullName as string,
                email: email as string,
                phoneNumber: phoneNumber as string,
                businessName: businessName as string
            };

            await sendAIEngineInterestEmail(data);

            successResponse(res, null, "AI Engine interest submitted successfully");
        } catch (error) {
            errorResponse(res, error);
        }
    }
    ,
}