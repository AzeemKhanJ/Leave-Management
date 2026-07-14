import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, authorize(['ADMIN', 'TEACHER']));

router.get('/attendance', ReportController.exportAttendance);
router.get('/leaves', ReportController.exportLeaves);
router.get('/students', ReportController.exportStudents);
router.get('/teachers', ReportController.exportTeachers);

export default router;
