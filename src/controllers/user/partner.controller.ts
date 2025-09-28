// src/controllers/user/partner.controller.ts
import type { RequestHandler } from "express";
import { Request, Response } from "express";
import {
  createPartnerSchema,
  editPartnerSchema,
} from "../../validation/partner.schema";
import { generateOTP, unflattenObject } from "../../utils/helper";
import { partnerService } from "../../services/user/partner.service";
import { OTP } from "../../model/otp.model";
import { sendOtp } from "../../services/common.service";

/**
 * Expand dot-notation keys from a flat object into nested objects.
 * Example:
 *   { "bankDetails.accountNumber": "123", "basicInfo.email": "a@b.com" }
 * -> { bankDetails: { accountNumber: "123" }, basicInfo: { email: "a@b.com" } }
 */
function expandDotNotation(body: Record<string, any>) {
  const out: Record<string, any> = {};

  const setDeep = (target: any, path: string, value: any) => {
    const parts = path.split(".");
    let cur = target;
    for (let i = 0; i < parts.length; i++) {
      const key = parts[i]!;
      const isLast = i === parts.length - 1;
      if (isLast) {
        cur[key] = value;
      } else {
        if (typeof cur[key] !== "object" || cur[key] === null) {
          cur[key] = {};
        }
        cur = cur[key];
      }
    }
  };

  for (const [k, v] of Object.entries(body)) {
    if (k.includes(".")) {
      setDeep(out, k, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * If a key exists and is a JSON string, parse it in place.
 * Safe to call even if key doesn't exist or isn't JSON.
 */
function parseJsonBlobInPlace(obj: Record<string, any>, key: string) {
  const val = obj[key];
  if (typeof val === "string") {
    try {
      obj[key] = JSON.parse(val);
    } catch {
      // ignore parse errors; keep original string
    }
  }
}

const createPartner: RequestHandler = async (req, res) => {
  try {
    console.log("BODY KEYS:", Object.keys(req.body));

    // 1) Expand flat multipart fields using dot-notation into nested objects
    const expanded = expandDotNotation(req.body);

    // 2) Also support full-object JSON blobs, if client sent them
    for (const k of ["basicInfo", "personalInfo", "addressDetails", "bankDetails"]) {
      parseJsonBlobInPlace(expanded, k);
    }

    // 3) Debug confirms (should all be objects if present)
    console.log("HAS basicInfo?", !!expanded?.basicInfo);
    console.log("HAS personalInfo?", !!expanded?.personalInfo);
    console.log("HAS addressDetails?", !!expanded?.addressDetails);
    console.log(
      "HAS bankDetails?",
      !!expanded?.bankDetails,
      "keys:",
      expanded?.bankDetails && Object.keys(expanded.bankDetails)
    );

    // 4) Validate with Zod
    const validated = createPartnerSchema.safeParse(expanded);
    if (!validated.success) {
      console.log("Zod errors:", validated.error.flatten().fieldErrors);
      res.status(400).json({
        status: false,
        message: "Validation failed",
        errors: validated.error.flatten(),
      });
      return;
    }

    // 5) Files from multer
    const files = req.files as Record<string, Express.Multer.File[]>;

    // 6) Create partner
    const newPartner = await partnerService.createPartner(
      { ...validated.data, ip: req.ip },
      files
    );

    res.status(201).json({ success: true, data: newPartner });
  } catch (error: any) {
    res.status(400).json({ status: false, message: error.message });
  }
};

const getAllPartners: RequestHandler = async (_req, res) => {
  try {
    const partners = await partnerService.getAllPartners();
    res.status(200).json({ success: true, data: partners });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getPartnerById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await partnerService.getPartnerById(id);
    if (!partner) {
      res.status(404).json({ success: false, message: "Partner not found" });
      return;
    }
    res.status(200).json({ success: true, data: partner });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const editPartner: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // For non-file edit route (upload.none()), we can still support dot-keys
    const formData = unflattenObject(req.body);
    const validatedData = editPartnerSchema.parse(formData);

    const updatedPartner = await partnerService.editPartner(id, validatedData);
    res.status(200).json({ success: true, data: updatedPartner });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const sendOtpHandler: RequestHandler = async (req, res) => {
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
};

const verifyOtpHandler: RequestHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    await partnerService.verifyOtp(email, otp);
    res.status(200).json({ success: true, message: "OTP verified." });
  } catch {
    res.status(500).json({ success: false, message: "Verification failed." });
  }
};

export const partnerController = {
  createPartner,
  getAllPartners,
  getPartnerById,
  editPartner,
  sendOtp: sendOtpHandler,
  verifyOtp: verifyOtpHandler,
};

export default partnerController;
