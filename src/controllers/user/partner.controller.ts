import { Request, Response } from "express";
import {
  createPartnerSchema,
  editPartnerSchema,
} from "../../validation/partner.schema";
import { generateOTP, unflattenObject } from "../../utils/helper";
import { partnerService } from "../../services/user/partner.service";
import { OTP } from "../../model/otp.model";
import { sendOtp } from "../../services/common.service";

export const partnerController = {
  async createPartner(req: Request, res: Response) {
    try {
      console.log("req", req.body);
      const formData = unflattenObject(req.body);
      console.log("formData", formData);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const validatedData = createPartnerSchema.safeParse(formData);
      if (validatedData.error) {
        console.log(validatedData.error.flatten().fieldErrors);
      }

      const newPartner = await partnerService.createPartner(
        { ...validatedData.data, ip: req.ip },
        files
      );

      res.status(201).json({ success: true, data: newPartner });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  async getAllPartners(req: Request, res: Response) {
    try {
      const partners = await partnerService.getAllPartners();
      res.status(200).json({ success: true, data: partners });
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  async getPartnerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const partner = await partnerService.getPartnerById(id);
      if (!partner) {
        res.status(404).json({ success: false, message: "Partner not found" });
      }
      res.status(200).json({ success: true, data: partner });
    } catch (error: any) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  async editPartner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const formData = unflattenObject(req.body);
      const validatedData = editPartnerSchema.parse(formData);

      const updatedPartner = await partnerService.editPartner(
        id,
        validatedData
      );
      res.status(200).json({ success: true, data: updatedPartner });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const otp = generateOTP();

      await OTP.findOneAndUpdate(
        { email },
        { otp },
        { upsert: true, new: true }
      );

      await sendOtp(email, "User", otp);
      res.status(201).json({ success: true, message: "otp sent", data: null });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const deleteOtp = await partnerService.verifyOtp(email, otp);

      res.status(200).json({ success: true, message: "OTP verified." });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Verification failed." });
    }
  },
};
