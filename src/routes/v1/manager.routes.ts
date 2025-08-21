import express from 'express';
import { managerController } from '../../controllers/user/manager.controller';
import upload from '../../utils/multer';

const router = express.Router();

router.post('/', upload.none(), managerController.createManager);
router.get('/', managerController.getAllManager);
router.get('/:id', managerController.getByIdManager);
router.put("/:id", upload.none(), managerController.updateManager);
router.delete('/:id', managerController.deleteManager);

export default router;
