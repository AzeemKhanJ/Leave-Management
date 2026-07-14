import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, authorize(['ADMIN', 'TEACHER']));

router.get('/logs', AttendanceController.getAttendanceLogs);
router.get('/frequent-absentees', AttendanceController.getFrequentAbsentees);
router.get('/low-attendance', AttendanceController.getLowAttendanceStudents);
router.get('/analytics', AttendanceController.getAnalytics);

export default router;
