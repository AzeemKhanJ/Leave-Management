import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Apply auth & role gate
router.use(authenticate, authorize(['ADMIN']));

// Teacher routes
router.post('/teachers', AdminController.createTeacher);
router.get('/teachers', AdminController.getTeachers);
router.put('/teachers/:id', AdminController.editTeacher);
router.delete('/teachers/:id', AdminController.deleteTeacher);
router.post('/teachers/:id/reset-password', AdminController.resetTeacherPassword);

// Student routes
router.post('/students', AdminController.createStudent);
router.get('/students', AdminController.getStudents);
router.put('/students/:id', AdminController.editStudent);
router.delete('/students/:id', AdminController.deleteStudent);
router.post('/students/:id/reset-password', AdminController.resetStudentPassword);

// Department routes
router.post('/departments', AdminController.createDepartment);
router.get('/departments', AdminController.getDepartments);
router.delete('/departments/:id', AdminController.deleteDepartment);

// Academic Years
router.post('/academic-years', AdminController.createAcademicYear);
router.get('/academic-years', AdminController.getAcademicYears);
router.delete('/academic-years/:id', AdminController.deleteAcademicYear);

// Semesters
router.post('/semesters', AdminController.createSemester);
router.get('/semesters', AdminController.getSemesters);
router.delete('/semesters/:id', AdminController.deleteSemester);

// Sections
router.post('/sections', AdminController.createSection);
router.get('/sections', AdminController.getSections);
router.delete('/sections/:id', AdminController.deleteSection);

// Classes
router.post('/classes', AdminController.createClass);
router.get('/classes', AdminController.getClasses);
router.delete('/classes/:id', AdminController.deleteClass);

// Subjects
router.post('/subjects', AdminController.createSubject);
router.get('/subjects', AdminController.getSubjects);
router.delete('/subjects/:id', AdminController.deleteSubject);

// Assign teacher to class/subject
router.post('/assignments', AdminController.assignTeacher);
router.get('/assignments', AdminController.getTeacherAssignments);
router.delete('/assignments/:id', AdminController.removeTeacherAssignment);

// Timetable
router.post('/timetable', AdminController.createTimetable);
router.get('/timetable/class/:classId', AdminController.getTimetableForClass);
router.delete('/timetable/:id', AdminController.deleteTimetableEntry);

// Settings: backup & restore
router.post('/settings/backup', AdminController.backup);
router.post('/settings/restore', AdminController.restore);

// Audit logs
router.get('/audit-logs', AdminController.getAuditLogs);

// Stats
router.get('/stats', AdminController.getStats);

export default router;
