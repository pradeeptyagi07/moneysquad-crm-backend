// src/routes/v1/partner.routes.ts
import express from 'express';
import upload from '../../utils/multer';
import { partnerController } from '../../controllers/user/partner.controller';

const router = express.Router();

// Create partner with file uploads
router.post(
  '/create',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
    { name: 'cancelledCheque', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'aditional', maxCount: 10 },
  ]),
  partnerController.createPartner
);

// Retrieve all partners
router.get('/', partnerController.getAllPartners);

// Retrieve partner by ID
router.get('/:id', partnerController.getPartnerById);

// Edit partner (no file uploads)
router.put('/:id', upload.none(), partnerController.editPartner);

// Send OTP to partner email
router.post('/send-otp', partnerController.sendOtp);

// Verify partner OTP
router.post('/verify-otp', partnerController.verifyOtp);

export default router;
