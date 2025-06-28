import express from 'express';
import { offerController } from '../../controllers/offer/offer.controller';
import upload from '../../utils/multer';

const router = express.Router();

// Metadata
// routes/loanType.route.ts
router.post("/loan-create", offerController.createLoanTypes);
router.get('/loan-types', offerController.getLoanTypes);
router.post("/lender-create", offerController.createLender);
router.get('/lenders', offerController.getLenders);

// Offer CRUD
router.post('/create', upload.fields([{name: 'bankImage', maxCount: 1}]), offerController.create);
router.get("/get-all", offerController.getAllOffers);
router.get('/:id', offerController.getOfferById);
router.put('/:id/edit', upload.fields([{name: 'bankImage', maxCount: 1}]), offerController.update);
router.delete('/:id', offerController.remove);


router.get('/:id/share-whatsapp', offerController.shareOfferViaWhatsApp);
export default router;