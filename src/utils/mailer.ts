import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();


export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    path: string;
  }[];
}

export const sendEmail = async ({ to, subject, html, attachments }: MailOptions) => {
  await transporter.sendMail({
    from: `"MoneySquad Contact" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    attachments
  });
};
