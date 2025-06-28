import { sendEmail } from '../utils/mailer';
import dotenv from "dotenv";
import ejs from 'ejs';
import path from 'path';
dotenv.config();


interface ContactData {
  firstName: string;
  lastName: string;
  message: string;
  email: string;
  phoneNumber: string;
  profession: string;
}

export const sendContactEmail = async (data: ContactData) => {
  const subject = `New Contact Form Submission from ${data.firstName} ${data.lastName}`;

  const templatePath = path.join(__dirname, '../template/contactEmail.ejs');
  const html = await ejs.renderFile(templatePath, data);

  await sendEmail({
    to: process.env.MAIL_USER!, // your email
    subject,
    html,
  });
};


export const sendPasswordEmail = async (to: string, name: string, password: string) => {
  const templatePath = path.join(__dirname, "../template/sendPassword.ejs");
  const html = await ejs.renderFile(templatePath, { name, email: to, password });

  await sendEmail({
    to,
    subject: "🎉 Welcome to MoneySquad – Your Account is Now Active!",
    html,
  });
};


export const sendOtp = async (to: string, name: string, password: string) => {
  const templatePath = path.join(__dirname, "../template/sendOtp.ejs");
  const html = await ejs.renderFile(templatePath, { name, email: to, password });

  await sendEmail({
    to,
    subject: "Otp for email verification",
    html,
  });
};