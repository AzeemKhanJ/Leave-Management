import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, authorize(['STUDENT']));

router.get('/dashboard', StudentController.getDashboard);

export default router;
