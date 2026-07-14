import { Router } from 'express';
import { TeacherController } from '../controllers/teacherController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate, authorize(['TEACHER']));

router.get('/assigned-classes', TeacherController.getAssignedClasses);
router.get('/students/search', TeacherController.searchStudents);
router.post('/attendance', TeacherController.submitAttendance);
router.put('/attendance/:id', TeacherController.editAttendance);
router.get('/stats', TeacherController.getStats);

export default router;
