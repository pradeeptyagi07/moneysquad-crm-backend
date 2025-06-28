import express from 'express';
import upload from '../../utils/multer';
import { partnerController } from '../../controllers/user/partner.controller';

const router = express.Router();

router.post('/create', upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 },
    { name: 'cancelledCheque', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'aditional', maxCount: 10 },
]), partnerController.createPartner);


router.get('/', partnerController.getAllPartners);
router.get('/:id', partnerController.getPartnerById);
router.put('/:id', upload.none(), partnerController.editPartner);


router.post('/send-otp', partnerController.sendOtp);

router.post('/verify-otp', partnerController.verifyOtp);

export default router;