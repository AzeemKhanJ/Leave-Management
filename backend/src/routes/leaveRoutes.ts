import { Router } from 'express';
import { LeaveController } from '../controllers/leaveController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['STUDENT']), LeaveController.applyLeave);
router.put('/:id/review', authorize(['TEACHER', 'ADMIN']), LeaveController.reviewLeave);
router.get('/', authorize(['STUDENT', 'TEACHER', 'ADMIN']), LeaveController.getLeaves);
router.get('/:id', authorize(['STUDENT', 'TEACHER', 'ADMIN']), LeaveController.getLeaveById);

export default router;
