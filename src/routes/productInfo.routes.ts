import express from 'express';
import { productInfoController } from '../controllers/productInfo.controller';
import upload from '../utils/multer';

const router = express.Router();

router.get('/', productInfoController.getAll);
router.post("/init", productInfoController.createInitial);
router.put('/edit-guides', upload.none(), productInfoController.editGuides);
router.put('/edit-policies', upload.none(), productInfoController.editPolicies);
router.put('/edit-documents', upload.none(), productInfoController.editDocuments);

export default router;