import express from 'express';
import { supportController } from '../controllers/support.controller';
import upload from '../utils/multer';

const router = express.Router();

router.get('/', supportController.getSupportInfo);
router.put('/', supportController.updateSupportInfo);

export default router;