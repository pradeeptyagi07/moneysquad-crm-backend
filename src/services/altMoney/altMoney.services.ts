import { sendEmail } from '../../utils/mailer';
import dotenv from "dotenv";
import ejs from 'ejs';
import path from 'path';
dotenv.config();

export interface ContactFormData {
  fullName: string;
  workEmail: string;
  phoneNumber: string;
  companyName: string;
  industry: string;
  inquiryType: string;
  fundingRequirement: string;
  additionalDetails: string;
}

export interface LoanInquiryFormData {
  loanType: string;
  subLoanType: string;
  loanAmountRequired: string;
  businessName: string;
  annualTurnover: string;
  fullName: string;
  mobileNumber: string;
  emailAddress: string;
  city: string;
}

export interface AIEngineInterest {
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
}


export const sendEnquiryEmail = async (data: ContactFormData) => {

  const templatePath = path.join(__dirname, '../../template/altMoneyEnquiry.ejs');
  const html = await ejs.renderFile(templatePath, data);

  await sendEmail({
    to: process.env.MAIL_USER!,
    subject:`Altmoney 📩 New Business Enquiry - ${data.fullName}`,
    html,
  });
};

export const sendLoanInquiryEmail = async (data: LoanInquiryFormData) => {

  const templatePath = path.join(__dirname, '../../template/loanInquiryEmail.ejs');
  const html = await ejs.renderFile(templatePath, data);

  await sendEmail({
    to: process.env.MAIL_USER!,
    subject:`Altmoney Loan Inquiry - ${data.loanType} - ${data.fullName}`,
    html,
  });
};

export const sendAIEngineInterestEmail = async (data: AIEngineInterest) => {
  const templatePath = path.join(__dirname, '../../template/aiEngineInterestEmail.ejs');
  const html = await ejs.renderFile(templatePath, data);

  await sendEmail({
    to: process.env.MAIL_USER!,
    subject:`Altmoney AI Engine Interest Submitted by ${data.fullName}`,
    html,
  });
};