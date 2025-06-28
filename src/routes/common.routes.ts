import express from 'express'
import { commonController } from '../controllers/common.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import upload from '../utils/multer';


const router = express.Router();

router.post('/contact', commonController.sendContactMessage);

router.get('/userdata', authMiddleware, commonController.getUserById);

router.put('/userdata', authMiddleware, upload.none(), commonController.updateUserData);

export default router